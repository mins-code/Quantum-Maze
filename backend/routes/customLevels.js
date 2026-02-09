/**
 * Custom Levels Routes - Quantum Maze
 * API endpoints for user-created custom levels
 */

const express = require('express');
const router = express.Router();
const CustomLevel = require('../models/CustomLevel');
const { protect } = require('../middleware/authMiddleware');

/**
 * @route   POST /api/custom-levels
 * @desc    Create a new custom level
 * @access  Protected
 */
router.post('/', protect, async (req, res) => {
    try {
        const { name, gridLeft, gridRight, difficulty, parMoves, mechanics, description } = req.body;

        // Validate required fields
        if (!name || !gridLeft || !gridRight) {
            return res.status(400).json({
                error: 'Missing required fields',
                message: 'name, gridLeft, and gridRight are required'
            });
        }

        // Validate grid dimensions
        if (!Array.isArray(gridLeft) || !Array.isArray(gridRight)) {
            return res.status(400).json({
                error: 'Invalid grid format',
                message: 'gridLeft and gridRight must be 2D arrays'
            });
        }

        if (gridLeft.length === 0 || gridRight.length === 0) {
            return res.status(400).json({
                error: 'Invalid grid size',
                message: 'Grids cannot be empty'
            });
        }

        // Create new custom level
        const customLevel = new CustomLevel({
            name,
            gridLeft,
            gridRight,
            difficulty: difficulty || 'Medium',
            parMoves: parMoves || 10,
            mechanics: mechanics || { switches: [], doors: [], portals: [] },
            description: description || '',
            creatorId: req.user._id
        });

        // Save to database
        const savedLevel = await customLevel.save();

        // Populate creator information before sending response
        await savedLevel.populate('creatorId', 'username');

        res.status(201).json({
            message: 'Custom level created successfully',
            level: savedLevel
        });

    } catch (error) {
        console.error('Error creating custom level:', error);

        // Handle validation errors
        if (error.name === 'ValidationError') {
            return res.status(400).json({
                error: 'Validation error',
                message: error.message
            });
        }

        res.status(500).json({
            error: 'Server error',
            message: 'Failed to create custom level'
        });
    }
});

/**
 * @route   GET /api/custom-levels
 * @desc    Get all custom levels (sorted by creation date)
 * @access  Public
 */
router.get('/', async (req, res) => {
    try {
        // Get custom levels with pagination
        const limit = parseInt(req.query.limit) || 20;
        const page = parseInt(req.query.page) || 1;
        const skip = (page - 1) * limit;

        // Fetch levels sorted by creation date (newest first)
        const customLevels = await CustomLevel.find({ isActive: true })
            .populate('creatorId', 'username')
            .sort({ createdAt: 1 })
            .limit(limit)
            .skip(skip)
            .lean();

        // Get total count for pagination
        const totalCount = await CustomLevel.countDocuments({ isActive: true });

        res.status(200).json({
            levels: customLevels,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(totalCount / limit),
                totalLevels: totalCount,
                levelsPerPage: limit
            }
        });

    } catch (error) {
        console.error('Error fetching custom levels:', error);
        res.status(500).json({
            error: 'Server error',
            message: 'Failed to fetch custom levels'
        });
    }
});

/**
 * @route   GET /api/custom-levels/:id
 * @desc    Get a specific custom level by ID
 * @access  Public
 */
router.get('/:id', async (req, res) => {
    try {
        const customLevel = await CustomLevel.findById(req.params.id)
            .populate('creatorId', 'username');

        if (!customLevel) {
            return res.status(404).json({
                error: 'Not found',
                message: 'Custom level not found'
            });
        }

        res.status(200).json({ level: customLevel });

    } catch (error) {
        console.error('Error fetching custom level:', error);
        res.status(500).json({
            error: 'Server error',
            message: 'Failed to fetch custom level'
        });
    }
});

/**
 * @route   POST /api/custom-levels/:id/play
 * @desc    Increment play count for a custom level
 * @access  Public
 */
router.post('/:id/play', async (req, res) => {
    try {
        const customLevel = await CustomLevel.findById(req.params.id);

        if (!customLevel) {
            return res.status(404).json({
                error: 'Not found',
                message: 'Custom level not found'
            });
        }

        await customLevel.incrementPlays();

        res.status(200).json({
            message: 'Play count incremented',
            plays: customLevel.plays
        });

    } catch (error) {
        console.error('Error incrementing play count:', error);
        res.status(500).json({
            error: 'Server error',
            message: 'Failed to increment play count'
        });
    }
});

