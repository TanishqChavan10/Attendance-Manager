const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * JWT Authentication Middleware
 * Verifies token and attaches authenticated user to request
 * Also validates organization and user status
 */
const authMiddleware = async (req, res, next) => {
    try {
        // Get token from Authorization header
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'No token provided' });
        }

        const token = authHeader.split(' ')[1];

        // Verify token
        const decoded = jwt.verify(token, process.env.SESSION_SECRET || 'secretattendanceapp');

        // Find user and populate organization
        const user = await User.findById(decoded.id)
            .select('-password')
            .populate('organizationId', 'name slug isActive');

        if (!user) {
            return res.status(401).json({ error: 'User not found' });
        }

        // Verify organization exists and is active
        if (!user.organizationId) {
            return res.status(403).json({
                error: 'Organization not found'
            });
        }

        if (!user.organizationId.isActive) {
            return res.status(403).json({
                error: 'Organization is inactive. Please contact your administrator.'
            });
        }

        // Verify user is active
        if (user.isActive === false) {
            return res.status(403).json({
                error: 'Your account has been deactivated. Please contact your administrator.'
            });
        }

        // Attach user to request object
        req.user = user;
        next();

    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ error: 'Invalid token' });
        }
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ error: 'Token expired. Please login again.' });
        }
        console.error('Auth middleware error:', error);
        res.status(500).json({ error: 'Authentication failed' });
    }
};

module.exports = authMiddleware;
