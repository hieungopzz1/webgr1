const mongoose = require("mongoose");
const Blog = require("../models/Blog");
const Document = require("../models/Document");
const TutorSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: "Tutor" },
  avatar: { type: String }
});

TutorSchema.pre("findOneAndDelete", async function (next) {
  const tutor = await this.model.findOne(this.getFilter());
  if (tutor) {
    const blogs = await Blog.find({ tutor_id: tutor._id });
    if (blogs.length > 0) {
      await Blog.deleteMany({ tutor_id: tutor._id });
    }
    await Document.deleteMany({ tutor_id: tutor._id });
  }
  next();
});

const Tutor = mongoose.model("Tutor", TutorSchema);
module.exports = Tutor;