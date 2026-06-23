import React from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import StatusChip from './StatusChip';
import PriorityBadge from './PriorityBadge';

const STATUSES   = ['open', 'in_progress', 'blocked', 'pinned', 'deferred', 'closed'];
const PRIORITIES = [0, 1, 2, 3, 4];

function StatCard({ label, count, dimmed }) {
  return (
    <Paper
      variant="outlined"
      sx={{
        px: 1.5,
        py: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 0.5,
        minWidth: 72,
        opacity: dimmed ? 0.4 : 1,
        transition: 'opacity 0.2s',
      }}
    >
      <Typography variant="h6" fontWeight={700} lineHeight={1}>{count}</Typography>
      {label}
    </Paper>
  );
}

export default function BeadDashboard({ beads }) {
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
            dimmed={byStatus[s] === 0}
          />
        ))}

        <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

        {PRIORITIES.map((p) => (
          <StatCard
            key={p}
            count={byPriority[p]}
            label={<PriorityBadge priority={p} size="small" />}
            dimmed={byPriority[p] === 0}
          />
        ))}
      </Stack>
    </Box>
  );
}
