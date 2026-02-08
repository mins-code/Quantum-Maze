/**
 * Leaderboard Routes - Quantum Maze
 * Handles leaderboard queries and rankings
 */

const express = require('express');
const router = express.Router();
const Score = require('../models/Score');

/**
 * @route   GET /api/leaderboard/:levelIdentifier
 * @desc    Get leaderboard for a specific level (official or custom) with advanced filtering
 * @access  Public
 * @query   type - 'official' or 'custom' (auto-detected if not provided)
 * @query   sortBy - 'time' or 'moves' (default: 'time')
 * @query   limit - Number of results (default: 10)
 */
router.get('/:levelIdentifier', async (req, res) => {
    try {
        const { levelIdentifier } = req.params;
        const sortBy = req.query.sortBy === 'moves' ? 'moves' : 'timeTaken';
        const limit = parseInt(req.query.limit) || 10;

        // Determine level type
        let levelType = req.query.type;
        let matchQuery = {};

        if (!levelType) {
            // Auto-detect: if it's a number, it's official; otherwise custom
            const parsedId = parseInt(levelIdentifier);
            if (!isNaN(parsedId)) {
                levelType = 'official';
                matchQuery = { levelId: parsedId, levelType: 'official' };
            } else {
                levelType = 'custom';
                const mongoose = require('mongoose');
                matchQuery = { customLevelId: new mongoose.Types.ObjectId(levelIdentifier), levelType: 'custom' };
            }
        } else {
            // Use specified type
            if (levelType === 'official') {
                matchQuery = { levelId: parseInt(levelIdentifier), levelType: 'official' };
            } else {
                const mongoose = require('mongoose');
                matchQuery = { customLevelId: new mongoose.Types.ObjectId(levelIdentifier), levelType: 'custom' };
            }
        }

        // MongoDB Aggregation Pipeline for Advanced Filtering
        const leaderboard = await Score.aggregate([
            // Step 1: Match - Filter by level
            {
                $match: matchQuery
            },

            // Step 2: Sort - Sort all scores by the sortBy field (ascending = best first)
            {
                $sort: { [sortBy]: 1 }
            },

            // Step 3: Group - Group by userId, keep the first (best) entry per player
            {
                $group: {
                    _id: '$userId',
                    bestScore: { $first: '$$ROOT' }
                }
            },

            // Step 4: Lookup - Join with User collection to get player details
            {
                $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'userDetails'
                }
            },

            // Step 5: Unwind - Flatten the userDetails array
            {
                $unwind: '$userDetails'
            },

            // Step 6: Project - Clean up output and flatten structure
            {
                $project: {
                    _id: 0,
                    userId: '$_id',
                    username: '$userDetails.username',
                    avatar: '$userDetails.avatar',
                    moves: '$bestScore.moves',
                    timeTaken: '$bestScore.timeTaken',
                    stars: '$bestScore.stars',
                    coinsCollected: '$bestScore.coinsCollected',
                    maxCoins: '$bestScore.maxCoins',
                    allCoinsCollected: '$bestScore.allCoinsCollected',
                    completedAt: '$bestScore.completedAt'
                }
            },

            // Step 7: Sort (Again) - Sort the final grouped results by sortBy field
            {
                $sort: { [sortBy]: 1 }
            },

            // Step 8: Limit - Return top N results
            {
                $limit: limit
            }
        ]);

        // Add rank to each entry
        const rankedLeaderboard = leaderboard.map((entry, index) => ({
            rank: index + 1,
            ...entry
        }));

        res.status(200).json({
            success: true,
            levelId: levelIdentifier,
            sortBy: sortBy === 'timeTaken' ? 'time' : 'moves',
            count: rankedLeaderboard.length,
            data: rankedLeaderboard
        });
    } catch (error) {
        console.error('Get leaderboard error:', error);
        res.status(500).json({
            success: false,
            error: 'Server error fetching leaderboard',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

/**
 * @route   GET /api/leaderboard/global/top
 * @desc    Get global top players
 * @access  Public
 */
router.get('/global/top', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;

        // Aggregate to get top players by total stars
        const topPlayers = await Score.aggregate([
            {
                $group: {
                    _id: '$userId',
                    totalStars: { $sum: '$stars' },
                    levelsCompleted: { $sum: 1 },
                    avgTime: { $avg: '$timeTaken' }
                }
            },
            { $sort: { totalStars: -1, levelsCompleted: -1 } },
            { $limit: limit },
            {
                $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'user'
                }
            },
            { $unwind: '$user' },
            {
                $project: {
                    username: '$user.username',
                    avatar: '$user.avatar',
                    totalStars: 1,
                    levelsCompleted: 1,
                    avgTime: { $round: ['$avgTime', 2] }
                }
            }
        ]);

        res.status(200).json({
            success: true,
            count: topPlayers.length,
            topPlayers: topPlayers.map((player, index) => ({
                rank: index + 1,
                ...player
            }))
        });
    } catch (error) {
        console.error('Get global leaderboard error:', error);
        res.status(500).json({
            success: false,
            error: 'Server error fetching global leaderboard'
        });
    }
});

/**
 * @route   GET /api/leaderboard/overall/rankings
 * @desc    Get overall leaderboard across all levels (official + custom)
 * @access  Public
 * @query   limit - Number of results (default: 20)
 */
router.get('/overall/rankings', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 20;

        // MongoDB Aggregation Pipeline for Overall Rankings
        const overallLeaderboard = await Score.aggregate([
            // Step 1: Group by userId - Calculate aggregate stats per player
            {
                $group: {
                    _id: '$userId',
                    totalStars: { $sum: '$stars' },
                    levelsCompleted: { $sum: 1 },
                    averageTime: { $avg: '$timeTaken' },
                    totalMoves: { $sum: '$moves' },
                    totalCoins: { $sum: '$coinsCollected' },
                    bestScores: { $push: '$$ROOT' }
                }
            },

            // Step 2: Lookup - Join with User collection
            {
                $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'userDetails'
                }
            },

            // Step 3: Unwind - Flatten userDetails
            {
                $unwind: '$userDetails'
            },

            // Step 4: Project - Format output
            {
                $project: {
                    _id: 0,
                    userId: '$_id',
                    username: '$userDetails.username',
                    avatar: '$userDetails.avatar',
                    totalStars: 1,
                    levelsCompleted: 1,
                    averageTime: { $round: ['$averageTime', 2] },
                    totalMoves: 1,
                    totalCoins: 1
                }
            },

            // Step 5: Sort - By total stars (desc), then levels completed (desc), then avg time (asc)
            {
                $sort: {
                    totalStars: -1,
                    levelsCompleted: -1,
                    averageTime: 1
                }
            },

            // Step 6: Limit results
            {
                $limit: limit
            }
        ]);

        res.status(200).json({
            success: true,
            count: overallLeaderboard.length,
            data: overallLeaderboard
        });

    } catch (error) {
        console.error('Error fetching overall leaderboard:', error);
        res.status(500).json({
            success: false,
            error: 'Server error fetching overall leaderboard',
            message: error.message
        });
    }
});

module.exports = router;
