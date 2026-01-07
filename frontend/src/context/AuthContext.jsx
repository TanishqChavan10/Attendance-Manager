import React, { createContext, useState, useContext, useEffect } from 'react';
import { login, register, registerOrganization, logout, getCurrentUser } from '../api/auth';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [organization, setOrganization] = useState(null);
    const [userRole, setUserRole] = useState(null);
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

            // Store organization and role
            if (data.user.organizationId) {
                setOrganization({
                    id: data.user.organizationId,
                    name: data.user.organizationName,
                    slug: data.user.organizationSlug
                });
            }
            setUserRole(data.user.role);

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
            // Auto-login after registration
            if (data.token && data.user) {
                setUser(data.user);
                if (data.user.organizationId) {
                    setOrganization({
                        id: data.user.organizationId,
                        name: data.user.organizationName,
                        slug: data.user.organizationSlug
                    });
                }
                setUserRole(data.user.role);
            }
            return data;
        } catch (error) {
            setError(error.error || 'Registration failed');
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const handleRegisterOrganization = async (orgData) => {
        setLoading(true);
        setError(null);
        try {
            const data = await registerOrganization(orgData);
            // Auto-login after organization creation
            if (data.token && data.user) {
                setUser(data.user);
                if (data.user.organizationId) {
                    setOrganization({
                        id: data.user.organizationId,
                        name: data.user.organizationName,
                        slug: data.user.organizationSlug
                    });
                }
                setUserRole(data.user.role);
            }
            return data;
        } catch (error) {
            setError(error.error || 'Organization creation failed');
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
            setOrganization(null);
            setUserRole(null);
        } catch (error) {
            console.error('Logout error:', error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const value = {
        user,
        organization,
        userRole,
        loading,
        error,
        login: handleLogin,
        register: handleRegister,
        registerOrganization: handleRegisterOrganization,
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
