/**
 * Array Data Structure - MazeGrid
 * 
 * PURPOSE: Represents the maze as a 2D grid using arrays
 * WHY ARRAY: Arrays provide O(1) random access to any tile, which is essential
 * for fast rendering and collision detection in a grid-based game.
 * 
 * ACADEMIC JUSTIFICATION:
 * - Constant-time access to any grid position
 * - Efficient memory layout (contiguous storage)
 * - Natural representation of 2D game boards
 */

export class MazeGrid {
  constructor(rows, cols) {
    this.rows = rows;
    this.cols = cols;
    this.grid = [];
  }

  /**
   * Initialize the grid with a default value
   * @param {*} initialValue - Value to fill each cell with
   */
  createGrid(initialValue = 0) {
    this.grid = [];
    for (let row = 0; row < this.rows; row++) {
      this.grid[row] = [];
      for (let col = 0; col < this.cols; col++) {
        this.grid[row][col] = initialValue;
      }
    }
  }

  /**
   * Set the value of a specific tile
   * @param {number} row - Row index
   * @param {number} col - Column index
   * @param {*} value - Value to set
   * @returns {boolean} - Success status
   */
  setTile(row, col, value) {
    if (this.isValidPosition(row, col)) {
      this.grid[row][col] = value;
      return true;
    }
    return false;
  }

  /**
   * Get the value of a specific tile
   * @param {number} row - Row index
   * @param {number} col - Column index
   * @returns {*} - Tile value or null if invalid
   */
  getTile(row, col) {
    if (this.isValidPosition(row, col)) {
      return this.grid[row][col];
    }
    return null;
  }

  /**
   * Check if a position is within grid bounds
   * @param {number} row - Row index
   * @param {number} col - Column index
   * @returns {boolean} - True if valid
   */
  isValidPosition(row, col) {
    return row >= 0 && row < this.rows && col >= 0 && col < this.cols;
  }

  /**
   * Get all neighboring tiles (up, down, left, right)
   * @param {number} row - Row index
   * @param {number} col - Column index
   * @returns {Array} - Array of neighbor positions
   */
  getNeighbors(row, col) {
    const neighbors = [];
    const directions = [
      [-1, 0], // up
      [1, 0],  // down
      [0, -1], // left
      [0, 1]   // right
    ];

    for (const [dRow, dCol] of directions) {
      const newRow = row + dRow;
      const newCol = col + dCol;
      if (this.isValidPosition(newRow, newCol)) {
        neighbors.push({ row: newRow, col: newCol, value: this.grid[newRow][newCol] });
      }
    }

    return neighbors;
  }

  /**
   * Get the entire grid
   * @returns {Array} - 2D array representing the grid
   */
  getGrid() {
    return this.grid;
  }

  /**
   * Clear the entire grid
   */
  clear() {
    this.grid = [];
  }
}

export default MazeGrid;
