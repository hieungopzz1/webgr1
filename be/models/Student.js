const mongoose = require("mongoose");
const Blog = require("../models/Blog");
const Document = require("../models/Document");
const StudentSchema = new mongoose.Schema({
  student_ID: { type: String, required: true, unique: true }, 
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true }, 
  password: { type: String, required: true },
  role: { type: String, default: "Student" },
  major: { type: String, required: true }, 
  avatar: { type: String }
});

StudentSchema.pre("findOneAndDelete", async function (next) {
  const student = await this.model.findOne(this.getFilter());
  if (student) {
    const blogs = await Blog.find({ student_id: student._id });
    if (blogs.length > 0) {
      await Blog.deleteMany({ student_id: student._id });
    }
    await Document.deleteMany({ student_id: student._id });
  }
  next();
});


const Student = mongoose.model("Student", StudentSchema);
module.exports = Student;