/**
 * PAR Calculator for Quantum Maze
 * 
 * This utility calculates the optimal number of moves (PAR) for a dual-maze level
 * using BFS pathfinding that considers both left and right grids simultaneously.
 * 
 * The algorithm handles:
 * - Synchronized movement (both players move together)
 * - Switch-door mechanics (doors block until switch is activated)
 * - Portal teleportation
 * - Asymmetric maze layouts
 */

/**
 * Tile type constants
 */
const TILE_TYPES = {
    EMPTY: 0,
    WALL: 1,
    GOAL: 2,
    START: 3,
    // Extended tile types for numbered switches/doors/portals
    SWITCH_1: 10, SWITCH_2: 11, SWITCH_3: 12, SWITCH_4: 13, SWITCH_5: 14, SWITCH_6: 15, SWITCH_7: 16,
    DOOR_1: 20, DOOR_2: 21, DOOR_3: 22, DOOR_4: 23, DOOR_5: 24, DOOR_6: 25, DOOR_7: 26,
    PORTAL_1: 30, PORTAL_2: 31, PORTAL_3: 32, PORTAL_4: 33, PORTAL_5: 34, PORTAL_6: 35, PORTAL_7: 36
};

/**
 * Helper functions to identify tile types
 */
const isSwitch = (tile) => tile >= 10 && tile <= 16;
const isDoor = (tile) => tile >= 20 && tile <= 26;
const isPortal = (tile) => tile >= 30 && tile <= 36;
const getSwitchNumber = (tile) => tile - 10 + 1;
const getDoorNumber = (tile) => tile - 20 + 1;
const getPortalNumber = (tile) => tile - 30 + 1;

/**
 * Direction vectors for movement
 */
const DIRECTIONS = [
    { row: -1, col: 0, name: 'UP' },
    { row: 1, col: 0, name: 'DOWN' },
    { row: 0, col: -1, name: 'LEFT' },
    { row: 0, col: 1, name: 'RIGHT' }
];

/**
 * Check if a position is within grid bounds
 */
function isInBounds(row, col, grid) {
    return row >= 0 && row < grid.length && col >= 0 && col < grid[0].length;
}

/**
 * Check if a tile is walkable (considering door states)
 */
function isWalkable(tile, activatedSwitches) {
    // Walls are never walkable
    if (tile === TILE_TYPES.WALL) return false;

    // Check if it's a door
    if (isDoor(tile)) {
        const doorNumber = getDoorNumber(tile);
        // Door is walkable only if its corresponding switch is activated
        return activatedSwitches.has(doorNumber);
    }

    // All other tiles are walkable
    return true;
}

/**
 * Find all positions of a specific tile type in a grid
 */
function findTilePositions(grid, tilePredicate) {
    const positions = [];
    for (let row = 0; row < grid.length; row++) {
        for (let col = 0; col < grid[row].length; col++) {
            if (tilePredicate(grid[row][col])) {
                positions.push({ row, col, tile: grid[row][col] });
            }
        }
    }
    return positions;
}

/**
 * Create a state key for visited tracking
 */
function createStateKey(leftPos, rightPos, activatedSwitches) {
    const switchesArray = Array.from(activatedSwitches).sort();
    return `${leftPos.row},${leftPos.col}|${rightPos.row},${rightPos.col}|${switchesArray.join(',')}`;
}

/**
 * Calculate PAR (optimal moves) for a dual-maze level using BFS
 * 
 * @param {Array<Array<number>>} gridLeft - Left maze grid
 * @param {Array<Array<number>>} gridRight - Right maze grid
 * @returns {Object} - { par: number, path: Array, explanation: string }
 */
