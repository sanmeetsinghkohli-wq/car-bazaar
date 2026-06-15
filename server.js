/**
 * Car Bazaar - Native Node.js HTTP server
 * No external frameworks. Serves static assets and exposes a small JSON API.
 *
 *   GET  /api/data           -> returns the full database (cars, testimonials, awards)
 *   POST /api/bookings       -> appends a submission to ppi_bookings without overwriting
 *
 * Static files (HTML/CSS/JS/images) are served directly from the project root.
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const ROOT = __dirname;
const DB_PATH = path.join(ROOT, 'data', 'database.json');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp'
};

function sendJson(res, status, payload) {
  const body = JSON.stringify(payload);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(body)
  });
  res.end(body);
}

function readDatabase(callback) {
  fs.readFile(DB_PATH, 'utf8', (err, raw) => {
    if (err) return callback(err);
    try {
      callback(null, JSON.parse(raw));
    } catch (parseErr) {
      callback(parseErr);
    }
  });
}

// --- API: read the database ----------------------------------------------
function handleGetData(res) {
  readDatabase((err, db) => {
    if (err) {
      return sendJson(res, 500, { error: 'Could not read database.' });
    }
    sendJson(res, 200, db);
  });
}

// --- API: append a booking (no overwrite of existing entries) -------------
function handlePostBooking(req, res) {
  let body = '';
  req.on('data', (chunk) => {
    body += chunk;
    if (body.length > 1e6) req.destroy(); // basic guard against oversized payloads
  });

  req.on('end', () => {
    let submission;
    try {
      submission = JSON.parse(body || '{}');
    } catch (e) {
      return sendJson(res, 400, { error: 'Invalid JSON payload.' });
    }

    readDatabase((err, db) => {
      if (err) return sendJson(res, 500, { error: 'Could not read database.' });

      if (!Array.isArray(db.ppi_bookings)) db.ppi_bookings = [];

      const record = {
        id: 'bk_' + Date.now(),
        submitted_at: new Date().toISOString(),
        ...submission
      };
      db.ppi_bookings.push(record);

      fs.writeFile(DB_PATH, JSON.stringify(db, null, 2), (writeErr) => {
        if (writeErr) return sendJson(res, 500, { error: 'Could not save submission.' });
        sendJson(res, 201, { ok: true, record });
      });
    });
  });
}

// --- Static file serving --------------------------------------------------
function serveStatic(req, res) {
  let urlPath = decodeURIComponent(req.url.split('?')[0]);
  if (urlPath === '/') urlPath = '/index.html';

  // Resolve and confine to project root (prevents path traversal).
  const filePath = path.join(ROOT, path.normalize(urlPath));
  if (!filePath.startsWith(ROOT)) {
    res.writeHead(403);
    return res.end('Forbidden');
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end('<h1>404 - Not Found</h1><p><a href="/">Return to Car Bazaar</a></p>');
    }
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, { 'Content-Type': MIME_TYPES[ext] || 'application/octet-stream' });
    res.end(data);
  });
}

const server = http.createServer((req, res) => {
  if (req.url.startsWith('/api/data') && req.method === 'GET') {
    return handleGetData(res);
  }
  if (req.url.startsWith('/api/bookings') && req.method === 'POST') {
    return handlePostBooking(req, res);
  }
  if (req.method === 'GET') {
    return serveStatic(req, res);
  }
  res.writeHead(405);
  res.end('Method Not Allowed');
});

server.listen(PORT, () => {
  console.log(`Car Bazaar server running at http://localhost:${PORT}`);
});
