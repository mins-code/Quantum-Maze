/**
 * MyLevels Component - Quantum Maze
 * List of user's created levels with management options
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import './MyLevels.css';

const MyLevels = () => {
    const [levels, setLevels] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (user) {
            fetchUserLevels();
        }
    }, [user]);

    const fetchUserLevels = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/custom-levels/user/${user.id}`);
            setLevels(response.data.levels);
        } catch (error) {
            console.error('Error fetching user levels:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (levelId, levelName) => {
        if (window.confirm(`Are you sure you want to delete "${levelName}"? This cannot be undone.`)) {
            try {
                await api.delete(`/custom-levels/${levelId}`);
                // Remove from state
                setLevels(prev => prev.filter(l => l._id !== levelId));
            } catch (error) {
                console.error('Error deleting level:', error);
                alert('Failed to delete level');
            }
        }
    };

    const handleEdit = (levelId) => {
        navigate(`/editor/${levelId}`);
    };

    if (loading) {
        return <div className="loading-container"><div className="loader"></div></div>;
    }

    return (
        <div className="my-levels-container">
            <header className="page-header">
                <h1>My Custom Levels</h1>
                <button className="btn-create-new" onClick={() => navigate('/editor')}>
                    ➕ Create New
                </button>
            </header>

            {levels.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-icon">🧩</div>
                    <h3>No Levels Created Yet</h3>
                    <p>Start your journey as a maze architect!</p>
                    <button className="btn-primary" onClick={() => navigate('/editor')}>
                        Create Your First Level
                    </button>
                </div>
            ) : (
                <div className="levels-grid">
                    {levels.map(level => (
                        <div key={level._id} className="level-card glass-card">
                            <div className="level-info">
                                <h3>{level.name}</h3>
                                <div className="level-meta">
                                    <span className={`difficulty-badge ${level.difficulty.toLowerCase()}`}>
                                        {level.difficulty}
                                    </span>
                                    <span className="meta-item">Moves: {level.parMoves}</span>
                                    <span className="meta-item">Size: {level.gridLeft.length}x{level.gridLeft[0].length}</span>
                                </div>
                                <div className="level-stats">
                                    <span>▶️ {level.plays || 0}</span>
                                    <span>❤️ {level.likes || 0}</span>
                                    <span>📅 {new Date(level.createdAt).toLocaleDateString()}</span>
                                </div>
                            </div>
                            <div className="level-actions">
                                <button 
                                    className="btn-action btn-edit"
                                    onClick={() => handleEdit(level._id)}
                                    title="Edit Level"
                                >
                                    ✏️ Edit
                                </button>
                                <button 
                                    className="btn-action btn-delete"
                                    onClick={() => handleDelete(level._id, level.name)}
                                    title="Delete Level"
                                >
                                    🗑️ Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyLevels;
