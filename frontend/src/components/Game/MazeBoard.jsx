/**
 * MazeBoard Component - Grid Renderer
 * 
 * Renders a complete maze grid using CSS Grid layout
 */

import React, { useState } from 'react';
import Tile from './Tile';
import AudioManager from '../../utils/AudioManager';
import { isTileVisible } from '../../gameEngine/helperUtils';
import './MazeBoard.css';

const MazeBoard = ({
    gridData,
    playerPosition,
    playerSide,
    title,
    mechanics,
    activeSwitches = [],
    ghostPos = null,
    isEditor = false,
    onTileClick = null,
    onTileEnter = null,
    onTileHover = null,
    isShaking = false,
    currentMoveCount = 0
}) => {
    const [isMuted, setIsMuted] = useState(false);

    if (!gridData || gridData.length === 0) {
        return (
            <div className="maze-board-empty">
                <p>No maze data</p>
            </div>
        );
    }

    const rows = gridData.length;
    const cols = gridData[0].length;

    // Handle music toggle
    const handleMusicToggle = () => {
        const newMuteState = AudioManager.toggleMute();
        setIsMuted(newMuteState);
    };

    // Helper to get mechanic state
    const getMechanicProps = (rowIndex, colIndex, type) => {
        if (!mechanics) return { isActive: false, isOpen: false, variant: 0 };

        // Check Switch
        if (type === 4) { // SWITCH
            const switchIndex = mechanics.switches?.findIndex(s => s.pos.row === rowIndex && s.pos.col === colIndex);
            if (switchIndex !== -1) {
                const switchData = mechanics.switches[switchIndex];
                // Determine variant based on explicit data or index
                const variant = (switchData.variant !== undefined) ? switchData.variant : (switchIndex % 3);
                return {
                    isActive: activeSwitches.includes(switchData.id),
                    variant
                };
            }
        }

        // Check Door
        if (type === 5) { // DOOR
            const doorData = mechanics.doors?.find(d => d.pos.row === rowIndex && d.pos.col === colIndex);
            if (doorData) {
                // Find corresponding switch to match variant
                const switchData = mechanics.switches?.find(s => s.id === doorData.switchId);
                const switchIndex = mechanics.switches?.findIndex(s => s.id === doorData.switchId);

                let variant = 0;
                if (switchData && switchData.variant !== undefined) {
                    variant = switchData.variant;
                } else if (switchIndex !== -1) {
                    variant = switchIndex % 3;
                }

                return {
                    isOpen: activeSwitches.includes(doorData.switchId),
                    variant
                };
            }
        }

        return { variant: 0 };
    };

    return (
        <div className={`maze-board-container ${isShaking ? 'board-shake' : ''}`}>
            {/* Board Title */}
            <div className="maze-board-header">
                <h3 className="maze-board-title">{title}</h3>
                <div className="player-indicator-label">
                    <div className={`player-dot ${playerSide}`}></div>
                    <span>{playerSide === 'left' ? 'Purple Player' : 'Cyan Player'}</span>
                </div>
                {/* Music Toggle Button - Only show on left board */}
                {playerSide === 'left' && (
                    <button
                        className="music-toggle-btn"
                        onClick={handleMusicToggle}
                        title={isMuted ? 'Unmute Music' : 'Mute Music'}
                    >
                        {isMuted ? '🔇' : '🔊'}
                    </button>
                )}
            </div>

            {/* Grid */}
            <div
                className="maze-board-grid"
                style={{
                    gridTemplateRows: `repeat(${rows}, 1fr)`,
                    gridTemplateColumns: `repeat(${cols}, 1fr)`
                }}
            >
                {gridData.map((row, rowIndex) => (
                    row.map((tileType, colIndex) => {
                        const isPlayer =
                            playerPosition &&
                            playerPosition.row === rowIndex &&
                            playerPosition.col === colIndex;

                        const isGhost =
                            ghostPos &&
                            ghostPos.row === rowIndex &&
                            ghostPos.col === colIndex;

                        const mechanicProps = getMechanicProps(rowIndex, colIndex, tileType);

                        // Fog of War: Check if tile is visible based on player position
                        const isVisible = playerPosition
                            ? isTileVisible(rowIndex, colIndex, playerPosition)
                            : true; // If no player position, show all tiles

                        return (
                            <Tile
                                key={`${rowIndex}-${colIndex}`}
                                type={tileType}
                                isPlayer={isPlayer}
                                playerSide={playerSide}
                                isActive={mechanicProps.isActive}
                                isOpen={mechanicProps.isOpen}
                                variant={mechanicProps.variant}
                                isGhost={isGhost}
                                isFogged={!isVisible}
                                currentMoveCount={currentMoveCount}
                                onClick={isEditor && onTileClick ? () => onTileClick(rowIndex, colIndex) : undefined}
                                onMouseEnter={isEditor && onTileEnter ? () => onTileEnter(rowIndex, colIndex) : undefined}
                                onHover={onTileHover ? (data) => {
                                    if (data === null) {
                                        onTileHover(null);
                                    } else {
                                        onTileHover({
                                            type: tileType,
                                            row: rowIndex,
                                            col: colIndex,
                                            side: playerSide === 'left' ? 'LEFT' : 'RIGHT'
                                        });
                                    }
                                } : undefined}
                            />
                        );
                    })
                ))}
            </div>

            {/* Grid Stats */}
            <div className="maze-board-footer">
                <span className="grid-size">{rows} × {cols}</span>
            </div>
        </div>
    );
};

export default MazeBoard;
