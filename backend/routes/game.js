/**
 * Game Routes - Quantum Maze
 * Handles game state, level management, and score tracking
 * TODO: Implement full game logic
 */

const express = require('express');
const router = express.Router();
const Level = require('../models/Level');
const Score = require('../models/Score');
const { protect } = require('../middleware/authMiddleware');

/**
 * @route   GET /api/game/levels
 * @desc    Get all available levels
 * @access  Public
 */
router.get('/levels', async (req, res) => {
    try {
        const levels = await Level.find({ isActive: true })
            .select('-gridLeft -gridRight') // Don't send grid data in list
            .sort({ levelId: 1 });

        res.status(200).json({
            success: true,
            count: levels.length,
            levels
        });
    } catch (error) {
        console.error('Get levels error:', error);
        res.status(500).json({
            success: false,
            error: 'Server error fetching levels'
        });
    }
});

/**
 * @route   GET /api/game/levels/:levelId
 * @desc    Get specific level data
 * @access  Public
 */
router.get('/levels/:levelId', async (req, res) => {
    try {
        const level = await Level.findByLevelId(parseInt(req.params.levelId));

        if (!level) {
            return res.status(404).json({
                success: false,
                error: 'Level not found'
            });
        }

        res.status(200).json({
            success: true,
            level
        });
    } catch (error) {
        console.error('Get level error:', error);
        res.status(500).json({
            success: false,
            error: 'Server error fetching level'
        });
    }
});

/**
 * @route   POST /api/game/score
 * @desc    Submit score for a level
 * @access  Private
 */
router.post('/score', protect, async (req, res) => {
    try {
        const { levelId, moves, timeTaken, undoCount, hintsUsed, replayHistory, coinsCollected, maxCoins } = req.body;

        if (!levelId || moves === undefined || timeTaken === undefined) {
            return res.status(400).json({
                success: false,
                error: 'Please provide levelId, moves, and timeTaken'
            });
        }

        // Get level to calculate stars
        const level = await Level.findByLevelId(levelId);
        if (!level) {
            return res.status(404).json({
                success: false,
                error: 'Level not found'
            });
        }

        // Calculate stars
        const stars = level.calculateStars(moves);

        // Determine if all coins were collected
        const allCoinsCollected = (coinsCollected !== undefined && maxCoins !== undefined)
            ? coinsCollected === maxCoins
            : false;

        // Check if user already has a score for this level
        const existingScore = await Score.getBestScore(req.user._id, levelId);

        // Only save if this is better than existing score
        if (!existingScore || stars > existingScore.stars ||
            (stars === existingScore.stars && timeTaken < existingScore.timeTaken)) {

            // Update or create best score
            const score = await Score.findOneAndUpdate(
                { userId: req.user._id, levelId },
                {
                    userId: req.user._id,
                    levelId,
                    moves,
                    timeTaken,
                    stars,
                    undoCount: undoCount || 0,
                    hintsUsed: hintsUsed || 0,
                    coinsCollected: coinsCollected || 0,
                    maxCoins: maxCoins || 0,
                    allCoinsCollected,
                    replayHistory: replayHistory || [],
                    completedAt: Date.now()
                },
                { new: true, upsert: true, setDefaultsOnInsert: true }
            );

            return res.status(201).json({
                success: true,
                message: 'Score submitted successfully',
                score,
                isNewBest: true
            });
        }

        res.status(200).json({
            success: true,
            message: 'Score recorded but not a new best',
            existingBest: existingScore,
            isNewBest: false
        });
    } catch (error) {
        console.error('Submit score error:', error);
        res.status(500).json({
            success: false,
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});

/**
 * @route   GET /api/game/progress
 * @desc    Get user's game progress
 * @access  Private
 */
router.get('/progress', protect, async (req, res) => {
    try {
        const scores = await Score.getUserScores(req.user._id);

        res.status(200).json({
            success: true,
            progress: {
                totalLevelsCompleted: req.user.levelsCompleted,
                totalStars: req.user.totalStars,
                scores
            }
        });
    } catch (error) {
        console.error('Get progress error:', error);
        res.status(500).json({
            success: false,
            error: 'Server error fetching progress'
        });
    }
});

/**
 * @route   GET /api/game/replay/:levelId
 * @desc    Get replay history for user's best score on a level
 * @access  Private
 */
router.get('/replay/:levelId', protect, async (req, res) => {
    try {
        const levelId = parseInt(req.params.levelId);

        if (!levelId || isNaN(levelId)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid level ID'
            });
        }

        // Get user's best score for this level
        const bestScore = await Score.getBestScore(req.user._id, levelId);

        if (!bestScore) {
            return res.status(200).json({
                success: true,
                replayHistory: null,
                message: 'No score found for this level'
            });
        }

        res.status(200).json({
            success: true,
            replayHistory: bestScore.replayHistory || []
        });
    } catch (error) {
        console.error('Get replay error:', error);
        res.status(500).json({
            success: false,
            error: 'Server error fetching replay data'
        });
    }
});

module.exports = router;
