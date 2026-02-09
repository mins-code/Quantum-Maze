/**
 * Level Routes - Quantum Maze
 * API endpoints for level management and retrieval
 */

const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const Level = require('../models/Level');

/**
 * @route   GET /api/levels
 * @desc    Get all levels
 * @access  Protected
 */
router.get('/', protect, async (req, res) => {
    try {
        // Fetch all levels from database, sorted by levelId
        const levels = await Level.find({}).sort({ levelId: 1 });

        res.status(200).json({
            success: true,
            count: levels.length,
            data: levels
        });
    } catch (error) {
        console.error('Error fetching levels:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch levels',
            error: error.message
        });
    }
});

/**
 * @route   GET /api/levels/:id
 * @desc    Get a single level by levelId
 * @access  Protected
 */
router.get('/:id', protect, async (req, res) => {
    try {
        const levelId = parseInt(req.params.id);

        // Validate levelId is a number
        if (isNaN(levelId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid level ID. Must be a number.'
            });
        }

        // Find level by levelId
        const level = await Level.findOne({ levelId });

        // Check if level exists
        if (!level) {
            return res.status(404).json({
                success: false,
                message: `Level ${levelId} not found`
            });
        }

        res.status(200).json({
            success: true,
            data: level
        });
    } catch (error) {
        console.error('Error fetching level:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch level',
            error: error.message
        });
    }
});

/**
 * @route   PUT /api/levels/:id
 * @desc    Update a built-in level
 * @access  Protected
 */
router.put('/:id', protect, async (req, res) => {
    try {
        const levelId = parseInt(req.params.id);
        const { name, gridLeft, gridRight, difficulty, parMoves, description } = req.body;

        if (isNaN(levelId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid level ID'
            });
        }

        let level = await Level.findOne({ levelId });

        if (!level) {
            return res.status(404).json({
                success: false,
                message: `Level ${levelId} not found`
            });
        }

        // Update fields
        if (name) level.name = name;
        if (gridLeft) level.gridLeft = gridLeft;
        if (gridRight) level.gridRight = gridRight;
        if (difficulty) level.difficulty = difficulty;
        if (parMoves) level.parMoves = parMoves;
        if (description !== undefined) level.description = description;

        await level.save();

        res.status(200).json({
            success: true,
            message: 'Level updated successfully',
            data: level
        });

    } catch (error) {
        console.error('Error updating level:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update level',
            error: error.message
        });
    }
});

/**
 * @route   POST /api/levels/:id/complete
 * @desc    Mark a level as completed and save score
 * @access  Protected
 */
router.post('/:id/complete', protect, async (req, res) => {
    try {
        const levelId = parseInt(req.params.id);
        const { moves, time, stars } = req.body;

        // Validate input
        if (isNaN(levelId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid level ID'
            });
        }

        // Find the level
        const level = await Level.findOne({ levelId });

        if (!level) {
            return res.status(404).json({
                success: false,
                message: `Level ${levelId} not found`
            });
        }

        // Calculate stars if not provided
        const earnedStars = stars !== undefined ? stars : level.calculateStars(moves);

        // TODO: Save user progress to UserProgress collection
        // For now, just return success with calculated stars
        res.status(200).json({
            success: true,
            message: 'Level completed!',
            data: {
                levelId,
                moves,
                time,
                stars: earnedStars,
                parMoves: level.parMoves
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
 * @route   GET /api/levels/difficulty/:difficulty
 * @desc    Get levels by difficulty
 * @access  Protected
 */
router.get('/difficulty/:difficulty', protect, async (req, res) => {
    try {
        const { difficulty } = req.params;

        // Validate difficulty
        const validDifficulties = ['Easy', 'Medium', 'Hard', 'Expert'];
        if (!validDifficulties.includes(difficulty)) {
            return res.status(400).json({
                success: false,
                message: `Invalid difficulty. Must be one of: ${validDifficulties.join(', ')}`
            });
        }

        // Find levels by difficulty
        const levels = await Level.find({ difficulty }).sort({ levelId: 1 });

        res.status(200).json({
            success: true,
            count: levels.length,
            data: levels
        });
    } catch (error) {
        console.error('Error fetching levels by difficulty:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch levels',
            error: error.message
        });
    }
});

/**
 * @route   GET /api/levels/all/combined
 * @desc    Get all levels (official + custom) for leaderboard selector
 * @access  Public
 */
router.get('/all/combined', async (req, res) => {
    try {
        const CustomLevel = require('../models/CustomLevel');

        // Fetch official levels
        const officialLevels = await Level.find({}).sort({ levelId: 1 }).lean();

        // Fetch active custom levels
        const customLevels = await CustomLevel.find({ isActive: true })
            .populate('creatorId', 'username')
            .sort({ createdAt: 1 })
            .lean();

        // Format official levels
        const formattedOfficialLevels = officialLevels.map(level => ({
            id: level.levelId,
            name: level.name,
            type: 'official',
            difficulty: level.difficulty,
            parMoves: level.parMoves
        }));

        // Format custom levels
        const formattedCustomLevels = customLevels.map(level => ({
            id: level._id.toString(),
            name: level.name,
            type: 'custom',
            difficulty: level.difficulty,
            parMoves: level.parMoves,
            creator: level.creatorId?.username || 'Unknown',
            plays: level.plays || 0,
            likes: level.likes || 0
        }));

        // Combine both
        const allLevels = [...formattedOfficialLevels, ...formattedCustomLevels];

        res.status(200).json({
            success: true,
            count: allLevels.length,
            officialCount: formattedOfficialLevels.length,
            customCount: formattedCustomLevels.length,
            data: allLevels
        });
    } catch (error) {
        console.error('Error fetching combined levels:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch levels',
            error: error.message
        });
    }
});

module.exports = router;
