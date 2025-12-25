# Data Structures

This folder contains the 8 required data structures for Quantum Maze, strictly adhering to the PRD.

## Data Structures Overview

### 1. Array - `arrayMaze.js`
**Purpose**: Maze grid representation  
**Usage**: 2D array storing cell states, walls, entities

### 2. Stack - `stackUndoRedo.js`
**Purpose**: Undo/Redo functionality  
**Usage**: LIFO structure for move history management

### 3. Queue - `inputQueue.js`
**Purpose**: Input buffering  
**Usage**: FIFO structure for processing player commands

### 4. Set - `switchSet.js`
**Purpose**: Switch/trigger tracking  
**Usage**: Unique collection of activated switches

### 5. Map - `entityMap.js`
**Purpose**: Entity management  
**Usage**: Key-value pairs for entity storage (ID -> entity data)

### 6. Linked List - `moveHistoryLinkedList.js`
**Purpose**: Complete move history  
**Usage**: Doubly linked list for efficient insertion/deletion

### 7. Tree - `levelTree.js`
**Purpose**: Level progression hierarchy  
**Usage**: Tree structure for level unlocking and dependencies

### 8. Graph - `mazeGraph.js`
**Purpose**: Maze connectivity and pathfinding  
**Usage**: Adjacency list for cell connections and pathfinding algorithms

## Implementation Status

All files are created with placeholder structure. Each file includes:
- Class definition
- Constructor
- Method stubs with TODO comments
- JSDoc comments explaining purpose

## Next Steps

Implement the full functionality for each data structure according to game requirements.
