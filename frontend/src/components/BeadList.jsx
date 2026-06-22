import React, { useState } from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import StatusChip from './StatusChip';
import PriorityBadge from './PriorityBadge';

const STATUSES = ['all', 'open', 'in_progress', 'blocked', 'deferred', 'closed', 'pinned'];
const TYPES    = ['all', 'task', 'feature', 'bug', 'chore', 'epic', 'spike', 'story', 'decision'];

export default function BeadList({ beads, onSelect }) {
  const [search, setSearch]     = useState('');
  const [status, setStatus]     = useState('all');
  const [type, setType]         = useState('all');

  const filtered = beads.filter((b) => {
    const matchSearch = !search || [b.Title, b.Description, b.ID].some(
      (v) => v && String(v).toLowerCase().includes(search.toLowerCase()),
    );
    const matchStatus = status === 'all' || b.Status === status;
    const matchType   = type === 'all'   || b.IssueType === type;
    return matchSearch && matchStatus && matchType;
  });

  return (
    <Box>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ mb: 2 }}>
        <TextField
          size="small"
          placeholder="Search beads…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ flexGrow: 1 }}
        />
        <TextField select size="small" label="Status" value={status} onChange={(e) => setStatus(e.target.value)} sx={{ minWidth: 130 }}>
          {STATUSES.map((s) => <MenuItem key={s} value={s}>{s === 'all' ? 'All statuses' : s}</MenuItem>)}
        </TextField>
        <TextField select size="small" label="Type" value={type} onChange={(e) => setType(e.target.value)} sx={{ minWidth: 120 }}>
          {TYPES.map((t) => <MenuItem key={t} value={t}>{t === 'all' ? 'All types' : t}</MenuItem>)}
        </TextField>
      </Stack>

      {filtered.length === 0 ? (
        <Typography color="text.secondary" align="center" sx={{ py: 6 }}>No beads match the current filters.</Typography>
      ) : (
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Title</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Priority</TableCell>
                <TableCell align="right"></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.map((b) => (
                <TableRow
                  key={b.ID}
                  hover
                  onClick={() => onSelect(b)}
                  sx={{ cursor: 'pointer' }}
                >
                  <TableCell>
                    <Typography variant="caption" color="text.secondary" fontFamily="monospace">
                      {b.ID}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight={500}>{b.Title}</Typography>
                    {b.Description && (
                      <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block', maxWidth: 300 }}>
                        {b.Description}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption">{b.IssueType}</Typography>
                  </TableCell>
                  <TableCell><StatusChip status={b.Status} /></TableCell>
                  <TableCell><PriorityBadge priority={b.Priority} /></TableCell>
                  <TableCell align="right">
                    <IconButton size="small" onClick={(e) => { e.stopPropagation(); onSelect(b); }}>
                      <OpenInNewIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}
