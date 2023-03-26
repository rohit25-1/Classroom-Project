const multer = require("multer");
const path = require("path");
const qpStorage = multer.diskStorage({
  destination: "public/assets/QuestionPapers",
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + path.extname(file.originalname);
    cb(null, file.fieldname + "-" + uniqueSuffix);
  },
});

const qpUpload = multer({
  storage: qpStorage,
  limits: {
    fileSize: 1024 * 1024 * 10, // 10 MB
  },
});

const ppStorage = multer.diskStorage({
  destination: "public/assets/ProfilePictures",
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + path.extname(file.originalname);
    cb(null, file.fieldname + "-" + uniqueSuffix);
  },
});

const ppUpload = multer({
  storage: ppStorage,
  limits: {
    fileSize: 1024 * 1024 * 10, // 10 MB
  },
});
const apStorage = multer.diskStorage({
  destination: "public/assets/AnswerPapers",
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + path.extname(file.originalname);
    cb(null, file.fieldname + "-" + uniqueSuffix);
  },
});

const apUpload = multer({
  storage: apStorage,
  limits: {
    fileSize: 1024 * 1024 * 10, // 10 MB
  },
});

module.exports = {
  qpUpload,
  ppUpload,
  apUpload,
};
