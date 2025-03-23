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
    }).populate("student", "firstName lastName email role");


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

// const markAttendance = async (req, res) => {
//   try {
//     const { scheduleId, students } = req.body;
//     const tutorId = req.user.id; 

//     const schedule = await Schedule.findById(scheduleId);
//     if (!schedule) {
//       return res.status(404).json({ message: "Schedule not found" });
//     }

//     const assignedStudents = await AssignStudent.find({ class: schedule.class }).populate("student");

//     const classStudentIds = assignedStudents.map((s) => s.student._id.toString());
//     console.log(classStudentIds)
//     const invalidStudents = students.filter(s => !classStudentIds.includes(s.studentId));
//     console.log(invalidStudents)
//     if (invalidStudents.length > 0) {
//       return res.status(400).json({ 
//         message: "Some students are not in this class", 
//         invalidStudents 
//       });
//     }

//     const existingAttendance = await Attendance.find({ 
//       schedule: scheduleId, 
//       student: { $in: students.map(s => s.studentId) }
//     });

//     const alreadyMarkedIds = existingAttendance.map(a => a.student.toString());
//     const newAttendances = students.filter(s => !alreadyMarkedIds.includes(s.studentId));

//     if (newAttendances.length === 0) {
//       return res.status(400).json({ message: "All students have already been marked attendance!" });
//     }

//     const attendanceRecords = newAttendances.map(({ studentId, status }) => ({
//       schedule: scheduleId,
//       student: studentId,
//       status,
//       markedBy: tutorId,
//     }));

//     await Attendance.insertMany(attendanceRecords);

//     res.status(201).json({ 
//       message: "Bulk attendance marked successfully!", 
//       attendanceCount: attendanceRecords.length 
//     });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };
//
// const markAttendance = async (req, res) => {
//   try {
//     const { scheduleId, students } = req.body;
//     const tutorId = req.user.id;
//     console.log(tutorId)
//     const schedule = await Schedule.findById(scheduleId);
//     if (!schedule) {
//       return res.status(404).json({ message: "Schedule not found" });
//     }

//     const assignedStudents = await AssignStudent.find({
//       class: schedule.class,
//     }).populate("student", "firstName lastName email role");

//     const classStudentIds = assignedStudents.map((s) => s.student._id.toString());

//     const invalidStudents = students.filter(s => !classStudentIds.includes(s.studentId));
//     if (invalidStudents.length > 0) {
//       return res.status(400).json({ 
//         message: "Some students are not in this class", 
//         invalidStudents 
//       });
//     }

//     const existingAttendance = await Attendance.find({ 
//       schedule: scheduleId, 
//       student: { $in: classStudentIds }
//     });

//     const alreadyMarkedIds = existingAttendance.map(a => a.student.toString());

//     const newAttendances = students.filter(s => !alreadyMarkedIds.includes(s.studentId));

//     const absentStudents = classStudentIds.filter(id => !students.some(s => s.studentId === id));

//     const attendanceRecords = [
//       ...newAttendances.map(({ studentId, status }) => ({
//         schedule: scheduleId,
//         student: studentId,
//         status,
//         markedBy: tutorId,
//       })),
//       ...absentStudents.map(studentId => ({
//         schedule: scheduleId,
//         student: studentId,
//         status: "Absent",
//         markedBy: tutorId,
//       }))
//     ];

//     await Attendance.insertMany(attendanceRecords);

//     res.status(201).json({ 
//       message: "Attendance marked successfully!", 
//       attendanceCount: attendanceRecords.length 
//     });

//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

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

    const alreadyMarked = new Map(existingAttendance.map(a => [a.student.toString(), a.status]));

    const newAttendances = students.filter(s => {
      const existingStatus = alreadyMarked.get(s.studentId);
      return !existingStatus || existingStatus !== "Present"; 
    });

    const absentStudents = classStudentIds.filter(id => !students.some(s => s.studentId === id));

    const attendanceRecords = [
      ...newAttendances.map(({ studentId, status }) => ({
        schedule: scheduleId,
        student: studentId,
        status,
        markedBy: tutorId,
      })),
      ...absentStudents.map(studentId => ({
        schedule: scheduleId,
        student: studentId,
        status: "Absent",
        markedBy: tutorId,
      }))
    ];

    await Attendance.insertMany(attendanceRecords);

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
      .populate("student", "firstName lastName email role");

    const allStudents = studentsInClass.map(s => ({
      _id: s.student._id.toString(),
      firstName: s.student.firstName,
      lastName: s.student.lastName,
      email: s.student.email,
      role: s.student.role,
    }));

    const attendanceRecords = await Attendance.find({ schedule: scheduleId }).populate("student", "firstName lastName email role");

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

module.exports = { getStudentsBySchedule, getAttendanceStatus , markAttendance };
