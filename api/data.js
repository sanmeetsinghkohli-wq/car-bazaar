/**
 * Vercel serverless function: GET /api/data
 * Returns the marketplace database (cars, testimonials, awards).
 */
const fs = require('fs');
const path = require('path');

module.exports = (req, res) => {
  try {
    const dbPath = path.join(process.cwd(), 'data', 'database.json');
    const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.status(200).send(JSON.stringify(db));
  } catch (e) {
    res.status(500).json({ error: 'Could not read database.' });
  }
};
