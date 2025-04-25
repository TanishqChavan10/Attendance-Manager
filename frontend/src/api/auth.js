import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Store token in localStorage
const setToken = (token) => {
    console.log("Setting token")
    if (token) {
        localStorage.setItem('token', token);
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
        localStorage.removeItem('token');
        delete axios.defaults.headers.common['Authorization'];
    }
};

// Initialize axios with stored token
const token = localStorage.getItem('token');
if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

export const register = async (userData) => {
    try {
        const response = await axios.post(`${API_URL}/auth/register`, userData);
        if (response.data.token) {
            setToken(response.data.token);
        }
        return response.data;
    } catch (error) {
        throw error.response?.data || { error: 'Registration failed' };
    }
};

export const login = async (credentials) => {
    try {
        const response = await axios.post(`${API_URL}/auth/login`, credentials);
        if (response.data.token) {
            setToken(response.data.token);
        }
        return response.data;
    } catch (error) {
        throw error.response?.data || { error: 'Login failed' };
    }
};

export const logout = async () => {
    try {
        await axios.post(`${API_URL}/auth/logout`);
        setToken(null);
    } catch (error) {
        console.error('Logout error:', error);
        // Still remove token on frontend even if backend logout fails
        setToken(null);
    }
};

export const getCurrentUser = async () => {
    try {
        const response = await axios.get(`${API_URL}/auth/current-user`);
        return response.data;
    } catch (error) {
        if (error.response?.status === 401) {
            setToken(null);
        }
        throw error.response?.data || { error: 'Failed to get user data' };
    }
};

export const updatePushSubscription = async (subscription) => {
  try {
    const res = await axios.post(`${API_URL}/api/auth/push-subscription`, { 
      subscription 
    });
    return res.data;
  } catch (error) {
    console.error("Error updating push subscription:", error);
    throw error.response?.data || { error: 'Failed to update push subscription' };
  }
};

export const updateRequiredPercentage = async (percentage) => {
  try {
    const res = await axios.put(`${API_URL}/api/auth/required-percentage`, { 
      percentage 
    });
    return res.data;
  } catch (error) {
    console.error("Error updating required percentage:", error);
    throw error;
  }
};
