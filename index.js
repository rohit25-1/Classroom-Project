// Import Statements
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const path = require("path");
const hbs = require("hbs");
const session = require("express-session");
const aws = require("aws-sdk");
const multer = require("multer");
const multerS3 = require("multer-s3");

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
    contentType: multerS3.AUTO_CONTENT_TYPE,
    contentDisposition: "inline",
  }),
});

hbs.registerHelper("eq", function (a, b) {
  return a === b;
});

app.use(
  session({
    secret: "my-secret-key",
    resave: false,
    saveUninitialized: true,
  })
);

require("./db/connect");
const { qpUpload, ppUpload, apUpload } = require("./storage/storage");

//Database and Partials Linking
const registerStudent = require("./models/registerStudent");
const studentExam = require("./models/studentExam");
const registerTeacher = require("./models/registerTeacher");
const exam = require("./models/teacherExam");
const viewsPath = path.join(__dirname, "./public/html/");
const partialsPath = path.join(__dirname, "./public/partials/");

//Setting Static Folders
app.use(express.static("public"));
app.use(express.static("public/css"));
app.use(express.static("public/js"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
hbs.registerPartials(partialsPath);

app.set("view engine", "hbs"); //setting views engine to hbs
app.set("views", viewsPath); //changing views directory

function requireAuth(req, res, next) {
  if (!req.session.isAuthenticated) {
    return res.redirect("/");
  }
  next();
}

//Default Page
app.get("/", (req, res) => {
  res.render("index");
});

//Student Starts Here
//Login
app.get("/student", (req, res) => {
  res.render("studentlogin");
});

//Exam Code
app.get("/student/examcode", (req, res) => {
  if (req.session.isLoggedIn) {
    res.render("studentexamcode", {
      name: req.session.name,
      displaypicture: req.session.displaypicture,
    });
  } else {
    res.redirect("/student");
  }
});

//Create Account
app.get("/student/create-account", (req, res) => {
  res.render("createstudentaccount");
});

//Exam Hall
app.get("/student/exam-hall", async (req, res) => {
  let currentDate = new Date();
  const offset = +270;
  checkDate = new Date(currentDate.getTime() + offset * 60 * 1000);
  startDate = new Date(currentDate.getTime() + 330 * 60 * 1000);
  if (req.session.isLoggedIn) {
    // console.log("reached");
    const records = await studentExam.find({
      usn: req.session.usn,
      parsedDate: { $gte: checkDate },
      submitted: "NO",
    });
    records.forEach((record) => {
      if (!(record.parsedDate <= startDate)) {
        record.name = "exam-hall/#";
      } else {
        record.name = "qpaper?file=" + record.name;
      }
    });
    res.render("studentexamhall", {
      records,
      displaypicture: req.session.displaypicture,
    });
  } else {
    res.redirect("/student");
  }
});
//$lt
//Import Exam by Code
app.post("/search-code", async (req, res) => {
  const examcode = req.body.examcode;
  const verifyCode = await studentExam.findOne({
    examcode: examcode,
    usn: req.session.usn,
  });
  if (verifyCode != null) {
    res.render("studentexamcode", { error: "Exam Code Already Added" });
  } else {
    const authenticate = await exam.findOne({
      examcode: examcode,
    });

    if (authenticate == null) {
      res.render("studentexamcode", { error: "Exam Code Not Found" });
    } else {
      try {
        const updateCode = new studentExam({
          usn: req.session.usn,
          examcode: authenticate.examcode,
          subject: authenticate.subject,
          date: authenticate.date,
          time: authenticate.time,
          name: authenticate.name,
          parsedDate: authenticate.parsedDate,
          displaypicture: req.session.displaypicture,
          studentname: req.session.name,
          location: authenticate.location,
        });
        // console.log(updateCode);
        const registered = await updateCode.save();
        res.status(201).redirect("/student/exam-hall");
      } catch (error) {
        console.log(error);
      }
    }
  }
});

//Exam History
app.get("/student/exam-history", async (req, res) => {
  let currentDate = new Date();
  const offset = +270;
  currentDate = new Date(currentDate.getTime() + offset * 60 * 1000);
  if (req.session.isLoggedIn) {
    const records = await studentExam.find({
      usn: req.session.usn,
      $or: [{ parsedDate: { $lt: currentDate } }, { submitted: "YES" }],
    });
    console.log(records);
    // console.log(records);
    res.render("studentexamhistory", {
      records,
      displaypicture: req.session.displaypicture,
    });
  } else {
    res.redirect("/student");
  }
});

//Forgot Password
app.get("/student/forgotpassword", (req, res) => {
  res.render("studentforgotpassword");
});

//Homescreen
app.get("/student/home", (req, res) => {
  if (req.session.isLoggedIn) {
    console.log(req.session);
    res.render("studenthome", {
      name: req.session.name,
      displaypicture: req.session.displaypicture,
    });
  } else {
    res.redirect("/student");
  }
});

//Student Profile
app.get("/student/profile", (req, res) => {
  if (req.session.isLoggedIn) {
    const name = req.session.name;
    const dept = req.session.dept;
    const semester = req.session.semester;
    const usn = req.session.usn;
    if (name && dept && semester && usn) {
      res.render("studentprofile", {
        usn,
        name,
        semester,
        dept,
        displaypicture: req.session.displaypicture,
      });
    }
  } else {
    res.redirect("/student");
  }
});

//Question Paper -> Yet to finish
app.get("/student/qpaper", async (req, res) => {
  if (req.session.isLoggedIn) {
    req.session.file = req.query.file;
    const records = await studentExam.findOne({
      name: req.query.file,
    });
    // console.log(records);
    res.render("studentqpaper", {
      name: records.location,
      subject: records.subject,
      displaypicture: req.session.displaypicture,
      id: records._id,
    });
  } else {
    res.redirect("/student");
  }
});

//Registering Student
app.post(
  "/student-register",
  upload.single("profile-picture"),
  async (req, res) => {
    try {
      const register = new registerStudent({
        usn: req.body.usn,
        name: req.body.name,
        phonenumber: req.body.phno,
        email: req.body.email,
        dept: req.body.dept,
        semester: req.body.semester,
        password: req.body.password,
        displaypicture: req.file.originalname,
        location: req.file.location,
      });
      // console.log(register);
      const registered = await register.save();
      res.status(201).render("studentlogin", {
        status: "Successfully Registered",
      });
    } catch (error) {
      if (error.code == 11000 && error.keyPattern.usn === 1) {
        res.render("createstudentaccount", {
          error: "USN Already Registered",
        });
      } else if (error.code == 11000 && error.keyPattern.phonenumber === 1) {
        res.render("createstudentaccount", {
          error: "Phone Number Already Registered",
        });
      } else if (error.code == 11000 && error.keyPattern.email === 1) {
        res.render("createstudentaccount", {
          error: "Email Already Registered",
        });
      }
      console.log(error);
    }
  }
);

//Logging in a Student
app.post("/student-login", async (req, res) => {
  try {
    const { usn, password } = req.body;
    // console.log(usn, password);
    const authenticate = await registerStudent.findOne({
      usn: usn,
    });
    // console.log(authenticate);
    if (authenticate == null) {
      res.status(400).render("studentlogin", {
        error: "USN Doesn't Exist",
      });
    } else if (authenticate.password === password) {
      req.session.isLoggedIn = true;
      req.session.name = authenticate.name;
      req.session.usn = authenticate.usn;
      req.session.semester = authenticate.semester;
      req.session.dept = authenticate.dept;
      req.session.displaypicture = authenticate.location;
      console.log(req.session);
      res.redirect("/student/home");
    } else {
      res.status(400).render("studentlogin", {
        error: "Wrong Password",
      });
    }
  } catch (error) {
    res.status(400).render("studentlogin", {
      error: "Error",
    });
    console.log(error);
  }
});

//Resetting Password Of Student
app.post("/student/reset-password", async (req, res) => {
  try {
    const update = await registerStudent.updateOne(
      {
        usn: req.body.usn,
      },
      {
        password: req.body.password,
      }
    );
    // console.log(update);
    if (update.modifiedCount == 0) {
      res.render("studentlogin", {
        error: "Invalid USN",
      });
    } else {
      res.render("studentlogin", {
        status: "Successfully Changed Password",
      });
    }
  } catch (error) {
    res.render("studentlogin", {
      error: "Error Updating",
    });
  }
});
app.post("/teacher/reset-password", async (req, res) => {
  try {
    const update = await registerTeacher.updateOne(
      {
        tid: req.body.tid,
      },
      {
        password: req.body.password,
      }
    );
    // console.log(update);
    if (update.modifiedCount == 0) {
      res.render("teacherlogin", {
        error: "Invalid TID",
      });
    } else {
      res.render("teacherlogin", {
        status: "Successfully Changed Password",
      });
    }
  } catch (error) {
    res.render("teacherlogin", {
      error: "Error Updating",
    });
  }
});

//Teacher Starts Here

app.get("/teacher", (req, res) => {
  res.render("teacherlogin");
});

app.get("/teacher/examcode", (req, res) => {
  if (req.session.isLoggedIn) {
    res.render("teachercreatecode", { name: req.session.name });
  } else {
    res.redirect("/teacher");
  }
});

app.get("/teacher/create-account", (req, res) => {
  res.render("createteacheraccount");
});

app.get("/teacher/create-exam", async (req, res) => {
  try {
    let currentDate = new Date();
    const offset = +330;
    currentDate = new Date(currentDate.getTime() + offset * 60 * 1000);
    if (req.session.isLoggedIn) {
      const records = await exam.find({
        tid: req.session.tid,
        parsedDate: { $gte: currentDate },
      });
      console.log(records);
      res.render("teachercreateexam", {
        records,
        displaypicture: req.session.displaypicture,
      });
    } else {
      res.redirect("/teacher");
    }
  } catch (error) {
    console.log(error);
  }
});
app.get("/teacher/exam-history", async (req, res) => {
  let currentDate = new Date();
  const offset = +330;
  currentDate = new Date(currentDate.getTime() + offset * 60 * 1000);
  if (req.session.isLoggedIn) {
    const records = await exam.find({
      tid: req.session.tid,
      parsedDate: { $lt: currentDate },
    });
    // console.log(records);
    res.render("teacherexamhistory", {
      records,
      displaypicture: req.session.displaypicture,
      error: req.query.error,
    });
  } else {
    res.redirect("/teacher");
  }
});
app.get("/teacher/forgotpassword", (req, res) => {
  res.render("teacherforgotpassword");
});
app.get("/teacher/home", (req, res) => {
  const username = req.session.name;
  if (username) {
    res.render("teacherhome", {
      name: req.session.name,
      displaypicture: req.session.displaypicture,
    });
  } else {
    res.redirect("/teacher");
  }
});

//Teacher Profile
app.get("/teacher/profile", (req, res) => {
  if (req.session.isLoggedIn) {
    const name = req.session.name;
    const dept = req.session.dept;
    const phone = req.session.phone;
    const tid = req.session.tid;
    if (name && dept && phone && tid) {
      res.render("teacherprofile", {
        tid,
        name,
        phone,
        dept,
        displaypicture: req.session.displaypicture,
      });
    }
  } else {
    res.redirect("/teacher");
  }
});

//Teacher Access to Question Papers
app.get("/teacher/qpaper", async (req, res) => {
  if (req.session.isLoggedIn) {
    const records = await exam.findOne({
      name: req.query.file,
    });
    // console.log(records);
    res.render("teacherqpaper", {
      name: records.location,
      subject: records.subject,
      examcode: records.examcode,
      displaypicture: req.session.displaypicture,
    });
  } else {
    res.redirect("/teacher");
  }
});

//Registration page of teacher
app.post(
  "/teacher-register",
  upload.single("profile-picture"),
  async (req, res) => {
    try {
      console.log(req.file);
      const register = new registerTeacher({
        tid: req.body.usn,
        name: req.body.name,
        phonenumber: req.body.phno,
        email: req.body.email,
        dept: req.body.dept,
        password: req.body.password,
        displaypicture: req.file.originalname,
        location: req.file.location,
      });
      // console.log(register);
      const registered = await register.save();
      res.status(201).render("teacherlogin", {
        status: "Successfully Registered",
      });
    } catch (error) {
      if (error.code == 11000 && error.keyPattern.tid === 1) {
        res.status(400).render("createteacheraccount", {
          error: "TID Already Registered",
        });
      } else if (error.code == 11000 && error.keyPattern.phonenumber === 1) {
        res.status(400).render("createteacheraccount", {
          error: "Phone Number Already Registered",
        });
      } else if (error.code == 11000 && error.keyPattern.email === 1) {
        res.status(400).render("createteacheraccount", {
          error: "Email Already Registered",
        });
      }
      console.log(error);
    }
  }
);

app.post("/teacher-login", async (req, res) => {
  try {
    const { tid, password } = req.body;
    const authenticate = await registerTeacher.findOne({
      tid: tid,
    });
    // console.log(password);
    if (authenticate == null) {
      res.status(400).render("teacherlogin", {
        error: "TID Doesn't Exist",
      });
    } else if (authenticate.password === password) {
      req.session.isLoggedIn = true;
      req.session.name = authenticate.name;
      req.session.tid = authenticate.tid;
      req.session.phone = authenticate.phonenumber;
      req.session.dept = authenticate.dept;
      req.session.displaypicture = authenticate.location;
      res.redirect("/teacher/home");
    } else {
      res.status(400).render("teacherlogin", {
        error: "Wrong Password",
      });
    }
  } catch (error) {
    res.status(400).render("teacherlogin", {
      status: "Wrong Email or Password",
    });
    console.log(error);
  }
});

app.post("/register-exam", upload.single("questionp"), async (req, res) => {
  try {
    const htmlDate = req.body.date;
    const htmlTime = req.body.time;
    const dateTimeString = htmlDate + "T" + htmlTime + ":00.000Z";
    const getDate = new Date(dateTimeString);
    // console.log(dateTimeString);
    console.log(req.file);
    // console.log(getDate);
    const registerExam = new exam({
      tid: req.session.tid,
      examcode: req.body.examcode,
      semester: req.body.semester,
      subject: req.body.subject,
      date: req.body.date,
      time: req.body.time,
      name: req.file.originalname,
      location: req.file.location,
      parsedDate: getDate,
    });
    // console.log(req.file);
    // console.log(registerExam);
    const registered = await registerExam.save();
    res.status(201).redirect("/teacher/create-exam");
  } catch (error) {
    console.log(error);
  }
});

app.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Error destroying session", err);
    } else {
      res.redirect("/");
    }
  });
});

