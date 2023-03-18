const mongoose = require("mongoose");

const examSchema = new mongoose.Schema({
  examcode: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },

  tid: {
    type: Number,
    required: true,
  },
  subject: {
    type: String,
    required: true,
  },
  semester: {
    type: Number,
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
  parsedDate:{
    type: Date,
    required: true,
  }
});

const exam = new mongoose.model("Teacher Exam", examSchema);
module.exports = exam;
