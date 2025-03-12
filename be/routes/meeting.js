const express = require("express");
const router = express.Router();
const { getAllMeetings, getMeetingById, joinMeeting, leaveMeeting } = require("../controllers/meetingController");

router.get("/", getAllMeetings);

router.get("/:meetingId", getMeetingById);

router.post("/:meetingId/join", joinMeeting);

router.post("/:meetingId/leave", leaveMeeting);

module.exports = router;
