const AssignStudent = require("../models/AssignStudent");

const getJoinedClasses = async (req, res) => {
  try {
    const studentId = req.user.id;

    const assignments = await AssignStudent.find({
      student: studentId,
    }).populate({
      path: "class",
      populate: { path: "tutor" },
    });

    const classes = assignments
      .filter((a) => a.class !== null)
      .map((a) => a.class);

    return res.status(200).json({ classes });
  } catch (error) {
    return res.status(500).json({ error });
  }
};

module.exports = { getJoinedClasses };
