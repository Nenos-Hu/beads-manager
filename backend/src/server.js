'use strict';

const Hapi = require('@hapi/hapi');
const projectRoutes = require('./routes/projects');
const beadRoutes = require('./routes/beads');
const workspaceRoutes = require('./routes/workspace');

const init = async () => {
  const server = Hapi.server({
    port: process.env.PORT || 3001,
    host: '0.0.0.0',
    routes: {
      cors: { origin: ['*'] },
    },
  });

  server.route({
    method: 'GET',
    path: '/health',
    handler: () => ({ status: 'ok' }),
  });

  server.route(workspaceRoutes);
  server.route(projectRoutes);
  server.route(beadRoutes);

  await server.start();
  console.log(`Server running on ${server.info.uri}`);
};

process.on('unhandledRejection', (err) => {
  console.error(err);
  process.exit(1);
});

init();
