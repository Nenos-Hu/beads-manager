import React from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import Tooltip from '@mui/material/Tooltip';
import StatusChip from './StatusChip';
import PriorityBadge from './PriorityBadge';

const STATUSES   = ['open', 'in_progress', 'blocked', 'pinned', 'deferred', 'closed'];
const PRIORITIES = [0, 1, 2, 3, 4];

function StatCard({ label, count, active, dimmed, onClick }) {
  return (
    <Tooltip title={active ? 'Click to clear filter' : 'Click to filter'} placement="top">
      <Paper
        variant={active ? 'elevation' : 'outlined'}
        elevation={active ? 3 : 0}
        onClick={onClick}
        sx={{
          px: 1.5,
          py: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 0.5,
          minWidth: 72,
          cursor: 'pointer',
          opacity: dimmed && !active ? 0.4 : 1,
          transition: 'all 0.15s',
          outline: active ? '2px solid' : 'none',
          outlineColor: 'primary.main',
          '&:hover': { opacity: 1, transform: 'translateY(-1px)' },
        }}
      >
        <Typography variant="h6" fontWeight={700} lineHeight={1}>{count}</Typography>
        {label}
      </Paper>
    </Tooltip>
  );
}

export default function BeadDashboard({ beads, selectedStatuses, onStatusClick, selectedPriorities, onPriorityClick }) {
  if (!beads || beads.length === 0) return null;

  const byCounts = (key, values) => {
    const map = {};
    values.forEach((v) => { map[v] = 0; });
    beads.forEach((b) => { if (map[b[key]] !== undefined) map[b[key]]++; });
    return map;
  };

  const byStatus   = byCounts('status', STATUSES);
  const byPriority = byCounts('priority', PRIORITIES);

  return (
    <Box sx={{ mb: 2 }}>
      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
        {STATUSES.map((s) => (
          <StatCard
            key={s}
            count={byStatus[s]}
            label={<StatusChip status={s} size="small" />}
            active={selectedStatuses.length === 1 && selectedStatuses[0] === s}
            dimmed={byStatus[s] === 0}
            onClick={() => onStatusClick(s)}
          />
        ))}

        <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

        {PRIORITIES.map((p) => (
          <StatCard
            key={p}
            count={byPriority[p]}
            label={<PriorityBadge priority={p} size="small" />}
            active={selectedPriorities.length === 1 && selectedPriorities[0] === p}
            dimmed={byPriority[p] === 0}
            onClick={() => onPriorityClick(p)}
          />
        ))}
      </Stack>
    </Box>
  );
}
