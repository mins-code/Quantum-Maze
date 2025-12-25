/**
 * Levels Routes - Quantum Maze
 * 
 * API endpoints for level management
 */

const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');

// Mock level data (temporary until Level Editor is built)
const MOCK_LEVELS = [
    {
        levelId: 1,
        name: "Tutorial: First Steps",
        description: "Learn the basics of mirrored movement",
        difficulty: "Easy",
        gridLeft: [
            [3, 0, 0, 0, 0],
            [1, 1, 0, 1, 1],
            [0, 0, 0, 0, 0],
            [1, 1, 0, 1, 1],
            [0, 0, 0, 0, 2]
        ],
        gridRight: [
            [0, 0, 0, 0, 3],
            [1, 1, 0, 1, 1],
            [0, 0, 0, 0, 0],
            [1, 1, 0, 1, 1],
            [2, 0, 0, 0, 0]
        ],
        parMoves: 8,
        stars: 0,
        isUnlocked: true,
        isCompleted: false
    },
    {
        levelId: 2,
        name: "Mirror Maze",
        description: "Navigate through symmetric obstacles",
        difficulty: "Medium",
        gridLeft: [
            [3, 0, 1, 0, 0, 0],
            [0, 0, 1, 0, 1, 0],
            [0, 1, 0, 0, 1, 0],
            [0, 1, 0, 1, 0, 0],
            [0, 0, 0, 1, 0, 1],
            [0, 0, 0, 0, 0, 2]
        ],
        gridRight: [
            [0, 0, 0, 1, 0, 3],
            [0, 1, 0, 1, 0, 0],
            [0, 1, 0, 0, 1, 0],
            [0, 0, 1, 0, 1, 0],
            [1, 0, 1, 0, 0, 0],
            [2, 0, 0, 0, 0, 0]
        ],
        parMoves: 12,
        stars: 0,
        isUnlocked: true,
        isCompleted: false
    },
    {
        levelId: 3,
        name: "Quantum Corridor",
        description: "Master the art of synchronized movement",
        difficulty: "Hard",
        gridLeft: [
            [3, 0, 0, 1, 0, 0, 0],
            [1, 1, 0, 1, 0, 1, 0],
            [0, 0, 0, 0, 0, 1, 0],
            [0, 1, 1, 1, 0, 0, 0],
            [0, 0, 0, 0, 0, 1, 1],
            [1, 1, 0, 1, 0, 0, 0],
            [0, 0, 0, 1, 0, 0, 2]
        ],
        gridRight: [
            [0, 0, 0, 1, 0, 0, 3],
            [0, 1, 0, 1, 0, 1, 1],
            [0, 1, 0, 0, 0, 0, 0],
            [0, 0, 0, 1, 1, 1, 0],
            [1, 1, 0, 0, 0, 0, 0],
            [0, 0, 0, 1, 0, 1, 1],
            [2, 0, 0, 1, 0, 0, 0]
        ],
        parMoves: 15,
        stars: 0,
        isUnlocked: true,
        isCompleted: false
    }
];

/**
 * @route   GET /api/levels
 * @desc    Get all levels
 * @access  Protected
 */
router.get('/', protect, async (req, res) => {
    try {
        // In the future, this will fetch from database
        // For now, return mock data
        res.json({
            success: true,
            count: MOCK_LEVELS.length,
            data: MOCK_LEVELS
        });
    } catch (error) {
        console.error('Error fetching levels:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

/**
 * @route   GET /api/levels/:id
 * @desc    Get single level by ID
 * @access  Protected
 */
router.get('/:id', protect, async (req, res) => {
    try {
        const levelId = parseInt(req.params.id);

        // Find level in mock data
        const level = MOCK_LEVELS.find(l => l.levelId === levelId);

        if (!level) {
            return res.status(404).json({
                success: false,
                message: 'Level not found'
            });
        }

        res.json({
            success: true,
            data: level
        });
    } catch (error) {
        console.error('Error fetching level:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

/**
 * @route   POST /api/levels/:id/complete
 * @desc    Mark level as completed and save score
 * @access  Protected
 */
router.post('/:id/complete', protect, async (req, res) => {
    try {
        const levelId = parseInt(req.params.id);
        const { moves, stars, time } = req.body;

        // In the future, save to database
        // For now, just return success

        res.json({
            success: true,
            message: 'Level completed!',
            data: {
                levelId,
                moves,
                stars,
                time
            }
        });
    } catch (error) {
        console.error('Error completing level:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

module.exports = router;
