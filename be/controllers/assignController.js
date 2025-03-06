const Admin = require("../models/Admin");
const Tutor = require("../models/Tutor");
const Student = require("../models/Student");
const Assignment = require("../models/Assignment");

const assign = async (req, res) => {
  try {
    const { assigned_by, tutor_id, student_id } = req.body;

    if (!assigned_by || !tutor_id || !student_id) {
      return res.status(400).json({ message: "" });
    }

    const adminExists = await Admin.findById(assigned_by);
    if (!adminExists) {
      return res.status(404).json({ message: "Admin Not Exists" });
    }

    const tutorExists = await Tutor.findById(tutor_id);
    if (!tutorExists) {
      return res.status(404).json({ message: "Tutor Not Exists" });
    }

    const studentExists = await Student.findById(student_id);
    if (!studentExists) {
      return res.status(404).json({ message: "Student Not Exists" });
    }

    const existingAssignment = await Assignment.findOne({
      tutor_id,
      student_id,
    });
    if (existingAssignment) {
      return res
        .status(400)
        .json({ message: "Student assigned with Tutor" });
    }

    const newAssignment = new Assignment({
      assigned_by,
      tutor_id,
      student_id,
    });

    await newAssignment.save();
    res
      .status(201)
      .json({ message: "Assign Successfull", assignment: newAssignment });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const assigns = async (req, res) => {
  try {
    const { assigned_by, tutor_id, student_ids } = req.body;

    if (
      !assigned_by ||
      !tutor_id ||
      !Array.isArray(student_ids) ||
      student_ids.length === 0
    ) {
      return res
        .status(400)
        .json({ message: "The information is not enough" });
    }

    const adminExists = await Admin.findById(assigned_by);
    if (!adminExists) {
      return res.status(404).json({ message: "Admin Not Exists" });
    }

    const tutorExists = await Tutor.findById(tutor_id);
    if (!tutorExists) {
      return res.status(404).json({ message: "Tutor Not Exists" });
    }

    const validStudents = await Student.find({ _id: { $in: student_ids } });
    if (validStudents.length !== student_ids.length) {
      return res
        .status(400)
        .json({ message: "One or Many Student Are Not Exists" });
    }

    const existingAssignments = await Assignment.find({
      tutor_id,
      student_id: { $in: student_ids },
    });
    const alreadyAssignedIds = existingAssignments.map((a) =>
      a.student_id.toString()
    );

    const newStudentIds = student_ids.filter(
      (id) => !alreadyAssignedIds.includes(id)
    );

    if (newStudentIds.length === 0) {
      return res
        .status(400)
        .json({ message: "All Student are assigned by Tutor previous" });
    }

    const newAssignments = newStudentIds.map((student_id) => ({
      assigned_by,
      tutor_id,
      student_id,
    }));

    await Assignment.insertMany(newAssignments);

    res.status(201).json({
      message: "Assign successfully",
      assigned_students: newStudentIds,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getAssign = async (req, res) => {
  try {
    const assignments = await Assignment.find()
      .populate("assigned_by", "user_id")
      .populate("tutor_id", "user_id fullname")
      .populate("student_id", "user_id fullname");

    res.status(200).json(assignments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteAssign = async (req, res) => {
  try {
    const assignment = await Assignment.findByIdAndDelete(req.params.id);

    if (!assignment) {
      return res.status(404).json({ message: "Not found" });
    }

    res.status(200).json({ message: "Delele success" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { assign, assigns, getAssign, deleteAssign };
