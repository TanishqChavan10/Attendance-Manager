const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String },
    courses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }],
    timetable: { type: mongoose.Schema.Types.ObjectId, ref: 'Timetable' },
    pushSubscription: { type: Object },
    requiredAttendancePercentage: { type: Number, default: 75 }
});

UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', UserSchema);
