/**
 * UserProgress Model - Quantum Maze
 * Tracks user's level completion and unlock status
 */

const mongoose = require('mongoose');

const userProgressSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    completedLevels: [{
        levelId: {
            type: Number,
            required: true
        },
        stars: {
            type: Number,
            min: 0,
            max: 3,
            default: 0
        },
        bestMoves: {
            type: Number,
            min: 1
        },
        bestTime: {
            type: Number,
            min: 0
        },
        completedAt: {
            type: Date,
            default: Date.now
        }
    }],
    unlockedLevels: {
        type: [Number],
        default: [1] // Level 1 is always unlocked by default
    },
    totalStars: {
        type: Number,
        default: 0
    },
    lastPlayedLevel: {
        type: Number,
        default: null
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

// Update timestamp on save (Mongoose 9.x compatible - no next callback)
userProgressSchema.pre('save', function () {
    this.updatedAt = Date.now();
});

// Method to check if a level is unlocked
userProgressSchema.methods.isLevelUnlocked = function (levelId) {
    // Level 1 is ALWAYS unlocked
    if (levelId === 1) return true;

    return this.unlockedLevels.includes(levelId);
};

// Method to unlock a level (additive - won't remove existing unlocks)
userProgressSchema.methods.unlockLevel = function (levelId) {
    if (!this.unlockedLevels.includes(levelId)) {
        this.unlockedLevels.push(levelId);
    }
};

// Method to complete a level
userProgressSchema.methods.completeLevel = function (levelId, stars, moves, time) {
    // Find existing completion
    const existingIndex = this.completedLevels.findIndex(
        cl => cl.levelId === levelId
    );

    const newCompletion = {
        levelId,
        stars,
        bestMoves: moves,
        bestTime: time,
        completedAt: new Date()
    };

    if (existingIndex >= 0) {
        // Update if better performance
        const existing = this.completedLevels[existingIndex];
        if (stars > existing.stars ||
            (stars === existing.stars && moves < existing.bestMoves)) {
            this.completedLevels[existingIndex] = newCompletion;
        }
    } else {
        // New completion
        this.completedLevels.push(newCompletion);
    }

    // Unlock next level (additive)
    const nextLevel = levelId + 1;
    this.unlockLevel(nextLevel);

    // Update total stars
    this.totalStars = this.completedLevels.reduce((sum, cl) => sum + cl.stars, 0);
};

module.exports = mongoose.model('UserProgress', userProgressSchema);
