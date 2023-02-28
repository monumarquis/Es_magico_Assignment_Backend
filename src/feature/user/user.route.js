const express = require('express')
const app = express.Router()
const bcrypt = require("bcrypt")
const userModel = require('./user.model')
const { ValidateUser, UpdatedUser } = require("../../config/user/user.config");
const { userPrivateRoute, adminPrivateRoute } = require('../Middleware/user.auth');


// All Users Profile route
app.get('/', adminPrivateRoute, async (req, res) => {
    const user = await userModel.find({ role: "user" });
    return res.status(201).send(user)
})

// Admin can delete User route 
app.delete('/', adminPrivateRoute, async (req, res) => {
    const { userId } = req.body
    try {
        let doc = await userModel.findByIdAndDelete(userId)
        return res.status(201).send({ "message": "user deleted successfully" })
    } catch (error) {
        return res.status(500).send(error);
    }
})

// Admin can update user role section route
app.patch('/', adminPrivateRoute, async (req, res) => {
    const { userId ,role} = req.body
    const user = await userModel.findById(userId)
    console.log(user);

    // here I am creating update object with deafult value provided to ensure whole data get updated
    const update = {
        role: role || user.role,
    }
    try {
        // here I am getting response from a function that hold my all logic  
        let response = await UpdatedUser(user, update)
        return res.status(201).send(response)

    } catch (error) {
        return res.status(401).send(error);
    }
})

// User getprofile Route
app.get('/getProfile', userPrivateRoute, async (req, res) => {
    let { user } = req.body

    console.log(user)
    return res.status(200).send(user)

})

// User update Route
app.patch("/udpdateProfile", userPrivateRoute, async (req, res) => {
    let { user, name, email, password } = req.body
    console.log(user);
    // here I am encrypting my password
    if (password) {
        password = bcrypt.hashSync(password, 10)
    }

    // here I am creating update object with deafult value provided to ensure whole data get updated
    const update = {
        name: name || user.name,
        email: email || user.email,
        password: password || user.password,
    }
    try {
        // here I am getting response from a function that hold my all logic  
        let response = await UpdatedUser(user, update)
        return res.status(201).send(response)

    } catch (error) {
        return res.status(401).send(error);
    }
})

// User register Routeoute
app.post('/register', async (req, res) => {
    const { name, email, password, role } = req.body
    if (!name || !email || !password || !role) return res.status(403).send({ message: "Please Enter All Credential" })

    const exsist = await userModel.findOne({ email })
    if (exsist) return res.status(404).send({ message: "User Already Created Try Logging in" })

    const hash = bcrypt.hashSync(password, 10);
    console.log(hash);
    const user = await userModel({ name, email, password: hash, role });
    user.save()

    return res.status(201).send({ user, message: "You have Signup Successfully" });
})

// User Log in Route
app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    //   Here checking user providing all detials or not 
    if (!email || !password) return res.status(403).send({ message: "Please Enter All Credentials" });

    const User = await userModel.findOne({ email })

    // checking here  If user doesn't exsist  then return from here 
    if (!User) return res.status(404).send("User Not Found");

    try {
        // here we are getting response from a function
        // and we are sending response to client based on response message 
        let response = await ValidateUser(password, User)
        console.log(response)
        if (response.message === "Login Successfully") {
            return res.status(200).send(response);
        }
        else {
            res.status(401).send(response);
        }
    } catch (error) {
        console.log(error);
        return res.status(401).send(error);
    }

})


module.exports = app