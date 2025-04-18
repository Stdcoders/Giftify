const mongoose = require('mongoose');

const reminderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    date: {
        type: Date,
        required: true
    },
    notifyBefore: {
        type: Number,
        default: 7, // Default notification 7 days before
        required: true
    }
}, {
    timestamps: true
});

const Reminder = mongoose.model('Reminder', reminderSchema);
module.exports = Reminder; 