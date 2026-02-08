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
    // Level identification - supports both official and custom levels
    levelType: {
        type: String,
        enum: ['official', 'custom'],
        required: [true, 'Level type is required'],
        default: 'official'
    },
    levelId: {
        type: Number,
        min: [1, 'Level ID must be at least 1'],
        // Required only for official levels
        validate: {
            validator: function (value) {
                if (this.levelType === 'official') {
                    return value != null && value >= 1;
                }
                return true; // Not required for custom levels
            },
            message: 'Level ID is required for official levels'
        }
    },
    customLevelId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'CustomLevel',
        // Required only for custom levels
        validate: {
            validator: function (value) {
                if (this.levelType === 'custom') {
                    return value != null;
                }
                return true; // Not required for official levels
            },
            message: 'Custom Level ID is required for custom levels'
        }
    },
    levelName: {
        type: String,
        required: [true, 'Level name is required'],
        trim: true
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
    // Coin collection data
    coinsCollected: {
        type: Number,
        default: 0,
        min: [0, 'Coins collected cannot be negative']
    },
    maxCoins: {
        type: Number,
        default: 0,
        min: [0, 'Max coins cannot be negative']
    },
    allCoinsCollected: {
        type: Boolean,
        default: false
    },
    // Replay data for ghost system
    replayHistory: {
        type: [Object],
        default: []
    },
    completedAt: {
        type: Date,
        default: Date.now
    }
});

// ==================== INDEXES ====================

// Compound index to ensure one score per user per level (keep best score)
scoreSchema.index({ userId: 1, levelId: 1, levelType: 1 });
scoreSchema.index({ userId: 1, customLevelId: 1, levelType: 1 });

// Compound indexes for leaderboard queries - optimized for sorting
// Index for time-based leaderboard sorting (official levels)
scoreSchema.index({ levelId: 1, levelType: 1, timeTaken: 1 });

// Index for moves-based leaderboard sorting (official levels)
scoreSchema.index({ levelId: 1, levelType: 1, moves: 1 });

// Index for custom level leaderboards
scoreSchema.index({ customLevelId: 1, levelType: 1, timeTaken: 1 });
scoreSchema.index({ customLevelId: 1, levelType: 1, moves: 1 });

// Index for per-user grouping in aggregation pipeline
scoreSchema.index({ levelId: 1, levelType: 1, userId: 1 });
scoreSchema.index({ customLevelId: 1, levelType: 1, userId: 1 });

// Index for user progress queries
scoreSchema.index({ userId: 1, completedAt: -1 });

// ==================== MIDDLEWARE ====================

scoreSchema.pre('save', async function () {
    try {
        // Only update user stats on new score records
        if (this.isNew) {
            const User = mongoose.model('User');
            const user = await User.findById(this.userId);

            if (user) {
                // Check if this is a new level completion
                const Score = mongoose.model('Score');

                // Construct query to find if user has played this level before
                let query = {
                    userId: this.userId,
                    _id: { $ne: this._id }
                };

                if (this.levelType === 'custom') {
                    query.customLevelId = this.customLevelId;
                    query.levelType = 'custom';
                } else {
                    // Default to official if not specified or explicit
                    query.levelId = this.levelId;
                    query.levelType = 'official';
                }

                // We want to find the BEST score for this level to compare against
                // But simplified logic looks for ANY existing score? 
                // Actually if we want to add to totalStars, we need to know if we are improving.
                // The original code used findOne. Let's assume there's only one "best" score concept or we just want to know if they played it.
                // If the system allows multiple scores per level (history), then we need to find the MAX stars.

                // Finds the score with highest stars for this level
                const existingBestScore = await Score.findOne(query).sort({ stars: -1 });

                if (!existingBestScore) {
                    // First time completing this level
                    user.levelsCompleted += 1;
                    user.totalStars += this.stars;
                } else if (this.stars > existingBestScore.stars) {
                    // Improved score
                    user.totalStars += (this.stars - existingBestScore.stars);
                }

                await user.save();
            }
        }
    } catch (error) {
        throw error;
    }
});

// Static method to get user's best score for a level
scoreSchema.statics.getBestScore = async function (userId, levelIdentifier, levelType = 'official') {
    const query = { userId, levelType };
    if (levelType === 'official') {
        query.levelId = levelIdentifier;
    } else {
        query.customLevelId = levelIdentifier;
    }
    return this.findOne(query)
        .sort({ stars: -1, timeTaken: 1 })
        .exec();
};

// Static method to get leaderboard for a level
scoreSchema.statics.getLeaderboard = async function (levelIdentifier, levelType = 'official', limit = 10) {
    const query = { levelType };
    if (levelType === 'official') {
        query.levelId = levelIdentifier;
    } else {
        query.customLevelId = levelIdentifier;
    }
    return this.find(query)
        .populate('userId', 'username avatar')
        .sort({ stars: -1, timeTaken: 1, moves: 1 })
        .limit(limit)
        .exec();
};

// Static method to get user's all scores
scoreSchema.statics.getUserScores = async function (userId) {
    return this.find({ userId })
        .sort({ completedAt: -1 })
        .exec();
};

module.exports = mongoose.model('Score', scoreSchema);
