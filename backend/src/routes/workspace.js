'use strict';

const fs = require('fs');
const path = require('path');

const WORKSPACE = process.env.WORKSPACE_PATH || '/workspace';

const safePath = (rel) => {
  const normalized = path.normalize(rel || '').replace(/^(\.\.(\/|\\|$))+/, '');
  const full = path.join(WORKSPACE, normalized);
  if (!full.startsWith(WORKSPACE)) return null;
  return { full, rel: normalized || '.' };
};

const listDir = (dirPath) => {
  try {
    return fs.readdirSync(dirPath, { withFileTypes: true })
      .filter((e) => e.isDirectory() && !e.name.startsWith('.'))
      .map((e) => ({
        name: e.name,
        hasBeads: fs.existsSync(path.join(dirPath, e.name, '.beads')),
      }));
  } catch {
    return [];
  }
};

const discoverBeads = (dirPath, relPath, maxDepth) => {
  const results = [];

  const scan = (absDir, relDir, depth) => {
    if (fs.existsSync(path.join(absDir, '.beads'))) {
      results.push({
        name: path.basename(absDir),
        relativePath: relDir,
      });
    }
    if (depth <= 0) return;
    let entries;
    try { entries = fs.readdirSync(absDir, { withFileTypes: true }); } catch { return; }
    for (const e of entries) {
      if (!e.isDirectory() || e.name.startsWith('.')) continue;
      scan(path.join(absDir, e.name), `${relDir}/${e.name}`, depth - 1);
    }
  };

  scan(dirPath, relPath, maxDepth);
  return results;
};

module.exports = [
  {
    method: 'GET',
    path: '/api/workspace/browse',
    handler: (request) => {
      const p = safePath(request.query.path || '');
      if (!p) return { error: 'Invalid path' };
      return { current: p.rel, entries: listDir(p.full) };
    },
  },

  {
    method: 'GET',
    path: '/api/workspace/discover',
    handler: (request) => {
      const depth = Math.min(parseInt(request.query.depth || '3', 10), 5);
      const p = safePath(request.query.path || '');
      if (!p) return { error: 'Invalid path' };
      if (!fs.existsSync(p.full)) return { error: 'Path does not exist' };
      const projects = discoverBeads(p.full, p.rel, depth);
      return { scanned: p.rel, projects };
    },
  },
];
