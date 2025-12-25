/**
 * Login Component - Quantum Maze
 * Cyberpunk-themed login form with glassmorphism
 */

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Auth.css';

const Login = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { login } = useAuth();
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
        if (!formData.email || !formData.password) {
            setError('Please fill in all fields');
            setLoading(false);
            return;
        }

        try {
            const result = await login(formData.email, formData.password);

            if (result.success) {
                // Redirect to dashboard
                navigate('/');
            } else {
                setError(result.error || 'Login failed. Please try again.');
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
                    <p className="auth-subtitle">Access Terminal</p>
                </div>

                {/* Login Form */}
                <form onSubmit={handleSubmit} className="auth-form">
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
                            autoComplete="current-password"
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
                                Authenticating...
                            </>
                        ) : (
                            'Initialize Login'
                        )}
                    </button>
                </form>

                {/* Divider */}
                <div className="auth-divider">
                    <span>New to Quantum Maze?</span>
                </div>

                {/* Signup Link */}
                <Link to="/signup" className="btn btn-secondary auth-secondary">
                    Create Account
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

export default Login;
