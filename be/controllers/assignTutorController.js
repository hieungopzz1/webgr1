const AssignTutor = require("../models/AssignTutor");
const Class = require("../models/Class");
const Tutor = require("../models/Tutor");
const assignTutor = async (req, res) => {
  try {
    const { tutorIds, classId, adminId } = req.body;

    if (!tutorIds || tutorIds.length === 0) {
      return res
        .status(400)
        .json({ message: "Danh sách giảng viên không được để trống!" });
    }

    const classData = await Class.findById(classId);
    if (!classData) {
      return res.status(404).json({ message: "Class không tồn tại!" });
    }

    const validTutors = await Tutor.find({
      _id: { $in: tutorIds },
      role: "Tutor",
    }).select("_id");

    const validTutorIds = validTutors.map((t) => t._id.toString());

    if (validTutorIds.length === 0) {
      return res
        .status(400)
        .json({ message: "Không có giảng viên hợp lệ để gán vào lớp!" });
    }

    const existingAssignments = await AssignTutor.find({
      class: classId,
    }).select("tutor");
    const assignedTutorIds = existingAssignments.map((as) =>
      as.tutor.toString()
    );

    const newTutors = validTutorIds.filter(
      (id) => !assignedTutorIds.includes(id)
    );

    if (newTutors.length === 0) {
      return res
        .status(400)
        .json({ message: "Tất cả giảng viên đã được gán vào lớp trước đó!" });
    }

    const assignments = newTutors.map((tutorId) => ({
      tutor: tutorId,
      class: classId,
      assignedBy: adminId,
    }));

    await AssignTutor.insertMany(assignments);

    res
      .status(201)
      .json({
        message: "Gán giảng viên vào lớp thành công!",
        assigned: newTutors.length,
      });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getAllTutors = async (req, res) => {
  try {
    const tutors = await Tutor.find({}, "firstName lastName email avatar");
    res.status(200).json({ message: "Success", tutors });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error retrieving tutors", error: error.message });
  }
};

const getAssignTutorInClass = async (req, res) => {
  try {
    const classId = req.params.classId;
    const tutors = await AssignTutor.find({ class: classId }).populate("tutor");

    res.status(200).json(tutors);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateAssignTutor = async (req, res) => {
  try {
    const { classId, adminId, addTutors, removeTutors } = req.body;

    if (!classId || !adminId) {
      return res.status(400).json({ message: "Thiếu thông tin cần thiết!" });
    }

    const classData = await Class.findById(classId);
    if (!classData) {
      return res.status(404).json({ message: "Class không tồn tại!" });
    }

    const validTutors = await Tutor.find({
      _id: { $in: [...addTutors, ...removeTutors] },
    }).select("_id");

    const validTutorIds = validTutors.map((t) => t._id.toString());

    const invalidTutors = [...addTutors, ...removeTutors].filter(
      (id) => !validTutorIds.includes(id)
    );
    if (invalidTutors.length > 0) {
      return res.status(400).json({
        message: "Một số Tutor không hợp lệ!",
        invalidTutors,
      });
    }

    if (addTutors.length > 0) {
      const newAssignments = addTutors.map((tutorId) => ({
        tutor: tutorId,
        class: classId,
        assignedBy: adminId,
      }));

      await AssignTutor.insertMany(newAssignments);
    }

    if (removeTutors.length > 0) {
      await AssignTutor.deleteMany({
        tutor: { $in: removeTutors },
        class: classId,
      });
    }

    res.status(200).json({
      message: "Cập nhật danh sách Tutor thành công!",
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server!", error: error.message });
  }
};
const removeTutor = async (req, res) => {};
module.exports = {
  assignTutor,
  getAssignTutorInClass,
  getAllTutors,
  removeTutor,
  updateAssignTutor
};
