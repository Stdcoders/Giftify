const Reminder = require('../models/reminderModel');
const asyncHandler = require('express-async-handler');
const sendEmail = require('../utils/sendEmail');

// @desc    Get user reminders
// @route   GET /api/reminders
// @access  Private
const getReminders = asyncHandler(async (req, res) => {
    if (!req.user) {
        return res.status(401).json({ message: "Authentication required" });
    }
    
    const reminders = await Reminder.find({ user: req.user._id }).populate('user', 'name email');
    res.json(reminders);
});

// @desc    Create new reminder
// @route   POST /api/reminders
// @access  Private
const createReminder = asyncHandler(async (req, res) => {
    if (!req.user) {
        return res.status(401).json({ message: "Authentication required" });
    }
    
    const { title, description, date, notifyBefore } = req.body;

    const reminder = await Reminder.create({
        user: req.user._id,
        title,
        description,
        date,
        notifyBefore
    });

    if (reminder) {
        // Schedule reminder email
        const notificationDate = new Date(date);
        notificationDate.setDate(notificationDate.getDate() - notifyBefore);
        
        // Only schedule if notification date is in the future
        if (notificationDate > new Date()) {
            scheduleReminderEmail(reminder._id);
        }

        res.status(201).json(reminder);
    } else {
        res.status(400);
        throw new Error('Invalid reminder data');
    }
});

// @desc    Update reminder
// @route   PUT /api/reminders/:id
// @access  Private
const updateReminder = asyncHandler(async (req, res) => {
    if (!req.user) {
        return res.status(401).json({ message: "Authentication required" });
    }
    
    const reminder = await Reminder.findById(req.params.id);

    if (!reminder) {
        res.status(404);
        throw new Error('Reminder not found');
    }

    // Make sure user owns reminder
    if (reminder.user.toString() !== req.user._id.toString()) {
        res.status(401);
        throw new Error('Not authorized');
    }

    const updatedReminder = await Reminder.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
    );

    // Reschedule reminder email if date or notifyBefore changed
    if (req.body.date || req.body.notifyBefore) {
        const notificationDate = new Date(updatedReminder.date);
        notificationDate.setDate(notificationDate.getDate() - updatedReminder.notifyBefore);
        
        if (notificationDate > new Date()) {
            scheduleReminderEmail(updatedReminder._id);
        }
    }

    res.json(updatedReminder);
});

// @desc    Delete reminder
// @route   DELETE /api/reminders/:id
// @access  Private
const deleteReminder = asyncHandler(async (req, res) => {
    if (!req.user) {
        return res.status(401).json({ message: "Authentication required" });
    }
    
    const reminder = await Reminder.findById(req.params.id);

    if (!reminder) {
        res.status(404);
        throw new Error('Reminder not found');
    }

    // Make sure user owns reminder
    if (reminder.user.toString() !== req.user._id.toString()) {
        res.status(401);
        throw new Error('Not authorized');
    }

    await reminder.deleteOne();
    res.json({ id: req.params.id });
});

// Helper function to schedule reminder emails
const scheduleReminderEmail = async (reminderId) => {
    try {
        const reminder = await Reminder.findById(reminderId).populate('user', 'name email');
        if (!reminder) return;

        const notificationDate = new Date(reminder.date);
        notificationDate.setDate(notificationDate.getDate() - reminder.notifyBefore);
        
        // Calculate time until notification
        const timeUntilNotification = notificationDate.getTime() - new Date().getTime();
        
        if (timeUntilNotification > 0) {
            setTimeout(async () => {
                try {
                    const emailSubject = `Reminder: ${reminder.title}`;
                    const emailText = `
                        Hello ${reminder.user.name},

                        This is a reminder for: ${reminder.title}
                        
                        Description: ${reminder.description || 'No description provided'}
                        Date: ${new Date(reminder.date).toLocaleDateString()}
                        
                        This reminder was set to notify you ${reminder.notifyBefore} days before the event.
                        
                        Best regards,
                        Your Giftify Team
                    `;

                    await sendEmail({
                        email: reminder.user.email,
                        subject: emailSubject,
                        message: emailText
                    });

                    console.log(`Reminder email sent for: ${reminder.title}`);
                } catch (error) {
                    console.error('Error sending reminder email:', error);
                }
            }, timeUntilNotification);
        }
    } catch (error) {
        console.error('Error scheduling reminder:', error);
    }
};

// @desc    Send test reminder email
// @route   POST /api/reminders/test-email
// @access  Private
const sendTestEmail = asyncHandler(async (req, res) => {
    if (!req.user) {
        return res.status(401).json({ message: "Authentication required" });
    }
    
    const reminder = await Reminder.findOne({ user: req.user._id }).populate('user', 'name email');
    
    if (!reminder) {
        res.status(404);
        throw new Error('No reminder found to test');
    }

    const emailSubject = `Test Reminder: ${reminder.title}`;
    const emailText = `
        Hello ${reminder.user.name},

        This is a test reminder for: ${reminder.title}
        
        Description: ${reminder.description || 'No description provided'}
        Date: ${new Date(reminder.date).toLocaleDateString()}
        
        This reminder is set to notify you ${reminder.notifyBefore} days before the event.
        
        Best regards,
        Your Giftify Team
    `;

    await sendEmail({
        email: reminder.user.email,
        subject: emailSubject,
        message: emailText
    });

    res.json({ message: 'Test email sent successfully' });
});

// @desc    Send reminder email for specific reminder
// @route   POST /api/reminders/:id/send-email
// @access  Private/Admin
const sendReminderEmail = asyncHandler(async (req, res) => {
    if (!req.user) {
        return res.status(401).json({ message: "Authentication required" });
    }
    
    // Check if user is admin
    if (req.user.role !== 'Admin') {
        res.status(401);
        throw new Error('Not authorized as an admin');
    }

    const reminder = await Reminder.findById(req.params.id).populate('user', 'name email');

    if (!reminder) {
        res.status(404);
        throw new Error('Reminder not found');
    }

    const emailSubject = `Reminder: ${reminder.title}`;
    const emailText = `
        Hello ${reminder.user.name},

        This is a reminder for: ${reminder.title}
        
        Description: ${reminder.description || 'No description provided'}
        Date: ${new Date(reminder.date).toLocaleDateString()}
        
        This reminder was sent by an administrator.
        
        Best regards,
        Your Giftify Team
    `;

    await sendEmail({
        email: reminder.user.email,
        subject: emailSubject,
        message: emailText
    });

    res.json({ message: 'Reminder email sent successfully' });
});

module.exports = {
    getReminders,
    createReminder,
    updateReminder,
    deleteReminder,
    sendTestEmail,
    sendReminderEmail
}; 