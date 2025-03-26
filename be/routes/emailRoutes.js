const express = require("express");
const sendEmailAllocation = require("../services/emailService");

const router = express.Router();

router.post("/send-email", async (req, res) => {
  const { to, subject, text } = req.body;

  if (!to || !subject || !text) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    await sendEmailAllocation(to, subject, text);
    res.status(200).json({ message: "Email sent successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to send email", error });
  }
});

module.exports = router;
