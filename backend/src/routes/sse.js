'use strict';

const fs = require('fs');
const path = require('path');
const { PassThrough } = require('stream');
const Boom = require('@hapi/boom');
const config = require('../services/configService');

const WORKSPACE = process.env.WORKSPACE_PATH || '/workspace';

module.exports = [
  {
    method: 'GET',
    path: '/api/projects/{id}/events',
    handler: (request, h) => {
      const project = config.getProjectById(request.params.id);
      if (!project) throw Boom.notFound('Project not found');

      const watchPath = path.join(WORKSPACE, project.relativePath, '.beads', 'issues.jsonl');
      const stream = new PassThrough();

      // Send initial handshake comment (not an event — won't trigger onmessage)
      stream.write(': connected\n\n');

      // fs.watchFile uses stat-polling so it works reliably across Docker volume mounts
      const onChange = (curr, prev) => {
        if (curr.mtimeMs !== prev.mtimeMs && !stream.destroyed) {
          stream.write('event: update\ndata: {}\n\n');
        }
      };

      fs.watchFile(watchPath, { interval: 2000, persistent: false }, onChange);

      // Heartbeat keeps connection alive through proxies / load balancers
      const heartbeat = setInterval(() => {
        if (!stream.destroyed) stream.write(': ping\n\n');
      }, 30000);

      request.raw.req.on('close', () => {
        clearInterval(heartbeat);
        fs.unwatchFile(watchPath, onChange);
        if (!stream.destroyed) stream.destroy();
      });

      return h.response(stream)
        .type('text/event-stream')
        .header('Cache-Control', 'no-cache')
        .header('Connection', 'keep-alive')
        .header('X-Accel-Buffering', 'no');
    },
  },
];
