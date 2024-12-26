const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const { User, Purchase } = require("../db");
const { signupSchema, loginSchema } = require("../types");
const { JWT_USER_PASSWORD } = require("../config");
const userMiddleware = require("../middleware/user");

// User Signup
router.post("/signup", async (req, res) => {
  const body = req.body;

  // Input validation using Zod
  let parsedBody;
  try {
    parsedBody = signupSchema.parse(body);
  } catch (error) {
    return res.status(400).json({ msg: "Invalid Inputs", error: error.errors });
  }

  // Check if email exists
  const emailExists = await User.findOne({ email: body.email });
  if (emailExists) {
    return res
      .status(409)
      .json({ msg: "Email already exists. Log in instead." });
  }

  // Hash password and create user
  const { email, password, firstName, lastName } = parsedBody;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      email,
      password: hashedPassword,
      firstName,
      lastName,
    });

    const token = jwt.sign({ id: user._id }, JWT_USER_PASSWORD);
    return res.status(201).json({
      msg: "User registered",
      token,
      info: { firstName, lastName, email },
    });
  } catch (e) {
    console.error("Signup error:", e);
    return res.status(500).json({ msg: "Server Error. Signup failed." });
  }
});

// User Login
router.post("/login", async (req, res) => {
  const body = req.body;

  // Input validation using zod
  let parsedBody;
  try {
    parsedBody = loginSchema.parse(body);
  } catch (error) {
    return res.status(400).json({ msg: "Invalid Inputs", error: error.errors });
  }

  const { email, password } = parsedBody;

  // Check if email exists
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(404).json({ msg: "Email doesn't exist." });
  }

  // Verify password
  const isMatch = bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(401).json({ msg: "Invalid password." });
  }

  // Generate token and log in.
  const token = jwt.sign({ id: user._id }, JWT_USER_PASSWORD);

  return res.status(200).json({
    msg: "User logged in",
    token,
    info: {
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
    },
  });
});

router.get("/purchases", userMiddleware, async (req, res) => {
  try {
    const courses = await Purchase.find({
      userId: req.id,
    });
    return res.status(200).json({
      msg: "Purchase courses loaded",
      courses,
    });
  } catch (err) {
    console.error("Purchased courses error:", err);
    return res
      .status(500)
      .json({ msg: "Server Error. Purchases courses loading failed." });
  }
});

module.exports = router;
