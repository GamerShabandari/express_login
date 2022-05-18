import express from "express";
import fs from "fs";
import { nanoid } from "nanoid";
import cors from "cors";
import morgan from "morgan";
import cryptoJs from "crypto-js";
import { MongoClient } from "mongodb";

// const port = 3000;
const app = express()

// MongoClient.connect("mongodb://127.0.0.1:27017", {
//     useUnifiedTopology: true
// })
MongoClient.connect("mongodb+srv://gamer:remag@gamerblogcluster.bwgq0.mongodb.net/?retryWrites=true&w=majority", {
    useUnifiedTopology: true
})
    .then(client => {
        console.log("vi har kontakt med databasen");

        // const db = client.db("nosqldagbok");
        const db = client.db("blogosphere");
        app.locals.db = db;
    })

app.use(morgan("dev"))
app.use(express.json())
app.use(cors())


const saltKey = "FanVadSäkertDetHärLösenOrderÄrEllerHur!?!?";


////////////////////////////////////////////////////////////////////

/// testar mongoDB med denna
// app.get("/", (req, res, next)=>{

//   

//     req.app.locals.db.collection("users").find().toArray()
//     .then(results =>{
//         console.log(results);
//     })

// })

// app.post("/addtest", (req, res)=>{
//     req.app.locals.db.collection("users").insertOne(req.body)
//     .then(result =>{
//         console.log(result);
//     })
// })

////////////////////////////////////////////////////////////////////

// hämta namn och id på alla användare
app.get("/allusers", (req, res) => {

    req.app.locals.db.collection("users").find().toArray()
        .then(results => {
            console.log(results);

            //let users = JSON.parse(results);
            let users = results

            let allUsersInfo = users.map((user) => {
                let u = { id: user.id, name: user.name }
                return u;
            })
            res.send(allUsersInfo)

        })

    // fs.readFile("users.json", (err, data) => {
    //     if (err) {
    //         console.log("något gick fel när användarna skulle läsas in " + err);
    //     }

    //     let users = JSON.parse(data);
    //     let allUsersInfo = users.map((user) => {
    //         let u = { id: user.id, name: user.name }
    //         return u;
    //     })
    //     res.send(allUsersInfo)

    // })
})

////////////////////////////////////////////////////////////////////

// lägg till ny användare
app.post("/adduser", (req, res) => {

    let newUser = { id: nanoid(), ...req.body };
    let cryptPass = cryptoJs.AES.encrypt(req.body.password, saltKey).toString();
    newUser.password = cryptPass;

    req.app.locals.db.collection("users").insertOne(newUser)
        .then(result => {
            console.log(result);
            res.send("ny användare skapad")
        })

    // fs.readFile("users.json", (err, data) => {
    //     if (err) {
    //         console.log("något gick snett: " + err);
    //     }

    //     let users = JSON.parse(data);

    //     let newUser = { id: nanoid(), ...req.body };

    //     let cryptPass = cryptoJs.AES.encrypt(req.body.password, saltKey).toString();
    //     newUser.password = cryptPass;

    //     users.push(newUser);

    //     fs.writeFile("users.json", JSON.stringify(users, null, 2), (err) => {
    //         if (err) {
    //             console.log("något gick fel när användare skulle skapas " + err);
    //         }
    //     })
    // })
    // res.send("ny användare skapad")
})

////////////////////////////////////////////////////////////////////

//logga in på sidan //
app.post("/login", (req, res) => {


    req.app.locals.db.collection("users").find().toArray()
        .then(results => {
            console.log(results);

            let users = results;
            let status = { loggedIn: false, userID: "" };

            //    console.log(req.body);

            for (let i = 0; i < users.length; i++) {
                const user = users[i];
                let deCryptPassToCheck = cryptoJs.AES.decrypt(user.password, saltKey).toString(cryptoJs.enc.Utf8);
                if (user.name == req.body.name && deCryptPassToCheck == req.body.password) {

                    console.log("logged in" + user.name);
                    status = { loggedIn: true, userID: user.id }
                }
            }
            res.send(status)
        })

    // fs.readFile("users.json", (err, data) => {
    //     if (err) {
    //         console.log("något gick fel med login" + err);
    //     }

    //     let users = JSON.parse(data)
    //     let status = { loggedIn: false, userID: "" };

    //     console.log(req.body);

    //     for (let i = 0; i < users.length; i++) {
    //         const user = users[i];
    //         let deCryptPassToCheck = cryptoJs.AES.decrypt(user.password, saltKey).toString(cryptoJs.enc.Utf8);
    //         if (user.name == req.body.name && deCryptPassToCheck == req.body.password) {

    //             console.log("logged in" + user.name);
    //             status = { loggedIn: true, userID: user.id }
    //         }
    //     }
    //     res.send(status)
    // })
})

