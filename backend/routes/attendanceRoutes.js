const express = require('express');
const AttendanceRecord = require('../models/AttendanceRecord');
const User = require('../models/User');
const authMiddleware = require('../middleware/authMiddleware');
const { requireTeacher, requireRole } = require('../middleware/authorization');
const { addTenantFilter } = require('../middleware/tenantContext');

const router = express.Router();

/**
 * Mark attendance for students (Teacher/Admin only)
 * POST /api/attendance/mark
 */
router.post('/mark', authMiddleware, requireTeacher, async (req, res) => {
    try {
        const { attendanceData, date } = req.body;

        // attendanceData is an array of { studentId, status }
        if (!attendanceData || !Array.isArray(attendanceData)) {
            return res.status(400).json({
                error: 'Attendance data is required'
            });
        }

        // Use provided date or default to today
        const attendanceDate = date ? new Date(date) : new Date();
        attendanceDate.setHours(0, 0, 0, 0); // Normalize to start of day

        const results = [];
        const errors = [];

        // Process each student's attendance
        for (const item of attendanceData) {
            try {
                const { studentId, status, notes } = item;

                // Verify student exists in organization
                const student = await User.findOne({
                    _id: studentId,
                    organizationId: req.organizationId,
                    role: 'student'
                });

                if (!student) {
                    errors.push({
                        studentId,
                        error: 'Student not found in organization'
                    });
                    continue;
                }

                // Validate status
                if (!['present', 'absent'].includes(status)) {
                    errors.push({
                        studentId,
                        error: 'Invalid attendance status (must be present or absent)'
                    });
                    continue;
                }

                // Upsert attendance record
                const record = await AttendanceRecord.findOneAndUpdate(
                    {
                        studentId,
                        date: attendanceDate
                    },
                    {
                        organizationId: req.organizationId,
                        studentId,
                        date: attendanceDate,
                        status,
                        markedBy: req.userId,
                        markedAt: new Date(),
                        notes
                    },
                    {
                        upsert: true,
                        new: true,
                        setDefaultsOnInsert: true
                    }
                );

                results.push(record);
            } catch (error) {
                console.error(`Error marking attendance for student ${item.studentId}:`, error);
                errors.push({
                    studentId: item.studentId,
                    error: error.message
                });
            }
        }

        res.json({
            message: 'Attendance marked successfully',
            marked: results.length,
            errors: errors.length > 0 ? errors : undefined,
            records: results
        });

    } catch (error) {
        console.error('Mark attendance error:', error);
        res.status(500).json({ error: 'Failed to mark attendance' });
    }
});

/**
 * Get attendance for a specific date (Teacher/Admin)
 * GET /api/attendance/date/:date
 */
router.get('/date/:date', authMiddleware, requireTeacher, async (req, res) => {
    try {
        const specificDate = new Date(req.params.date);
        specificDate.setHours(0, 0, 0, 0);
        const nextDay = new Date(specificDate);
        nextDay.setDate(nextDay.getDate() + 1);

        const records = await AttendanceRecord.find({
            organizationId: req.organizationId,
            date: {
                $gte: specificDate,
                $lt: nextDay
            }
        })
            .populate('studentId', 'username email profile')
            .populate('markedBy', 'username profile')
            .sort({ 'studentId.username': 1 });

        res.json({
            date: specificDate,
            totalRecords: records.length,
            records
        });

    } catch (error) {
        console.error('Get date attendance error:', error);
        res.status(500).json({ error: 'Failed to fetch attendance' });
    }
});

/**
 * Get attendance for a student (Student/Teacher/Admin)
 * GET /api/attendance/student/:studentId
 */
router.get('/student/:studentId', authMiddleware, async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        // Permission check: students can only view their own attendance
        if (req.userRole === 'student' && req.userId.toString() !== req.params.studentId) {
            return res.status(403).json({
                error: 'You can only view your own attendance'
            });
        }

        // Verify student exists in organization
        const student = await User.findOne({
            _id: req.params.studentId,
            ...addTenantFilter(req),
            role: 'student'
        });

        if (!student) {
            return res.status(404).json({ error: 'Student not found' });
        }

        // Build query
        let query = {
            studentId: req.params.studentId,
            organizationId: req.organizationId
        };

        if (startDate && endDate) {
            query.date = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        const records = await AttendanceRecord.find(query)
            .sort({ date: -1 });

        // Calculate statistics
        const stats = await AttendanceRecord.getStudentStats(
            req.params.studentId,
            startDate,
            endDate
        );

        res.json({
            student: {
                id: student._id,
                username: student.username,
                profile: student.profile
            },
            records,
            statistics: stats
        });

    } catch (error) {
        console.error('Get student attendance error:', error);
        res.status(500).json({ error: 'Failed to fetch attendance' });
    }
});

/**
 * Get attendance report for organization (Teacher/Admin)
 * GET /api/attendance/report
 */
router.get('/report', authMiddleware, requireTeacher, async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        // Build query
        let query = {
            organizationId: req.organizationId
        };

        if (startDate && endDate) {
            query.date = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        // Aggregate attendance by student
        const report = await AttendanceRecord.aggregate([
            { $match: query },
            {
                $group: {
                    _id: '$studentId',
                    totalDays: { $sum: 1 },
                    present: {
                        $sum: { $cond: [{ $eq: ['$status', 'present'] }, 1, 0] }
                    },
                    absent: {
                        $sum: { $cond: [{ $eq: ['$status', 'absent'] }, 1, 0] }
                    }
                }
            },
            {
                $addFields: {
                    percentage: {
                        $multiply: [
                            { $divide: ['$present', '$totalDays'] },
                            100
                        ]
                    }
                }
            },
            { $sort: { percentage: -1 } }
        ]);

        // Populate student details
        const populatedReport = await User.populate(report, {
            path: '_id',
            select: 'username email profile'
        });

        res.json({
            dateRange: startDate && endDate ? { startDate, endDate } : 'All time',
            totalStudents: populatedReport.length,
            report: populatedReport.map(item => ({
                student: item._id,
                totalDays: item.totalDays,
                present: item.present,
                absent: item.absent,
                percentage: Math.round(item.percentage * 10) / 10
            }))
        });

    } catch (error) {
        console.error('Get attendance report error:', error);
        res.status(500).json({ error: 'Failed to generate report' });
    }
});

module.exports = router;
