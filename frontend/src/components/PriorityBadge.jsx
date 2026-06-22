import React from 'react';
import Chip from '@mui/material/Chip';

const PRIORITY_MAP = [
  { label: 'Critical', color: 'error' },
  { label: 'High',     color: 'warning' },
  { label: 'Medium',   color: 'info' },
  { label: 'Low',      color: 'success' },
  { label: 'Backlog',  color: 'default' },
];

export default function PriorityBadge({ priority, size = 'small' }) {
  const p = PRIORITY_MAP[priority] ?? { label: `P${priority}`, color: 'default' };
  return <Chip label={p.label} color={p.color} size={size} variant="outlined" />;
}
