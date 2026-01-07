/**
 * Tenant Context Middleware
 * 
 * Attaches organization context and user role to the request object
 * for all authenticated requests. This ensures tenant isolation and
 * role-based access control.
 */

const tenantContext = async (req, res, next) => {
    try {
        if (req.isAuthenticated && req.isAuthenticated()) {
            // Attach organization and role to request
            req.organizationId = req.user.organizationId;
            req.userRole = req.user.role;
            req.userId = req.user._id;

            // Optional: Load organization if needed
            // const Organization = require('../models/Organization');
            // req.organization = await Organization.findById(req.organizationId);
        }

        next();
    } catch (error) {
        console.error('Tenant context middleware error:', error);
        next(error);
    }
};

/**
 * Validate Organization Access Middleware
 * 
 * Ensures that the organizationId in the request matches the user's organization.
 * Use this for routes that accept organizationId as a parameter.
 */
const validateOrganizationAccess = (req, res, next) => {
    const requestedOrgId = req.params.organizationId || req.body.organizationId;

    if (!req.organizationId) {
        return res.status(401).json({
            error: 'Authentication required'
        });
    }

    if (requestedOrgId && requestedOrgId !== req.organizationId.toString()) {
        return res.status(403).json({
            error: 'Access denied: Organization mismatch'
        });
    }

    next();
};

/**
 * Tenant Isolation Helper
 * 
 * Adds organizationId filter to Mongoose queries automatically.
 * Use this to ensure all database queries are tenant-scoped.
 */
const addTenantFilter = (req, filter = {}) => {
    if (!req.organizationId) {
        throw new Error('Organization context not found in request');
    }

    return {
        ...filter,
        organizationId: req.organizationId
    };
};

module.exports = {
    tenantContext,
    validateOrganizationAccess,
    addTenantFilter
};
