/**
 * Leaderboard Routes - Quantum Maze
 * Handles leaderboard queries and rankings
 */

const express = require('express');
const router = express.Router();
const Score = require('../models/Score');

/**
 * @route   GET /api/leaderboard/:levelId
 * @desc    Get leaderboard for a specific level with advanced filtering
 * @access  Public
 * @query   sortBy - 'time' or 'moves' (default: 'time')
 * @query   limit - Number of results (default: 10)
 */
router.get('/:levelId', async (req, res) => {
    try {
        const levelId = parseInt(req.params.levelId);
        const sortBy = req.query.sortBy === 'moves' ? 'moves' : 'timeTaken';
        const limit = parseInt(req.query.limit) || 10;

        // Validate levelId
        if (!levelId || isNaN(levelId)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid level ID'
            });
        }

        // MongoDB Aggregation Pipeline for Advanced Filtering
        const leaderboard = await Score.aggregate([
            // Step 1: Match - Filter by levelId
            {
                $match: { levelId: levelId }
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
            levelId,
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

module.exports = router;
