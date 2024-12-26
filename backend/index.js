require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const mongoose = require("mongoose");

const courseRouter = require("./routes/course");
const adminRouter = require("./routes/admin");
const userRouter = require("./routes/user");

const { Course } = require("./db");

const MONGO_URL = process.env.MONGO_URL;
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use("/user", userRouter);
app.use("/admin", adminRouter);
app.use("/course", courseRouter);

// Get Bulk Courses
app.get("/courses", async (req, res) => {
  try {
    // Logic for fetching bulk courses goes here
    const courses = await Course.find();
    return res
      .status(200)
      .json({ msg: "Fetched courses successfully.", courses: courses});
  } catch (error) {
    console.error("Fetch courses error:", error);
    return res.status(500).json({ msg: "Failed to fetch courses.", error });
  }
});


const main = async () => {
  try {
    await mongoose.connect(MONGO_URL);
    app.listen(PORT, async () => {
      console.log("Server started.");
    });
  } catch (e) {
    console.error("Error connecting to MongoDB", e);
  }
};
main();
