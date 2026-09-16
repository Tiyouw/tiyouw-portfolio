// tiyouw-portfolio CMS server — zero dependencies (node:http)
'use strict';

const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const PORT = Number(process.env.PORT || 3000);
const HOST = process.env.HOST || '0.0.0.0';
const DIST = path.join(__dirname, '..', 'dist');
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, '..', 'data');
const DATA_FILE = path.join(DATA_DIR, 'content.json');
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '';

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.glb': 'model/gltf-binary',
  '.hdr': 'application/octet-stream',
};

// ---- auth state ----
const sessions = new Set();
const loginFails = new Map(); // ip -> {count, resetAt}
const FAIL_WINDOW_MS = 10 * 60 * 1000;
const FAIL_MAX = 10;

function newToken() {
  return crypto.randomBytes(32).toString('hex');
}

function isRateLimited(ip) {
  const rec = loginFails.get(ip);
  if (!rec) return false;
  if (Date.now() > rec.resetAt) {
    loginFails.delete(ip);
    return false;
  }
  return rec.count >= FAIL_MAX;
}

function recordFail(ip) {
  const rec = loginFails.get(ip);
  if (!rec || Date.now() > rec.resetAt) {
    loginFails.set(ip, { count: 1, resetAt: Date.now() + FAIL_WINDOW_MS });
  } else {
    rec.count += 1;
  }
}

function parseCookies(req) {
  const out = {};
  const raw = req.headers.cookie;
  if (!raw) return out;
  for (const part of raw.split(';')) {
    const i = part.indexOf('=');
    if (i > -1) out[part.slice(0, i).trim()] = decodeURIComponent(part.slice(i + 1).trim());
  }
  return out;
}

function isAuthed(req) {
  const tok = parseCookies(req).cms_token;
  return tok ? sessions.has(tok) : false;
}

// ---- content store ----
function loadContent() {
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  } catch {
    try {
      return JSON.parse(fs.readFileSync(path.join(DIST, 'content.json'), 'utf8'));
    } catch {
      return null;
    }
  }
}

function saveContent(data) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  const tmp = DATA_FILE + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2));
  fs.renameSync(tmp, DATA_FILE);
}

function validateContent(d) {
  if (!d || typeof d !== 'object') return 'root must be an object';
  for (const key of ['projects', 'designs', 'videos', 'skills', 'timeline']) {
    if (!Array.isArray(d[key])) return `.${key} must be an array`;
  }
  if (!d.profile || typeof d.profile !== 'object') return '.profile missing';
  for (const p of d.projects) {
    if (!p || typeof p.slug !== 'string' || typeof p.name !== 'string') return 'project needs slug + name';
  }
  for (const v of d.videos) {
    if (!v || typeof v.slug !== 'string') return 'video needs slug';
  }
  return null;
}

// ---- helpers ----
function send(res, status, body, headers = {}) {
  const buf = Buffer.isBuffer(body) ? body : Buffer.from(body);
  res.writeHead(status, { 'Content-Length': buf.length, ...headers });
  res.end(buf);
}

