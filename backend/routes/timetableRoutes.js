const express = require('express');
const Timetable = require('../models/Timetable');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Get the user's timetable
router.get('/', authMiddleware, async (req, res) => {
    try {
        const timetable = await Timetable.findOne({ user: req.user._id });
        res.json(timetable || { classes: [] });
    } catch (error) {
        console.error('Error fetching timetable:', error);
        res.status(500).json({ error: 'Failed to fetch timetable' });
    }
});

// Create or update the user's timetable
router.post('/', authMiddleware, async (req, res) => {
    try {
        let timetable = await Timetable.findOne({ user: req.user._id });
        
        if (!timetable) {
            // Create new timetable if it doesn't exist
            timetable = new Timetable({
                user: req.user._id,
                classes: req.body.classes || []
            });
        } else {
            // Update existing timetable
            timetable.classes = req.body.classes || [];
        }
        
        await timetable.save();
        res.status(201).json(timetable);
    } catch (error) {
        console.error('Error creating/updating timetable:', error);
        res.status(500).json({ error: 'Failed to create/update timetable' });
    }
});

// Add a class to the timetable
router.post('/class', authMiddleware, async (req, res) => {
    try {
        let timetable = await Timetable.findOne({ user: req.user._id });
        
        if (!timetable) {
            // Create new timetable if it doesn't exist
            timetable = new Timetable({
                user: req.user._id,
                classes: [{
                    day: req.body.day,
                    subject: req.body.subject,
                    time: req.body.time
                }]
            });
        } else {
            // Add class to existing timetable
            timetable.classes.push({
                day: req.body.day,
                subject: req.body.subject,
                time: req.body.time
            });
        }
        
        await timetable.save();
        res.status(201).json(timetable);
    } catch (error) {
        console.error('Error adding class to timetable:', error);
        res.status(500).json({ error: 'Failed to add class to timetable' });
    }
});

// Update a class in the timetable
router.put('/class/:classId', authMiddleware, async (req, res) => {
    try {
        const timetable = await Timetable.findOne({ user: req.user._id });
        
        if (!timetable) {
            return res.status(404).json({ error: 'Timetable not found' });
        }
        
        // Find the class to update
        const classIndex = timetable.classes.findIndex(
            c => c._id.toString() === req.params.classId
        );
        
        if (classIndex === -1) {
            return res.status(404).json({ error: 'Class not found in timetable' });
        }
        
        // Update the class
        if (req.body.day) timetable.classes[classIndex].day = req.body.day;
        if (req.body.subject) timetable.classes[classIndex].subject = req.body.subject;
        if (req.body.time) timetable.classes[classIndex].time = req.body.time;
        
        await timetable.save();
        res.json(timetable);
    } catch (error) {
        console.error('Error updating class in timetable:', error);
        res.status(500).json({ error: 'Failed to update class in timetable' });
    }
});

// Delete a class from the timetable
router.delete('/class/:classId', authMiddleware, async (req, res) => {
    try {
        const timetable = await Timetable.findOne({ user: req.user._id });
        
        if (!timetable) {
            return res.status(404).json({ error: 'Timetable not found' });
        }
        
        // Remove the class
        timetable.classes = timetable.classes.filter(
            c => c._id.toString() !== req.params.classId
        );
        
        await timetable.save();
        res.json({ message: 'Class removed from timetable successfully' });
    } catch (error) {
        console.error('Error deleting class from timetable:', error);
        res.status(500).json({ error: 'Failed to delete class from timetable' });
    }
});

module.exports = router;
