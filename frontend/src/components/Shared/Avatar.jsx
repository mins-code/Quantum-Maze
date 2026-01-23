/**
 * Avatar Component - Reusable Avatar Display
 * 
 * Displays a user avatar with consistent styling and size options.
 */

import React from 'react';
import './Avatar.css';

const Avatar = ({
    seed,
    url,
    size = 'md',
    glowColor = 'var(--neon-cyan)',
    className = ''
}) => {
    // Determine image source: direct URL or DiceBear seed
    const imgSrc = url || (seed ? (seed.startsWith('http') ? seed : `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`) : '/default-avatar.png');

    return (
        <img
            src={imgSrc}
            alt="User Avatar"
            className={`avatar-component avatar-${size} ${className}`}
            style={{
                '--glow-color': glowColor,
                boxShadow: `0 0 10px ${glowColor}40` // 40 is hex for 25% opacity
            }}
            onError={(e) => {
                e.target.src = '/default-avatar.png';
            }}
        />
    );
};

export default Avatar;
