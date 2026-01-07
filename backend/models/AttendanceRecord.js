const mongoose = require('mongoose');

const AttendanceRecordSchema = new mongoose.Schema({
    // Multi-tenancy
    organizationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Organization',
        required: true,
        index: true
    },

    // Student reference
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },

    // Attendance details
    date: {
        type: Date,
        required: true,
        index: true
    },
    status: {
        type: String,
        enum: ['present', 'absent'],
        required: true,
        default: 'absent'
    },

    // Tracking
    markedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'  // Teacher or admin who marked attendance
    },
    markedAt: {
        type: Date,
        default: Date.now
    },

    // Additional info
    notes: String
}, {
    timestamps: true
});

// Compound indexes for efficient queries
AttendanceRecordSchema.index({ organizationId: 1, date: 1 });
AttendanceRecordSchema.index({ organizationId: 1, studentId: 1, date: 1 });

// Unique constraint: one record per student per date
AttendanceRecordSchema.index(
    { studentId: 1, date: 1 },
    { unique: true }
);

// Static methods for attendance calculations
AttendanceRecordSchema.statics.getStudentStats = async function (studentId, startDate, endDate) {
    const match = { studentId };

    if (startDate && endDate) {
        match.date = {
            $gte: new Date(startDate),
            $lte: new Date(endDate)
        };
    }

    const result = await this.aggregate([
        { $match: match },
        {
            $group: {
                _id: null,
                total: { $sum: 1 },
                present: {
                    $sum: {
                        $cond: [{ $eq: ['$status', 'present'] }, 1, 0]
                    }
                },
                absent: {
                    $sum: {
                        $cond: [{ $eq: ['$status', 'absent'] }, 1, 0]
                    }
                }
            }
        },
        {
            $addFields: {
                percentage: {
                    $multiply: [
                        { $divide: ['$present', '$total'] },
                        100
                    ]
                }
            }
        }
    ]);

    return result.length > 0 ? result[0] : { total: 0, present: 0, absent: 0, percentage: 0 };
};

module.exports = mongoose.model('AttendanceRecord', AttendanceRecordSchema);
