const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = mongoose.ObjectId;

const userSchema = new Schema({
  email: { type: String, unique: true},
  password: { type: String },
  firstName: String,
  lastName: String,
});

const courseSchema = new Schema({
  title: String,
  description: String,
  price: Number,
  imageUrl: String,
  creatorId: ObjectId,
});

const purchaseSchema = new Schema({
  userId: ObjectId,
  courseId: ObjectId,
});

const User = mongoose.model("User", userSchema);
const Admin = mongoose.model("Admin", userSchema);
const Course = mongoose.model("Course", courseSchema);
const Purchase = mongoose.model("Purchase", purchaseSchema);

module.exports = {
  User,
  Admin,
  Course,
  Purchase,
};
