import React, { createContext, useState, useContext, useEffect } from 'react';
import { login, register, logout, getCurrentUser } from '../api/auth';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const initializeAuth = async () => {
            try {
                if (localStorage.getItem('token')) {
                    const userData = await getCurrentUser();
                    setUser(userData);
                }
            } catch (error) {
                console.error('Auth initialization error:', error);
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        initializeAuth();
    }, []);

    const handleLogin = async (credentials) => {
        setLoading(true);
        setError(null);
        try {
            const data = await login(credentials);
            setUser(data.user);
            return data;
        } catch (error) {
            setError(error.error || 'Login failed');
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async (userData) => {
        setLoading(true);
        setError(null);
        try {
            const data = await register(userData);
            return data;
        } catch (error) {
            setError(error.error || 'Registration failed');
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        setLoading(true);
        try {
            await logout();
            setUser(null);
        } catch (error) {
            console.error('Logout error:', error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const value = {
        user,
        loading,
        error,
        login: handleLogin,
        register: handleRegister,
        logout: handleLogout,
        isAuthenticated: !!user
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
