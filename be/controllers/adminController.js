const Admin = require("../models/Admin");
const Student = require("../models/Student");
const Tutor = require("../models/Tutor");
const Blog = require("../models/Blog");
const Meeting = require("../models/Meeting");
const Document = require("../models/Document");
const Class = require("../models/Class");
const AssignStudent = require("../models/AssignStudent");
const AssignTutor = require("../models/AssignTutor");
const Schedule = require("../models/Schedule");
const bcrypt = require("bcrypt");
const fs = require("fs");
const path = require("path");
const createAccount = async (req, res) => {
  try {
    const { firstName, lastName, email, password, role } = req.body;
    const avatar = req.file ? `/uploads/avatar/${req.file.filename}` : null;

    if (!["Student", "Tutor", "Admin"].includes(role)) {
      if (avatar) removeImage(avatar);
      return res.status(400).json({ message: "Invalid role" });
    }

    const existingUser =
      (await Student.findOne({ email })) ||
      (await Tutor.findOne({ email })) ||
      (await Admin.findOne({ email }));

    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    let user;
    if (role === "Student") {
      user = new Student({
        firstName,
        lastName,
        email,
        password: hashedPassword,
        avatar,
      });
    } else if (role === "Tutor") {
      user = new Tutor({
        firstName,
        lastName,
        email,
        password: hashedPassword,
        avatar,
      });
    } else if (role === "Admin") {
      user = new Admin({
        firstName,
        lastName,
        email,
        password: hashedPassword,
        avatar,
      });
    }

    await user.save();
    res
      .status(201)
      .json({ user, message: "User created successfully", avatar });
  } catch (error) {
    if (req.file) removeImage(`/uploads/avatar/${req.file.filename}`);
    res.status(500).json({ error: error.message });
  }
};

const removeImage = (filePath) => {
  const fullPath = path.join(__dirname, "..", filePath);
  fs.unlink(fullPath, (err) => {
    if (err) console.error("Error deleting image:", err);
  });
};

const getAllUsers = async (req, res) => {
  try {
    const students = await Student.find(
      {},
      "firstName lastName email role avatar"
    );
    const tutors = await Tutor.find({}, "firstName lastName email role avatar");

    const users = [...students, ...tutors];

    res.status(200).json({ message: "Success", users });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error retrieving users", error: error.message });
  }
};

