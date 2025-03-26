const mongoose = require("mongoose");

const ClassSchema = new mongoose.Schema({
  class_name: { type: String, required: true },
  major: { type: String, required: true }, 
  subject: { type: String, required: true } 
});

const Class = mongoose.model("Class", ClassSchema);
module.exports = Class;