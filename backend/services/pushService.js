const webPush = require('web-push');
const dotenv = require('dotenv');
const path = require('path');
const User = require('../models/User');
const Course = require('../models/Course');

// Load environment variables with the correct path
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Use environment variables for VAPID keys
const vapidKeys = {
    publicKey: process.env.VAPID_PUBLIC_KEY,
    privateKey: process.env.VAPID_PRIVATE_KEY
};

// If keys are not available in .env, generate new ones (for development only)
if (!vapidKeys.publicKey || !vapidKeys.privateKey) {
    console.warn('VAPID keys not found in environment variables. Generating new keys for development.');
    const newKeys = webPush.generateVAPIDKeys();
    vapidKeys.publicKey = newKeys.publicKey;
    vapidKeys.privateKey = newKeys.privateKey;
    console.log('Generated VAPID keys:');
    console.log('Public Key:', vapidKeys.publicKey);
    console.log('Private Key:', vapidKeys.privateKey);
    console.log('Add these keys to your .env file for production use.');
}

// Ensure VAPID_SUBJECT always starts with mailto:
let vapidSubject = process.env.VAPID_SUBJECT || 'mailto:your-email@example.com';
if (!vapidSubject.startsWith('mailto:')) {
    vapidSubject = `mailto:${vapidSubject}`;
}

console.log(`Setting VAPID details with subject: ${vapidSubject}`);

webPush.setVapidDetails(
    vapidSubject,
    vapidKeys.publicKey, 
    vapidKeys.privateKey
);

// Send a push notification to a specific subscription
const sendPushNotification = async (subscription, message) => {
    try {
        await webPush.sendNotification(subscription, JSON.stringify({ message }));
        return true;
    } catch (error) {
        console.error('Push Notification Error:', error);
        return false;
    }
};

// Send attendance reminder to all users with an active push subscription
const sendAttendanceReminders = async () => {
    try {
        const users = await User.find({ pushSubscription: { $exists: true, $ne: null } });
        console.log(`Sending attendance reminders to ${users.length} users`);
        
        let successCount = 0;
        
        for (const user of users) {
            const courses = await Course.find({ user: user._id });
            
            if (courses.length > 0) {
                const lowAttendanceCourses = courses.filter(course => 
                    course.attendancePercentage < 75 && course.totalClasses > 0
                );
                
                let message = 'Reminder: Update your attendance records for today!';
                
                if (lowAttendanceCourses.length > 0) {
                    message += ` Warning: Your attendance is below 75% in ${lowAttendanceCourses.length} course(s).`;
                }
                
                const success = await sendPushNotification(user.pushSubscription, message);
                if (success) successCount++;
            }
        }
        
        console.log(`Successfully sent reminders to ${successCount}/${users.length} users`);
        return successCount;
    } catch (error) {
        console.error('Error sending attendance reminders:', error);
        return 0;
    }
};

module.exports = { 
    sendPushNotification, 
    sendAttendanceReminders, 
    vapidKeys 
};
