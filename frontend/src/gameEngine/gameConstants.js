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
    SWITCH: 4,
    DOOR: 5,
    PORTAL: 6,
    COIN: 7,
    ONE_WAY_UP: 9,
    ONE_WAY_DOWN: 10,
    ONE_WAY_LEFT: 11,
    ONE_WAY_RIGHT: 12
};

// Individual tile type exports for convenience
export const EMPTY = TILE_TYPES.EMPTY;
export const WALL = TILE_TYPES.WALL;
export const GOAL = TILE_TYPES.GOAL;
export const START = TILE_TYPES.START;
export const SWITCH = TILE_TYPES.SWITCH;
export const DOOR = TILE_TYPES.DOOR;
export const PORTAL = TILE_TYPES.PORTAL;
export const COIN = TILE_TYPES.COIN;
export const ONE_WAY_UP = TILE_TYPES.ONE_WAY_UP;
export const ONE_WAY_DOWN = TILE_TYPES.ONE_WAY_DOWN;
export const ONE_WAY_LEFT = TILE_TYPES.ONE_WAY_LEFT;
export const ONE_WAY_RIGHT = TILE_TYPES.ONE_WAY_RIGHT;

// Tile Metadata - For Live Tile Preview Scanner
export const TILE_METADATA = {
    [TILE_TYPES.EMPTY]: {
        name: 'Quantum Floor',
        description: 'Stable quantum substrate. Safe for traversal.',
        hazardLevel: 'SAFE',
        color: '#1a1d2e'
    },
    [TILE_TYPES.WALL]: {
        name: 'Barrier Field',
        description: 'Impenetrable energy barrier. Blocks all movement.',
        hazardLevel: 'BLOCKER',
        color: '#ff0055'
    },
    [TILE_TYPES.GOAL]: {
        name: 'Exit Portal',
        description: 'Quantum exit gateway. Reach with both entities to complete.',
        hazardLevel: 'OBJECTIVE',
        color: '#00ff88'
    },
    [TILE_TYPES.START]: {
        name: 'Spawn Point',
        description: 'Entity materialization zone. Initial coordinates.',
        hazardLevel: 'NEUTRAL',
        color: '#00f3ff'
    },
    [TILE_TYPES.SWITCH]: {
        name: 'Quantum Switch',
        description: 'Pressure-activated mechanism. Toggles linked door states.',
        hazardLevel: 'INTERACTIVE',
        color: '#ffaa00'
    },
    [TILE_TYPES.DOOR]: {
        name: 'Energy Gate',
        description: 'Switch-controlled barrier. Requires activation to pass.',
        hazardLevel: 'CONDITIONAL',
        color: '#bc13fe'
    },
    [TILE_TYPES.PORTAL]: {
        name: 'Wormhole Portal',
        description: 'Quantum teleportation node. Instantly transports to paired portal.',
        hazardLevel: 'TELEPORTER',
        color: '#0066ff'
    },
    [TILE_TYPES.COIN]: {
        name: 'Quantum Coin',
        description: 'Collectible energy fragment. Bonus objective.',
        hazardLevel: 'COLLECTIBLE',
        color: '#ffd700'
    },
    [TILE_TYPES.ONE_WAY_UP]: {
        name: 'North Gate',
        description: 'One-way barrier. Only allows passage when moving UP.',
        hazardLevel: 'RESTRICTION',
        color: '#00ccff'
    },
    [TILE_TYPES.ONE_WAY_DOWN]: {
        name: 'South Gate',
        description: 'One-way barrier. Only allows passage when moving DOWN.',
        hazardLevel: 'RESTRICTION',
        color: '#00ccff'
    },
    [TILE_TYPES.ONE_WAY_LEFT]: {
        name: 'West Gate',
        description: 'One-way barrier. Only allows passage when moving LEFT.',
        hazardLevel: 'RESTRICTION',
        color: '#00ccff'
    },
    [TILE_TYPES.ONE_WAY_RIGHT]: {
        name: 'East Gate',
        description: 'One-way barrier. Only allows passage when moving RIGHT.',
        hazardLevel: 'RESTRICTION',
        color: '#00ccff'
    }
};

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
    TILE_METADATA,
    DIRECTIONS,
    DIRECTION_VECTORS,
    MIRRORED_DIRECTIONS,
    PLAYER_IDS,
    GAME_STATES,
    SCORING,
    ANIMATION,
    KEYS,
    KEY_TO_DIRECTION
};
