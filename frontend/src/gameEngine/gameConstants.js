/**
 * Game Constants - Quantum Maze
 * 
 * Defines all constant values used throughout the game engine
 */

// Tile Types
export const TILE_TYPES = {
    EMPTY: 0,
    WALL: 1,
    GOAL: 2,
    START: 3,
    // Legacy tile types (for backward compatibility)
    SWITCH: 4,
    DOOR: 5,
    PORTAL: 6,
    // Extended tile types for numbered switches/doors/portals
    SWITCH_1: 10, SWITCH_2: 11, SWITCH_3: 12, SWITCH_4: 13, SWITCH_5: 14, SWITCH_6: 15, SWITCH_7: 16,
    DOOR_1: 20, DOOR_2: 21, DOOR_3: 22, DOOR_4: 23, DOOR_5: 24, DOOR_6: 25, DOOR_7: 26,
    PORTAL_1: 30, PORTAL_2: 31, PORTAL_3: 32, PORTAL_4: 33, PORTAL_5: 34, PORTAL_6: 35, PORTAL_7: 36
};

// Helper functions to identify tile types
export const isSwitch = (tile) => tile >= 10 && tile <= 16 || tile === 4;
export const isDoor = (tile) => tile >= 20 && tile <= 26 || tile === 5;
export const isPortal = (tile) => tile >= 30 && tile <= 36 || tile === 6;
export const getSwitchNumber = (tile) => tile >= 10 && tile <= 16 ? tile - 10 + 1 : 1;
export const getDoorNumber = (tile) => tile >= 20 && tile <= 26 ? tile - 20 + 1 : 1;
export const getPortalNumber = (tile) => tile >= 30 && tile <= 36 ? tile - 30 + 1 : 1;

// Individual tile type exports for convenience
export const EMPTY = TILE_TYPES.EMPTY;
export const WALL = TILE_TYPES.WALL;
export const GOAL = TILE_TYPES.GOAL;
export const START = TILE_TYPES.START;
export const SWITCH = TILE_TYPES.SWITCH;
export const DOOR = TILE_TYPES.DOOR;
export const PORTAL = TILE_TYPES.PORTAL;

// Direction Constants
export const DIRECTIONS = {
    UP: 'UP',
    DOWN: 'DOWN',
    LEFT: 'LEFT',
    RIGHT: 'RIGHT'
};

export const UP = DIRECTIONS.UP;
export const DOWN = DIRECTIONS.DOWN;
export const LEFT = DIRECTIONS.LEFT;
export const RIGHT = DIRECTIONS.RIGHT;

// Direction Vectors (for movement calculation)
export const DIRECTION_VECTORS = {
    [UP]: { row: -1, col: 0 },
    [DOWN]: { row: 1, col: 0 },
    [LEFT]: { row: 0, col: -1 },
    [RIGHT]: { row: 0, col: 1 }
};

// Mirrored Direction Mapping (for right player)
// Left player moves normally, right player mirrors horizontally
export const MIRRORED_DIRECTIONS = {
    [UP]: UP,       // Up stays up
    [DOWN]: DOWN,   // Down stays down
    [LEFT]: RIGHT,  // Left becomes right (mirrored)
    [RIGHT]: LEFT   // Right becomes left (mirrored)
};

// Player IDs
export const PLAYER_IDS = {
    LEFT: 'player_left',
    RIGHT: 'player_right'
};

// Game States
export const GAME_STATES = {
    IDLE: 'IDLE',
    PLAYING: 'PLAYING',
    PAUSED: 'PAUSED',
    WON: 'WON',
    LOST: 'LOST'
};

// Scoring Constants
export const SCORING = {
    STAR_3: 1.0,   // <= par moves
    STAR_2: 1.5,   // <= par * 1.5
    STAR_1: 2.0,   // <= par * 2.0
    STAR_0: 999    // > par * 2.0
};

// Animation Durations (milliseconds)
export const ANIMATION = {
    MOVE_DURATION: 200,
    WIN_DELAY: 500,
    HINT_DURATION: 1000
};

// Input Keys
export const KEYS = {
    ARROW_UP: 'ArrowUp',
    ARROW_DOWN: 'ArrowDown',
    ARROW_LEFT: 'ArrowLeft',
    ARROW_RIGHT: 'ArrowRight',
    W: 'w',
    A: 'a',
    S: 's',
    D: 'd',
    SPACE: ' ',
    ESCAPE: 'Escape',
    Z: 'z',
    R: 'r',
    H: 'h'
};

// Key to Direction Mapping
export const KEY_TO_DIRECTION = {
    [KEYS.ARROW_UP]: UP,
    [KEYS.ARROW_DOWN]: DOWN,
    [KEYS.ARROW_LEFT]: LEFT,
    [KEYS.ARROW_RIGHT]: RIGHT,
    [KEYS.W]: UP,
    [KEYS.A]: LEFT,
    [KEYS.S]: DOWN,
    [KEYS.D]: RIGHT
};

export default {
    TILE_TYPES,
    DIRECTIONS,
    DIRECTION_VECTORS,
    MIRRORED_DIRECTIONS,
    PLAYER_IDS,
    GAME_STATES,
    SCORING,
    ANIMATION,
    KEYS,
    KEY_TO_DIRECTION,
    isSwitch,
    isDoor,
    isPortal,
    getSwitchNumber,
    getDoorNumber,
    getPortalNumber
};