////////////////////////////////////////////////////////////////////

//skapa ny blogpost
app.post("/blogs", (req, res) => {

    let newBlogEntry = { id: nanoid(), ...req.body, created: new Date().toDateString() }

    req.app.locals.db.collection("blogs").insertOne(newBlogEntry)
        .then(result => {
            console.log(result);
            res.send("skapa inlägg - ok from server")
        })

    // fs.readFile("blogs.json", (err, data) => {
    //     if (err) {
    //         console.log("något gick snett när alla bloggarna skulle läsas in: " + err);
    //     }

    //     let blogs = JSON.parse(data);

    //     let newBlogEntry = { id: nanoid(), ...req.body, created: new Date().toDateString() }

    //     blogs.push(newBlogEntry);

    //     fs.writeFile("blogs.json", JSON.stringify(blogs, null, 2), (err) => {
    //         if (err) {
    //             console.log("något gick fel när ny blogg skulle skapas " + err);
    //         }
    //         res.send("ok from server")
    //     })
    // })

})

////////////////////////////////////////////////////////////////////

//radera en blogpost
app.delete("/blogs/:blogID", (req, res) => {

    req.app.locals.db.collection("blogs").deleteOne({ "id": req.params.blogID })
        .then(results => {
            console.log(results);
            res.send("radering av inlägg - ok from server")

        })

    // fs.readFile("blogs.json", (err, data) => {
    //     if (err) {
    //         console.log("något gick fel när bloggar skulle läsas in " + err);
    //     }

    //     let allBlogs = JSON.parse(data);

    //     for (let i = 0; i < allBlogs.length; i++) {
    //         const blog = allBlogs[i];

    //         if (blog.id == req.params.blogID) {
    //             allBlogs.splice(i, 1);
    //             fs.writeFile("blogs.json", JSON.stringify(allBlogs, null, 2), (err) => {
    //                 if (err) {
    //                     console.log("något gick fel när ny blogg skulle skapas " + err);
    //                 }
    //                 res.send("ok from server")
    //             })

    //         }
    //     }
    // })

})

////////////////////////////////////////////////////////////////////

//uppdatera en redan skapad blogpost
app.put("/blogs/update", (req, res) => {

    let updatedBlogPost = { ...req.body, created: new Date().toDateString() }

    req.app.locals.db.collection("blogs").updateOne({ "id": updatedBlogPost.id }, { $set: { "title": updatedBlogPost.title, "text": updatedBlogPost.text, "created": updatedBlogPost.created } })
        .then(results => {
            console.log(results);
            res.send("uppdatering av inlägg - ok from server")

        })

    // fs.readFile("blogs.json", (err, data) => {
    //     if (err) {
    //         console.log("något gick fel när bloggar skulle läsas in " + err);
    //     }

    //     let allBlogs = JSON.parse(data);

    //     for (let i = 0; i < allBlogs.length; i++) {
    //         const blog = allBlogs[i];

    //         if (blog.id == updatedBlogPost.id) {

    //             allBlogs[i] = updatedBlogPost;

    //             fs.writeFile("blogs.json", JSON.stringify(allBlogs, null, 2), (err) => {
    //                 if (err) {
    //                     console.log("något gick fel när ny blogg skulle skapas " + err);
    //                 }
    //                 res.send("ok from server")
    //             })

    //         }
    //     }
    // })

})

////////////////////////////////////////////////////////////////////

//hämta en användares alla blogpost
app.get("/blogs/:userID", (req, res) => {

    let yourBlogs = [];

    req.app.locals.db.collection("blogs").find({ "author": req.params.userID }).toArray()
        .then(results => {
            console.log(results);

            yourBlogs = [...results]

            res.send(yourBlogs.reverse())

        })

    // fs.readFile("blogs.json", (err, data) => {
    //     if (err) {
    //         console.log("något gick fel när bloggar skulle läsas in " + err);
    //     }

    //     let allBlogs = JSON.parse(data);

    //     let yourBlogs = [];

    //     for (let i = 0; i < allBlogs.length; i++) {
    //         const blog = allBlogs[i];

    //         if (blog.author == req.params.userID) {
    //             yourBlogs.push(blog)
    //         }

    //     }

    //     res.send(yourBlogs.reverse())

    // })
})

////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////

app.listen(process.env.PORT || 4000, () => {

    console.log("server är igång på port: 4000");

})