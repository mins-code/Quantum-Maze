const mongoose = require('mongoose');
const fs = require('fs');
const CustomLevel = require('./models/CustomLevel');
require('dotenv').config();

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');
    } catch (err) {
        console.error('Connection Error:', err);
        process.exit(1);
    }
};

const verifyLevels = async () => {
    await connectDB();

    console.log('\n--- Checking Custom Levels ---\n');
    let output = '--- Checking Custom Levels ---\n\n';

    try {
        const levels = await CustomLevel.find({}).sort({ createdAt: -1 });

        if (levels.length === 0) {
            output += 'No custom levels found in the database.\n';
        } else {
            output += `Found ${levels.length} custom levels:\n\n`;

            levels.forEach((level, index) => {
                output += `${index + 1}. Name: "${level.name}"\n`;
                output += `   ID: ${level._id}\n`;
                output += `   Mechanics: ${JSON.stringify(level.mechanics, null, 2)}\n`; // Dump mechanics
                output += `   Full Level Data: ${JSON.stringify(level, null, 2)}\n`; // Dump everything just in case
                output += '-----------------------------------\n\n';
            });
        }
        fs.writeFileSync('levels_dump.txt', output);
        console.log('Output written to levels_dump.txt');
    } catch (err) {
        console.error('Error querying levels:', err);
        fs.writeFileSync('levels_dump.txt', `Error: ${err.message}`);
    } finally {
        await mongoose.connection.close();
        console.log('\nDatabase connection closed.');
    }
};

verifyLevels();
