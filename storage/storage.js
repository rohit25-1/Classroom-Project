// const multer = require("multer");
// const path = require("path");
// const qpStorage = multer.diskStorage({
//   destination: "public/assets/QuestionPapers",
//   filename: function (req, file, cb) {
//     const uniqueSuffix = Date.now() + "-" + path.extname(file.originalname);
//     cb(null, file.fieldname + "-" + uniqueSuffix);
//   },
// });

// const qpUpload = multer({
//   storage: qpStorage,
//   limits: {
//     fileSize: 1024 * 1024 * 10, // 10 MB
//   },
// });

// const ppStorage = multer.diskStorage({
//   destination: "public/assets/ProfilePictures",
//   filename: function (req, file, cb) {
//     const uniqueSuffix = Date.now() + "-" + path.extname(file.originalname);
//     cb(null, file.fieldname + "-" + uniqueSuffix);
//   },
// });

// const ppUpload = multer({
//   storage: ppStorage,
// limits: {
//   fileSize: 1024 * 1024 * 10, // 10 MB
// },
// });
// const apStorage = multer.diskStorage({
//   destination: "public/assets/AnswerPapers",
//   filename: function (req, file, cb) {
//     const uniqueSuffix = Date.now() + "-" + path.extname(file.originalname);
//     cb(null, file.fieldname + "-" + uniqueSuffix);
//   },
// });

// const apUpload = multer({
//   storage: apStorage,
//   limits: {
//     fileSize: 1024 * 1024 * 10, // 10 MB
//   },
// });

// module.exports = {
//   qpUpload,
//   ppUpload,
//   apUpload,
// };

const express = require("express");
const aws = require("aws-sdk");
const multer = require("multer");
const multerS3 = require("multer-s3");

const app = express();
const bodyParser = require("body-parser");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

aws.config.update({
  accessKeyId: "AKIAUSDD7GAQJZQ5CSHH",
  secretAccessKey: "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",
  region: "ap-southeast-2",
});

const s3 = new aws.S3();
const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: "rohit-classroom",
    key: function (req, file, cb) {
      cb(null, Date.now().toString() + "-" + file.originalname);
    },
  }),
});

// Set up a route to handle file uploads
app.post("/upload", upload.single("file"), (req, res) => {
  console.log(req.file);
});
