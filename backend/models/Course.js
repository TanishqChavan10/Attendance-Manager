const mongoose = require('mongoose');

const CourseSchema = new mongoose.Schema({
    user: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User',
        required: true 
    },
    courseName: { 
        type: String, 
        required: true 
    },
    courseCode: { 
        type: String, 
        required: true 
    },
    instructor: { 
        type: String, 
        required: true 
    },
    totalClasses: { 
        type: Number, 
        default: 0 
    },
    attendedClasses: { 
        type: Number, 
        default: 0 
    },
    attendanceRecords: [
        {
            date: { type: Date, required: true },
            attended: { type: Boolean, required: true }
        }
    ]
}, { timestamps: true });

module.exports = mongoose.model('Course', CourseSchema);
