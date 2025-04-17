const mongoose = require('mongoose');

const TimetableSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    classes: [
        {
            day: { type: String, required: true },
            subject: { type: String, required: true },
            time: { type: String, required: true }
        }
    ]
});

module.exports = mongoose.model('Timetable', TimetableSchema);
