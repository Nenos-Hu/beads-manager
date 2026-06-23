'use strict';

const Boom = require('@hapi/boom');
const config = require('../services/configService');
const beads = require('../services/beadService');

const getProject = (id) => {
  const project = config.getProjectById(id);
  if (!project) throw Boom.notFound('Project not found');
  return project;
};

const wrapBdError = (err) => {
  const msg = err.message || String(err);
  if (msg.includes('command not found') || msg.includes('ENOENT')) {
    throw Boom.serverUnavailable('bd CLI not found. Ensure bd is installed in the container.');
  }
  if (msg.includes('.beads')) {
    throw Boom.badRequest('Project not initialized with bd. Run `bd init` in the project folder.');
  }
  throw Boom.serverUnavailable(msg);
};

module.exports = [
  {
    method: 'GET',
    path: '/api/projects/{id}/stats',
    handler: async (request) => {
      const project = getProject(request.params.id);
      try {
        return await beads.getStats(project.relativePath);
      } catch {
        return { byStatus: {}, total: 0 };
      }
    },
  },

  {
    method: 'GET',
    path: '/api/projects/{id}/beads',
    handler: async (request) => {
      const project = getProject(request.params.id);
      try {
        return await beads.listBeads(project.relativePath);
      } catch (err) {
        return wrapBdError(err);
      }
    },
  },

  {
    method: 'POST',
    path: '/api/projects/{id}/beads',
    handler: async (request, h) => {
      const project = getProject(request.params.id);
      try {
        const bead = await beads.createBead(project.relativePath, request.payload);
        return h.response(bead).code(201);
      } catch (err) {
        return wrapBdError(err);
      }
    },
  },

  {
    method: 'GET',
    path: '/api/projects/{id}/beads/{beadId}',
    handler: async (request) => {
      const project = getProject(request.params.id);
      try {
        return await beads.getBead(project.relativePath, request.params.beadId);
      } catch (err) {
        return wrapBdError(err);
      }
    },
  },

  {
    method: 'PUT',
    path: '/api/projects/{id}/beads/{beadId}',
    handler: async (request) => {
      const project = getProject(request.params.id);
      try {
        return await beads.updateBead(project.relativePath, request.params.beadId, request.payload);
      } catch (err) {
        return wrapBdError(err);
      }
    },
  },

  {
    method: 'DELETE',
    path: '/api/projects/{id}/beads/{beadId}',
    handler: async (request, h) => {
      const project = getProject(request.params.id);
      const { reason } = request.payload || {};
      try {
        await beads.closeBead(project.relativePath, request.params.beadId, reason);
        return h.response().code(204);
      } catch (err) {
        return wrapBdError(err);
      }
    },
  },

  {
    method: 'GET',
    path: '/api/projects/{id}/beads/{beadId}/comments',
    handler: async (request) => {
      const project = getProject(request.params.id);
      try {
        return await beads.listComments(project.relativePath, request.params.beadId);
      } catch (err) {
        return wrapBdError(err);
      }
    },
  },

  {
    method: 'POST',
    path: '/api/projects/{id}/beads/{beadId}/comments',
    handler: async (request, h) => {
      const project = getProject(request.params.id);
      const { text } = request.payload;
      if (!text || !text.trim()) throw Boom.badRequest('Comment text is required');
      try {
        const comment = await beads.addComment(project.relativePath, request.params.beadId, text.trim());
        return h.response(comment).code(201);
      } catch (err) {
        return wrapBdError(err);
      }
    },
  },

  {
    method: 'POST',
    path: '/api/projects/{id}/init',
    handler: async (request, h) => {
      const project = getProject(request.params.id);
      try {
        await beads.initBeads(project.relativePath);
        return h.response({ success: true }).code(200);
      } catch (err) {
        return wrapBdError(err);
      }
    },
  },
];
