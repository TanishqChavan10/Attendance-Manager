const express = require('express');
const cors = require('cors');
const passport = require('passport');
const session = require('express-session');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables - this must be first, before requiring other modules
dotenv.config({ path: path.resolve(__dirname, './.env') });

// Validate required environment variables
function validateEnv() {
  const required = ['MONGO_URI', 'SESSION_SECRET'];
  const missing = required.filter(key => !process.env[key]);

  if (missing.length > 0) {
    console.error(`FATAL: Missing required environment variables: ${missing.join(', ')}`);
    if (process.env.NODE_ENV === 'production') {
      console.error('Application cannot start without required environment variables');
      process.exit(1);
    } else {
      console.warn('WARNING: Running without required environment variables in development mode');
    }
  }

  // Validate push notification config if enabled
  if (process.env.ENABLE_REMINDERS === 'true') {
    const pushVars = ['VAPID_PUBLIC_KEY', 'VAPID_PRIVATE_KEY', 'VAPID_SUBJECT'];
    const missingPush = pushVars.filter(key => !process.env[key]);
    if (missingPush.length > 0) {
      console.warn(`WARNING: Push notifications enabled but missing variables: ${missingPush.join(', ')}`);
      console.warn('Push notifications may not work correctly');
    }
  }
}

validateEnv();

const connectDB = require('./config/db');
const healthRoutes = require('./routes/health');
const authRoutes = require('./routes/authRoutes');
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

// Tenant context middleware - inject organization info into requests
const { tenantContext } = require('./middleware/tenantContext');
app.use(tenantContext);

// Import new routes
const organizationRoutes = require('./routes/organizationRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');

// Routes
app.use('/api', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/organization', organizationRoutes);
app.use('/api/attendance', attendanceRoutes);
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
  try {
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
      try {
        console.log('Sending attendance reminders...');
        await sendAttendanceReminders();
        // Schedule the next reminder
        scheduleReminders();
      } catch (error) {
        console.error('Failed to send attendance reminders:', error);
        // Continue without crashing - reschedule for next day
        scheduleReminders();
      }
    }, timeUntilSchedule);
  } catch (error) {
    console.error('Failed to initialize reminder scheduler:', error);
    // Don't crash the server - just log and continue
  }
};

// Safe initialization of reminder scheduler
try {
  scheduleReminders();
} catch (error) {
  console.error('Reminder scheduler failed to start:', error);
  console.log('Server will continue without reminder functionality');
}


// Connect to MongoDB and start server
connectDB()
  .then((connected) => {
    if (!connected) {
      console.error('FATAL: Database connection failed');
      if (process.env.NODE_ENV === 'production') {
        console.error('Cannot start server without database in production mode');
        process.exit(1);
      } else {
        console.warn('WARNING: Running without database in development mode');
        console.warn('API requests will fail until database connection is established');
      }
    } else {
      console.log('Database connection established successfully');
    }

    const PORT = parseInt(process.env.PORT) || 5001;
    console.log(`Starting server on port ${PORT}`);

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`Database: ${connected ? 'Connected' : 'Not Connected'}`);
      console.log(`Reminders: ${process.env.ENABLE_REMINDERS === 'true' ? 'Enabled' : 'Disabled'}`);
    });
  })
  .catch(err => {
    console.error('Database connection error:', err);
    if (process.env.NODE_ENV === 'production') {
      console.error('Exiting due to database connection failure in production');
      process.exit(1);
    } else {
      console.warn('Continuing in development mode despite database error');
      const PORT = parseInt(process.env.PORT) || 5001;
      app.listen(PORT, () => console.log(`Server running on port ${PORT} (WITHOUT DATABASE)`));
    }
  });
