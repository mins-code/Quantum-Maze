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
        const { levelId, moves, timeTaken, undoCount, hintsUsed } = req.body;

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

        // Check if user already has a score for this level
        const existingScore = await Score.getBestScore(req.user._id, levelId);

        // Only save if this is better than existing score
        if (!existingScore || stars > existingScore.stars ||
            (stars === existingScore.stars && timeTaken < existingScore.timeTaken)) {

            const score = await Score.create({
                userId: req.user._id,
                levelId,
                moves,
                timeTaken,
                stars,
                undoCount: undoCount || 0,
                hintsUsed: hintsUsed || 0
            });

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
            error: 'Server error submitting score'
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

module.exports = router;
