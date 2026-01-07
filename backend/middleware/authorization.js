/**
 * Authorization Middleware
 * 
 * Role-based access control for protected routes.
 * Ensures users have the required role(s) to access resources.
 */

/**
 * Require specific role(s) to access a route
 * 
 * @param {string|string[]} roles - Single role or array of allowed roles
 * @returns {Function} Express middleware function
 * 
 * @example
 * router.post('/courses', requireRole('admin'), createCourse);
 * router.get('/courses', requireRole(['teacher', 'admin']), getCourses);
 */
const requireRole = (roles) => {
    // Normalize to array
    const allowedRoles = Array.isArray(roles) ? roles : [roles];

    return (req, res, next) => {
        // Check if user is authenticated
        if (!req.isAuthenticated || !req.isAuthenticated()) {
            return res.status(401).json({
                error: 'Authentication required'
            });
        }

        // Check if user has required role
        if (!req.user || !req.user.role) {
            return res.status(403).json({
                error: 'Access denied: No role assigned'
            });
        }

        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                error: `Access denied: Requires role ${allowedRoles.join(' or ')}`,
                requiredRoles: allowedRoles,
                currentRole: req.user.role
            });
        }

        next();
    };
};

/**
 * Require admin role
 * Shorthand for requireRole('admin')
 */
const requireAdmin = requireRole('admin');

/**
 * Require teacher or admin role
 * Teachers and admins can access these routes
 */
const requireTeacher = requireRole(['teacher', 'admin']);

/**
 * Require authenticated user (any role)
 */
const requireAuth = (req, res, next) => {
    if (!req.isAuthenticated || !req.isAuthenticated()) {
        return res.status(401).json({
            error: 'Authentication required'
        });
    }
    next();
};

/**
 * Check if user owns a resource or is admin
 * 
 * @param {Function} getOwnerId - Function that extracts owner ID from request
 * @returns {Function} Express middleware function
 * 
 * @example
 * router.get('/profile/:userId', 
 *   requireOwnerOrAdmin(req => req.params.userId),
 *   getProfile
 * );
 */
const requireOwnerOrAdmin = (getOwnerId) => {
    return (req, res, next) => {
        if (!req.isAuthenticated || !req.isAuthenticated()) {
            return res.status(401).json({
                error: 'Authentication required'
            });
        }

        const ownerId = getOwnerId(req);
        const isOwner = req.user._id.toString() === ownerId.toString();
        const isAdmin = req.user.role === 'admin';

        if (!isOwner && !isAdmin) {
            return res.status(403).json({
                error: 'Access denied: Not resource owner or admin'
            });
        }

        next();
    };
};

module.exports = {
    requireRole,
    requireAdmin,
    requireTeacher,
    requireAuth,
    requireOwnerOrAdmin
};
