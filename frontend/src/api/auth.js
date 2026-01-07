import axiosClient from './axiosClient';

// Store token in localStorage
const setToken = (token) => {
    if (token) {
        localStorage.setItem('token', token);
    } else {
        localStorage.removeItem('token');
    }
};

// Initialize token on module load
const token = localStorage.getItem('token');
// Token will be attached automatically by axiosClient interceptor

// Register a new organization (creates org + admin user)
export const registerOrganization = async (orgData) => {
    try {
        const response = await axiosClient.post('/auth/register/organization', orgData);
        if (response.data.token) {
            setToken(response.data.token);
        }
        return response.data;
    } catch (error) {
        throw error.response?.data || { error: 'Organization registration failed' };
    }
};

// Register a user to existing organization
export const register = async (userData) => {
    try {
        const response = await axiosClient.post('/auth/register', userData);
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
        const response = await axiosClient.post('/auth/login', credentials);
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
        await axiosClient.get('/auth/logout');
        setToken(null);
    } catch (error) {
        console.error('Logout error:', error);
        // Still remove token on frontend even if backend logout fails
        setToken(null);
    }
};

export const getCurrentUser = async () => {
    try {
        const response = await axiosClient.get('/auth/current-user');
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
        const res = await axiosClient.post("/auth/push-subscription", {
            subscription
        });
        return res.data;
    } catch (error) {
        console.error("Error updating push subscription:", error);
        throw error;
    }
};

export const updateRequiredPercentage = async (percentage) => {
    try {
        const res = await axiosClient.put("/auth/required-percentage", {
            percentage
        });
        return res.data;
    } catch (error) {
        console.error("Error updating required percentage:", error);
        throw error;
    }
};
