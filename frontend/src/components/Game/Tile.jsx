/**
 * Tile Component - Individual Grid Cell
 * 
 * Renders a single tile in the maze with Cyberpunk styling
 */

import React from 'react';
import './Tile.css';

const Tile = ({ type, isPlayer, isGhost, playerSide }) => {
    // Determine tile class based on type
    const getTileClass = () => {
        const classes = ['tile'];

        // Add type-specific class
        switch (type) {
            case 0: // EMPTY
                classes.push('tile-empty');
                break;
            case 1: // WALL
                classes.push('tile-wall');
                break;
            case 2: // GOAL
                classes.push('tile-goal');
                break;
            case 3: // START
                classes.push('tile-start');
                break;
            default:
                classes.push('tile-empty');
        }

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
        </div>
    );
};

export default Tile;
