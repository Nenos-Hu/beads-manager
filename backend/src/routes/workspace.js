'use strict';

const fs = require('fs');
const path = require('path');

const WORKSPACE = process.env.WORKSPACE_PATH || '/workspace';

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

module.exports = [
  {
    method: 'GET',
    path: '/api/workspace/browse',
    handler: (request) => {
      const rel = request.query.path || '';
      const safe = path.normalize(rel).replace(/^(\.\.(\/|\\|$))+/, '');
      const target = path.join(WORKSPACE, safe);

      if (!target.startsWith(WORKSPACE)) {
        return { error: 'Invalid path' };
      }

      const entries = listDir(target);
      return {
        current: safe || '.',
        entries,
      };
    },
  },
];