app.post(
  "/upload-answersheet",
  upload.single("answer-sheet"),
  async (req, res) => {
    try {
      console.log(req.session.file);
      const registerExam = await studentExam.updateOne(
        {
          _id: req.query.id,
        },
        {
          name: req.file.originalname,
          location: req.file.location,
          submitted: "YES",
        }
      );
      // console.log(registerExam);
      // console.log(req.file);
      console.log(registerExam);

      res.status(201).redirect("/student/exam-hall");
    } catch (error) {
      console.log(error);
    }
  }
);

app.get("/teacher/studentlist", async (req, res) => {
  if (req.session.isLoggedIn) {
    try {
      const examList = await exam.findOne({
        _id: req.query.id,
      });
      const records = await studentExam.find({
        examcode: examList.examcode,
      });
      if (records.length == 0) {
        res.redirect("/teacher/exam-history?error=No Submissions Yet");
      } else {
        res.render("studentlist", {
          displaypicture: req.session.displaypicture,
          subject: records[0].subject,
          date: records[0].date,
          records,
        });
      }
    } catch (error) {
      console.log(error);
    }
  } else {
    res.redirect("/teacher");
  }
});

app.get("/teacher/studentapaper", async (req, res) => {
  if (req.session.isLoggedIn) {
    try {
      console.log(req.session);
      const records = await studentExam.findOne({
        name: req.query.file,
      });
      res.render("studentapaper", {
        subject: records.subject,
        usn: records.usn,
        name: records.name,
        studentname: records.studentname,
        id: records._id,
        displaypicture: req.session.displaypicture,
      });
    } catch (error) {
      console.log(error);
    }
  } else {
    res.redirect("/teachers");
  }
});

app.post("/update-marks", async (req, res) => {
  try {
    console.log(req.query.id);
    const updateMarks = await studentExam.updateOne(
      {
        _id: req.query.id,
      },
      {
        marks: req.body.marks,
        evaluated: "YES",
      }
    );
    console.log(updateMarks);
    res.redirect("/teacher/exam-history");
  } catch (error) {
    console.log(error);
  }
});

app.post("/delete-exam", async (req, res) => {
  try {
    console.log(req.query.examcode);
    const deleteStudent = await studentExam.deleteMany({
      examcode: req.query.examcode,
    });
    const deleteTeacherEntry = await exam.deleteMany({
      examcode: req.query.examcode,
    });
    // console.log(deleteStudent);
    // console.log(deleteTeacherEntry);
    res.redirect("/teacher/create-exam");
  } catch (error) {
    console.log(error);
  }
});

app.listen(8000);
