const express = require("express");
const router = express.Router();
const Assignment = require("../models/Assignment");
const Tutor = require("../models/Tutor");
const Student = require("../models/Student");
const Admin = require("../models/Admin");

// 🟢 API: Phân bổ sinh viên cho tutor (POST /api/assignments)
router.post("/", async (req, res) => {
  try {
    const { assigned_by, tutor_id, student_id } = req.body;

    if (!assigned_by || !tutor_id || !student_id) {
      return res.status(400).json({ message: "Thiếu thông tin bắt buộc" });
    }

    // Kiểm tra Admin có tồn tại không
    const adminExists = await Admin.findById(assigned_by);
    if (!adminExists) {
      return res.status(404).json({ message: "Admin không tồn tại" });
    }

    // Kiểm tra Tutor có tồn tại không
    const tutorExists = await Tutor.findById(tutor_id);
    if (!tutorExists) {
      return res.status(404).json({ message: "Tutor không tồn tại" });
    }

    // Kiểm tra Student có tồn tại không
    const studentExists = await Student.findById(student_id);
    if (!studentExists) {
      return res.status(404).json({ message: "Student không tồn tại" });
    }

    // Kiểm tra xem student đã được gán cho tutor này chưa
    const existingAssignment = await Assignment.findOne({ tutor_id, student_id });
    if (existingAssignment) {
      return res.status(400).json({ message: "Student đã được gán cho tutor này rồi" });
    }

    // Tạo assignment mới
    const newAssignment = new Assignment({
      assigned_by,
      tutor_id,
      student_id,
    });

    await newAssignment.save();
    res.status(201).json({ message: "Phân bổ thành công", assignment: newAssignment });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 🟢 API: Phân bổ nhiều sinh viên cho một tutor (POST /api/assignments/bulk)
router.post("/bulk", async (req, res) => {
    try {
      const { assigned_by, tutor_id, student_ids } = req.body;
  
      if (!assigned_by || !tutor_id || !Array.isArray(student_ids) || student_ids.length === 0) {
        return res.status(400).json({ message: "Thiếu thông tin hoặc danh sách sinh viên rỗng" });
      }
  
      // Kiểm tra Admin có tồn tại không
      const adminExists = await Admin.findById(assigned_by);
      if (!adminExists) {
        return res.status(404).json({ message: "Admin không tồn tại" });
      }
  
      // Kiểm tra Tutor có tồn tại không
      const tutorExists = await Tutor.findById(tutor_id);
      if (!tutorExists) {
        return res.status(404).json({ message: "Tutor không tồn tại" });
      }
  
      // Kiểm tra từng Student có tồn tại không
      const validStudents = await Student.find({ _id: { $in: student_ids } });
      if (validStudents.length !== student_ids.length) {
        return res.status(400).json({ message: "Một hoặc nhiều sinh viên không tồn tại" });
      }
  
      // Kiểm tra xem student nào đã được gán trước đó
      const existingAssignments = await Assignment.find({ tutor_id, student_id: { $in: student_ids } });
      const alreadyAssignedIds = existingAssignments.map((a) => a.student_id.toString());
  
      // Lọc ra danh sách student chưa được gán
      const newStudentIds = student_ids.filter((id) => !alreadyAssignedIds.includes(id));
  
      if (newStudentIds.length === 0) {
        return res.status(400).json({ message: "Tất cả sinh viên đã được gán trước đó" });
      }
  
      // Tạo danh sách phân bổ mới
      const newAssignments = newStudentIds.map((student_id) => ({
        assigned_by,
        tutor_id,
        student_id,
      }));
  
      await Assignment.insertMany(newAssignments);
  
      res.status(201).json({ message: "Phân bổ thành công", assigned_students: newStudentIds });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

// 🟢 API: Lấy danh sách phân bổ (GET /api/assignments)
router.get("/", async (req, res) => {
  try {
    const assignments = await Assignment.find()
      .populate("assigned_by", "user_id")
      .populate("tutor_id", "user_id fullname")
      .populate("student_id", "user_id fullname");

    res.status(200).json(assignments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 🟢 API: Xóa phân bổ (DELETE /api/assignments/:id)
router.delete("/:id", async (req, res) => {
  try {
    const assignment = await Assignment.findByIdAndDelete(req.params.id);

    if (!assignment) {
      return res.status(404).json({ message: "Không tìm thấy phân bổ" });
    }

    res.status(200).json({ message: "Xóa phân bổ thành công" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
