const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');

const UserSchema = new mongoose.Schema({
    // Multi-tenancy fields
    organizationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Organization',
        required: true,
        index: true
    },
    role: {
        type: String,
        enum: ['admin', 'teacher', 'student'],
        required: true,
        default: 'student'
    },

    // Authentication fields
    username: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true
    },
    password: { type: String },

    // Profile fields
    profile: {
        firstName: { type: String, trim: true },
        lastName: { type: String, trim: true },
        studentId: String,   // For students
        employeeId: String,  // For teachers/admins
        phone: String,
        avatar: String
    },

    // Attendance-related fields (for students)
    courses: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course'
    }],
    timetable: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Timetable'
    },
    requiredAttendancePercentage: {
        type: Number,
        default: 75
    },

    // Notification settings
    pushSubscription: { type: Object },

    // Status fields
    isActive: {
        type: Boolean,
        default: true
    },
    lastLogin: Date
}, {
    timestamps: true
});

// Compound index for unique username per organization
UserSchema.index({ organizationId: 1, username: 1 }, { unique: true });
UserSchema.index({ organizationId: 1, email: 1 }, { unique: true });
UserSchema.index({ organizationId: 1, role: 1 });

// Virtual for full name
UserSchema.virtual('fullName').get(function () {
    if (this.profile.firstName && this.profile.lastName) {
        return `${this.profile.firstName} ${this.profile.lastName}`;
    }
    return this.username;
});

// Method to check if user has permission
UserSchema.methods.hasRole = function (roles) {
    return Array.isArray(roles) ? roles.includes(this.role) : this.role === roles;
};

// Method to check if user is in same organization
UserSchema.methods.isSameOrganization = function (organizationId) {
    return this.organizationId.toString() === organizationId.toString();
};

UserSchema.plugin(passportLocalMongoose, {
    usernameField: 'username',
    // We'll need to customize this to support organization-scoped usernames
    usernameQueryFields: ['username']
});

module.exports = mongoose.model('User', UserSchema);
