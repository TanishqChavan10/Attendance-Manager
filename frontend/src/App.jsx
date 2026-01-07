import { AuthProvider } from "./context/AuthContext";
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
import { Toaster } from "sonner";

function App() {
  return (
    <AuthProvider>
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
          <Toaster position="top-center" richColors theme="dark" />
        </div>
      </TimetableProvider>
    </AuthProvider>
  );
}

export default App;
