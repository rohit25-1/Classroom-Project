const mongoose = require("mongoose");

const examSchema = new mongoose.Schema({
  examcode: {
    type: String,
    required: true,
    unique: true,
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
  evaluated: {
    type: String,
    default: "NO",
  },
});

const exam = new mongoose.model("Student Exam", examSchema);
module.exports = exam;
