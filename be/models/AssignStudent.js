const mongoose = require("mongoose");

const AssignStudentSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
  class: { type: mongoose.Schema.Types.ObjectId, ref: "Class", required: true },
  assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin", required: true }, 
  assignedAt: { type: Date, default: Date.now }
});

AssignStudentSchema.index({ class: 1 });
AssignStudentSchema.index({ student: 1 });

AssignStudentSchema.post('find', function(docs) {
  if (!docs) return;
  docs.forEach(doc => {
    if (doc && !doc.class) {
      console.log(`Warning: Class not populated in AssignStudent: ${doc._id}, student: ${doc.student}`);
    }
    if (doc && !doc.student) {
      console.log(`Warning: Student not populated in AssignStudent: ${doc._id}, class: ${doc.class}`);
    }
  });
});

const AssignStudent = mongoose.model("AssignStudent", AssignStudentSchema);
module.exports = AssignStudent;
