import React from 'react';
import Chip from '@mui/material/Chip';

const STATUS_MAP = {
  open:        { label: 'Open',        color: 'info' },
  in_progress: { label: 'In Progress', color: 'warning' },
  blocked:     { label: 'Blocked',     color: 'error' },
  deferred:    { label: 'Deferred',    color: 'default' },
  closed:      { label: 'Closed',      color: 'success' },
  pinned:      { label: 'Pinned',      color: 'secondary' },
};

export default function StatusChip({ status, size = 'small' }) {
  const s = STATUS_MAP[status] ?? { label: status, color: 'default' };
  return <Chip label={s.label} color={s.color} size={size} />;
}