const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user =
      (await Student.findById(id)) ||
      (await Tutor.findById(id)) ||
      (await Admin.findById(id));
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ user });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error retrieving user", error: error.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    let deletedUser = await Student.findById(id);
    if (deletedUser) {
      const blogs = await Blog.find({ student_id: id });
      if (blogs.length > 0) {
        await Blog.deleteMany({ student_id: id });
      }

      const documents = await Document.find({ student_id: id });
      if (documents.length > 0) {
        await Document.deleteMany({ student_id: id });
      }

      await Student.findByIdAndDelete(id);
      return res.status(200).json({ message: "Student and related data deleted", deletedUser });
    }

    deletedUser = await Tutor.findById(id);
    if (deletedUser) {
      const blogs = await Blog.find({ tutor_id: id });
      if (blogs.length > 0) {
        await Blog.deleteMany({ tutor_id: id });
      }
      const documents = await Document.find({ tutor_id: id });
      if (documents.length > 0) {
        await Document.deleteMany({ tutor_id: id });
      }
      await Tutor.findByIdAndDelete(id);
      return res.status(200).json({ message: "Tutor and related data deleted", deletedUser });
    }

    res.status(404).json({ message: "User not found" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


const createMeeting = async (req, res) => {
  try {
    const { title, created_by, type, link, location, date } = req.body;

    if (!title || !created_by || !type || !date) {
      return res.status(400).json({ message: "All fields are required" });
    }
    if (type === "online" && !link) {
      return res
        .status(400)
        .json({ message: "Online meeting must have a link" });
    }
    if (type === "offline" && !location) {
      return res
        .status(400)
        .json({ message: "Offline meeting must have a location" });
    }

    const newMeeting = new Meeting({
      title,
      created_by,
      type,
      link,
      location,
      date,
    });

    await newMeeting.save();
    res
      .status(201)
      .json({ message: "Meeting created successfully", newMeeting });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateMeeting = async (req, res) => {
  try {
    const { meetingId } = req.params;
    const { title, type, link, location, date } = req.body;

    if (!title || !type || !date) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const updatedMeeting = await Meeting.findByIdAndUpdate(
      meetingId,
      { title, type, link, location, date },
      { new: true }
    );

    if (!updatedMeeting)
      return res.status(404).json({ message: "Meeting not found" });

    res
      .status(200)
      .json({ message: "Meeting updated successfully", updatedMeeting });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteMeeting = async (req, res) => {
  try {
    const { meetingId } = req.params;
    const deletedMeeting = await Meeting.findByIdAndDelete(meetingId);

    if (!deletedMeeting)
      return res.status(404).json({ message: "Meeting not found" });

    res.status(200).json({ message: "Meeting deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//lya sinh vien theo major
const getStudentsByMajor = async (req, res) => {
  try {
    const { major } = req.query;

    if (!major) {
      return res.status(400).json({ message: "Vui lòng cung cấp major!" });
    }

    // Lọc danh sách sinh viên theo major
    const students = await Student.find({ major });

    res.status(200).json(students);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//quan ly lop hoc
const createClass = async (req, res) => {
  try {
    const { class_name, major, subject } = req.body;
    if (!class_name || !major || !subject) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const existingClass = await Class.findOne({ class_name });
    if (existingClass) {
      return res.status(400).json({ message: "Class already exists" });
    }
    const newClass = new Class({ class_name, major, subject });

    await newClass.save();
    res.status(201).json({ message: "Class created successfully", class: newClass });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
// const updateClass = async (req, res) => {
//   try {
//     const { classId } = req.params;
//     const { class_name, major, subject } = req.body;
//     const updatedClass = await Class.findByIdAndUpdate(classId, { class_name, major, subject }, { new: true });
//     res.status(200).json({ message: "Class updated successfully", updatedClass });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// }
// const deleteClass = async (req, res) => {
//   try {
//     const { class_id } = req.params;
//     const deletedClass = await Class.findByIdAndDelete(class_id);
//     res.status(200).json({ message: "Class deleted successfully", deletedClass });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// }
const getAllClasses = async (req, res) => {
  try {
    const classes = await Class.find();
    res.status(200).json(classes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
const getClassById = async (req, res) => {
  try {
    const { classId } = req.params;
    const classs = await Class.findById(classId);
    res.status(200).json(classs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

//quan ly phan bo sinh vien va giao vien

const getAllStudents = async (req, res) => {
  try {
    const students = await Student.find({}, "student_ID firstName lastName email avatar");
    res.status(200).json({ message: "Success", students });
  } catch (error) {
    res.status(500).json({ message: "Error retrieving students", error: error.message });
  }
};

const getAllTutors = async (req, res) => {
  try {
    const tutors = await Tutor.find({}, "firstName lastName email avatar");
    res.status(200).json({ message: "Success", tutors });
  } catch (error) {
    res.status(500).json({ message: "Error retrieving tutors", error: error.message });
  }
};
const assignStudent = async (req, res) => {
  try {
    const { studentIds, classId, adminId } = req.body;

    if (!studentIds || studentIds.length === 0) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingAssignments = await AssignStudent.find({ class: classId }).select("student");
    const assignedStudentIds = existingAssignments.map((as) => as.student.toString());

    const newStudents = studentIds.filter((id) => !assignedStudentIds.includes(id));

    if (newStudents.length === 0) {
      return res.status(400).json({ message: "Students have been assigned to this class before!" });
    }

    const assignments = newStudents.map((studentId) => ({
      student: studentId,
      class: classId,
      assignedBy: adminId,
    }));

    await AssignStudent.insertMany(assignments);

    res.status(201).json({ 
      message: "Students assigned to class successfully!", 
      assigned: newStudents.length 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
const assignTutor = async (req, res) => {
  try {
    const { tutor, classId, adminId } = req.body;

    const assignment = new AssignTutor({ tutor, class: classId, assignedBy: adminId });
    await assignment.save();

    res.status(201).json({ message: "Tutor assigned to class successfully!", assignment });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
const getAssignTutorInClass = async (req, res) => {
  try {
    const classId = req.params.classId;
    const tutors = await AssignTutor.find({ class: classId }).populate("tutor");

    res.status(200).json(tutors);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
const getAssignStudentInClass = async (req, res) => {
  try {
    const classId = req.params.classId;
    const students = await AssignStudent.find({ class: classId }).populate("student");
    
    res.status(200).json(students);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}



//quan ly lich hoc
const createSchedule = async (req, res) => {
  try {
    const { classId, tutorId, date, startTime, endTime } = req.body;

    const schedule = new Schedule({
      class: classId,
      tutor: tutorId,
      date,
      startTime,
      endTime
    });

    await schedule.save();
    res.status(201).json({ message: "Schedule created successfully!", schedule });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
// const updateSchedule = async (req, res) => {
//   try {
//     const { scheduleId } = req.params;
//     const { classId, tutorId, date, startTime, endTime } = req.body;

//     const updatedSchedule = await Schedule.findByIdAndUpdate(scheduleId, { class: classId, tutor: tutorId, date, startTime, endTime }, { new: true });
//     res.status(200).json({ message: "Lịch học đã được cập nhật!", updatedSchedule });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// }
// const deleteSchedule = async (req, res) => {
//   try {
//       const { scheduleId } = req.params;
//     const deletedSchedule = await Schedule.findByIdAndDelete(scheduleId);
//     res.status(200).json({ message: "Lịch học đã được xóa!", deletedSchedule });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// }
const getScheduleByClass = async (req, res) => {
  try {
    const classId = req.params.classId;
    const schedules = await Schedule.find({ class: classId }).populate("tutor class");

    res.status(200).json(schedules);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
const getAllSchedules = async (req, res) => {
  try {
    const schedules = await Schedule.find().populate("tutor class");
    res.status(200).json({message: "Success", schedules});
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}





module.exports = {
  createAccount,
  deleteUser,
  getAllUsers,
  getUserById,
  createMeeting,
  deleteMeeting,
  updateMeeting,
  createClass,
  // updateClass,
  // deleteClass,
  getAllClasses,
  assignStudent,
  assignTutor,
  getAssignTutorInClass,
  getAssignStudentInClass,
  createSchedule,
  // updateSchedule,
  // deleteSchedule,
  getScheduleByClass,
  getAllSchedules,
  getStudentsByMajor,
  getClassById,
  getAllStudents,
  getAllTutors,
};