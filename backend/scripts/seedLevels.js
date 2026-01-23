/**
 * Database Seeding Script for Quantum Maze Levels
 * 
 * This script populates the MongoDB database with level data from JSON files.
 * Run with: npm run seed
 */

const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Import Level model
const Level = require('../models/Level');

// MongoDB connection URI from environment variables
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/quantum-maze';

/**
 * Connect to MongoDB
 */
const connectDB = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('✅ MongoDB Connected Successfully');
    } catch (error) {
        console.error('❌ MongoDB Connection Error:', error.message);
        process.exit(1);
    }
};

/**
 * Read level JSON files from data/levels directory
 */
const readLevelFiles = () => {
    const levelsDir = path.join(__dirname, '../data/levels');
    const levelFiles = fs.readdirSync(levelsDir).filter(file => file.endsWith('.json'));

    const levels = levelFiles.map(file => {
        const filePath = path.join(levelsDir, file);
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        return JSON.parse(fileContent);
    });

    return levels.sort((a, b) => a.levelId - b.levelId);
};

/**
 * Seed the database with level data
 */
const seedLevels = async () => {
    try {
        console.log('🌱 Starting database seeding...\n');

        // Connect to database
        await connectDB();

        // Clear existing levels
        console.log('🗑️  Clearing existing levels...');
        const deleteResult = await Level.deleteMany({});
        console.log(`   Deleted ${deleteResult.deletedCount} existing levels\n`);

        // Read level files
        console.log('📖 Reading level files...');
        const levels = readLevelFiles();
        console.log(`   Found ${levels.length} level files\n`);

        // Insert levels into database
        console.log('💾 Inserting levels into database...');
        const insertedLevels = await Level.insertMany(levels);
        console.log(`   Successfully inserted ${insertedLevels.length} levels\n`);

        // Display inserted levels
        console.log('📋 Inserted Levels:');
        insertedLevels.forEach(level => {
            console.log(`   - Level ${level.levelId}: ${level.name} (${level.difficulty})`);
        });

        console.log('\n✅ Database seeding completed successfully!');

    } catch (error) {
        console.error('\n❌ Seeding Error:', error.message);
        process.exit(1);
    } finally {
        // Disconnect from database
        await mongoose.disconnect();
        console.log('\n🔌 Disconnected from MongoDB');
        process.exit(0);
    }
};

// Run the seeding script
seedLevels();
