require("dotenv").config();
const express = require("express");
const app = express();
const authUser = require("./middleware/authUser");
const authAdmin = require("./middleware/authAdmin");
const User = require("./models/user");
const Admin = require("./models/admin");
const jwt = require("jsonwebtoken");
const methodOverride = require("method-override");

const path = require("path");
const port = 3000;
const cookieParser = require("cookie-parser");
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));
require("./db/connection");

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieParser());
app.use("/api/admin", require("./routes/adminAuth"));
app.use("/category", require("./routes/articles"));
app.use("/api", require("./routes/auth"));  
app.use(methodOverride("_method"));

app.set("view engine", "ejs");

app.get("/", async (req, res) => {
  try {
    let user = false;
    if(req.cookies.jwt){
      const _id = jwt.verify(req.cookies.jwt, process.env.PRIVATE_KEY);
      user = await User.findOne({_id});
      if(!user){
        user = await Admin.findOne({_id});
      }
    }
    let flag = false;
    if (req.cookies.jwt) {
      flag = true;
    }
    const response = await fetch(
      "https://newsapi.org/v2/top-headlines?country=in&apiKey=eff6c38fe8674e6f91eebd45259238b4"
    );
    const data = await response.json();
    res.render("articles/index", { articles: data.articles, login: flag, name: user.name });
  } catch (error) {
    console.log(error.message);
  }
});

app.get("/login", (req, res) => {
  res.render("articles/login");
});
app.get("/loginadmin", (req, res) => {
  res.render("articles/loginadmin");
});
app.get("/signup", (req, res) => {
  res.render("articles/signup", { message: "" });
});

app.listen(port, () => {
  console.log(`your app is listening at http://localhost:${port}`);
});

app.get("/logout", async (req, res) => {
  try {
    res.clearCookie("jwt");
    console.log("logout successfully");
    res.redirect("/login");
  } catch (error) {
    console.log(error);
  }
});

app.use(express.static(path.join(__dirname, "/src")));
app.use("/api/admin", require("./routes/adminAuth"));
app.use("/category", require("./routes/articles"));
app.use("/api", require("./routes/auth"));  
app.use(methodOverride("_method"));
app.use("/admin/category", require("./routes/adminArticles"));

module.exports = { fetch };