require("dotenv").config();
const express = require("express");
const router = express.Router();
const argon2 = require("argon2");
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const { Router } = require("express");
const verifyToken = require("../middleware/auth");

//router.get('/', (req, res) => res.send('User route ...'))

// @route GET api/auth
// @desc Check if user is logged in
// @access public
router.get("/", verifyToken, async (req, res) => {
  try {
    const user = await await await User.findById(req.userId).select(
      "-password"
    );
    if (!user)
      return res
        .status(400)
        .json({ success: false, message: "User is not found!" });
    res.json({ success: true, user });
  } catch (error) {
    console.log(ex.message);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// @route POST api/auth/register
// @desc Register user
// @access public
router.post("/register", async (req, res) => {
  const { username, password } = req.body;

  //Simple Validation
  if (!username || !password) {
    return res
      .status(400)
      .json({ success: false, message: "Missing username and/or password" });
  }
  try {
    //Check for existing user
    const user = await User.findOne({ username });

    if (user)
      return res
        .status(400)
        .json({ success: false, message: "Username already exists" });

    //All good
    const hashedPassword = await argon2.hash(password);
    const newUser = new User({
      username,
      password: hashedPassword,
    });

    await newUser.save();

    //Return token
    const accessToken = jwt.sign(
      { userId: newUser._id },
      process.env.ACCESS_TOKEN
    );

    res.json({
      success: true,
      message: "User created successfully!",
      accessToken,
    });
  } catch (ex) {
    console.log(ex.message);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// @route POST api/auth/login
// @desc login user
// @access public
router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  //Simple Validation
  if (!username || !password) {
    return res
      .status(400)
      .json({ success: false, message: "Missing username and/or password" });
  }

  try {
    //Check for existing user
    const user = await User.findOne({ username });
    if (!user)
      return res
        .status(400)
        .json({ success: false, message: "Incorrect username or password" });

    //Username found
    const passwordValid = await argon2.verify(user.password, password);
    if (!passwordValid)
      return res
        .status(400)
        .json({ success: false, message: "Incorrect username or password" });

    //All good
    //Return token
    const accessToken = jwt.sign(
      { userId: user._id },
      process.env.ACCESS_TOKEN
    );

    res.json({
      success: true,
      message: "User logged in successfully!",
      accessToken,
    });
  } catch (ex) {
    console.log(ex.message);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

module.exports = router;
