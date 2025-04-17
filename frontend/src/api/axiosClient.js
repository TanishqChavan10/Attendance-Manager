import axios from "axios";

// Get the backend API URL from environment variables or use the default
const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5001/api";

const axiosClient = axios.create({
  baseURL: apiUrl,
  withCredentials: true, // Important for CORS with credentials
  headers: {
    "Content-Type": "application/json",
  },
});

// Add a request interceptor to attach the token if available
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Store information about the current request to prevent redirect loops
const isAuthCheckRequest = (config) => {
  return config.url.includes('/auth/current-user');
};

// Add a response interceptor to handle common errors
axiosClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Don't redirect if it's an auth check request - this prevents reload loops
    const isAuthCheck = error.config && isAuthCheckRequest(error.config);
    
    // Handle unauthorized errors (401) but don't redirect for auth check requests
    if (error.response && error.response.status === 401 && !isAuthCheck) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      
      // Use window.location.replace instead of href to avoid adding to history
      // Only redirect if we're not already on the login page
      if (!window.location.pathname.includes('/login')) {
        window.location.replace("/login");
      }
    }
    
    // Network errors
    if (!error.response) {
      console.error("Network Error:", error.message);
    }
    
    return Promise.reject(error);
  }
);

export default axiosClient;
