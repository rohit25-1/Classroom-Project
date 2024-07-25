// Import Statements
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const path = require("path");
const hbs = require("hbs");
const multer = require("multer");
const redis = require("redis");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");

const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
require("dotenv").config();
app.use(express.json());

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
});

const uploadFile = async (file) => {
  console.log(file.mimetype);
  const key = Date.now().toString() + "-" + file.originalname;
  const command = new PutObjectCommand({
    Bucket: process.env.S3_BUCKET,
    Key: key,
    Body: file.buffer,
    ContentDisposition: "inline",
    ContentType: file.mimetype,
  });

  try {
    const ans = await s3.send(command);
    console.log(ans);
    const url = `https://${process.env.S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
    return url;
  } catch (error) {
    console.log(error);
    return null;
  }
};
app.use(cookieParser());
const SECRET_KEY = process.env.SECRET_KEY;

hbs.registerHelper("eq", function (a, b) {
  return a === b;
});
const redisClient = redis.createClient();

require("./db/connect");

//Database and Partials Linking
const registerStudent = require("./models/registerStudent");
const studentExam = require("./models/studentExam");
const registerTeacher = require("./models/registerTeacher");
const exam = require("./models/teacherExam");
const viewsPath = path.join(__dirname, "./public/html/");
const partialsPath = path.join(__dirname, "./public/partials/");

//Setting Static Folders
app.use(express.static(__dirname + "/public/"));

// app.use(express.static("public"));
app.use(express.static(__dirname + "public/css"));
app.use(express.static(__dirname + "public/js"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
hbs.registerPartials(partialsPath);

app.set("view engine", "hbs"); //setting views engine to hbs
app.set("views", viewsPath); //changing views directory

const authenticateStudentToken = async (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    return res.redirect("/student");
  }
  const user = jwt.verify(token, SECRET_KEY);
  // console.log(user);
  const findinDB = await registerStudent.findOne({ usn: user.usn });
  if (findinDB) {
    req.user = user;
    next();
  } else res.redirect("/");
};

const authenticateTeacherToken = async (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    return res.redirect("/teacher");
  }
  const user = jwt.verify(token, SECRET_KEY);
  // console.log(user);
  const findinDB = await registerTeacher.findOne({ tid: user.tid });
  if (findinDB) {
    req.user = user;
    next();
  } else res.redirect("/");
};

const authenticateHomeToken = async (req, res, next) => {
  const token = req.cookies.token;
  if (token == undefined) {
    next();
  } else {
    const user = jwt.verify(token, SECRET_KEY);
    if (user.tid) {
      console.log("reached");
      const findinDB = await registerTeacher.findOne({ tid: user.tid });

      if (findinDB) {
        res.redirect("/teacher/home");
      } else {
        next();
      }
    } else if (user.usn) {
      console.log("reached Student");

      const findinDBStud = await registerStudent.findOne({ usn: user.usn });
      console.log(findinDBStud);
      if (findinDBStud) {
        res.redirect("/student/home");
      } else next();
    }
  }
};

app.post("/upload", upload.single("file"), async (req, res) => {
  const file = req.file;
  if (!file) {
    return res.status(400).send("No file uploaded.");
  }

  try {
    console.log(req.file);
    // console.log(req.file.location);
    const a = await uploadFile(req.file);
    console.log(a);
    res.send("File uploaded successfully.");
  } catch (error) {
    res.status(500).send("File upload failed.");
  }
});

//Default Page
app.get("/", authenticateHomeToken, (req, res) => {
  res.render("index");
});

//Student Starts Here
//Login
app.get("/student", authenticateHomeToken, (req, res) => {
  res.render("studentlogin");
});

//Exam Code
app.get("/student/examcode", authenticateStudentToken, (req, res) => {
  res.render("studentexamcode", {
    name: req.user.name,
    displaypicture: req.user.displaypicture,
  });
});

//Create Account
app.get("/student/create-account", authenticateHomeToken, (req, res) => {
  res.render("createstudentaccount");
});

//Exam Hall
app.get("/student/exam-hall", authenticateStudentToken, async (req, res) => {
  let currentDate = new Date();
  const offset = +270;
  checkDate = new Date(currentDate.getTime() + offset * 60 * 1000);
  startDate = new Date(currentDate.getTime() + 330 * 60 * 1000);

  const records = await studentExam.find({
    usn: req.user.usn,
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
    displaypicture: req.user.displaypicture,
  });
});
//$lt
//Import Exam by Code
app.post("/search-code", authenticateStudentToken, async (req, res) => {
  const examcode = req.body.examcode;
  const verifyCode = await studentExam.findOne({
    examcode: examcode,
    usn: req.user.usn,
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
          usn: req.user.usn,
          examcode: authenticate.examcode,
          subject: authenticate.subject,
          date: authenticate.date,
          time: authenticate.time,
          name: authenticate.name,
          parsedDate: authenticate.parsedDate,
          displaypicture: req.user.displaypicture,
          studentname: req.user.name,
          location: authenticate.location,
        });
        // console.log(updateCode);
        const registered = await updateCode.save();
        if (registered) res.status(201).redirect("/student/exam-hall");
        else res.send("{'message':'Couldnt Update Code'}");
      } catch (error) {
        console.log(error);
      }
    }
  }
});

//Exam History
app.get("/student/exam-history", authenticateStudentToken, async (req, res) => {
  let currentDate = new Date();
  const offset = +270;
  currentDate = new Date(currentDate.getTime() + offset * 60 * 1000);

  const records = await studentExam.find({
    usn: req.user.usn,
    $or: [{ parsedDate: { $lt: currentDate } }, { submitted: "YES" }],
  });
  // console.log(records);
  // console.log(records);
  res.render("studentexamhistory", {
    records,
    displaypicture: req.user.displaypicture,
  });
});

//Forgot Password
app.get("/student/forgotpassword", (req, res) => {
  res.render("studentforgotpassword");
});

//Homescreen
app.get("/student/home", authenticateStudentToken, (req, res) => {
  // console.log(req.user);
  res.render("studenthome", {
    name: req.session,
    displaypicture: req.user.displaypicture,
  });
});

//Student Profile
app.get("/student/profile", authenticateStudentToken, (req, res) => {
  const name = req.user.name;
  const dept = req.user.dept;
  const semester = req.user.semester;
  const usn = req.user.usn;
  if (name && dept && semester && usn) {
    res.render("studentprofile", {
      usn,
      name,
      semester,
      dept,
      displaypicture: req.user.displaypicture,
    });
  }
});

//Question Paper -> Yet to finish
app.get("/student/qpaper", authenticateStudentToken, async (req, res) => {
  req.file = req.query.file;
  const records = await studentExam.findOne({
    name: req.query.file,
  });
  // console.log(records);
  res.render("studentqpaper", {
    name: records.location,
    subject: records.subject,
    displaypicture: req.user.displaypicture,
    id: records._id,
  });
});

//Registering Student
app.post(
  "/student-register",
  upload.single("profile-picture"),
  async (req, res) => {
    try {
      location = await uploadFile(req.file);
      const register = new registerStudent({
        usn: req.body.usn,
        name: req.body.name,
        phonenumber: req.body.phno,
        email: req.body.email,
        dept: req.body.dept,
        semester: req.body.semester,
        password: req.body.password,
        displaypicture: req.file.originalname,
        location,
      });
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
      } else {
        console.log(error);
      }
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
      const token = jwt.sign(
        {
          name: authenticate.name,
          usn: authenticate.usn,
          semester: authenticate.semester,
          dept: authenticate.dept,
          displaypicture: authenticate.location,
        },
        SECRET_KEY,
        {
          expiresIn: "1h",
        }
      );
      res.cookie("token", token, { httpOnly: true });

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
app.post("/student/reset-password", authenticateHomeToken, async (req, res) => {
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
app.post("/teacher/reset-password", authenticateHomeToken, async (req, res) => {
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

app.get("/teacher", authenticateHomeToken, (req, res) => {
  res.render("teacherlogin");
});

app.get("/teacher/examcode", authenticateTeacherToken, (req, res) => {
  res.render("teachercreatecode", { name: req.user.name });
});

app.get("/teacher/create-account", authenticateHomeToken, (req, res) => {
  res.render("createteacheraccount");
});

app.get("/teacher/create-exam", authenticateTeacherToken, async (req, res) => {
  try {
    let currentDate = new Date();
    const offset = +330;
    currentDate = new Date(currentDate.getTime() + offset * 60 * 1000);

    const records = await exam.find({
      tid: req.user.tid,
      parsedDate: { $gte: currentDate },
    });
    // console.log(records);
    res.render("teachercreateexam", {
      records,
      displaypicture: req.user.displaypicture,
    });
  } catch (error) {
    console.log(error);
  }
});
app.get("/teacher/exam-history", authenticateTeacherToken, async (req, res) => {
  let currentDate = new Date();
  const offset = +330;
  currentDate = new Date(currentDate.getTime() + offset * 60 * 1000);

  const records = await exam.find({
    tid: req.user.tid,
    parsedDate: { $lt: currentDate },
  });
  // console.log(records);
  res.render("teacherexamhistory", {
    records,
    displaypicture: req.user.displaypicture,
    error: req.query.error,
  });
});
app.get("/teacher/forgotpassword", (req, res) => {
  res.render("teacherforgotpassword");
});
app.get("/teacher/home", authenticateTeacherToken, (req, res) => {
  res.render("teacherhome", {
    name: req.user.name,
    displaypicture: req.user.displaypicture,
  });
});

//Teacher Profile
app.get("/teacher/profile", authenticateTeacherToken, (req, res) => {
  const name = req.user.name;
  const dept = req.user.dept;
  const phone = req.user.phone;
  const tid = req.user.tid;
  if (name && dept && phone && tid) {
    res.render("teacherprofile", {
      tid,
      name,
      phone,
      dept,
      displaypicture: req.user.displaypicture,
    });
  }
});

//Teacher Access to Question Papers
app.get("/teacher/qpaper", authenticateTeacherToken, async (req, res) => {
  const records = await exam.findOne({
    name: req.query.file,
  });
  // console.log(records);
  res.render("teacherqpaper", {
    name: records.location,
    subject: records.subject,
    examcode: records.examcode,
    displaypicture: req.user.displaypicture,
  });
});

//Registration page of teacher
app.post(
  "/teacher-register",
  upload.single("profile-picture"),
  async (req, res) => {
    try {
      const register = new registerTeacher({
        tid: req.body.usn,
        name: req.body.name,
        phonenumber: req.body.phno,
        email: req.body.email,
        dept: req.body.dept,
        password: req.body.password,
        displaypicture: req.file.originalname,
        location: await uploadFile(req.file),
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
    if (authenticate == null) {
      res.status(400).render("teacherlogin", {
        error: "TID Doesn't Exist",
      });
    } else if (authenticate.password === password) {
      const token = jwt.sign(
        {
          name: authenticate.name,
          tid: authenticate.tid,
          phone: authenticate.phonenumber,
          dept: authenticate.dept,
          displaypicture: authenticate.location,
        },
        SECRET_KEY,
        { expiresIn: "1h" }
      );
      res.cookie("token", token, { httpOnly: true });

      res.redirect("/teacher/home");
    } else {
      res.status(400).render("teacherlogin", {
        error: "Wrong Password",
      });
    }
  } catch (error) {
    res.status(400).render("teacherlogin", {
      error: "Wrong Email or Password",
    });
    console.log(error);
  }
});

app.post(
  "/register-exam",
  upload.single("questionp"),
  authenticateTeacherToken,
  async (req, res) => {
    try {
      const htmlDate = req.body.date;
      const htmlTime = req.body.time;
      const dateTimeString = htmlDate + "T" + htmlTime + ":00.000Z";
      const getDate = new Date(dateTimeString);
      // console.log(dateTimeString);
      // console.log(req.file);
      // console.log(getDate);
      const registerExam = new exam({
        tid: req.user.tid,
        examcode: req.body.examcode,
        semester: req.body.semester,
        subject: req.body.subject,
        date: req.body.date,
        time: req.body.time,
        name: Date.now() + req.file.originalname,
        location: await uploadFile(req.file),
        parsedDate: getDate,
      });
      // console.log(req.file);
      // console.log(registerExam);
      const registered = await registerExam.save();
      res.status(201).redirect("/teacher/create-exam");
    } catch (error) {
      console.log(error);
    }
  }
);

app.get("/logout", (req, res) => {
  const token = req.cookies.token;

  if (!token) {
    return res.redirect("/");
  }

  // redisClient.set(token, "blacklisted", "EX", 3600); // Blacklist for 1 hour
  res.clearCookie("token"); // Clear the cookie
  res.redirect("/"); // No Content
});

app.post(
  "/upload-answersheet",
  authenticateStudentToken,
  upload.single("answer-sheet"),
  async (req, res) => {
    try {
      // console.log(req.file);
      const registerExam = await studentExam.updateOne(
        {
          _id: req.query.id,
        },
        {
          name: req.file.originalname,
          location: await uploadFile(req.file),
          submitted: "YES",
        }
      );
      // console.log(registerExam);
      // console.log(req.file);
      // console.log(registerExam);

      res.status(201).redirect("/student/exam-hall");
    } catch (error) {
      console.log(error);
    }
  }
);

app.get("/teacher/studentlist", authenticateTeacherToken, async (req, res) => {
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
        displaypicture: req.user.displaypicture,
        subject: records[0].subject,
        date: records[0].date,
        records,
      });
    }
  } catch (error) {
    console.log(error);
  }
});

app.get(
  "/teacher/studentapaper",
  authenticateTeacherToken,
  async (req, res) => {
    try {
      // console.log(req.session);
      const records = await studentExam.findOne({
        name: req.query.file,
      });
      res.render("studentapaper", {
        subject: records.subject,
        usn: records.usn,
        name: records.location,
        studentname: records.studentname,
        id: records._id,
        displaypicture: req.user.displaypicture,
      });
    } catch (error) {
      console.log(error);
    }
  }
);

app.post("/update-marks", authenticateTeacherToken, async (req, res) => {
  try {
    // console.log(req.query.id);
    const updateMarks = await studentExam.updateOne(
      {
        _id: req.query.id,
      },
      {
        marks: req.body.marks,
        evaluated: "YES",
      }
    );
    // console.log(updateMarks);
    res.redirect("/teacher/exam-history");
  } catch (error) {
    console.log(error);
  }
});

app.post("/delete-exam", authenticateTeacherToken, async (req, res) => {
  try {
    // console.log(req.query.examcode);
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

app.listen(3000);
