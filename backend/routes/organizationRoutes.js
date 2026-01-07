const express = require('express');
const Organization = require('../models/Organization');
const User = require('../models/User');
const authMiddleware = require('../middleware/authMiddleware');
const { requireAdmin, requireRole } = require('../middleware/authorization');
const { addTenantFilter } = require('../middleware/tenantContext');

const router = express.Router();

/**
 * Get current user's organization details
 * GET /api/organization
 */
router.get('/', authMiddleware, async (req, res) => {
    try {
        const organization = await Organization.findById(req.organizationId);

        if (!organization) {
            return res.status(404).json({ error: 'Organization not found' });
        }

        res.json(organization);
    } catch (error) {
        console.error('Get organization error:', error);
        res.status(500).json({ error: 'Failed to fetch organization' });
    }
});

/**
 * Update organization details (Admin only)
 * PUT /api/organization
 */
router.put('/', authMiddleware, requireAdmin, async (req, res) => {
    try {
        const organization = await Organization.findById(req.organizationId);

        if (!organization) {
            return res.status(404).json({ error: 'Organization not found' });
        }

        // Allowed fields to update
        const allowedUpdates = [
            'name', 'type', 'contactEmail', 'contactPhone', 'address', 'logo'
        ];

        allowedUpdates.forEach(field => {
            if (req.body[field] !== undefined) {
                organization[field] = req.body[field];
            }
        });

        // Update settings if provided
        if (req.body.settings) {
            organization.settings = {
                ...organization.settings,
                ...req.body.settings
            };
        }

        await organization.save();
        res.json(organization);
    } catch (error) {
        console.error('Update organization error:', error);
        res.status(500).json({ error: 'Failed to update organization' });
    }
});

/**
 * Get all users in organization (Admin only)
 * GET /api/organization/users
 */
router.get('/users', authMiddleware, requireAdmin, async (req, res) => {
    try {
        const { role, search, page = 1, limit = 50 } = req.query;

        let query = addTenantFilter(req);

        // Filter by role if provided
        if (role && ['admin', 'teacher', 'student'].includes(role)) {
            query.role = role;
        }

        // Search by username, email, or name
        if (search) {
            query.$or = [
                { username: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { 'profile.firstName': { $regex: search, $options: 'i' } },
                { 'profile.lastName': { $regex: search, $options: 'i' } }
            ];
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const [users, total] = await Promise.all([
            User.find(query)
                .select('-password')
                .sort({ createdAt: -1 })
                .limit(parseInt(limit))
                .skip(skip),
            User.countDocuments(query)
        ]);

        res.json({
            users,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

/**
 * Get user by ID (Admin only)
 * GET /api/organization/users/:userId
 */
router.get('/users/:userId', authMiddleware, requireAdmin, async (req, res) => {
    try {
        const user = await User.findOne({
            _id: req.params.userId,
            ...addTenantFilter(req)
        }).select('-password');

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json(user);
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ error: 'Failed to fetch user' });
    }
});

/**
 * Update user role or status (Admin only)
 * PATCH /api/organization/users/:userId
 */
router.patch('/users/:userId', authMiddleware, requireAdmin, async (req, res) => {
    try {
        const { role, isActive } = req.body;

        const user = await User.findOne({
            _id: req.params.userId,
            ...addTenantFilter(req)
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Prevent admin from deactivating themselves
        if (req.userId.toString() === user._id.toString() && isActive === false) {
            return res.status(400).json({
                error: 'You cannot deactivate your own account'
            });
        }

        // Update role if provided and valid
        if (role && ['admin', 'teacher', 'student'].includes(role)) {
            user.role = role;
        }

        // Update active status if provided
        if (isActive !== undefined) {
            user.isActive = isActive;
        }

        await user.save();

        res.json({
            message: 'User updated successfully',
            user: {
                id: user._id,
                username: user.username,
                role: user.role,
                isActive: user.isActive
            }
        });
    } catch (error) {
        console.error('Update user error:', error);
        res.status(500).json({ error: 'Failed to update user' });
    }
});

/**
 * Delete user (Admin only)
 * DELETE /api/organization/users/:userId
 */
router.delete('/users/:userId', authMiddleware, requireAdmin, async (req, res) => {
    try {
        const user = await User.findOne({
            _id: req.params.userId,
            ...addTenantFilter(req)
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Prevent admin from deleting themselves
        if (req.userId.toString() === user._id.toString()) {
            return res.status(400).json({
                error: 'You cannot delete your own account'
            });
        }

        await user.deleteOne();

        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({ error: 'Failed to delete user' });
    }
});

/**
 * Get organization statistics (Admin only)
 * GET /api/organization/stats
 */
router.get('/stats', authMiddleware, requireAdmin, async (req, res) => {
    try {
        const [totalUsers, admins, teachers, students, activeUsers] = await Promise.all([
            User.countDocuments(addTenantFilter(req)),
            User.countDocuments({ ...addTenantFilter(req), role: 'admin' }),
            User.countDocuments({ ...addTenantFilter(req), role: 'teacher' }),
            User.countDocuments({ ...addTenantFilter(req), role: 'student' }),
            User.countDocuments({ ...addTenantFilter(req), isActive: true })
        ]);

        res.json({
            users: {
                total: totalUsers,
                active: activeUsers,
                admins,
                teachers,
                students
            }
        });
    } catch (error) {
        console.error('Get stats error:', error);
        res.status(500).json({ error: 'Failed to fetch statistics' });
    }
});

module.exports = router;