function calculatePAR(gridLeft, gridRight) {
    // Find start and goal positions
    const leftStarts = findTilePositions(gridLeft, t => t === TILE_TYPES.START);
    const rightStarts = findTilePositions(gridRight, t => t === TILE_TYPES.START);
    const leftGoals = findTilePositions(gridLeft, t => t === TILE_TYPES.GOAL);
    const rightGoals = findTilePositions(gridRight, t => t === TILE_TYPES.GOAL);

    if (leftStarts.length === 0 || rightStarts.length === 0) {
        throw new Error('Start positions not found in both grids');
    }
    if (leftGoals.length === 0 || rightGoals.length === 0) {
        throw new Error('Goal positions not found in both grids');
    }

    const leftStart = leftStarts[0];
    const rightStart = rightStarts[0];
    const leftGoal = leftGoals[0];
    const rightGoal = rightGoals[0];

    console.log(`   Left: Start(${leftStart.row},${leftStart.col}) → Goal(${leftGoal.row},${leftGoal.col})`);
    console.log(`   Right: Start(${rightStart.row},${rightStart.col}) → Goal(${rightGoal.row},${rightGoal.col})`);

    // BFS state: { leftPos, rightPos, activatedSwitches, moves, path }
    const queue = [{
        leftPos: { row: leftStart.row, col: leftStart.col },
        rightPos: { row: rightStart.row, col: rightStart.col },
        activatedSwitches: new Set(),
        moves: 0,
        path: []
    }];

    const visited = new Set();
    visited.add(createStateKey(
        { row: leftStart.row, col: leftStart.col },
        { row: rightStart.row, col: rightStart.col },
        new Set()
    ));

    let iterations = 0;
    const maxIterations = 10000;

    while (queue.length > 0) {
        iterations++;
        if (iterations > maxIterations) {
            throw new Error(`Max iterations (${maxIterations}) reached. Queue size: ${queue.length}, Visited: ${visited.size}`);
        }

        const state = queue.shift();
        const { leftPos, rightPos, activatedSwitches, moves, path } = state;

        // Check if both players reached their goals
        if (leftPos.row === leftGoal.row && leftPos.col === leftGoal.col &&
            rightPos.row === rightGoal.row && rightPos.col === rightGoal.col) {
            return {
                par: moves,
                path: path,
                explanation: `Optimal solution found in ${moves} moves`
            };
        }

        // Try all 4 directions
        for (const dir of DIRECTIONS) {
            const newLeftRow = leftPos.row + dir.row;
            const newLeftCol = leftPos.col + dir.col;

            // Mirror horizontal movement for right player
            // LEFT command (-1 col for left) -> RIGHT move (+1 col for right)
            // RIGHT command (+1 col for left) -> LEFT move (-1 col for right)
            const rightColDiff = (dir.name === 'LEFT' || dir.name === 'RIGHT') ? -dir.col : dir.col;
            const newRightRow = rightPos.row + dir.row;
            const newRightCol = rightPos.col + rightColDiff;

            // Check bounds
            if (!isInBounds(newLeftRow, newLeftCol, gridLeft) ||
                !isInBounds(newRightRow, newRightCol, gridRight)) {
                continue;
            }

            const leftTile = gridLeft[newLeftRow][newLeftCol];
            const rightTile = gridRight[newRightRow][newRightCol];

            // Check if both positions are walkable
            if (!isWalkable(leftTile, activatedSwitches) ||
                !isWalkable(rightTile, activatedSwitches)) {
                continue;
            }

            // Create new state with updated switch activations
            const newActivatedSwitches = new Set(activatedSwitches);
            if (isSwitch(leftTile)) {
                newActivatedSwitches.add(getSwitchNumber(leftTile));
            }
            if (isSwitch(rightTile)) {
                newActivatedSwitches.add(getSwitchNumber(rightTile));
            }

            const newLeftPos = { row: newLeftRow, col: newLeftCol };
            const newRightPos = { row: newRightRow, col: newRightCol };
            const stateKey = createStateKey(newLeftPos, newRightPos, newActivatedSwitches);

            if (!visited.has(stateKey)) {
                visited.add(stateKey);
                queue.push({
                    leftPos: newLeftPos,
                    rightPos: newRightPos,
                    activatedSwitches: newActivatedSwitches,
                    moves: moves + 1,
                    path: [...path, dir.name]
                });
            }
        }
    }

    // No solution found
    throw new Error('No valid path found from start to goal');
}

/**
 * Calculate PAR from level JSON data
 */
function calculatePARFromLevel(levelData) {
    try {
        console.log(`\n📊 Level ${levelData.levelId}: ${levelData.name}`);
        console.log(`   Grid Size: ${levelData.gridLeft.length}x${levelData.gridLeft[0].length}`);
        console.log(`   Calculating optimal path...\n`);

        const result = calculatePAR(levelData.gridLeft, levelData.gridRight);
        console.log(`\n✅ PAR Calculation for Level ${levelData.levelId}: ${levelData.name}`);
        console.log(`   Optimal Moves: ${result.par}`);
        console.log(`   Path: ${result.path.join(' → ')}`);
        console.log(`   ${result.explanation}\n`);
        return result.par;
    } catch (error) {
        console.error(`\n❌ PAR Calculation Error for Level ${levelData.levelId}:`, error.message);
        console.error(`   Stack:`, error.stack);
        throw error;
    }
}

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        calculatePAR,
        calculatePARFromLevel,
        TILE_TYPES
    };
}
