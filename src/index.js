require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connect = require("./config/db");
const User = require("./feature/user/user.route")
const app = express();

const PORT = process.env.PORT || 8001;

app.use(cors());
app.use(express.json({limit:"500mb"}));
app.use(express.urlencoded({ extended: true , limit:"500mb"}));

app.use("/user",User)

app.get("/", (req, res) => {
  res.send("This is  My Es Magic  Backend");
});

app.listen(PORT, async () => {
  await connect();
  console.log(`listening on .....http://localhost:${PORT}`) 
});