function sendJSON(res, status, obj) {
  send(res, status, JSON.stringify(obj), { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
}

function readBody(req, limit = 2 * 1024 * 1024) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    req.on('data', (c) => {
      size += c.length;
      if (size > limit) {
        reject(new Error('body too large'));
        req.destroy();
        return;
      }
      chunks.push(c);
    });
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

function serveStatic(res, filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const type = MIME[ext] || 'application/octet-stream';
  const cache = filePath.includes(`${path.sep}assets${path.sep}`)
    ? 'public, max-age=31536000, immutable'
    : 'no-cache';
  const stream = fs.createReadStream(filePath);
  stream.on('open', () => {
    res.writeHead(200, { 'Content-Type': type, 'Cache-Control': cache });
    stream.pipe(res);
  });
  stream.on('error', () => send(res, 404, 'Not found'));
}

// ---- request handling ----
async function handle(req, res) {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const p = url.pathname;

  // --- API ---
  if (p === '/api/login' && req.method === 'POST') {
    if (!ADMIN_PASSWORD) return sendJSON(res, 503, { error: 'ADMIN_PASSWORD not configured' });
    const ip = req.socket.remoteAddress || '?';
    if (isRateLimited(ip)) return sendJSON(res, 429, { error: 'Too many attempts, wait 10 minutes' });
    let body;
    try {
      body = JSON.parse((await readBody(req)).toString('utf8'));
    } catch {
      return sendJSON(res, 400, { error: 'Invalid JSON' });
    }
    if (body.password !== ADMIN_PASSWORD) {
      recordFail(ip);
      return sendJSON(res, 401, { error: 'Wrong password' });
    }
    const tok = newToken();
    sessions.add(tok);
    return send(res, 200, JSON.stringify({ ok: true }), {
      'Content-Type': 'application/json',
      'Set-Cookie': `cms_token=${tok}; HttpOnly; SameSite=Strict; Path=/; Max-Age=86400`,
    });
  }

  if (p === '/api/logout' && req.method === 'POST') {
    const tok = parseCookies(req).cms_token;
    if (tok) sessions.delete(tok);
    return send(res, 200, '{"ok":true}', {
      'Content-Type': 'application/json',
      'Set-Cookie': 'cms_token=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0',
    });
  }

  if (p === '/api/session' && req.method === 'GET') {
    return sendJSON(res, 200, { authed: isAuthed(req), hasPassword: Boolean(ADMIN_PASSWORD) });
  }

  if (p === '/api/content') {
    if (!isAuthed(req)) return sendJSON(res, 401, { error: 'Not authenticated' });
    if (req.method === 'GET') {
      const data = loadContent();
      if (!data) return sendJSON(res, 500, { error: 'No content available' });
      return sendJSON(res, 200, data);
    }
    if (req.method === 'PUT') {
      let body;
      try {
        body = JSON.parse((await readBody(req)).toString('utf8'));
      } catch {
        return sendJSON(res, 400, { error: 'Invalid JSON' });
      }
      const err = validateContent(body);
      if (err) return sendJSON(res, 422, { error: err });
      try {
        saveContent(body);
      } catch (e) {
        return sendJSON(res, 500, { error: 'Save failed: ' + e.message });
      }
      return sendJSON(res, 200, { ok: true });
    }
  }

  // --- content.json (public) ---
  if (p === '/content.json') {
    const data = loadContent();
    if (data) return sendJSON(res, 200, data);
    const fallback = path.join(DIST, 'content.json');
    if (fs.existsSync(fallback)) return serveStatic(res, fallback);
    return sendJSON(res, 404, { error: 'content.json not found' });
  }

  // --- admin ---
  if (p === '/admin' || p === '/admin/') {
    return serveStatic(res, path.join(__dirname, 'admin.html'));
  }

  // --- static ---
  let rel = decodeURIComponent(p);
  if (rel.includes('..')) return send(res, 400, 'Bad path');
  let filePath = path.join(DIST, rel);
  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    return serveStatic(res, filePath);
  }
  // SPA fallback
  const indexPath = path.join(DIST, 'index.html');
  if (fs.existsSync(indexPath)) return serveStatic(res, indexPath);
  send(res, 404, 'Not found');
}

const server = http.createServer((req, res) => {
  handle(req, res).catch((e) => {
    console.error('[cms]', e);
    if (!res.headersSent) sendJSON(res, 500, { error: 'Internal error' });
  });
});

server.listen(PORT, HOST, () => {
  console.log(`[cms] listening on ${HOST}:${PORT}`);
  console.log(`[cms] admin at /admin — ADMIN_PASSWORD ${ADMIN_PASSWORD ? 'set' : 'NOT SET'}`);
  console.log(`[cms] data file: ${DATA_FILE}`);
});
