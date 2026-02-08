const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');

// Setup error logging
const logFile = path.join(__dirname, '../migration_error.log');
function logError(err) {
    try {
        const msg = `[${new Date().toISOString()}] ${err.stack || err}\n`;
        fs.appendFileSync(logFile, msg);
        console.error(msg);
    } catch (e) {
        console.error('Failed to write to log file:', e);
        console.error(err);
    }
}

process.on('uncaughtException', (err) => {
    logError(err);
    process.exit(1);
});

process.on('unhandledRejection', (reason, p) => {
    logError(new Error(`Unhandled Rejection at: ${p}, reason: ${reason}`));
    process.exit(1);
});

try {
    // Check if .env exists
    const envPath = path.join(__dirname, '../.env');
    if (!fs.existsSync(envPath)) {
        throw new Error(`.env file not found at ${envPath}`);
    }
    require('dotenv').config({ path: envPath });

    // Check if Score model exists
    const scoreModelPath = path.join(__dirname, '../models/Score.js');
    if (!fs.existsSync(scoreModelPath)) {
        throw new Error(`Score model not found at ${scoreModelPath}`);
    }
    const Score = require(scoreModelPath);

    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    mongoose.connect(process.env.MONGO_URI)
        .then(() => {
            console.log('✅ Connected to MongoDB');
            migrateScores();
        })
        .catch(err => {
            logError(err);
            process.exit(1);
        });

    async function migrateScores() {
        try {
            console.log('🔄 Starting Score Migration...');

            const scoresToUpdate = await Score.find({
                $or: [
                    { levelType: { $exists: false } },
                    { levelType: null }
                ]
            });

            console.log(`📊 Found ${scoresToUpdate.length} scores to migrate.`);

            let updatedCount = 0;
            for (const score of scoresToUpdate) {
                if (score.levelId && typeof score.levelId === 'number') {
                    score.levelType = 'official';
                    score.levelName = `Level ${score.levelId}`;
                    await score.save();
                    updatedCount++;
                } else {
                    console.log(`⚠️ Skipping score ${score._id}: No numeric levelId`);
                }
            }

            console.log(`\n✅ Migration Complete! Updated ${updatedCount} scores.`);
            process.exit(0);
        } catch (error) {
            logError(error);
            process.exit(1);
        }
    }

} catch (err) {
    logError(err);
    process.exit(1);
}
