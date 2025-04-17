# Attendance Manager

A comprehensive attendance management system for students and educators, providing easy tracking and monitoring of class attendance.

## Screenshots

### Dashboard
![image](https://github.com/user-attachments/assets/696aa728-1534-461e-9d5d-0c28a597a340)
*Student dashboard showing attendance statistics and upcoming classes*

### Course Management
![image](https://github.com/user-attachments/assets/f2237bdf-7a55-44a9-ba57-b7a617f45342)
*Interface for managing course information and attendance records*

### Attendance Analytics
![image](https://github.com/user-attachments/assets/6ba31e61-8d70-44fc-a853-4521bb1ca22b)
*Visual representation of attendance patterns and trends*

### Timetable Visuals
![image](https://github.com/user-attachments/assets/e35fbd0a-9b94-42a5-a71e-be4da2be89ec)
*Visual representation of Timetable saved by user*

## Features

- **User Authentication**: Secure signup/login system
- **Course Management**: Add and manage multiple courses
- **Timetable Setup**: Configure weekly class schedules
- **Attendance Tracking**: Record and view attendance statistics
- **Dashboard Analytics**: Visualize attendance patterns with charts
- **Push Notifications**: Receive reminders for upcoming classes

## Tech Stack

### Frontend
- React 19
- React Router v7
- Axios for API requests
- Recharts for data visualization
- Vite as build tool

### Backend
- Node.js with Express
- MongoDB with Mongoose
- JWT & Passport.js for authentication
- Express-session for session management
- Web-push for notifications

## Project Structure

```
attendance-manager/
├── frontend/                # React application
│   ├── src/
│   │   ├── api/             # API integration
│   │   ├── assets/          # Static assets
│   │   ├── components/      # Reusable UI components
│   │   ├── context/         # React context providers
│   │   ├── hooks/           # Custom React hooks
│   │   ├── pages/           # Main application pages
│   │   └── utils/           # Helper functions
│   └── package.json         # Frontend dependencies
│
├── backend/                 # Express server
│   ├── config/              # Configuration files
│   ├── middleware/          # Express middleware
│   ├── models/              # Mongoose data models
│   ├── routes/              # API routes
│   ├── scripts/             # Utility scripts
│   ├── services/            # Business logic
│   └── server.js            # Server entry point
```

## Getting Started

### Prerequisites
- Node.js (v16+)
- MongoDB

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/attendance-manager.git
cd attendance-manager
```

2. Install backend dependencies
```bash
cd backend
npm install
```

3. Configure environment variables
```bash
# Create a .env file in the backend directory with:
PORT=5001
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
SESSION_SECRET=your_session_secret
# Other environment variables as needed
```

4. Install frontend dependencies
```bash
cd ../frontend
npm install
```

5. Start the development servers

Backend:
```bash
cd backend
npm start
```

Frontend:
```bash
cd frontend
npm run dev
```

6. Access the application at `http://localhost:5173`

## Deployment

The application is configured for easy deployment:

- Backend is ready for deployment on services like Heroku, Railway, or Render
- Frontend can be deployed to Netlify, Vercel, or any static hosting service

## License

This project is licensed under the MIT License. 

## Contributors

- [@waghmarepranav2006](https://github.com/waghmarepranav2006)
