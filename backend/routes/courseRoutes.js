const express = require('express');
const Course = require('../models/Course');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Get all courses for a user
router.get('/', authMiddleware, async (req, res) => {
    try {
        const courses = await Course.find({ user: req.user._id });
        res.json(courses);
    } catch (error) {
        console.error('Error fetching courses:', error);
        res.status(500).json({ error: 'Failed to fetch courses' });
    }
});

// Get a specific course
router.get('/:id', authMiddleware, async (req, res) => {
    try {
        const course = await Course.findOne({ 
            _id: req.params.id,
            user: req.user._id
        });
        
        if (!course) {
            return res.status(404).json({ error: 'Course not found' });
        }
        
        res.json(course);
    } catch (error) {
        console.error('Error fetching course:', error);
        res.status(500).json({ error: 'Failed to fetch course' });
    }
});

// Create a new course
router.post('/', authMiddleware, async (req, res) => {
    try {
        const { courseName, courseCode, instructor } = req.body;
        
        // Validate required fields
        if (!courseName || !courseCode || !instructor) {
            return res.status(400).json({ error: 'Please provide all required fields' });
        }
        
        const newCourse = new Course({
            user: req.user._id,
            courseName,
            courseCode,
            instructor,
            totalClasses: 0,
            attendedClasses: 0
        });
        
        await newCourse.save();
        res.status(201).json(newCourse);
    } catch (error) {
        console.error('Error creating course:', error);
        res.status(500).json({ error: 'Failed to create course' });
    }
});

// Update a course
router.put('/:id', authMiddleware, async (req, res) => {
    try {
        const { courseName, courseCode, instructor, totalClasses, attendedClasses } = req.body;
        
        // Find course and check if it belongs to the user
        let course = await Course.findOne({ 
            _id: req.params.id,
            user: req.user._id
        });
        
        if (!course) {
            return res.status(404).json({ error: 'Course not found' });
        }
        
        // Update course fields
        if (courseName) course.courseName = courseName;
        if (courseCode) course.courseCode = courseCode;
        if (instructor) course.instructor = instructor;
        if (totalClasses !== undefined) course.totalClasses = totalClasses;
        if (attendedClasses !== undefined) course.attendedClasses = attendedClasses;
        
        await course.save();
        res.json(course);
    } catch (error) {
        console.error('Error updating course:', error);
        res.status(500).json({ error: 'Failed to update course' });
    }
});

// Delete a course
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const course = await Course.findOneAndDelete({ 
            _id: req.params.id,
            user: req.user._id
        });
        
        if (!course) {
            return res.status(404).json({ error: 'Course not found' });
        }
        
        res.json({ message: 'Course deleted successfully' });
    } catch (error) {
        console.error('Error deleting course:', error);
        res.status(500).json({ error: 'Failed to delete course' });
    }
});

// Mark attendance for a course
router.post('/:id/attendance', authMiddleware, async (req, res) => {
    try {
        const { attended, date } = req.body;
        
        // Validate inputs
        if (attended === undefined) {
            return res.status(400).json({ error: 'Attendance status is required' });
        }
        
        // Find course and check if it belongs to the user
        let course = await Course.findOne({ 
            _id: req.params.id,
            user: req.user._id
        });
        
        if (!course) {
            return res.status(404).json({ error: 'Course not found' });
        }
        
        // Use provided date or default to today
        const attendanceDate = date ? new Date(date) : new Date();
        
        // Check if attendance already marked for this date
        const existingRecord = course.attendanceRecords.find(record => 
            record.date.toISOString().split('T')[0] === attendanceDate.toISOString().split('T')[0]
        );
        
        if (existingRecord) {
            // Update existing record
            existingRecord.attended = attended;
        } else {
            // Add new record
            course.attendanceRecords.push({
                date: attendanceDate,
                attended
            });
            
            // Update counters
            course.totalClasses += 1;
            if (attended) {
                course.attendedClasses += 1;
            }
        }
        
        await course.save();
        res.json(course);
    } catch (error) {
        console.error('Error marking attendance:', error);
        res.status(500).json({ error: 'Failed to mark attendance' });
    }
});

module.exports = router;
