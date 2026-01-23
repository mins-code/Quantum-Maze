/**
 * User Progress Routes - Quantum Maze
 * API endpoints for tracking user level progress
 */

const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const UserProgress = require('../models/UserProgress');
const Level = require('../models/Level');

/**
 * @route   GET /api/progress
 * @desc    Get user's progress
 * @access  Protected
 */
router.get('/', protect, async (req, res) => {
    try {
        let progress = await UserProgress.findOne({ user: req.user._id });

        // Create progress if doesn't exist
        if (!progress) {
            progress = await UserProgress.create({
                user: req.user._id,
                unlockedLevels: [1], // Level 1 always unlocked
                completedLevels: [],
                totalStars: 0
            });
        }

        res.status(200).json({
            success: true,
            data: progress
        });
    } catch (error) {
        console.error('Error fetching progress:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch progress',
            error: error.message
        });
    }
});

/**
 * @route   POST /api/progress/complete/:levelId
 * @desc    Mark level as completed and unlock next level
 * @access  Protected
 */
router.post('/complete/:levelId', protect, async (req, res) => {
    try {
        const levelId = parseInt(req.params.levelId);
        const { moves, time } = req.body;

        // Validate input
        if (isNaN(levelId) || !moves || !time) {
            return res.status(400).json({
                success: false,
                message: 'Invalid input. levelId, moves, and time are required.'
            });
        }

        // Get the level to calculate stars
        const level = await Level.findOne({ levelId });
        if (!level) {
            return res.status(404).json({
                success: false,
                message: `Level ${levelId} not found`
            });
        }

        // Calculate stars based on moves
        const stars = level.calculateStars(moves);

        // Get or create user progress
        let progress = await UserProgress.findOne({ user: req.user._id });
        if (!progress) {
            progress = await UserProgress.create({
                user: req.user._id,
                unlockedLevels: [1],
                completedLevels: [],
                totalStars: 0
            });
        }

        // Complete the level (this also unlocks next level)
        progress.completeLevel(levelId, stars, moves, time);
        progress.lastPlayedLevel = levelId;

        // Save progress
        await progress.save();

        // Sync stats to User model
        await req.user.save(); // req.user is available via protect middleware but might be stale

        // Better to fetch and update explicitly or use User.findByIdAndUpdate
        await require('../models/User').findByIdAndUpdate(req.user._id, {
            totalStars: progress.totalStars,
            levelsCompleted: progress.completedLevels.length,
            // Calculate pseudo-score: 1000 for 3 stars, 600 for 2, 300 for 1
            totalScore: progress.completedLevels.reduce((acc, lvl) => {
                if (lvl.stars === 3) return acc + 1000;
                if (lvl.stars === 2) return acc + 600;
                if (lvl.stars === 1) return acc + 300;
                return acc + 100;
            }, 0)
        });

        res.status(200).json({
            success: true,
            message: 'Level completed successfully!',
            data: {
                levelId,
                stars,
                moves,
                time,
                parMoves: level.parMoves,
                nextLevelUnlocked: levelId + 1,
                totalStars: progress.totalStars,
                unlockedLevels: progress.unlockedLevels
            }
        });
    } catch (error) {
        console.error('Error completing level:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to save level completion',
            error: error.message
        });
    }
});

/**
 * @route   GET /api/progress/levels
 * @desc    Get all levels with user's progress merged
 * @access  Protected
 */
router.get('/levels', protect, async (req, res) => {
    try {
        // Get all levels
        const levels = await Level.find({}).sort({ levelId: 1 });

        // Get user progress
        let progress = await UserProgress.findOne({ user: req.user._id });
        if (!progress) {
            progress = await UserProgress.create({
                user: req.user._id,
                unlockedLevels: [1],
                completedLevels: [],
                totalStars: 0
            });
        }

        // Merge progress with levels
        const levelsWithProgress = levels.map(level => {
            const levelObj = level.toObject();

            // Check if unlocked (Level 1 ALWAYS unlocked)
            levelObj.isUnlocked = level.levelId === 1 || progress.isLevelUnlocked(level.levelId);

            // Check if completed and get stars
            const completion = progress.completedLevels.find(
                cl => cl.levelId === level.levelId
            );

            if (completion) {
                levelObj.isCompleted = true;
                levelObj.stars = completion.stars;
                levelObj.bestMoves = completion.bestMoves;
                levelObj.bestTime = completion.bestTime;
            } else {
                levelObj.isCompleted = false;
                levelObj.stars = 0;
            }

            return levelObj;
        });

        res.status(200).json({
            success: true,
            count: levelsWithProgress.length,
            data: levelsWithProgress,
            totalStars: progress.totalStars
        });
    } catch (error) {
        console.error('Error fetching levels with progress:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch levels',
            error: error.message
        });
    }
});

module.exports = router;
