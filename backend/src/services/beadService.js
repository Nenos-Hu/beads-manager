'use strict';

const { execFile } = require('child_process');
const path = require('path');
const util = require('util');

const execFileAsync = util.promisify(execFile);
const WORKSPACE = process.env.WORKSPACE_PATH || '/workspace';

// Each `bd` invocation is a ~145 MB Go binary with an embedded Dolt database:
// measured at ~0.8 s and ~110 MB peak RSS per call. Cap how many run at once so
// a burst of requests (e.g. the home page loading stats for every project)
// cannot multiply that memory footprint.
const MAX_CONCURRENT_BD = parseInt(process.env.BD_MAX_CONCURRENT || '2', 10);
const EXEC_TIMEOUT_MS = 30000;
const MAX_BUFFER = 32 * 1024 * 1024; // `bd list --limit 0` on a large project can exceed Node's 1 MB default

let running = 0;
const queue = [];

const acquire = () => new Promise((resolve) => {
  if (running < MAX_CONCURRENT_BD) { running++; resolve(); return; }
  queue.push(resolve);
});

const release = () => {
  const next = queue.shift();
  if (next) next(); else running--;
};

const projectPath = (relativePath) => path.join(WORKSPACE, relativePath);

const bd = async (args, cwd) => {
  await acquire();
  try {
    const { stdout, stderr } = await execFileAsync('bd', args, {
      cwd,
      timeout: EXEC_TIMEOUT_MS,
      maxBuffer: MAX_BUFFER,
    });
    if (stderr) console.warn('[bd stderr]', stderr.trim());
    return stdout.trim();
  } finally {
    release();
  }
};

const parseJson = (raw) => {
  const parsed = JSON.parse(raw);
  if (Array.isArray(parsed)) return parsed;
  if (parsed.issues) return parsed.issues;
  if (parsed.data) return parsed.data;
  return parsed;
};

const listBeads = async (relativePath) => {
  const out = await bd(['list', '--all', '--limit', '0', '--json'], projectPath(relativePath));
  return parseJson(out);
};

const getBead = async (relativePath, beadId) => {
  const out = await bd(['show', beadId, '--json'], projectPath(relativePath));
  const parsed = parseJson(out);
  return Array.isArray(parsed) ? parsed[0] : parsed;
};

const createBead = async (relativePath, { title, description, priority, issueType }) => {
  const args = ['create', title];
  if (description) args.push('--description', description);
  if (priority !== undefined && priority !== null) args.push('-p', String(priority));
  if (issueType) args.push('-t', issueType);
  args.push('--json');
  const out = await bd(args, projectPath(relativePath));
  return parseJson(out);
};

const updateBead = async (relativePath, beadId, { title, description, priority, status, issueType, acceptanceCriteria, notes }) => {
  const args = ['update', beadId];
  if (title !== undefined && title !== null) args.push('--title', title);
  if (description !== undefined) args.push('--description', description);
  if (priority !== undefined && priority !== null) args.push('--priority', String(priority));
  if (status !== undefined) args.push('--status', status);
  if (issueType !== undefined) args.push('--type', issueType);
  if (acceptanceCriteria !== undefined) args.push('--acceptance', acceptanceCriteria);
  if (notes !== undefined) args.push('--notes', notes);
  args.push('--json');
  const out = await bd(args, projectPath(relativePath));
  const parsed = parseJson(out);
  // `bd update --json` returns a one-element array holding the updated issue
  return Array.isArray(parsed) ? parsed[0] : parsed;
};

const closeBead = async (relativePath, beadId, reason = 'Closed via Beads Manager') => {
  await bd(['close', beadId, '--reason', reason], projectPath(relativePath));
  return { success: true };
};

const initBeads = async (relativePath) => {
  await bd(['init'], projectPath(relativePath));
  return { success: true };
};

const getStats = async (relativePath) => {
  const all = await listBeads(relativePath);
  const byStatus = {};
  all.forEach((b) => { byStatus[b.status] = (byStatus[b.status] || 0) + 1; });
  return { byStatus, total: all.length };
};

const listComments = async (relativePath, beadId) => {
  const out = await bd(['comments', beadId, '--json'], projectPath(relativePath));
  return parseJson(out);
};

const addComment = async (relativePath, beadId, text) => {
  const out = await bd(['comment', beadId, text, '--json'], projectPath(relativePath));
  return parseJson(out);
};

module.exports = { listBeads, getBead, createBead, updateBead, closeBead, initBeads, getStats, listComments, addComment };
