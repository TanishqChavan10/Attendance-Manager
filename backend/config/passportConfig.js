const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/User');
const Organization = require('../models/Organization');

/**
 * Authentication strategy for single-organization system
 * Simplified from multi-tenant to single-tenant
 */
passport.use(new LocalStrategy(
    {
        usernameField: 'username',
        passwordField: 'password'
    },
    async (username, password, done) => {
        try {
            // Find user by username (globally unique now)
            const user = await User.findOne({
                username: username.trim(),
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
