const Schedule = require("../models/Schedule");
const Class = require("../models/Class");
const AssignStudent = require("../models/AssignStudent");

const createSchedule = async (req, res) => {
  try {
    const { classId, date, startTime, endTime, type, meetingLink } = req.body;

    if (!classId || !date || !startTime || !endTime || !type) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (startTime === endTime) {
      return res.status(400).json({ message: "Start time and end time cannot be the same" });
    }

    if (startTime > endTime) {
      return res.status(400).json({ message: "Start time must be before end time" });
    }

    const classData = await Class.findById(classId);
    if (!classData) {
      return res.status(404).json({ message: "Class not found" });
    }

    if (type === "Online" && !meetingLink) {
      return res.status(400).json({ message: "Online class must have a meeting link" });
    }

    const location = type === "Offline" ? classData.class_name : undefined;

    const existingSchedule = await Schedule.findOne({
      class: classId,
      date: date,
      $or: [
        { startTime: { $lt: endTime }, endTime: { $gt: startTime } },
      ],
    });

    if (existingSchedule) {
      return res.status(400).json({ message: "Schedule already exists for this time!" });
    }

    const assignedStudents = await AssignStudent.findOne({ class: classId });
    if (!assignedStudents) {
      return res.status(400).json({ message: "Assign student to this class." });
    }

    const newSchedule = new Schedule({
      class: classId,
      date,
      startTime,
      endTime,
      type,
      location,
      meetingLink: type === "Online" ? meetingLink : undefined,
    });

    await newSchedule.save();

    const io = req.app.get("socketio");
    io.emit("updateDashboard", { message:" Add schedule successfully", newSchedule : newSchedule });

    res.status(201).json({ message: "Schedule created successfully!", newSchedule });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getAllSchedules = async (req, res) => {
  try {
    const schedules = await Schedule.find().populate("class", "class_name");
    res.status(200).json(schedules);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateSchedule = async (req, res) => {
  try {
    const { scheduleId } = req.params;
    const { date, startTime, endTime, type, meetingLink } = req.body;

    if (startTime === endTime) {
      return res.status(400).json({ message: "Start time and end time cannot be the same" });
    }

    if (startTime > endTime) {
      return res.status(400).json({ message: "Start time must be before end time" });
    }

    const updatedSchedule = await Schedule.findByIdAndUpdate(
      scheduleId,
      { date, startTime, endTime, type, meetingLink },
      { new: true }
    );

    if (!updatedSchedule) {
      return res.status(404).json({ message: "Schedule not found" });
    }

    const io = req.app.get("socketio");
    io.emit("updateDashboard", { message:" Update schedule successfully", updatedSchedule : updatedSchedule });

    res.status(200).json({ message: "Schedule updated successfully!", updatedSchedule });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteSchedule = async (req, res) => {
  try {
    const { scheduleId } = req.params;
    const deletedSchedule = await Schedule.findByIdAndDelete(scheduleId);

    if (!deletedSchedule) {
      return res.status(404).json({ message: "Schedule not found" });
    }

    const io = req.app.get("socketio");
    io.emit("updateDashboard", { message:" Delelte class successfully", deletedSchedule : deletedSchedule });

    res.status(200).json({ message: "Schedule deleted successfully!" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


const getStudentSchedules = async (req, res) => {
  try {
    const studentId = req.user.id; 

    const assignedClasses = await AssignStudent.find({ student: studentId }).distinct("class");

    const schedules = await Schedule.find({ class: { $in: assignedClasses } })
      .populate("class", "class_name")
      .sort({ date: 1, startTime: 1 });

    res.status(200).json({ schedules });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getTutorSchedules = async (req, res) => {
  try {
    const tutorId = req.user.id;

    const tutorClasses = await Class.find({ tutor: tutorId }).distinct("_id");

    const schedules = await Schedule.find({ class: { $in: tutorClasses } })
      .populate("class", "class_name")
      .sort({ date: 1, startTime: 1 });

    res.status(200).json({ schedules });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


module.exports = {
  createSchedule,
  getAllSchedules,
  updateSchedule,
  deleteSchedule,
  getStudentSchedules,
  getTutorSchedules
};
