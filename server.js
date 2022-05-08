import express from "express";
import { nanoid } from "nanoid";

const port = 3000;
const app = express()

app.use(express.json())

let users = [{id: nanoid() ,name: "gamer", password: "remag"}]

////////////////////////////////////////////////////////////////////

app.get("/", (req, res)=>{
    res.json(users)
})

app.post("/adduser", (req, res)=>{
    console.log(req.body);
    users.push({id: nanoid(),...req.body})
    res.send("ny användare skapad")
})

app.post("/login", (req, res)=>{
    users.find((user)=>{
        if (user.name == req.body.name && user.password == req.body.password) {
            res.send("logged in")
        } else {
            res.send("wrong user/pass")
        }
    })
})

////////////////////////////////////////////////////////////////////

app.listen(port, ()=>{
    console.log("server är igång på port: " +  port);
})