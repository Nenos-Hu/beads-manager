'use strict';

const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const DATA_PATH = process.env.DATA_PATH || '/data';
const CONFIG_FILE = path.join(DATA_PATH, 'projects.json');

const ensureConfig = () => {
  if (!fs.existsSync(DATA_PATH)) {
    fs.mkdirSync(DATA_PATH, { recursive: true });
  }
  if (!fs.existsSync(CONFIG_FILE)) {
    fs.writeFileSync(CONFIG_FILE, JSON.stringify({ projects: [] }, null, 2));
  }
};

const readConfig = () => {
  ensureConfig();
  return JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
};

const writeConfig = (config) => {
  ensureConfig();
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
};

const getProjects = () => readConfig().projects;

const getProjectById = (id) => {
  return readConfig().projects.find((p) => p.id === id) || null;
};

const addProject = ({ name, relativePath, colorScheme = 0 }) => {
  const config = readConfig();
  const project = {
    id: uuidv4(),
    name,
    relativePath,
    colorScheme,
    createdAt: new Date().toISOString(),
  };
  config.projects.push(project);
  writeConfig(config);
  return project;
};

const updateProject = (id, updates) => {
  const config = readConfig();
  const idx = config.projects.findIndex((p) => p.id === id);
  if (idx === -1) return null;
  const allowed = ['name', 'colorScheme'];
  for (const key of allowed) {
    if (updates[key] !== undefined) config.projects[idx][key] = updates[key];
  }
  writeConfig(config);
  return config.projects[idx];
};

const removeProject = (id) => {
  const config = readConfig();
  const idx = config.projects.findIndex((p) => p.id === id);
  if (idx === -1) return false;
  config.projects.splice(idx, 1);
  writeConfig(config);
  return true;
};

module.exports = { getProjects, getProjectById, addProject, updateProject, removeProject };
