/**
 * EditProfile Component - Quantum Maze
 * View and edit user profile information
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Avatar from '../Shared/Avatar';
import './Profile.css';

const EditProfile = () => {
    const navigate = useNavigate();
    const { user, updateProfile, refreshUser } = useAuth();

    // Refresh user data on mount to ensure stats are up to date
    useEffect(() => {
        if (refreshUser) refreshUser();
    }, []);

    // State Management
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const [formData, setFormData] = useState({
        name: '',
        bio: '',
        avatar: '',
        avatarStyle: 'avataaars'
    });

    // Available Avatar Styles
    const avatarStyles = [
        { value: 'avataaars', label: 'Human' },
        { value: 'bottts', label: 'Robot' },
        { value: 'croodles', label: 'Doodle' },
        { value: 'thumbs', label: 'Fun Emoji' },
        { value: 'identicon', label: 'Abstract' }
    ];

    // Initialize form data from user context
    useEffect(() => {
        if (user) {
            let initialStyle = 'avataaars';
            if (user.avatar) {
                // Try to extract style from existing URL
                // Format: https://api.dicebear.com/7.x/${style}/svg?seed=${seed}
                const match = user.avatar.match(/7\.x\/([^/]+)\/svg/);
                if (match && match[1]) {
                    initialStyle = match[1];
                }
            }

            setFormData({
                name: user.name || '',
                bio: user.bio || '',
                avatar: user.avatar || '',
                avatarStyle: initialStyle
            });
        }
    }, [user]);

    // Handle input changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        
        if (name === 'avatarStyle') {
            // Immediately update avatar when style changes
            const randomString = Math.random().toString(36).substring(7);
            const newAvatar = `https://api.dicebear.com/7.x/${value}/svg?seed=${randomString}`;
            setFormData(prev => ({
                ...prev,
                avatarStyle: value,
                avatar: newAvatar
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    // Randomize Avatar
    const handleRandomizeAvatar = () => {
        const randomString = Math.random().toString(36).substring(7);
        const newAvatar = `https://api.dicebear.com/7.x/${formData.avatarStyle}/svg?seed=${randomString}`;
        setFormData(prev => ({
            ...prev,
            avatar: newAvatar
        }));
    };

    // Save Changes
    const handleSave = async () => {
        setLoading(true);
        setError('');
        setSuccessMessage('');

        if (!formData.name.trim()) {
            setError('Name is required');
            setLoading(false);
            return;
        }

        if (formData.bio.length > 150) {
            setError('Bio must be less than 150 characters');
            setLoading(false);
            return;
        }

        // Exclude avatarStyle from the data sent to backend if it doesn't expect it
        // but we just need to save the avatar URL which is already updated in formData.avatar
        const { avatarStyle, ...profileData } = formData;

        const result = await updateProfile({
            ...profileData,
            avatar: formData.avatar // Ensure latest avatar is sent
        });

        if (result.success) {
            setSuccessMessage('Profile updated successfully!');
            setIsEditing(false);
            setTimeout(() => setSuccessMessage(''), 3000);
        } else {
            setError(result.error || 'Failed to update profile');
        }
        setLoading(false);
    };

    // Cancel Editing
    const handleCancel = () => {
        // Reset form to current user data
        if (user) {
            let initialStyle = 'avataaars';
            if (user.avatar) {
                const match = user.avatar.match(/7\.x\/([^/]+)\/svg/);
                if (match && match[1]) {
                    initialStyle = match[1];
                }
            }
            
            setFormData({
                name: user.name || '',
                bio: user.bio || '',
                avatar: user.avatar || '',
                avatarStyle: initialStyle
            });
        }
        setIsEditing(false);
        setError('');
    };

    if (!user) {
        return (
            <div className="profile-container">
                <div className="loading-state">
                    <div className="spinner"></div>
                    <p>Loading profile...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="profile-container">
            <button className="back-btn-profile" onClick={() => navigate('/')}>
                ← BACK
            </button>

            <div className="profile-content">
                <div className="profile-card">
                    {/* Header Section */}
                    <div className="profile-header">
                        <div className="avatar-container">
                            <Avatar
                                seed={isEditing ? formData.avatar : user.avatar}
                                size="xl"
                                className="profile-avatar-component"
                            />
                        </div>

                        {isEditing && (
                            <div className="avatar-controls">
                                <button className="randomize-btn" onClick={handleRandomizeAvatar}>
                                    🎲 Randomize
                                </button>
                            </div>
                        )}

                        {!isEditing ? (
                            <>
                                <h1 className="profile-name">{user.name}</h1>
                                <p className="profile-username">@{user.username}</p>
                                {user.bio && <p className="profile-bio">{user.bio}</p>}
                                {!user.bio && (
                                    <p className="profile-bio" style={{ fontStyle: 'italic', opacity: 0.6 }}>
                                        No bio yet. Click 'Edit Profile' to add one!
                                    </p>
                                )}
                            </>
                        ) : (
                            <div className="edit-form" style={{ marginTop: '1.5rem' }}>
                                <div className="form-group">
                                    <label className="form-label">Avatar Style</label>
                                    <select
                                        name="avatarStyle"
                                        value={formData.avatarStyle}
                                        onChange={handleChange}
                                        className="form-select"
                                    >
                                        {avatarStyles.map(style => (
                                            <option key={style.value} value={style.value}>
                                                {style.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Name</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        className="form-input"
                                        placeholder="Your Name"
                                        maxLength={50}
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Bio</label>
                                    <textarea
                                        name="bio"
                                        value={formData.bio}
                                        onChange={handleChange}
                                        className="form-textarea"
                                        placeholder="Tell us about yourself..."
                                        maxLength={150}
                                    />
                                    <span className="char-count">{formData.bio.length}/150</span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Stats Row - Only visible in View Mode */}
                    {!isEditing && (
                        <div className="stats-row">
                            <div className="stat-card">
                                <span className="stat-value">{user.totalStars || 0}</span>
                                <span className="stat-label">Total Stars</span>
                            </div>
                            <div className="stat-card">
                                <span className="stat-value">{user.levelsCompleted || 0}</span>
                                <span className="stat-label">Levels Cleared</span>
                            </div>
                            <div className="stat-card">
                                <span className="stat-value">#{user.rank || 'N/A'}</span>
                                <span className="stat-label">Rank</span>
                            </div>
                        </div>
                    )}

                    {/* Feedback Messages */}
                    {error && <div className="error-message" style={{ textAlign: 'center', marginBottom: '1rem' }}>{error}</div>}
                    {successMessage && <div className="success-message" style={{ color: 'var(--success)', textAlign: 'center', marginBottom: '1rem' }}>{successMessage}</div>}

                    {/* Actions */}
                    <div className="profile-actions">
                        {!isEditing ? (
                            <button className="btn-edit" onClick={() => setIsEditing(true)}>
                                Edit Profile
                            </button>
                        ) : (
                            <>
                                <button className="btn-cancel" onClick={handleCancel} disabled={loading}>
                                    Cancel
                                </button>
                                <button className="btn-save" onClick={handleSave} disabled={loading}>
                                    {loading ? 'Saving...' : 'Save Changes'}
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EditProfile;
