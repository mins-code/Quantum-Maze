/**
 * CustomLevel Model - Quantum Maze
 * Mongoose schema for storing user-created custom levels
 */

const mongoose = require('mongoose');

const customLevelSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Level name is required'],
        trim: true,
        maxlength: [100, 'Level name cannot exceed 100 characters']
    },
    difficulty: {
        type: String,
        enum: ['Easy', 'Medium', 'Hard', 'Expert'],
        default: 'Medium'
    },
    gridLeft: {
        type: [[mongoose.Schema.Types.Mixed]],
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
        type: [[mongoose.Schema.Types.Mixed]],
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
        default: 10,
        min: [1, 'Par moves must be at least 1']
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
    description: {
        type: String,
        default: '',
        maxlength: [500, 'Description cannot exceed 500 characters']
    },
    // Creator tracking
    creatorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Creator ID is required']
    },
    // Engagement metrics
    plays: {
        type: Number,
        default: 0,
        min: [0, 'Plays cannot be negative']
    },
    likes: {
        type: Number,
        default: 0,
        min: [0, 'Likes cannot be negative']
    },
    // Status
    isActive: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Index for faster queries
customLevelSchema.index({ creatorId: 1 });
customLevelSchema.index({ plays: -1 });
customLevelSchema.index({ likes: -1 });
customLevelSchema.index({ createdAt: -1 });

// Update the updatedAt timestamp before saving
// Update the updatedAt timestamp before saving
customLevelSchema.pre('save', async function () {
    this.updatedAt = Date.now();
});

// Method to calculate stars based on moves (same as Level model)
customLevelSchema.methods.calculateStars = function (moves) {
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

// Method to increment plays
customLevelSchema.methods.incrementPlays = async function () {
    this.plays += 1;
    return await this.save();
};

// Method to increment likes
customLevelSchema.methods.incrementLikes = async function () {
    this.likes += 1;
    return await this.save();
};

module.exports = mongoose.model('CustomLevel', customLevelSchema);
