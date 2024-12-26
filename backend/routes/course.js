const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");

const { Course, Purchase } = require("../db");
const { purchaseSchema } = require("../types");
const userMiddleware = require("../middleware/user.js");

router.post("/purchase", userMiddleware, async (req, res) => {
  try {
    const userId = req.id;
    const courseId = req.body.courseId;
    const parsedCourseId = purchaseSchema.safeParse({courseId});
    if (!parsedCourseId.success) {
      return res.status(400).json({
        message: "Invalid courseId input",
      });
    }
    const course = await Course.findOne({ _id: courseId });
    if (!course) {
      return res.status(404).json({
        message: "Course not found",
      });
    }
    const purchase = await Purchase.create({ userId, courseId });
    return res.status(200).json({msg:'course purchased successfully'});
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: "Server Error purchase failed",
      err: err,
    });
  }
});

router.get("/preview", async (req, res) => {
    try {
        const courseId = req.body.courseId;
        const parsedCourseId = purchaseSchema.safeParse({courseId});
        if (!parsedCourseId.success) {
          return res.status(400).json({
            message: "Invalid courseId",
          });
        }
        const course = await Course.findOne({ _id: courseId });
        if (!course) {
          return res.status(404).json({
            message: "Course not found",
          });
        }
      return res.status(200).json({ courseInfo: course });
    } catch (err) {
      console.error(err);
      return res.status(500).json({
        message: "Server Error fetching purchases",
        err: err,
      });
    }
});

module.exports = router;
