const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const User = require("../models/user");
const bcrypt = require("bcrypt");
const authUser = require("../middleware/authUser");
const Contact = require("../models/contact");
const success = false;
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));
function userError(error, message) {
  this.error = error;
  this.message = message;
}

//CREATE USER
router.post(
  "/create",
  [
    body("name", "name should be atleast of 3 character").isLength({ min: 3 }),
    body("email", "please enter a valid email").isEmail(),
    body("password", "length of password should be atleast 5").isLength({
      min: 5,
    }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).render("articles/signup", {
        message: errors.errors[0].msg,
      });
    }
    try {
      let user = await User.findOne({ email: req.body.email });
      if (user)
        return res.status(400).render("articles/signup", {
          message: "user with this email already exists",
        });
      let password = req.body.password;
      let confirmpassword = req.body.confirmpassword;
      if (password === confirmpassword) {
        try {
          user = new User({
            name: req.body.name,
            email: req.body.email,
            password: password,
            confirmpassword: confirmpassword,
          });
          const token = await user.generateToken();
          res.cookie("jwt", token, {
            httpOnly: true,
          });
          await user.save();
          try {
            const response = await fetch(
              "https://newsapi.org/v2/top-headlines?country=in&apiKey=eff6c38fe8674e6f91eebd45259238b4"
            );
            const data = await response.json();
          } catch (error) {
            console.log(error.message);
          }
          res.redirect("/");
        } catch (error) {
          const message = {
            msg: error.message,
          };
          res.render("articles/signup", { message: message });
        }
      } else {
        res.render("articles/signup", {
          message: "passwords are not matching",
        });
        console.log({ error: "passwords are not matching bro kuch kar" });
      }
    } catch (error) {
      res.render("articles/signup", { message: error.message });
    }
  }
);

//LOGIN USER
router.post(
  "/login",
  [
    body("email", "please enter a valid email").isEmail(),
    body("password", "length of password should be atleast 5").isLength({
      min: 5,
    }),
  ],
  async (req, res) => {
    const message = {
      msg: "Invalid Details",
    };
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(400)
        .json({ message: errors.errors[0].msg, errors: errors.array() });
    }

    try {
      let user = await User.findOne({ email: req.body.email });
      if (!user)
        return res.status(400).render("articles/login", { message: message });
      const token = await user.generateToken();
      res.cookie("jwt", token, {
        httpOnly: true,
      });
      const passwordCheck = await bcrypt.compare(
        req.body.password,
        user.password
      );
      if (passwordCheck) {
        try {
          const response = await fetch(
            "https://newsapi.org/v2/top-headlines?country=in&apiKey=eff6c38fe8674e6f91eebd45259238b4"
          );
          const data = await response.json();
          console.log("Login successfully!");
          res.redirect("/");
        } catch (error) {
          console.log(error.message);
        }
      } else {
        res.status(400).render("articles/login", { message: message });
      }
    } catch (error) {
      const message = {
        msg: error.message,
      };
      res.render("articles/login", { message: message });
    }
  }
);

router.post("/getuser", authUser, async (req, res) => {
  const _id = req._id;
  try {
    const user = await User.findById(_id).select("-password -confirmpassword");
    res.status(200).json(user);
  } catch (error) {
    res.status(401).json({
      success,
      error: "Internal server error",
      e: error.message,
    });
  }
});

router.post(
  "/contact",
  [
    body("name", "name should be atleast of 3 character").isLength({ min: 3 }),
    body("email", "please enter a valid email").isEmail(),
  ],
  async (req, res) => {
    const token = req.cookies.jwt;
    if (token) {
      console.log("token hai");
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success,
          message: errors.errors[0].msg,
          errors: errors.array(),
        });
      }
      try {
        let contact = new Contact({
          name: req.body.name,
          email: req.body.email,
          message: req.body.message,
        });
        console.log(contact);
        await contact.save();
        res.redirect("/");
      } catch (error) {
        console.log(error);
      }
    } else {
      console.log("token naahi hai");
      const response = await fetch(
        "https://newsapi.org/v2/top-headlines?country=in&apiKey=eff6c38fe8674e6f91eebd45259238b4"
      );
      const data = await response.json();
      res.render("articles/404", {
        message: "Please login first to send feedback",
      });
    }
  }
);

module.exports = router;
