const Class = require("../models/Class");

const getTutorClasses = async (req, res) => {
  try {
    const tutorId = req.user.id; // lấy từ token sau khi xác thực

    const classes = await Class.find({ tutor: tutorId });

    return res.status(200).json({ classes });
  } catch (error) {
    return res.status(500).json({ error });
  }
};


module.exports = {
  getTutorClasses,
};
