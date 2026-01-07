const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Organization = require('../models/Organization');
const authMiddleware = require('../middleware/authMiddleware');
const { requireAdmin } = require('../middleware/authorization');

const router = express.Router();

// Helper function to generate a JWT token with organization context
const generateToken = (user) => {
    const payload = {
        id: user._id,
        username: user.username,
        organizationId: user.organizationId,
        role: user.role,
        email: user.email
    };

    return jwt.sign(payload, process.env.SESSION_SECRET || 'secretattendanceapp', {
        expiresIn: '7d' // Token expires in 7 days
    });
};

// Helper to generate organization slug from name
const generateSlug = (name) => {
    return name
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
};

/**
 * Register a new organization (first user becomes admin)
 * POST /api/auth/register/organization
 */
router.post('/register/organization', async (req, res) => {
    try {
        const {
            organizationName,
            username,
            email,
            password,
            firstName,
            lastName,
            organizationType
        } = req.body;

        // Validation
        if (!organizationName || !username || !email || !password) {
            return res.status(400).json({
                error: 'Organization name, username, email, and password are required'
            });
        }

        if (username.trim().length < 3) {
            return res.status(400).json({
                error: 'Username must be at least 3 characters long'
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                error: 'Password must be at least 6 characters long'
            });
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ error: 'Invalid email format' });
        }

        // Create organization
        const slug = generateSlug(organizationName);

        // Check if slug already exists
        const existingOrg = await Organization.findOne({ slug });
        if (existingOrg) {
            return res.status(409).json({
                error: 'An organization with a similar name already exists'
            });
        }

        const organization = new Organization({
            name: organizationName.trim(),
            slug,
            type: organizationType || 'college',
            contactEmail: email
        });

        await organization.save();

        // Create admin user
        const user = new User({
            organizationId: organization._id,
            role: 'admin',
            username: username.trim(),
            email: email.toLowerCase().trim(),
            profile: {
                firstName: firstName?.trim(),
                lastName: lastName?.trim()
            }
        });

        await User.register(user, password);

        // Generate token
        const token = generateToken(user);

        res.status(201).json({
            message: 'Organization and user created successfully',
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
                organizationId: user.organizationId,
                organizationName: organization.name
            }
        });

    } catch (error) {
        console.error('Organization registration error:', error);

        if (error.name === 'UserExistsError' || error.message.includes('duplicate')) {
            return res.status(409).json({ error: 'Username or email already exists' });
        }

        res.status(500).json({ error: error.message || 'Registration failed' });
    }
});

/**
 * Register a new user to existing organization
 * POST /api/auth/register
 */
router.post('/register', async (req, res) => {
    try {
        const {
            organizationCode,
            username,
            email,
            password,
            firstName,
            lastName,
            role,
            requiredAttendancePercentage
        } = req.body;

        // Validation
        if (!organizationCode || !username || !email || !password) {
            return res.status(400).json({
                error: 'Organization code, username, email, and password are required'
            });
        }

        if (username.trim().length < 3) {
            return res.status(400).json({
                error: 'Username must be at least 3 characters long'
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                error: 'Password must be at least 6 characters long'
            });
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ error: 'Invalid email format' });
        }

        // Find organization by slug (organizationCode is the slug)
        const organization = await Organization.findOne({
            slug: organizationCode.toLowerCase().trim(),
            isActive: true
        });

        if (!organization) {
            return res.status(404).json({
                error: 'Invalid organization code'
            });
        }

        // Determine user role (default to student)
        const userRole = role && ['admin', 'teacher', 'student'].includes(role)
            ? role
            : 'student';

        // Create user
        const user = new User({
            organizationId: organization._id,
            role: userRole,
            username: username.trim(),
            email: email.toLowerCase().trim(),
            profile: {
                firstName: firstName?.trim(),
                lastName: lastName?.trim()
            },
            requiredAttendancePercentage: requiredAttendancePercentage || 75
        });

        await User.register(user, password);

        // Generate token
        const token = generateToken(user);

        res.status(201).json({
            message: 'User registered successfully',
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
                organizationId: user.organizationId,
                organizationName: organization.name,
                requiredAttendancePercentage: user.requiredAttendancePercentage
            }
        });

    } catch (error) {
        console.error('Registration error:', error);

        if (error.name === 'UserExistsError' || error.message.includes('duplicate') || error.code === 11000) {
            return res.status(409).json({ error: 'Username or email already exists in this organization' });
        }

        res.status(500).json({ error: error.message || 'Registration failed' });
    }
});

