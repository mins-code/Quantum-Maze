/**
 * Leaderboard Routes - Quantum Maze
 * Handles leaderboard queries and rankings
 */

const express = require('express');
const router = express.Router();
const Score = require('../models/Score');

/**
 * @route   GET /api/leaderboard/:levelId
 * @desc    Get leaderboard for a specific level
 * @access  Public
 */
router.get('/:levelId', async (req, res) => {
    try {
        const levelId = parseInt(req.params.levelId);
        const limit = parseInt(req.query.limit) || 10;

        const leaderboard = await Score.getLeaderboard(levelId, limit);

        res.status(200).json({
            success: true,
            levelId,
            count: leaderboard.length,
            leaderboard: leaderboard.map((score, index) => ({
                rank: index + 1,
                username: score.userId.username,
                avatar: score.userId.avatar,
                stars: score.stars,
                moves: score.moves,
                timeTaken: score.timeTaken,
                completedAt: score.completedAt
            }))
        });
    } catch (error) {
        console.error('Get leaderboard error:', error);
        res.status(500).json({
            success: false,
            error: 'Server error fetching leaderboard'
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
