import express from "express";
import { nanoid } from "nanoid";
import cors from "cors";
import morgan from "morgan";
import cryptoJs from "crypto-js";
import { MongoClient } from "mongodb";
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
dotenv.config()

const app = express()

const mongoUrl = process.env.MONGOURL;
const saltKey = "FanVadSäkertDetHärLösenOrderÄrEllerHur!?!?";

//console.log(process.env.MONGOURL);

MongoClient.connect(mongoUrl, {
    useUnifiedTopology: true
})
    .then(client => {
        console.log("vi har kontakt med databasen");
        const db = client.db("blogosphere");
        app.locals.db = db;
    })

app.use(morgan("dev"))
app.use(express.json())
app.use(cors())
app.use(bodyParser.urlencoded())


////////////////////////////////////////////////////////////////////

// login admin monolit
app.get("/login", (req, res) => {
    let formHtml = "<form action='/admin' method='post'> <input type='text' name='username' placeholder='username'> <input type='password' name='password' placeholder='password'> <button>login</button></form>"
    res.send(formHtml)
})


// visa admin gränssnitt monolit
app.post("/admin", (req, res) => {

    if (req.body.username == "admin" && req.body.password == "admin") {


        req.app.locals.db.collection("users").find().toArray()
            .then(results => {

                let users = results;

                let usersListHTML = "<header><h1>Welcome Admin</h1></header><div><h3>Users and their subscription status</h3><ul>";

                let subscribersListHTML = "<div><h2>All subscribers emails</h2><ul>"

                for (const user of users) {

                    usersListHTML += "<li><strong>" + user.name + "</strong>: "
                    if (user.subscribed) {
                        usersListHTML += "subscribed</li><br>"
                        subscribersListHTML += "<li><strong>" + user.email + "</strong></li>"
                    } else {
                        usersListHTML += "not subscribed</li><br>"
                    }

                }

                subscribersListHTML += "</ul> </div>";
                usersListHTML += "</ul> </div>";
                usersListHTML += subscribersListHTML;

                res.send(usersListHTML)
            })
    } else {
        //  res.send(req.body);
        res.send("Access denied")
    }

})


////////////////////////////////////////////////////////////////////

// hämta namn och id på alla användare
app.get("/allusers", (req, res) => {

    req.app.locals.db.collection("users").find().toArray()
        .then(results => {
            console.log(results);

            let users = results

            let allUsersInfo = users.map((user) => {
                let u = { id: user.id, name: user.name }
                return u;
            })
            res.send(allUsersInfo)

        })
})

////////////////////////////////////////////////////////////////////

// lägg till ny användare
app.post("/adduser", (req, res) => {

    req.app.locals.db.collection("users").find({ "name": req.body.name }).toArray()
        .then(results => {
            console.log(results);

            if (results.length > 0) {
                res.send("användarnamnet finns redan, välj något annat")
            }
            else {
                let newUser = { id: nanoid(), ...req.body };
                let cryptPass = cryptoJs.AES.encrypt(req.body.password, saltKey).toString();
                newUser.password = cryptPass;

                req.app.locals.db.collection("users").insertOne(newUser)
                    .then(result => {
                        console.log(result);
                        res.send("ny användare skapad")
                    })

            }

        })
})

////////////////////////////////////////////////////////////////////

// radera en användare och dess bloggar
app.delete("/deleteuser/:userId", (req, res) => {

    req.app.locals.db.collection("users").deleteOne({ "id": req.params.userId })
        .then(results => {
            console.log(results);

            req.app.locals.db.collection("blogs").deleteMany({ "author": req.params.userId })
                .then(results => {
                    console.log(results);
                    res.send("användaren och alla dess bloggar raderade")
                })
        })


})

////////////////////////////////////////////////////////////////////

// ändra subscribe på en  användare
app.post("/subscribe", (req, res) => {

    console.log(req.body.id);
    req.app.locals.db.collection("users").updateOne({ "id": req.body.id }, [{ $set: { subscribed: { $eq: [false, "$subscribed"] } } }])
        .then(results => {
            console.log(results);
            res.send("uppdatering av subscribed - ok from server")

        })
})

////////////////////////////////////////////////////////////////////

//logga in på sidan //
app.post("/login", (req, res) => {


    req.app.locals.db.collection("users").find().toArray()
        .then(results => {
            console.log(results);

            let users = results;
            let status = { loggedIn: false, userID: "" };

            for (let i = 0; i < users.length; i++) {
                const user = users[i];
                let deCryptPassToCheck = cryptoJs.AES.decrypt(user.password, saltKey).toString(cryptoJs.enc.Utf8);
                if (user.name == req.body.name && deCryptPassToCheck == req.body.password) {

                    console.log("logged in" + user.name);
                    status = { loggedIn: true, userID: user.id, subscribed: user.subscribed }
                }
            }
            res.send(status)
        })
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
})

////////////////////////////////////////////////////////////////////

//radera en blogpost
app.delete("/blogs/:blogID", (req, res) => {

    req.app.locals.db.collection("blogs").deleteOne({ "id": req.params.blogID })
        .then(results => {
            console.log(results);
            res.send("radering av inlägg - ok from server")

        })

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
})

////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////

app.listen(process.env.PORT || 4000, () => {

    console.log("server är igång på port: 4000");

})