/**
 * @route   POST /api/custom-levels/:id/like
 * @desc    Increment like count for a custom level
 * @access  Protected
 */
router.post('/:id/like', protect, async (req, res) => {
    try {
        const customLevel = await CustomLevel.findById(req.params.id);

        if (!customLevel) {
            return res.status(404).json({
                error: 'Not found',
                message: 'Custom level not found'
            });
        }

        await customLevel.incrementLikes();

        res.status(200).json({
            message: 'Like count incremented',
            likes: customLevel.likes
        });

    } catch (error) {
        console.error('Error incrementing like count:', error);
        res.status(500).json({
            error: 'Server error',
            message: 'Failed to increment like count'
        });
    }
});

/**
 * @route   PUT /api/custom-levels/:id
 * @desc    Update a custom level
 * @access  Protected
 */
router.put('/:id', protect, async (req, res) => {
    try {
        const { name, gridLeft, gridRight, difficulty, parMoves, mechanics, description } = req.body;

        // Find the level
        const customLevel = await CustomLevel.findById(req.params.id);

        if (!customLevel) {
            return res.status(404).json({
                error: 'Not found',
                message: 'Custom level not found'
            });
        }

        // Check ownership
        if (customLevel.creatorId.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                error: 'Unauthorized',
                message: 'You can only edit your own levels'
            });
        }

        // Validate required fields if they are being updated
        if (gridLeft && !Array.isArray(gridLeft) || gridRight && !Array.isArray(gridRight)) {
            return res.status(400).json({
                error: 'Invalid grid format',
                message: 'gridLeft and gridRight must be 2D arrays'
            });
        }

        // Update fields
        if (name) customLevel.name = name;
        if (gridLeft) customLevel.gridLeft = gridLeft;
        if (gridRight) customLevel.gridRight = gridRight;
        if (difficulty) customLevel.difficulty = difficulty;
        if (parMoves) customLevel.parMoves = parMoves;
        if (mechanics) customLevel.mechanics = mechanics;
        if (description !== undefined) customLevel.description = description;

        // Save updated level
        const updatedLevel = await customLevel.save();

        res.status(200).json({
            message: 'Custom level updated successfully',
            level: updatedLevel
        });

    } catch (error) {
        console.error('Error updating custom level:', error);

        // Handle validation errors
        if (error.name === 'ValidationError') {
            return res.status(400).json({
                error: 'Validation error',
                message: error.message
            });
        }

        res.status(500).json({
            error: 'Server error',
            message: 'Failed to update custom level'
        });
    }
});

/**
 * @route   DELETE /api/custom-levels/:id
 * @desc    Delete a custom level
 * @access  Protected
 */
router.delete('/:id', protect, async (req, res) => {
    try {
        const customLevel = await CustomLevel.findById(req.params.id);

        if (!customLevel) {
            return res.status(404).json({
                error: 'Not found',
                message: 'Custom level not found'
            });
        }

        // Check ownership
        if (customLevel.creatorId.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                error: 'Unauthorized',
                message: 'You can only delete your own levels'
            });
        }

        // Set isActive to false instead of hard deleting (soft delete)
        // or actually delete it depending on requirements. 
        // For now, let's do a hard delete to keep it simple and clean.
        await CustomLevel.findByIdAndDelete(req.params.id);

        res.status(200).json({
            message: 'Custom level deleted successfully'
        });

    } catch (error) {
        console.error('Error deleting custom level:', error);
        res.status(500).json({
            error: 'Server error',
            message: 'Failed to delete custom level'
        });
    }
});

/**
 * @route   GET /api/custom-levels/user/:userId
 * @desc    Get all custom levels created by a specific user
 * @access  Public
 */
router.get('/user/:userId', async (req, res) => {
    try {
        const customLevels = await CustomLevel.find({
            creatorId: req.params.userId,
            isActive: true
        })
            .populate('creatorId', 'username')
            .sort({ createdAt: 1 })
            .lean();

        res.status(200).json({
            levels: customLevels,
            count: customLevels.length
        });

    } catch (error) {
        console.error('Error fetching user custom levels:', error);
        res.status(500).json({
            error: 'Server error',
            message: 'Failed to fetch user custom levels'
        });
    }
});

module.exports = router;
