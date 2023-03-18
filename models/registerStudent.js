const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({
  usn: {
    type: String,
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
  semester: {
    type: Number,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
});

const registerStudent = new mongoose.model("Register Student", studentSchema);
module.exports = registerStudent;
