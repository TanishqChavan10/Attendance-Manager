import { AuthProvider } from "./context/AuthContext";
import { CourseProvider } from "./context/CourseContext";
import { TimetableProvider } from "./context/TimetableContext";
import AppRoutes from "./routes";
import Navbar from "./components/Navbar";
import AttendancePrompt from "./components/AttendancePrompt";
import "./App.css";
import "./components/styles/dashboard.css";
import "./components/styles/modal.css";
import "./components/styles/auth.css";
import "./components/styles/forms.css";
import "./components/styles/utilities.css";
import "./components/styles/attendance.css";

function App() {
  return (
    <AuthProvider>
      <CourseProvider>
        <TimetableProvider>
          <div className="app">
            <div className="bg-decoration bg-decoration-1"></div>
            <div className="bg-decoration bg-decoration-2"></div>
            <Navbar />
            <main className="app-content">
              <div className="container">
                <AppRoutes />
              </div>
            </main>
            <AttendancePrompt />
            <footer>
              <div className="container">
                <p>&copy; {new Date().getFullYear()} Attendance Manager App</p>
              </div>
            </footer>
          </div>
        </TimetableProvider>
      </CourseProvider>
    </AuthProvider>
  );
}

export default App;
