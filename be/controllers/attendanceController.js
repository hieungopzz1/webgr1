const Schedule = require("../models/Schedule");
const Attendance = require("../models/Attendance");
const AssignStudent = require("../models/AssignStudent");

const getStudentsBySchedule = async (req, res) => {
  try {
    const { scheduleId } = req.params;
    
    const schedule = await Schedule.findById(scheduleId).populate('class');
    if (!schedule) {
      return res.status(404).json({ message: "Schedule not found" });
    }
    
    const classId = schedule.class._id;
    
    // Lấy danh sách sinh viên được gán cho lớp học
    const assignedStudents = await AssignStudent.find({ class: classId })
      .populate('student');
    
    // Lọc ra sinh viên không tồn tại (có thể đã bị xóa)
    const validStudents = assignedStudents
      .filter(assignment => assignment.student)
      .map(assignment => assignment.student);
    
    res.json({ students: validStudents });
  } catch (error) {
    res.status(500).json({ message: "Error retrieving students", error: error.message });
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
    
    // Lấy trạng thái điểm danh
    const attendances = await Attendance.find({ schedule: scheduleId })
      .populate('student', 'firstName lastName email student_ID');
    
    // Tìm sinh viên đã được điểm danh là present
    const presentStudents = attendances
      .filter(att => att.status === 'Present' && att.student)
      .map(att => att.student);
    
    // Tìm sinh viên đã được điểm danh là absent
    const absentStudents = attendances
      .filter(att => att.status === 'Absent' && att.student)
      .map(att => att.student);
    
    // Tìm lớp học của lịch trình
    const schedule = await Schedule.findById(scheduleId);
    if (!schedule) {
      return res.status(404).json({ message: "Schedule not found" });
    }
    
    // Lấy tất cả sinh viên trong lớp
    const assignedStudents = await AssignStudent.find({ class: schedule.class })
      .populate('student', 'firstName lastName email student_ID');
    
    // Lọc sinh viên hợp lệ (chưa điểm danh và tồn tại)
    const validAssignedStudents = assignedStudents.filter(as => as.student);
    
    // Lấy danh sách ID của sinh viên đã điểm danh
    const attendedStudentIds = [...presentStudents, ...absentStudents].map(s => s._id.toString());
    
    // Lọc ra sinh viên chưa điểm danh
    const notYetStudents = validAssignedStudents
      .filter(as => !attendedStudentIds.includes(as.student._id.toString()))
      .map(as => as.student);
    
    res.json({
      presentStudents,
      absentStudents,
      notYetStudents,
    });
  } catch (error) {
    res.status(500).json({ message: "Error retrieving attendance status", error: error.message });
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
