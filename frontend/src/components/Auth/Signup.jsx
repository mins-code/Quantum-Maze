/**
 * Signup Component - Quantum Maze
 * Cyberpunk-themed registration form with glassmorphism
 */

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Auth.css';

const Signup = () => {
    const [formData, setFormData] = useState({
        name: '',
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { signup } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        // Clear error when user types
        if (error) setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        // Validation
        if (!formData.name || !formData.username || !formData.email || !formData.password) {
            setError('Please fill in all fields');
            setLoading(false);
            return;
        }

        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters');
            setLoading(false);
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            setLoading(false);
            return;
        }

        // Username validation
        if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
            setError('Username can only contain letters, numbers, and underscores');
            setLoading(false);
            return;
        }

        try {
            const result = await signup(
                formData.name,
                formData.username,
                formData.email,
                formData.password
            );

            if (result.success) {
                // Redirect to dashboard
                navigate('/');
            } else {
                setError(result.error || 'Signup failed. Please try again.');
            }
        } catch (err) {
            setError('An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card glass-card neon-border">
                {/* Logo/Title */}
                <div className="auth-header">
                    <h1 className="glitch">Quantum Maze</h1>
                    <p className="auth-subtitle">New User Registration</p>
                </div>

                {/* Signup Form */}
                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="input-group">
                        <label htmlFor="name">Full Name</label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            placeholder="John Doe"
                            value={formData.name}
                            onChange={handleChange}
                            disabled={loading}
                            autoComplete="name"
                        />
                    </div>

                    <div className="input-group">
                        <label htmlFor="username">Username</label>
                        <input
                            type="text"
                            id="username"
                            name="username"
                            placeholder="johndoe_2025"
                            value={formData.username}
                            onChange={handleChange}
                            disabled={loading}
                            autoComplete="username"
                        />
                    </div>

                    <div className="input-group">
                        <label htmlFor="email">Email Address</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            placeholder="user@quantummaze.io"
                            value={formData.email}
                            onChange={handleChange}
                            disabled={loading}
                            autoComplete="email"
                        />
                    </div>

                    <div className="input-group">
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            placeholder="••••••••"
                            value={formData.password}
                            onChange={handleChange}
                            disabled={loading}
                            autoComplete="new-password"
                        />
                    </div>

                    <div className="input-group">
                        <label htmlFor="confirmPassword">Confirm Password</label>
                        <input
                            type="password"
                            id="confirmPassword"
                            name="confirmPassword"
                            placeholder="••••••••"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            disabled={loading}
                            autoComplete="new-password"
                        />
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="error-message">
                            {error}
                        </div>
                    )}

                    {/* Submit Button */}
                    <button
                        type="submit"
                        className="btn btn-primary auth-submit"
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <div className="spinner-small"></div>
                                Creating Account...
                            </>
                        ) : (
                            'Register Account'
                        )}
                    </button>
                </form>

                {/* Divider */}
                <div className="auth-divider">
                    <span>Already have an account?</span>
                </div>

                {/* Login Link */}
                <Link to="/login" className="btn btn-secondary auth-secondary">
                    Back to Login
                </Link>

                {/* Footer */}
                <div className="auth-footer">
                    <p>Secure Connection Established</p>
                    <div className="status-indicator"></div>
                </div>
            </div>
        </div>
    );
};

export default Signup;
