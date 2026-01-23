/**
 * MazeBoard Component - Grid Renderer
 * 
 * Renders a complete maze grid using CSS Grid layout
 */

import React from 'react';
import Tile from './Tile';
import './MazeBoard.css';

const MazeBoard = ({
    gridData,
    playerPosition,
    playerSide,
    title,
    mechanics,
    activeSwitches = []
}) => {
    if (!gridData || gridData.length === 0) {
        return (
            <div className="maze-board-empty">
                <p>No maze data</p>
            </div>
        );
    }

    const rows = gridData.length;
    const cols = gridData[0].length;

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
        <div className="maze-board-container">
            {/* Board Title */}
            <div className="maze-board-header">
                <h3 className="maze-board-title">{title}</h3>
                <div className="player-indicator-label">
                    <div className={`player-dot ${playerSide}`}></div>
                    <span>{playerSide === 'left' ? 'Purple Player' : 'Cyan Player'}</span>
                </div>
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

                        const mechanicProps = getMechanicProps(rowIndex, colIndex, tileType);

                        return (
                            <Tile
                                key={`${rowIndex}-${colIndex}`}
                                type={tileType}
                                isPlayer={isPlayer}
                                playerSide={playerSide}
                                isActive={mechanicProps.isActive}
                                isOpen={mechanicProps.isOpen}
                                variant={mechanicProps.variant}
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
