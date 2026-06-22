'use strict';

const fs = require('fs');
const path = require('path');
const Boom = require('@hapi/boom');
const config = require('../services/configService');

const WORKSPACE = process.env.WORKSPACE_PATH || '/workspace';

module.exports = [
  {
    method: 'GET',
    path: '/api/projects',
    handler: () => config.getProjects(),
  },

  {
    method: 'POST',
    path: '/api/projects',
    handler: (request, h) => {
      const { name, relativePath, colorScheme } = request.payload;

      if (!name || !relativePath) {
        throw Boom.badRequest('name and relativePath are required');
      }

      const safe = path.normalize(relativePath).replace(/^(\.\.(\/|\\|$))+/, '');
      const fullPath = path.join(WORKSPACE, safe);

      if (!fullPath.startsWith(WORKSPACE)) {
        throw Boom.badRequest('Invalid path');
      }
      if (!fs.existsSync(fullPath)) {
        throw Boom.badRequest('Path does not exist in workspace');
      }

      const project = config.addProject({ name, relativePath: safe, colorScheme });
      return h.response(project).code(201);
    },
  },

  {
    method: 'PUT',
    path: '/api/projects/{id}',
    handler: (request) => {
      const project = config.updateProject(request.params.id, request.payload);
      if (!project) throw Boom.notFound('Project not found');
      return project;
    },
  },

  {
    method: 'DELETE',
    path: '/api/projects/{id}',
    handler: (request, h) => {
      const removed = config.removeProject(request.params.id);
      if (!removed) throw Boom.notFound('Project not found');
      return h.response().code(204);
    },
  },
];
