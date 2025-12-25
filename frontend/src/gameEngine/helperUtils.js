/**
 * Helper Utilities - Quantum Maze
 * 
 * Utility functions for game logic calculations
 */

import { DIRECTION_VECTORS, MIRRORED_DIRECTIONS } from './gameConstants.js';

/**
 * Calculate new position based on direction
 * @param {number} row - Current row
 * @param {number} col - Current column
 * @param {string} direction - Direction to move
 * @returns {Object} - New position {row, col}
 */
export function calculateNewPosition(row, col, direction) {
    const vector = DIRECTION_VECTORS[direction];
    return {
        row: row + vector.row,
        col: col + vector.col
    };
}

/**
 * Get mirrored direction for right player
 * @param {string} direction - Original direction
 * @returns {string} - Mirrored direction
 */
export function getMirroredDirection(direction) {
    return MIRRORED_DIRECTIONS[direction];
}

/**
 * Check if position is within grid bounds
 * @param {number} row - Row to check
 * @param {number} col - Column to check
 * @param {number} maxRows - Maximum rows
 * @param {number} maxCols - Maximum columns
 * @returns {boolean} - True if within bounds
 */
export function isWithinBounds(row, col, maxRows, maxCols) {
    return row >= 0 && row < maxRows && col >= 0 && col < maxCols;
}

/**
 * Calculate Manhattan distance between two points
 * @param {number} row1 - First row
 * @param {number} col1 - First column
 * @param {number} row2 - Second row
 * @param {number} col2 - Second column
 * @returns {number} - Manhattan distance
 */
export function manhattanDistance(row1, col1, row2, col2) {
    return Math.abs(row1 - row2) + Math.abs(col1 - col2);
}

/**
 * Calculate stars based on moves and par
 * @param {number} moves - Number of moves taken
 * @param {number} par - Par moves for the level
 * @returns {number} - Stars earned (0-3)
 */
export function calculateStars(moves, par) {
    if (moves <= par) return 3;
    if (moves <= par * 1.5) return 2;
    if (moves <= par * 2) return 1;
    return 0;
}

/**
 * Format time in MM:SS format
 * @param {number} seconds - Time in seconds
 * @returns {string} - Formatted time string
 */
export function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Generate unique tile ID from coordinates
 * @param {number} row - Row coordinate
 * @param {number} col - Column coordinate
 * @returns {string} - Unique tile ID
 */
export function getTileId(row, col) {
    return `tile_${row}_${col}`;
}

/**
 * Parse tile ID to get coordinates
 * @param {string} tileId - Tile ID (e.g., "tile_5_3")
 * @returns {Object} - Coordinates {row, col}
 */
export function parseTileId(tileId) {
    const parts = tileId.split('_');
    return {
        row: parseInt(parts[1], 10),
        col: parseInt(parts[2], 10)
    };
}

/**
 * Deep clone an object
 * @param {Object} obj - Object to clone
 * @returns {Object} - Cloned object
 */
export function deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
}

/**
 * Check if two positions are equal
 * @param {Object} pos1 - First position {row, col}
 * @param {Object} pos2 - Second position {row, col}
 * @returns {boolean} - True if equal
 */
export function positionsEqual(pos1, pos2) {
    return pos1.row === pos2.row && pos1.col === pos2.col;
}

export default {
    calculateNewPosition,
    getMirroredDirection,
    isWithinBounds,
    manhattanDistance,
    calculateStars,
    formatTime,
    getTileId,
    parseTileId,
    deepClone,
    positionsEqual
};
