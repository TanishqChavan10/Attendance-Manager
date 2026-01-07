const mongoose = require('mongoose');

const OrganizationSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    slug: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    type: {
        type: String,
        enum: ['school', 'college', 'university', 'institute'],
        default: 'college'
    },
    settings: {
        academicYearStart: {
            type: Date,
            default: () => new Date(new Date().getFullYear(), 6, 1) // July 1st
        },
        minimumAttendance: {
            type: Number,
            default: 75,
            min: 0,
            max: 100
        },
        enableReminders: {
            type: Boolean,
            default: true
        },
        timezone: {
            type: String,
            default: 'Asia/Kolkata'
        }
    },
    contactEmail: {
        type: String,
        lowercase: true,
        trim: true
    },
    contactPhone: String,
    address: {
        street: String,
        city: String,
        state: String,
        country: String,
        postalCode: String
    },
    logo: String,
    isActive: {
        type: Boolean,
        default: true
    },
    plan: {
        type: String,
        enum: ['free', 'basic', 'premium', 'enterprise'],
        default: 'free'
    },
    maxUsers: {
        type: Number,
        default: 100
    }
}, {
    timestamps: true
});

// Indexes
OrganizationSchema.index({ slug: 1 });
OrganizationSchema.index({ isActive: 1 });

// Methods
OrganizationSchema.methods.getActiveUserCount = async function () {
    const User = mongoose.model('User');
    return await User.countDocuments({
        organizationId: this._id,
        isActive: true
    });
};

module.exports = mongoose.model('Organization', OrganizationSchema);
