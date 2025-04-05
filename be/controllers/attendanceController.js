const Schedule = require("../models/Schedule");
const Attendance = require("../models/Attendance");
const AssignStudent = require("../models/AssignStudent");

const getStudentsBySchedule = async (req, res) => {
  try {
    const { scheduleId } = req.params;

    const schedule = await Schedule.findById(scheduleId);
    if (!schedule) {
      return res.status(404).json({ message: "Schedule not found" });
    }

    const students = await AssignStudent.find({
      class: schedule.class,
    }).populate("student", "firstName lastName student_ID email");


    res.status(200).json({
      scheduleId,
      classId: schedule.class,
      date: schedule.date,
      startTime: schedule.startTime,
      endTime: schedule.endTime,
      students: students.map((s) => s.student),
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const markAttendance = async (req, res) => {
  try {
    const { scheduleId, students } = req.body;
    const tutorId = req.user.id;

    const schedule = await Schedule.findById(scheduleId);
    if (!schedule) {
      return res.status(404).json({ message: "Schedule not found" });
    }

    const assignedStudents = await AssignStudent.find({ class: schedule.class }).populate("student", "firstName lastName email");
    const classStudentIds = assignedStudents.map((s) => s.student._id.toString());

    const invalidStudents = students.filter(s => !classStudentIds.includes(s.studentId));
    if (invalidStudents.length > 0) {
      return res.status(400).json({ 
        message: "Some students are not in this class", 
        invalidStudents 
      });
    }

    const existingAttendance = await Attendance.find({ 
      schedule: scheduleId, 
      student: { $in: classStudentIds }
    });

    const attendanceMap = new Map(existingAttendance.map(a => [a.student.toString(), a.status]));

    const newAttendanceRecords = [];
    const updateAttendancePromises = [];

    for (const { studentId, status } of students) {
      const existingStatus = attendanceMap.get(studentId);

      if (!existingStatus) {
        newAttendanceRecords.push({
          schedule: scheduleId,
          student: studentId,
          status,
          markedBy: tutorId,
        });
      } else if (existingStatus !== status) {
        updateAttendancePromises.push(
          Attendance.findOneAndUpdate(
            { schedule: scheduleId, student: studentId },
            { status, markedBy: tutorId },
            { new: true }
          )
        );
      }
    }

    if (newAttendanceRecords.length > 0) {
      await Attendance.insertMany(newAttendanceRecords);
    }

    const updatedAttendance = await Promise.all(updateAttendancePromises);

    const attendanceRecords = [...newAttendanceRecords, ...updatedAttendance];

    const io = req.app.get("socketio");
    io.emit("updateDashboard", { message: "Successfully!", attendanceRecords });

    res.status(201).json({ 
      message: "Attendance marked successfully!", 
      attendanceCount: attendanceRecords.length 
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};



const getAttendanceStatus = async (req, res) => {
  try {
    const { scheduleId } = req.params;

    const schedule = await Schedule.findById(scheduleId);
    if (!schedule) {
      return res.status(404).json({ message: "Schedule not found" });
    }

    const studentsInClass = await AssignStudent.find({ class: schedule.class })
      .populate("student", "firstName lastName email role student_ID");

    const allStudents = studentsInClass.map(s => ({
      _id: s.student._id.toString(),
      firstName: s.student.firstName,
      lastName: s.student.lastName,
      email: s.student.email,
      role: s.student.role,
      student_ID: s.student.student_ID
    }));

    const attendanceRecords = await Attendance.find({ schedule: scheduleId }).populate("student", "firstName lastName email role student_ID");

    const presentStudents = [];
    const absentStudents = [];

    const attendanceMap = new Map();
    attendanceRecords.forEach(record => {
      attendanceMap.set(record.student._id.toString(), record.status);
    });

    allStudents.forEach(student => {
      if (attendanceMap.has(student._id)) {
        if (attendanceMap.get(student._id) === "Present") {
          presentStudents.push(student);
        } else {
          absentStudents.push(student);
        }
      } else {
        absentStudents.push(student);
      }
    });

    res.status(200).json({
      scheduleId,
      classId: schedule.class,
      date: schedule.date,
      startTime: schedule.startTime,
      endTime: schedule.endTime,
      presentStudents,
      absentStudents,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


const getStudentAttendance = async (req, res) => {
  try {
    const studentId = req.user.id; 

    const attendanceRecords = await Attendance.find({ student: studentId })
      .populate("schedule", "class date") 
      .sort({ createdAt: -1 }) 
      .lean();

    res.status(200).json({ attendanceRecords });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


module.exports = { getStudentsBySchedule, getAttendanceStatus , markAttendance,getStudentAttendance };
