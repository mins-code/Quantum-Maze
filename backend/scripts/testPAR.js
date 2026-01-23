/**
 * Test script to calculate PAR for a specific level
 * Usage: node testPAR.js <levelNumber>
 */

const fs = require('fs');
const path = require('path');
const { calculatePARFromLevel } = require('../utils/parCalculator');

// Get level number from command line argument
const levelNumber = process.argv[2] || 1;
const levelFile = path.join(__dirname, `../data/levels/level${levelNumber}.json`);

// Check if file exists
if (!fs.existsSync(levelFile)) {
    console.error(`❌ Level file not found: ${levelFile}`);
    process.exit(1);
}

// Read level data
const levelData = JSON.parse(fs.readFileSync(levelFile, 'utf-8'));

console.log('═══════════════════════════════════════════════════════════');
console.log('  QUANTUM MAZE - PAR CALCULATOR');
console.log('═══════════════════════════════════════════════════════════');

try {
    const par = calculatePARFromLevel(levelData);

    // Update the level file with calculated PAR
    levelData.parMoves = par;
    fs.writeFileSync(levelFile, JSON.stringify(levelData, null, 4));

    console.log(`✅ Updated ${levelFile} with PAR = ${par}`);
    console.log('═══════════════════════════════════════════════════════════\n');
} catch (error) {
    console.error('❌ Failed to calculate PAR:', error.message);
    process.exit(1);
}
