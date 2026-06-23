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
import Select from '@mui/material/Select';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Checkbox from '@mui/material/Checkbox';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import CircularProgress from '@mui/material/CircularProgress';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import StatusChip from './StatusChip';
import PriorityBadge from './PriorityBadge';
import CopyIconButton from './CopyIconButton';

const ALL_STATUSES  = ['open', 'in_progress', 'blocked', 'deferred', 'closed', 'pinned'];
const EDIT_STATUSES = ALL_STATUSES;
const DEFAULT_STATUSES = ['open', 'in_progress', 'blocked', 'pinned'];
const TYPES       = ['all', 'task', 'feature', 'bug', 'chore', 'epic', 'spike', 'story', 'decision'];
const PRIORITIES  = [0, 1, 2, 3, 4];

function InlineStatusSelect({ beadId, value, onUpdate, updating }) {
  return (
    <Select
      value={value}
      onChange={(e) => onUpdate(beadId, { status: e.target.value })}
      onClick={(e) => e.stopPropagation()}
      renderValue={(v) => updating ? <CircularProgress size={16} /> : <StatusChip status={v} />}
      variant="standard"
      disableUnderline
      disabled={updating}
      sx={{ '& .MuiSelect-icon': { opacity: 0 }, '&:hover .MuiSelect-icon': { opacity: 1 } }}
    >
      {EDIT_STATUSES.map((s) => (
        <MenuItem key={s} value={s} dense>
          <StatusChip status={s} />
        </MenuItem>
      ))}
    </Select>
  );
}

function InlinePrioritySelect({ beadId, value, onUpdate, updating }) {
  return (
    <Select
      value={value}
      onChange={(e) => onUpdate(beadId, { priority: e.target.value })}
      onClick={(e) => e.stopPropagation()}
      renderValue={(v) => updating ? <CircularProgress size={16} /> : <PriorityBadge priority={v} />}
      variant="standard"
      disableUnderline
      disabled={updating}
      sx={{ '& .MuiSelect-icon': { opacity: 0 }, '&:hover .MuiSelect-icon': { opacity: 1 } }}
    >
      {PRIORITIES.map((p) => (
        <MenuItem key={p} value={p} dense>
          <PriorityBadge priority={p} />
        </MenuItem>
      ))}
    </Select>
  );
}

export default function BeadList({ beads, onSelect, onUpdate }) {
  const [search, setSearch]           = useState('');
  const [selectedStatuses, setSelectedStatuses] = useState(DEFAULT_STATUSES);
  const [type, setType]               = useState('all');
  const [updating, setUpdating] = useState({}); // beadId → true while saving

  const handleUpdate = async (beadId, changes) => {
    setUpdating((u) => ({ ...u, [beadId]: true }));
    try {
      await onUpdate(beadId, changes);
    } finally {
      setUpdating((u) => ({ ...u, [beadId]: false }));
    }
  };

  const filtered = beads.filter((b) => {
    const matchSearch = !search || [b.title, b.description, b.id].some(
      (v) => v && String(v).toLowerCase().includes(search.toLowerCase()),
    );
    const matchStatus = selectedStatuses.length === 0 || selectedStatuses.includes(b.status);
    const matchType   = type === 'all'   || b.issue_type === type;
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
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Status</InputLabel>
          <Select
            multiple
            value={selectedStatuses}
            onChange={(e) => setSelectedStatuses(e.target.value)}
            label="Status"
            renderValue={(selected) =>
              selected.length === 0 ? (
                <Typography variant="caption" color="text.secondary">All</Typography>
              ) : (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((s) => <StatusChip key={s} status={s} size="small" />)}
                </Box>
              )
            }
          >
            {ALL_STATUSES.map((s) => (
              <MenuItem key={s} value={s} dense>
                <Checkbox checked={selectedStatuses.includes(s)} size="small" sx={{ py: 0 }} />
                <StatusChip status={s} />
              </MenuItem>
            ))}
          </Select>
        </FormControl>
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
                <TableRow key={b.id} hover onClick={() => onSelect(b)} sx={{ cursor: 'pointer' }}>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Typography variant="caption" color="text.secondary" fontFamily="monospace">
                        {b.id}
                      </Typography>
                      <CopyIconButton text={b.id} size="small" />
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight={500}>{b.title}</Typography>
                    {b.description && (
                      <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block', maxWidth: 300 }}>
                        {b.description}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption">{b.issue_type}</Typography>
                  </TableCell>
                  <TableCell>
                    <InlineStatusSelect
                      beadId={b.id}
                      value={b.status}
                      onUpdate={handleUpdate}
                      updating={!!updating[b.id]}
                    />
                  </TableCell>
                  <TableCell>
                    <InlinePrioritySelect
                      beadId={b.id}
                      value={b.priority}
                      onUpdate={handleUpdate}
                      updating={!!updating[b.id]}
                    />
                  </TableCell>
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
