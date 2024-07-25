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
const { S3Client } = require("@aws-sdk/client-s3");
const multer = require("multer");
const multerS3 = require("multer-s3");

const app = express();
const bodyParser = require("body-parser");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: "rohit-classroom",
    key: function (req, file, cb) {
      cb(null, Date.now().toString() + "-" + file.originalname);
    },
  }),
});

app.post("/upload", upload.single("file"), (req, res) => {
  console.log(req.file);
  res.send("File uploaded successfully");
});
