const Meeting = require("../models/Meeting");
const Student = require("../models/Student");
const Tutor = require("../models/Tutor");



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
const getAllMeetings = async (req, res) => {
  try {
    const meetings = await Meeting.find()
      .populate("created_by", "name email")
      .populate("students", "name email")
      .populate("tutors", "name email");
    res.status(200).json(meetings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getMeetingById = async (req, res) => {
  try {
    const { meetingId } = req.params;
    const meeting = await Meeting.findById(meetingId)
      .populate("created_by", "name email")
      .populate("students", "name email")
      .populate("tutors", "name email");

    if (!meeting) return res.status(404).json({ message: "Meeting not found" });

    res.status(200).json(meeting);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const joinMeeting = async (req, res) => {
    try {
      const { meetingId } = req.params;
      const { userId } = req.body;

      const meeting = await Meeting.findById(meetingId);
      if (!meeting) return res.status(404).json({ message: "Meeting not found" });
  
      if (meeting.students.includes(userId) || meeting.tutors.includes(userId)) {
        return res.status(400).json({ message: "User already joined the meeting" });
      }
  
      if (meeting.students.includes(userId)) {
        meeting.students.push(userId);
      } else {
        meeting.tutors.push(userId);
      }
  
      await meeting.save();
      res.status(200).json({ message: "Joined meeting successfully", meeting });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };
  

const leaveMeeting = async (req, res) => {
  try {
    const { meetingId } = req.params;
    const { userId } = req.body;

    const meeting = await Meeting.findById(meetingId);
    if (!meeting) return res.status(404).json({ message: "Meeting not found" });

    if (meeting.students.includes(userId)) {
      meeting.students = meeting.students.filter(
        (student) => student.toString() !== userId
      );
    } else if (meeting.tutors.includes(userId)) {
      meeting.tutors = meeting.tutors.filter(
        (tutor) => tutor.toString() !== userId
      );
    } else {
      return res.status(400).json({ message: "User not joined the meeting" });
    }

    await meeting.save();
    res.status(200).json({ message: "Left meeting successfully", meeting });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {createMeeting,updateMeeting,deleteMeeting, getAllMeetings, getMeetingById, joinMeeting, leaveMeeting };
