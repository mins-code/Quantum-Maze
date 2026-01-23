/**
 * TileLegend Component - Displays tile type reference
 * Shows all tile types with their colors and meanings
 */

import React from 'react';
import './TileLegend.css';

const TileLegend = () => {
    const tiles = [
        { type: 'wall', color: '#00F3FF', label: 'Wall', icon: '█' },
        { type: 'empty', color: '#0B0D17', label: 'Path', icon: '·' },
        { type: 'start', color: '#BC13FE', label: 'Start', icon: '●' },
        { type: 'goal', color: '#00FF88', label: 'Goal', icon: '◉' },
        { type: 'switch', color: '#FF9500', label: 'Switch', icon: '⚡' },
        { type: 'door', color: '#FF0066', label: 'Door', icon: '🔒' },
        { type: 'portal', color: '#4169E1', label: 'Portal', icon: '◎' }
    ];

    return (
        <div className="tile-legend">
            <div className="legend-title">Tile Legend</div>
            <div className="legend-items">
                {tiles.map((tile) => (
                    <div key={tile.type} className="legend-item">
                        <div
                            className="legend-tile-sample"
                            style={{
                                borderColor: tile.color,
                                backgroundColor: tile.type === 'empty' ? tile.color : `${tile.color}20`
                            }}
                        >
                            <span style={{ color: tile.color }}>{tile.icon}</span>
                        </div>
                        <span className="legend-label">{tile.label}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TileLegend;
