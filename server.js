import express from "express";
import fs from "fs";
import { nanoid } from "nanoid";
import cors from "cors";
import morgan from "morgan";

const port = 4000;
const app = express()

app.use(morgan("dev"))
app.use(express.json())
app.use(cors())


////////////////////////////////////////////////////////////////////

app.get("/", (req, res) => {

    fs.readFile("users.json", (err, data) => {
        if (err) {
            console.log("något gick fel när användarna skulle läsas in " + err);
        }

        let users = JSON.parse(data);
        res.send(users)

    })
    //res.json(users)
})

// lägg till ny användare
app.post("/adduser", (req, res) => {

    fs.readFile("users.json", (err, data) => {
        if (err) {
            console.log("något gick snett: " + err);
        }

        let users = JSON.parse(data);

        let newUser = { id: nanoid(), ...req.body };

        users.push(newUser);

        fs.writeFile("users.json", JSON.stringify(users, null, 2), (err) => {
            if (err) {
                console.log("något gick fel när användare skulle skapas " + err);
            }
        })
    })
    res.send("ny användare skapad")
})

//logga in på sidan //
app.post("/login", (req, res) => {

    fs.readFile("users.json", (err, data) => {
        if (err) {
            console.log("något gick fel med login" + err);
        }

        let users = JSON.parse(data)
        let status = { loggedIn: false, userID: "" };

        console.log(req.body);

        for (let i = 0; i < users.length; i++) {
            const user = users[i];
            if (user.name == req.body.name && user.password == req.body.password) {

                console.log("logged in" + user.name);
                status = { loggedIn: true, userID: user.id }
            }
        }

        // users.find((user) => {
        //     if (user.name == req.body.name && user.password == req.body.password) {
        //         console.log("logged in");
        //         //res.json({"status":"loggedIn", "userID":user.id})
        //     } else {
        //         console.log("wrong pass");
        //         //res.send("error bad login")
        //     }
        // })
        res.send(status)
    })
})

//skapa ny blogpost
app.post("/blogs", (req, res) => {

    fs.readFile("blogs.json", (err, data) => {
        if (err) {
            console.log("något gick snett när alla bloggarna skulle läsas in: " + err);
        }

        let blogs = JSON.parse(data);

        let newBlogEntry = { id: nanoid(), ...req.body, created: new Date().toDateString() }

        blogs.push(newBlogEntry);

        fs.writeFile("blogs.json", JSON.stringify(blogs, null, 2), (err) => {
            if (err) {
                console.log("något gick fel när ny blogg skulle skapas " + err);
            }
            res.send("ok from server")
        })
    })

})

//radera en blogpost
app.delete("/blogs/:blogID", (req, res) => {

    fs.readFile("blogs.json", (err, data) => {
        if (err) {
            console.log("något gick fel när bloggar skulle läsas in " + err);
        }

        let allBlogs = JSON.parse(data);

        for (let i = 0; i < allBlogs.length; i++) {
            const blog = allBlogs[i];

            if (blog.id == req.params.blogID) {
                allBlogs.splice(i, 1);
                fs.writeFile("blogs.json", JSON.stringify(allBlogs, null, 2), (err) => {
                    if (err) {
                        console.log("något gick fel när ny blogg skulle skapas " + err);
                    }
                    res.send("ok from server")
                })

            }
        }
    })

})

//hämta en användares alla blogpost
app.get("/blogs/:userID", (req, res) => {

    fs.readFile("blogs.json", (err, data) => {
        if (err) {
            console.log("något gick fel när bloggar skulle läsas in " + err);
        }

        let allBlogs = JSON.parse(data);

        let yourBlogs = [];

        for (let i = 0; i < allBlogs.length; i++) {
            const blog = allBlogs[i];

            if (blog.author == req.params.userID) {
                yourBlogs.push(blog)
            }

        }

        res.send(yourBlogs)

    })
})

////////////////////////////////////////////////////////////////////

app.listen(port, () => {
    console.log("server är igång på port: " + port);
})