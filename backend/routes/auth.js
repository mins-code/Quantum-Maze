/**
 * Authentication Routes - Quantum Maze
 * Handles user signup, login, and profile management
 */

const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect, generateToken } = require('../middleware/authMiddleware');

/**
 * @route   POST /api/auth/signup
 * @desc    Register a new user
 * @access  Public
 */
router.post('/signup', async (req, res) => {
    try {
        const { name, username, email, password, avatar } = req.body;

        // Validation
        if (!name || !username || !email || !password) {
            return res.status(400).json({
                success: false,
                error: 'Please provide all required fields: name, username, email, password'
            });
        }

        // Check if user already exists
        const existingUser = await User.findOne({
            $or: [{ email }, { username }]
        });

        if (existingUser) {
            if (existingUser.email === email) {
                return res.status(400).json({
                    success: false,
                    error: 'Email already registered'
                });
            }
            if (existingUser.username === username) {
                return res.status(400).json({
                    success: false,
                    error: 'Username already taken'
                });
            }
        }

        // Create user (password will be hashed by pre-save middleware)
        const user = await User.create({
            name,
            username,
            email,
            password,
            avatar: avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`
        });

        // Generate JWT token
        const token = generateToken(user._id);

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            token,
            user: user.getPublicProfile()
        });
    } catch (error) {
        console.error('Signup error:', error);

        // Handle validation errors
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                error: messages[0] || 'Validation error'
            });
        }

        res.status(500).json({
            success: false,
            error: 'Server error during registration'
        });
    }
});

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validation
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                error: 'Please provide email and password'
            });
        }

        // Find user by email (include password field)
        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            return res.status(401).json({
                success: false,
                error: 'Invalid credentials'
            });
        }

        // Check password
        const isPasswordMatch = await user.comparePassword(password);

        if (!isPasswordMatch) {
            return res.status(401).json({
                success: false,
                error: 'Invalid credentials'
            });
        }

        // Generate JWT token
        const token = generateToken(user._id);

        res.status(200).json({
            success: true,
            message: 'Login successful',
            token,
            user: user.getPublicProfile()
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            error: 'Server error during login'
        });
    }
});

// Helper to get rank
async function getUserRank(userId, totalScore) {
    const betterPlayers = await User.countDocuments({ totalScore: { $gt: totalScore } });
    return betterPlayers + 1;
}

/**
 * @route   GET /api/auth/profile
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/profile', protect, async (req, res) => {
    try {
        // req.user is set by protect middleware
        const userProfile = req.user.getPublicProfile();
        userProfile.rank = await getUserRank(req.user._id, req.user.totalScore);

        res.status(200).json({
            success: true,
            user: userProfile
        });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({
            success: false,
            error: 'Server error fetching profile'
        });
    }
});

/**
 * @route   PUT /api/auth/profile
 * @desc    Update user profile
 * @access  Private
 */
router.put('/profile', protect, async (req, res) => {
    try {
        const { name, avatar, bio } = req.body;

        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        // Update allowed fields
        if (name) user.name = name;
        if (avatar) user.avatar = avatar;
        if (bio !== undefined) user.bio = bio;

        await user.save();

        const userProfile = user.getPublicProfile();
        userProfile.rank = await getUserRank(user._id, user.totalScore);

        res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            user: userProfile
        });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({
            success: false,
            error: 'Server error updating profile'
        });
    }
});

/**
 * @route   GET /api/auth/verify
 * @desc    Verify JWT token
 * @access  Private
 */
router.get('/verify', protect, async (req, res) => {
    try {
        const userProfile = req.user.getPublicProfile();
        userProfile.rank = await getUserRank(req.user._id, req.user.totalScore);

        res.status(200).json({
            success: true,
            message: 'Token is valid',
            user: userProfile
        });
    } catch (error) {
        console.error('Verify token error:', error);
        res.status(500).json({
            success: false,
            error: 'Server error verifying token'
        });
    }
});

module.exports = router;
