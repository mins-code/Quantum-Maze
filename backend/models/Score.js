/**
 * Score Model - Quantum Maze
 * Mongoose schema for tracking user progress and scores
 */

const mongoose = require('mongoose');

const scoreSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User ID is required']
    },
    levelId: {
        type: Number,
        required: [true, 'Level ID is required'],
        min: [1, 'Level ID must be at least 1']
    },
    moves: {
        type: Number,
        required: [true, 'Number of moves is required'],
        min: [0, 'Moves cannot be negative']
    },
    timeTaken: {
        type: Number,
        required: [true, 'Time taken is required'],
        min: [0, 'Time cannot be negative']
    },
    stars: {
        type: Number,
        required: [true, 'Stars are required'],
        min: [0, 'Stars cannot be negative'],
        max: [3, 'Maximum stars is 3'],
        default: 0
    },
    completed: {
        type: Boolean,
        default: true
    },
    // Additional gameplay data
    undoCount: {
        type: Number,
        default: 0,
        min: [0, 'Undo count cannot be negative']
    },
    hintsUsed: {
        type: Number,
        default: 0,
        min: [0, 'Hints used cannot be negative']
    },
    completedAt: {
        type: Date,
        default: Date.now
    }
});

// Compound index to ensure one score per user per level (keep best score)
scoreSchema.index({ userId: 1, levelId: 1 });

// Index for leaderboard queries
scoreSchema.index({ levelId: 1, stars: -1, timeTaken: 1 });
scoreSchema.index({ userId: 1, completedAt: -1 });

// Pre-save middleware to update user stats
scoreSchema.pre('save', async function (next) {
    try {
        // Only update user stats on new score records
        if (this.isNew) {
            const User = mongoose.model('User');
            const user = await User.findById(this.userId);

            if (user) {
                // Check if this is a new level completion
                const Score = mongoose.model('Score');
                const existingScore = await Score.findOne({
                    userId: this.userId,
                    levelId: this.levelId,
                    _id: { $ne: this._id }
                });

                if (!existingScore) {
                    // First time completing this level
                    user.levelsCompleted += 1;
                }

                // Update total stars (replace old score if better)
                if (existingScore && this.stars > existingScore.stars) {
                    user.totalStars += (this.stars - existingScore.stars);
                } else if (!existingScore) {
                    user.totalStars += this.stars;
                }

                await user.save();
            }
        }
        next();
    } catch (error) {
        next(error);
    }
});

// Static method to get user's best score for a level
scoreSchema.statics.getBestScore = async function (userId, levelId) {
    return this.findOne({ userId, levelId })
        .sort({ stars: -1, timeTaken: 1 })
        .exec();
};

// Static method to get leaderboard for a level
scoreSchema.statics.getLeaderboard = async function (levelId, limit = 10) {
    return this.find({ levelId })
        .populate('userId', 'username avatar')
        .sort({ stars: -1, timeTaken: 1, moves: 1 })
        .limit(limit)
        .exec();
};

// Static method to get user's all scores
scoreSchema.statics.getUserScores = async function (userId) {
    return this.find({ userId })
        .sort({ levelId: 1 })
        .exec();
};

module.exports = mongoose.model('Score', scoreSchema);
