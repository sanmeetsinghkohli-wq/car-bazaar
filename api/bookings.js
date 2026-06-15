/**
 * Vercel serverless function: POST /api/bookings
 *
 * Accepts a form submission and returns a confirmation record.
 *
 * NOTE: Vercel's serverless filesystem is read-only, so submissions are
 * acknowledged but NOT persisted to data/database.json in this hosted
 * environment. Run `node server.js` locally for full read/write storage.
 */
module.exports = (req, res) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // Vercel parses JSON bodies automatically when Content-Type is application/json.
  const submission = req.body && typeof req.body === 'object' ? req.body : {};

  const record = {
    id: 'bk_' + Date.now(),
    submitted_at: new Date().toISOString(),
    ...submission
  };

  res.status(201).json({
    ok: true,
    record,
    note: 'Acknowledged. Persistent storage is only available when running the local Node server.'
  });
};
