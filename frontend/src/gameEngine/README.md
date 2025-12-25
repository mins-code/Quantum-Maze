# Game Engine

This folder contains the core game logic for Quantum Maze.

## Structure (To be implemented)

```
gameEngine/
├── GameManager.js          # Main game loop and state management
├── PhysicsEngine.js        # Collision detection and physics
├── InputHandler.js         # Keyboard/mouse input processing
├── Renderer.js             # Canvas rendering logic
├── EntityController.js     # Entity behavior and AI
└── LevelLoader.js          # Level data loading and parsing
```

## Responsibilities

- Game loop management
- State updates
- Physics calculations
- Input processing
- Rendering coordination
- Entity management
- Level loading and transitions

## Integration with Data Structures

- Uses `ArrayMaze` for grid representation
- Uses `InputQueue` for buffered input
- Uses `EntityMap` for entity tracking
- Uses `MazeGraph` for pathfinding
- Uses `StackUndoRedo` for move history
- Uses `SwitchSet` for puzzle state
- Uses `MoveHistoryLinkedList` for replay
- Uses `LevelTree` for progression
