const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Helper function to generate a JWT token
const generateToken = (user) => {
    const payload = {
        id: user._id,
        username: user.username
    };
    
    return jwt.sign(payload, process.env.SESSION_SECRET || 'secretattendanceapp', {
        expiresIn: '24h' // Token expires in 24 hours
    });
};

// Register a new user
router.post('/register', async (req, res) => {
    try {
        const user = new User({ 
            username: req.body.username,
            requiredAttendancePercentage: req.body.requiredAttendancePercentage || 75
        });
        await User.register(user, req.body.password);
        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: error.message || 'Registration failed' });
    }
});

// Login
router.post('/login', passport.authenticate('local'), (req, res) => {
    // Generate a token
    const token = generateToken(req.user);
    
    res.json({ 
        message: 'Login successful',
        token: token, // Add the token to the response
        user: {
            id: req.user._id,
            username: req.user.username,
            requiredAttendancePercentage: req.user.requiredAttendancePercentage || 75
        }
    });
});

// Logout
router.get('/logout', (req, res) => {
    req.logout(function(err) {
        if (err) { 
            console.error('Logout error:', err);
            return res.status(500).json({ error: 'Logout failed' }); 
        }
        res.json({ message: 'Logged out successfully' });
    });
});

// Get current user
router.get('/current-user', authMiddleware, (req, res) => {
    res.json({
        id: req.user._id,
        username: req.user.username,
        requiredAttendancePercentage: req.user.requiredAttendancePercentage || 75
    });
});

// Update push subscription
router.post('/push-subscription', authMiddleware, async (req, res) => {
    try {
        req.user.pushSubscription = req.body.subscription;
        await req.user.save();
        res.status(200).json({ message: 'Push subscription updated successfully' });
    } catch (error) {
        console.error('Push subscription update error:', error);
        res.status(500).json({ error: 'Failed to update push subscription' });
    }
});

// Update required attendance percentage
router.put('/required-percentage', authMiddleware, async (req, res) => {
    try {
        const { percentage } = req.body;
        
        // Validate the percentage
        if (typeof percentage !== 'number' || percentage < 0 || percentage > 100) {
            return res.status(400).json({ error: 'Invalid percentage value. Must be between 0 and 100.' });
        }
        
        req.user.requiredAttendancePercentage = percentage;
        await req.user.save();
        
        res.status(200).json({ 
            message: 'Required attendance percentage updated successfully',
            requiredAttendancePercentage: percentage
        });
    } catch (error) {
        console.error('Required percentage update error:', error);
        res.status(500).json({ error: 'Failed to update required attendance percentage' });
    }
});

module.exports = router;
