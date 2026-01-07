const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/User');
const Organization = require('../models/Organization');

/**
 * Custom authentication strategy for multi-tenant system
 * Usernames are unique per organization, not globally
 */
passport.use(new LocalStrategy(
    {
        usernameField: 'username',
        passwordField: 'password',
        passReqToCallback: true // Pass req to access organizationCode
    },
    async (req, username, password, done) => {
        try {
            const { organizationCode } = req.body;

            if (!organizationCode) {
                return done(null, false, { message: 'Organization code is required' });
            }

            // Find organization
            const org = await Organization.findOne({
                slug: organizationCode.toLowerCase().trim(),
                isActive: true
            });

            if (!org) {
                return done(null, false, { message: 'Invalid organization code' });
            }

            // Find user scoped to this organization
            const user = await User.findOne({
                username: username.trim(),
                organizationId: org._id,
                isActive: true
            });

            if (!user) {
                return done(null, false, { message: 'Invalid credentials' });
            }

            // Verify password using passport-local-mongoose authenticate method
            user.authenticate(password, (err, authenticatedUser, passwordErr) => {
                if (err) {
                    console.error('Password verification error:', err);
                    return done(err);
                }

                if (!authenticatedUser || passwordErr) {
                    return done(null, false, { message: 'Invalid credentials' });
                }

                return done(null, authenticatedUser);
            });

        } catch (error) {
            console.error('Authentication strategy error:', error);
            return done(error);
        }
    }
));

/**
 * Serialize user for session
 */
passport.serializeUser((user, done) => {
    done(null, user._id);
});

/**
 * Deserialize user from session
 */
passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id)
            .select('-password')
            .populate('organizationId', 'name slug isActive');

        if (!user) {
            return done(null, false);
        }

        done(null, user);
    } catch (error) {
        console.error('Deserialize user error:', error);
        done(error);
    }
});
