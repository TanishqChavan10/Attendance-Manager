const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const connectDB = async () => {
    try {
        // Get the MongoDB URI from environment variables or use a fallback
        const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/attendance-manager';
        
        // Log the connection attempt for debugging
        console.log(`Attempting to connect to MongoDB at: ${mongoURI}`);
        
        // Add connection options to handle deprecation warnings and other issues
        const connectionOptions = {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 5000, // Timeout after 5 seconds
            socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
        };
        
        // Set up connection event listeners for better debugging
        mongoose.connection.on('connected', () => {
            console.log('MongoDB connection established successfully');
        });
        
        mongoose.connection.on('error', (err) => {
            console.error('MongoDB connection error:', err);
        });
        
        mongoose.connection.on('disconnected', () => {
            console.log('MongoDB connection disconnected');
        });
        
        // Handle process termination
        process.on('SIGINT', () => {
            mongoose.connection.close(() => {
                console.log('MongoDB connection closed due to app termination');
                process.exit(0);
            });
        });
        
        // Connect to MongoDB
        await mongoose.connect(mongoURI, connectionOptions);
        console.log('MongoDB Connected Successfully');
        return true;
    } catch (error) {
        console.error('MongoDB Connection Failed:', error);
        // Don't terminate the process, let the app continue with reduced functionality
        console.log('Application will continue running, but database operations will fail');
        return false;
    }
};

module.exports = connectDB;
