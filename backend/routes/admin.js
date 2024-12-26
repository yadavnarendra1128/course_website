const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const { Admin, Course } = require("../db");

const {
  signupSchema,
  loginSchema,
  courseSchema,
  courseUpdateSchema,
} = require("../types");
const { JWT_ADMIN_PASSWORD } = require("../config");
const adminMiddleware = require("../middleware/admin");

// Admin Signup
router.post("/signup", async (req, res) => {
  try {
    const body = req.body;

    // Input validation with .parse
    const parsedBody = signupSchema.parse(body);

    // Check if email exists
    const emailExists = await Admin.findOne({ email: parsedBody.email });
    if (emailExists) {
      return res
        .status(409)
        .json({ msg: "Email already exists. Log in instead." });
    }

    // Hash password and create admin
    const { email, password, firstName, lastName } = parsedBody;
    const hashedPassword = await bcrypt.hash(password, 10);
    const newAdmin = await Admin.create({
      email,
      password: hashedPassword,
      firstName,
      lastName,
    });

    const token = jwt.sign({ id: newAdmin._id }, JWT_ADMIN_PASSWORD);

    return res.status(201).json({
      msg: "Admin registered successfully.",
      token,
      info: { email, firstName, lastName },
    });
  } catch (error) {
    console.error("Signup error:", error);
    return res
      .status(400)
      .json({ msg: "Invalid Inputs", error: error.errors || error.message });
  }
});

// Admin Login
router.post("/login", async (req, res) => {
  try {
    const body = req.body;

    // Input validation with .parse
    const parsedBody = loginSchema.parse(body);
    const { email, password } = parsedBody;

    // Check if admin exists
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res
        .status(404)
        .json({ msg: "Email does not exist. Signup instead." });
    }

    // Verify password
    const isMatch = bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ msg: "Incorrect password." });
    }

    // Generate token
    const token = jwt.sign({ id: admin._id }, JWT_ADMIN_PASSWORD);

    return res.status(200).json({
      msg: "Admin logged in successfully.",
      token,
      info: {
        email: admin.email,
        firstName: admin.firstName,
        lastName: admin.lastName,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return res
      .status(400)
      .json({ msg: "Invalid Inputs", error: error.errors || error.message });
  }
});

// Create Course
router.post("/course", adminMiddleware, async (req, res) => {
  try {
    const body = req.body;

    // Input validation with .parse
    const parsedBody = courseSchema.safeParse(body);
    if (!parsedBody.success) {
      return res.status(411).json({
        message: "Invalid course input",
      });
    }

    // Logic for course creation
    const course = await Course.create({
      ...body,
      creatorId: req.id,
    });

    return res
      .status(201)
      .json({ msg: "Course created successfully.", course: course });
  } catch (error) {
    console.error("Course creation error:", error);
    return res.status(400).json({
      msg: "Course creation error",
      error: error.errors || error.message,
    });
  }
});

// Update Course
router.put("/course", adminMiddleware, async (req, res) => {
  try {
    const body = req.body;

    // Input validation
    const parsedBody = courseUpdateSchema.safeParse(body);
    if (!parsedBody.success) {
      return res.status(411).json({
        message: "Invalid course input",
        err: parsedBody.error.errors,
      });
    }

    const { courseId, ...keys } = body;

    // Logic for course update, including updating createdId with req.id
    try {
      await Course.findByIdAndUpdate(
        { _id: courseId },
        { $set: { ...keys, creatorId: req.id } }
      );
    } catch (error) {
      return res.status(500).json({ msg: "Failed to update course.", error });
    }

    return res.status(200).json({ msg: "Course updated successfully." });
  } catch (error) {
    console.error("Course update error:", error);
    return res.status(400).json({
      msg: "Invalid course update data",
      error: error.errors || error.message,
    });
  }
});

module.exports = router;
