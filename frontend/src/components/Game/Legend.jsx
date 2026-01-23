/**
 * Legend Component
 * 
 * Displays key game elements for the user.
 */

import React from 'react';
import './Tile.css'; // Re-use tile styles

const Legend = () => {
    const items = [
        { label: 'Wall', type: 1, class: 'tile-wall' },
        { label: 'Switch', type: 4, class: 'tile-switch' },
        { label: 'Locked Door (Red/Solid)', type: 5, class: 'tile-door' }, // Clearly indicate locked state
        { label: 'Open Door (Transparent)', type: 5, class: 'tile-door open', isOpen: true }, // Clearly indicate open state
        { label: 'Portal', type: 6, class: 'tile-portal' },
        { label: 'Goal', type: 2, class: 'tile-goal' },
        { label: 'Player', class: 'tile-player player-left' }
    ];

    const styles = {
        container: {
            display: 'flex',
            flexWrap: 'wrap',
            gap: '1.5rem',
            justifyContent: 'center',
            padding: '1rem',
            background: 'rgba(15, 17, 25, 0.6)',
            borderRadius: '12px',
            border: '1px solid rgba(0, 243, 255, 0.2)',
            backdropFilter: 'blur(10px)',
            maxWidth: '1000px',
            margin: '0 auto'
        },
        item: {
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem'
        },
        preview: {
            width: '30px',
            height: '30px',
            position: 'relative',
            borderRadius: '4px',
            overflow: 'hidden'
        },
        label: {
            color: 'var(--text-secondary)',
            fontFamily: 'var(--font-secondary)',
            fontSize: '0.9rem'
        }
    };

    return (
        <div style={styles.container}>
            {items.map((item, index) => (
                <div key={index} style={styles.item}>
                    <div className={`tile ${item.class}`} style={styles.preview}>
                        {/* Render inner content based on type (simplified for legend) */}
                        {item.type === 2 && (
                            <div className="goal-indicator">
                                <div className="goal-core" style={{ width: '40%', height: '40%' }}></div>
                            </div>
                        )}
                        {item.type === 4 && <div className="switch-indicator"></div>}
                        {item.type === 5 && !item.isOpen && <div className="door-barrier"></div>}
                        {item.type === 6 && (
                            <div className="portal-indicator">
                                <div className="portal-vortex"></div>
                                <div className="portal-core"></div>
                            </div>
                        )}
                        {item.label === 'Player' && (
                            <div className="player-indicator">
                                <div className="player-core"></div>
                            </div>
                        )}
                    </div>
                    <span style={styles.label}>{item.label}</span>
                </div>
            ))}
        </div>
    );
};

export default Legend;
