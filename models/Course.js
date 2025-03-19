const mongoose = require('mongoose');

const CourseSchema = new mongoose.Schema({
  courseName: { type: String, required: true },
  totalClasses: { type: Number, required: true },
  attendedClasses: { type: Number, required: true }
});

module.exports = mongoose.model('Course', CourseSchema);