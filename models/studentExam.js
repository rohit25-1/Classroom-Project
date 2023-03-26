const mongoose = require("mongoose");

const examSchema = new mongoose.Schema({
  examcode: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    default: "",
  },
  location: {
    type: String,
    default: "",
  },
  usn: {
    type: String,
    required: true,
  },

  subject: {
    type: String,
    required: true,
  },
  date: {
    type: String,
    required: true,
  },
  time: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  parsedDate: {
    type: Date,
    required: true,
  },
  submitted: {
    type: String,
    default: "NO",
  },
  evaluated: {
    type: String,
    default: "NO",
  },
  studentname: {
    type: String,
  },
  displaypicture: {
    type: String,
    required: true,
  },
  marks: {
    type: String,
    default: "N/A",
  },
});

const exam = new mongoose.model("Student Exam", examSchema);
module.exports = exam;
