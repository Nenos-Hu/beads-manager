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

// Canonical column order for CSV export. Any field `bd export` emits that is
// not listed here is appended after these, so nothing is silently dropped.
const EXPORT_COLUMNS = [
  'id', 'title', 'status', 'priority', 'issue_type',
  'description', 'design', 'acceptance_criteria', 'notes',
  'assignee', 'owner', 'created_by', 'labels',
  'created_at', 'updated_at', 'started_at', 'closed_at', 'deferred_until',
  'close_reason', 'parent', 'dependencies', 'dependents',
  'dependency_count', 'dependent_count', 'comment_count', 'comments',
];

// `bd export` writes JSONL: one complete issue per line, including labels,
// dependencies and comments (fields that are empty are omitted per record).
// Unlike `bd list --json` it carries every stored field, so it is the source
// for a full export.
const exportBeads = async (relativePath) => {
  const out = await bd(['export'], projectPath(relativePath));
  return out
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const record = JSON.parse(line);
      delete record._type; // internal export marker, always "issue"
      return record;
    });
};

const csvCell = (value) => {
  if (value === undefined || value === null) return '';
  const text = typeof value === 'object' ? JSON.stringify(value) : String(value);
  // RFC 4180: quote when the cell holds a separator, quote or line break;
  // embedded quotes are doubled.
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
};

const beadsToCsv = (records) => {
  const extra = new Set();
  records.forEach((r) => Object.keys(r).forEach((k) => { if (!EXPORT_COLUMNS.includes(k)) extra.add(k); }));
  const columns = [...EXPORT_COLUMNS, ...[...extra].sort()];
  const lines = [columns.map(csvCell).join(',')];
  records.forEach((r) => lines.push(columns.map((c) => csvCell(r[c])).join(',')));
  // CRLF line endings and a UTF-8 BOM so Excel opens the file with the right encoding.
  return '﻿' + lines.join('\r\n') + '\r\n';
};

module.exports = {
  listBeads, getBead, createBead, updateBead, closeBead, initBeads, getStats, listComments, addComment,
  exportBeads, beadsToCsv,
};
