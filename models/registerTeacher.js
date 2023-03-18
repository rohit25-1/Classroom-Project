const mongoose = require("mongoose");

const teacherSchema = new mongoose.Schema({
  tid: {
    type: Number,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  phonenumber: {
    type: Number,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  dept: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
});

const registerTeacher = new mongoose.model("Register Teacher", teacherSchema);
module.exports = registerTeacher;
