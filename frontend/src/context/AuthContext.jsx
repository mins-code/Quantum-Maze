/**
 * Authentication Context - Quantum Maze
 * Global state management for user authentication
 */

import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../utils/api';

// Create Auth Context
const AuthContext = createContext(null);

// Custom hook to use auth context
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

// Auth Provider Component
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    // Check for existing token on mount
    useEffect(() => {
        const initAuth = async () => {
            const token = localStorage.getItem('token');
            const storedUser = localStorage.getItem('user');

            if (token && storedUser) {
                try {
                    // Verify token is still valid
                    const response = await api.get('/auth/verify');
                    if (response.data.success) {
                        setUser(JSON.parse(storedUser));
                        setIsAuthenticated(true);
                    } else {
                        // Token invalid, clear storage
                        localStorage.removeItem('token');
                        localStorage.removeItem('user');
                    }
                } catch (error) {
                    // Token verification failed
                    console.error('Token verification failed:', error);
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                }
            }
            setLoading(false);
        };

        initAuth();
    }, []);

    // Login function
    const login = async (email, password) => {
        try {
            const response = await api.post('/auth/login', { email, password });

            if (response.data.success) {
                const { token, user } = response.data;

                // Store token and user in localStorage
                localStorage.setItem('token', token);
                localStorage.setItem('user', JSON.stringify(user));

                // Update state
                setUser(user);
                setIsAuthenticated(true);

                return { success: true, user };
            }
        } catch (error) {
            return { success: false, error };
        }
    };

    // Signup function
    const signup = async (name, username, email, password) => {
        try {
            const response = await api.post('/auth/signup', {
                name,
                username,
                email,
                password
            });

            if (response.data.success) {
                const { token, user } = response.data;

                // Store token and user in localStorage
                localStorage.setItem('token', token);
                localStorage.setItem('user', JSON.stringify(user));

                // Update state
                setUser(user);
                setIsAuthenticated(true);

                return { success: true, user };
            }
        } catch (error) {
            return { success: false, error };
        }
    };

    // Logout function
    const logout = () => {
        // Clear localStorage
        localStorage.removeItem('token');
        localStorage.removeItem('user');

        // Clear state
        setUser(null);
        setIsAuthenticated(false);
    };

    // Update user profile
    const updateProfile = async (updates) => {
        try {
            const response = await api.put('/auth/profile', updates);

            if (response.data.success) {
                const updatedUser = response.data.user;

                // Update localStorage
                localStorage.setItem('user', JSON.stringify(updatedUser));

                // Update state
                setUser(updatedUser);

                return { success: true, user: updatedUser };
            }
        } catch (error) {
            return { success: false, error };
        }
    };

    const value = {
        user,
        loading,
        isAuthenticated,
        login,
        signup,
        logout,
        updateProfile
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;
