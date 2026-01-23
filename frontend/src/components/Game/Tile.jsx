/**
 * Tile Component - Individual Grid Cell
 * 
 * Renders a single tile in the maze with Cyberpunk styling
 */

import React from 'react';
import { TILE_TYPES } from '../../gameEngine/gameConstants';
import './Tile.css';

const Tile = ({ type, isPlayer, isGhost, playerSide, isActive, isOpen, variant = 0, isFogged = false, onClick, onMouseEnter, onHover }) => {
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
            case 4: // SWITCH
                classes.push('tile-switch');
                classes.push(`variant-${variant}`);
                if (isActive) classes.push('active');
                break;
            case 5: // DOOR
                classes.push('tile-door');
                classes.push(`variant-${variant}`);
                if (isOpen) classes.push('open');
                break;
            case 6: // PORTAL
                classes.push('tile-portal');
                break;
            case 7: // COIN
                classes.push('tile-coin');
                break;
            case TILE_TYPES.ONE_WAY_UP:
            case TILE_TYPES.ONE_WAY_DOWN:
            case TILE_TYPES.ONE_WAY_LEFT:
            case TILE_TYPES.ONE_WAY_RIGHT:
                classes.push('tile-oneway');
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

        // Add fog effect for Fog of War
        if (isFogged) {
            classes.push('fog-hidden');
        }

        return classes.join(' ');
    };

    return (
        <div
            className={getTileClass()}
            onClick={onClick}
            onMouseEnter={(e) => {
                // Prevent any event bubbling that might trigger game logic
                if (onHover) {
                    e.stopPropagation();
                }
                if (onMouseEnter) onMouseEnter();
                if (onHover) onHover();
            }}
            onMouseLeave={(e) => {
                if (onHover) {
                    e.stopPropagation();
                    onHover(null);
                }
            }}
        >
            {isPlayer && (
                <div className="player-indicator">
                    <div className="player-core"></div>
                    <div className="player-glow"></div>
                </div>
            )}

            {isGhost && !isPlayer && (
                <div className="ghost-indicator">
                    <div className="ghost-core"></div>
                    <div className="ghost-glow"></div>
                </div>
            )}

            {type === 2 && !isPlayer && (
                <div className="goal-indicator">
                    <div className="goal-core"></div>
                    <div className="goal-pulse"></div>
                </div>
            )}

            {type === 4 && (
                <div className="switch-indicator"></div>
            )}

            {type === 5 && (
                <div className="door-barrier"></div>
            )}

            {type === 6 && (
                <div className="portal-indicator">
                    <div className="portal-vortex"></div>
                    <div className="portal-core"></div>
                </div>
            )}

            {type === 7 && (
                <div className="coin-item"></div>
            )}

            {(type === TILE_TYPES.ONE_WAY_UP ||
              type === TILE_TYPES.ONE_WAY_DOWN ||
              type === TILE_TYPES.ONE_WAY_LEFT ||
              type === TILE_TYPES.ONE_WAY_RIGHT) && (
                <div className="arrow-gate" style={{
                    transform: `translate(-50%, -50%) rotate(${
                        type === TILE_TYPES.ONE_WAY_UP ? '-90deg' :
                        type === TILE_TYPES.ONE_WAY_DOWN ? '90deg' :
                        type === TILE_TYPES.ONE_WAY_LEFT ? '180deg' : '0deg'
                    })`
                }}>➤</div>
            )}
        </div>
    );
};

export default Tile;
