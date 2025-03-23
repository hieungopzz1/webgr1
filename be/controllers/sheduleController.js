const Schedule = require("../models/Schedule");
//quan ly lich hoc
const createSchedule = async (req, res) => {
  try {
    const { classId, date, startTime, endTime } = req.body;

    if (!classId || !date || !startTime || !endTime) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingSchedule = await Schedule.findOne({
      class: classId,
      date: date,
      $or: [
        { startTime: { $lt: endTime, $gte: startTime } }, 
        { endTime: { $gt: startTime, $lte: endTime } },   
      ],
    });

    if (existingSchedule) {
      return res.status(400).json({ message: "Schedule already exists for this time!" });
    }

    const schedule = new Schedule({
      class: classId,
      date,
      startTime,
      endTime,
    });

    await schedule.save();
    res.status(201).json({ message: "Schedule created successfully!", schedule });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateSchedule = async (req, res) => {
  try {
    const { scheduleId } = req.params;
    const { classId, date, startTime, endTime } = req.body;

    const updatedSchedule = await Schedule.findByIdAndUpdate(
      scheduleId,
      { class: classId, date, startTime, endTime },
      { new: true }
    );
    res
      .status(200)
      .json({ message: "Lịch học đã được cập nhật!", updatedSchedule });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
const deleteSchedule = async (req, res) => {
  try {
    const { scheduleId } = req.params;
    const deletedSchedule = await Schedule.findByIdAndDelete(scheduleId);
    res.status(200).json({ message: "Lịch học đã được xóa!", deletedSchedule });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
const getScheduleByClass = async (req, res) => {
  try {
    const classId = req.params.classId;
    const schedules = await Schedule.find({ class: classId })

    res.status(200).json(schedules);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
const getAllSchedules = async (req, res) => {
  try {
    const schedules = await Schedule.find()
    res.status(200).json({ message: "Success", schedules });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAllSchedules,
  getScheduleByClass,
  createSchedule,
  updateSchedule,
  deleteSchedule,
};
