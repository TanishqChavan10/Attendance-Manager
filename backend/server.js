const express = require('express');
const cors = require('cors');
const passport = require('passport');
const session = require('express-session');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables - this must be first, before requiring other modules
dotenv.config({ path: path.resolve(__dirname, './.env') });

const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const courseRoutes = require('./routes/courseRoutes');
const timetableRoutes = require('./routes/timetableRoutes');
const { sendAttendanceReminders } = require('./services/pushService');
require('./config/passportConfig');

// Initialize Express app
const app = express();

// CORS configuration
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.FRONTEND_URL || 'https://your-production-frontend-url.com' 
    : ['http://localhost:5173', 'http://localhost:5174'], // Allow both default Vite ports
  credentials: true,
  optionsSuccessStatus: 200
};

// Important: Apply CORS first to prevent issues with preflight requests
app.use(cors(corsOptions));

// Apply other middleware
app.use(express.json());

// Session configuration
app.use(session({
    secret: process.env.SESSION_SECRET || 'secretattendanceapp',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/timetable', timetableRoutes);

// Serve React App in production
if (process.env.NODE_ENV === 'production') {
    // Serve static files from the React app build directory
    app.use(express.static(path.join(__dirname, '../frontend/dist')));

    // The "catchall" handler: for any request that doesn't match a defined API route,
    // send back the React app's index.html file
    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, '../frontend/dist', 'index.html'));
    });
}

// Schedule daily attendance reminders
const scheduleReminders = () => {
    // Only run scheduler if ENABLE_REMINDERS is set to true in .env
    if (process.env.ENABLE_REMINDERS !== 'true') {
        console.log('Attendance reminders are disabled. Set ENABLE_REMINDERS=true in .env to enable.');
        return;
    }
    
    const now = new Date();
    const scheduledTime = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        process.env.REMINDER_HOUR || 19, // Default to 7 PM
        0,
        0
    );
    
    // If it's already past the scheduled time, schedule for tomorrow
    if (now > scheduledTime) {
        scheduledTime.setDate(scheduledTime.getDate() + 1);
    }
    
    const timeUntilSchedule = scheduledTime.getTime() - now.getTime();
    
    console.log(`Scheduled next reminder for ${scheduledTime.toLocaleString()}`);
    
    setTimeout(async () => {
        console.log('Sending attendance reminders...');
        await sendAttendanceReminders();
        // Schedule the next reminder
        scheduleReminders();
    }, timeUntilSchedule);
};

// Start the reminder scheduler only if enabled
scheduleReminders();

// Connect to MongoDB and start server
connectDB()
  .then((connected) => {
    if (connected) {
      console.log('Database connection established');
      // Start the server if database connection is successful
      const PORT = parseInt(process.env.PORT) || 5001;
      console.log(`Attempting to start server on port ${PORT}`);
      
      app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    } else {
      console.warn('Server started with limited functionality due to database connection issues');
      // Start the server even if database connection failed
      const PORT = parseInt(process.env.PORT) || 5001;
      console.log(`Attempting to start server on port ${PORT}`);
      
      app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    }
  })
  .catch(err => console.error('Could not connect to database:', err));
