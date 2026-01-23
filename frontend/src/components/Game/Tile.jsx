/**
 * Tile Component - Individual Grid Cell
 * 
 * Renders a single tile in the maze with Cyberpunk styling
 */

import React from 'react';
import './Tile.css';

const Tile = ({ type, isPlayer, isGhost, playerSide, isDoorOpen = false }) => {
    // Determine tile class based on type
    const getTileClass = () => {
        const classes = ['tile'];

        // Add type-specific class
        if (type === 0) classes.push('tile-empty');
        else if (type === 1) classes.push('tile-wall');
        else if (type === 2) classes.push('tile-goal');
        else if (type === 3) classes.push('tile-start');
        else if (type === 4 || (type >= 10 && type <= 16)) {
            classes.push('tile-switch');
            if (type >= 10) classes.push(`tile-pair-${type - 10 + 1}`);
        }
        else if (type === 5 || (type >= 20 && type <= 26)) {
            classes.push('tile-door');
            if (isDoorOpen) classes.push('door-open');
            if (type >= 20) classes.push(`tile-pair-${type - 20 + 1}`);
        }
        else if (type === 6 || (type >= 30 && type <= 36)) {
            classes.push('tile-portal');
            if (type >= 30) classes.push(`tile-pair-${type - 30 + 1}`);
        }
        else classes.push('tile-empty');

        // Add player overlay
        if (isPlayer) {
            classes.push('tile-player');
            classes.push(playerSide === 'left' ? 'player-left' : 'player-right');
        }

        // Add ghost effect for mirrored visualization
        if (isGhost) {
            classes.push('tile-ghost');
        }

        return classes.join(' ');
    };

    const getPairNumber = () => {
        if (type >= 10 && type <= 16) return type - 10 + 1;
        if (type >= 20 && type <= 26) return type - 20 + 1;
        if (type >= 30 && type <= 36) return type - 30 + 1;
        return null;
    };

    const pairNum = getPairNumber();

    return (
        <div className={getTileClass()}>
            {isPlayer && (
                <div className="player-indicator">
                    <div className="player-core"></div>
                    <div className="player-glow"></div>
                </div>
            )}
            {type === 2 && !isPlayer && (
                <div className="goal-indicator">
                    <div className="goal-core"></div>
                    <div className="goal-pulse"></div>
                </div>
            )}
            {(type === 4 || (type >= 10 && type <= 16)) && !isPlayer && (
                <div className="switch-indicator">
                    <div className="switch-icon">⚡</div>
                    {pairNum && <span className="pair-number">{pairNum}</span>}
                </div>
            )}
            {(type === 5 || (type >= 20 && type <= 26)) && !isPlayer && (
                <div className="door-indicator">
                    <div className="door-icon">{isDoorOpen ? '🔓' : '🔒'}</div>
                    {pairNum && <span className="pair-number">{pairNum}</span>}
                </div>
            )}
            {(type === 6 || (type >= 30 && type <= 36)) && !isPlayer && (
                <div className="portal-indicator">
                    <div className="portal-core"></div>
                    <div className="portal-ring"></div>
                    {pairNum && <span className="pair-number">{pairNum}</span>}
                </div>
            )}
        </div>
    );
};

export default Tile;
