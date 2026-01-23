const calc = require('./utils/parCalculator');
const fs = require('fs');

const data = JSON.parse(fs.readFileSync('./data/levels/level1.json', 'utf-8'));

try {
    const par = calc.calculatePARFromLevel(data);
    console.log('SUCCESS! PAR:', par);
} catch (e) {
    console.error('ERROR:', e.message);
    console.error('STACK:', e.stack);
}
