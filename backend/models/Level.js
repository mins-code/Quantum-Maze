/**
 * Level Model - Quantum Maze
 * Mongoose schema for storing level data and configurations
 */

const mongoose = require('mongoose');

const levelSchema = new mongoose.Schema({
    levelId: {
        type: Number,
        required: [true, 'Level ID is required'],
        unique: true,
        min: [1, 'Level ID must be at least 1']
    },
    name: {
        type: String,
        required: [true, 'Level name is required'],
        trim: true
    },
    difficulty: {
        type: String,
        enum: ['Easy', 'Medium', 'Hard', 'Expert'],
        default: 'Easy'
    },
    gridLeft: {
        type: [[Number]],
        required: [true, 'Left grid is required'],
        validate: {
            validator: function (grid) {
                // Ensure it's a valid 2D array
                return Array.isArray(grid) && grid.length > 0 &&
                    grid.every(row => Array.isArray(row) && row.length === grid[0].length);
            },
            message: 'Grid must be a valid 2D array with consistent row lengths'
        }
    },
    gridRight: {
        type: [[Number]],
        required: [true, 'Right grid is required'],
        validate: {
            validator: function (grid) {
                // Ensure it's a valid 2D array with same dimensions as gridLeft
                return Array.isArray(grid) && grid.length > 0 &&
                    grid.every(row => Array.isArray(row) && row.length === grid[0].length) &&
                    grid.length === this.gridLeft.length &&
                    grid[0].length === this.gridLeft[0].length;
            },
            message: 'Right grid must match left grid dimensions'
        }
    },
    parMoves: {
        type: Number,
        required: [true, 'Par moves is required for star calculation'],
        min: [1, 'Par moves must be at least 1']
    },
    bestTime: {
        type: Number,
        default: null,
        min: [0, 'Best time cannot be negative']
    },
    mechanics: {
        switches: [{
            id: String,
            pos: { row: Number, col: Number },
            variant: { type: Number, default: 0 }
        }],
        doors: [{
            id: String,
            pos: { row: Number, col: Number },
            switchId: String
        }],
        portals: [{
            pos: { row: Number, col: Number },
            target: { row: Number, col: Number }
        }]
    },
    // Additional level metadata
    description: {
        type: String,
        default: ''
    },
    unlockRequirement: {
        type: Number,
        default: null, // levelId that must be completed to unlock this level
        ref: 'Level'
    },
    isActive: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Index for faster queries
// Note: levelId already has an index from unique: true
levelSchema.index({ difficulty: 1 });

// Method to calculate stars based on moves
levelSchema.methods.calculateStars = function (moves) {
    if (moves <= this.parMoves) {
        return 3; // Perfect - 3 stars
    } else if (moves <= this.parMoves * 1.5) {
        return 2; // Good - 2 stars
    } else if (moves <= this.parMoves * 2) {
        return 1; // Completed - 1 star
    } else {
        return 0; // Too many moves - no stars
    }
};

// Static method to get level by ID
levelSchema.statics.findByLevelId = function (levelId) {
    return this.findOne({ levelId });
};

module.exports = mongoose.model('Level', levelSchema);