/**
 * Login
 * POST /api/auth/login
 */
router.post('/login', async (req, res) => {
    try {
        const { username, password, organizationCode } = req.body;

        // Validate inputs
        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password are required' });
        }

        if (!organizationCode) {
            return res.status(400).json({ error: 'Organization code is required' });
        }

        // Find organization
        const organization = await Organization.findOne({
            slug: organizationCode.toLowerCase().trim(),
            isActive: true
        });

        if (!organization) {
            return res.status(401).json({ error: 'Invalid organization code' });
        }

        // Find user scoped to this organization
        const user = await User.findOne({
            username: username.trim(),
            organizationId: organization._id,
            isActive: true
        });

        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Verify password using passport-local-mongoose authenticate method
        user.authenticate(password, async (err, authenticatedUser, passwordErr) => {
            if (err) {
                console.error('Password authentication error:', err);
                return res.status(500).json({ error: 'Authentication failed' });
            }

            if (!authenticatedUser || passwordErr) {
                return res.status(401).json({ error: 'Invalid credentials' });
            }

            try {
                // Update last login
                user.lastLogin = new Date();
                await user.save();

                // Generate JWT token
                const token = generateToken(user);

                res.json({
                    message: 'Login successful',
                    token,
                    user: {
                        id: user._id,
                        username: user.username,
                        email: user.email,
                        role: user.role,
                        organizationId: user.organizationId,
                        organizationName: organization.name,
                        organizationSlug: organization.slug,
                        requiredAttendancePercentage: user.requiredAttendancePercentage || 75,
                        profile: user.profile
                    }
                });
            } catch (saveError) {
                console.error('Login save error:', saveError);
                res.status(500).json({ error: 'Login processing failed' });
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
});

/**
 * Logout
 * GET /api/auth/logout
 */
router.get('/logout', (req, res) => {
    req.logout(function (err) {
        if (err) {
            console.error('Logout error:', err);
            return res.status(500).json({ error: 'Logout failed' });
        }
        res.json({ message: 'Logged out successfully' });
    });
});

/**
 * Get current user
 * GET /api/auth/current-user
 */
router.get('/current-user', authMiddleware, async (req, res) => {
    try {
        const organization = await Organization.findById(req.user.organizationId);

        res.json({
            id: req.user._id,
            username: req.user.username,
            email: req.user.email,
            role: req.user.role,
            organizationId: req.user.organizationId,
            organizationName: organization?.name,
            organizationSlug: organization?.slug,
            requiredAttendancePercentage: req.user.requiredAttendancePercentage || 75,
            profile: req.user.profile
        });
    } catch (error) {
        console.error('Get current user error:', error);
        res.status(500).json({ error: 'Failed to fetch user data' });
    }
});

/**
 * Update push subscription
 * POST /api/auth/push-subscription
 */
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

/**
 * Update required attendance percentage
 * PUT /api/auth/required-percentage
 */
router.put('/required-percentage', authMiddleware, async (req, res) => {
    try {
        const { percentage } = req.body;

        if (typeof percentage !== 'number' || percentage < 0 || percentage > 100) {
            return res.status(400).json({
                error: 'Invalid percentage value. Must be between 0 and 100.'
            });
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

/**
 * Get organization info by slug
 * GET /api/auth/organization/:slug
 */
router.get('/organization/:slug', async (req, res) => {
    try {
        const organization = await Organization.findOne({
            slug: req.params.slug.toLowerCase(),
            isActive: true
        }).select('name slug type contactEmail');

        if (!organization) {
            return res.status(404).json({ error: 'Organization not found' });
        }

        res.json(organization);
    } catch (error) {
        console.error('Get organization error:', error);
        res.status(500).json({ error: 'Failed to fetch organization' });
    }
});

module.exports = router;
