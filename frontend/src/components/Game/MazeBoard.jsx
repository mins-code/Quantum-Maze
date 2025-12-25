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
    title
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

                        return (
                            <Tile
                                key={`${rowIndex}-${colIndex}`}
                                type={tileType}
                                isPlayer={isPlayer}
                                playerSide={playerSide}
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
