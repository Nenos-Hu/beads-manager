import React, { useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import Grid from '@mui/material/Grid';
import Alert from '@mui/material/Alert';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import BeadComments from './BeadComments';

const ISSUE_TYPES = ['task', 'feature', 'bug', 'chore', 'epic', 'spike', 'story', 'decision'];
const STATUSES = ['open', 'in_progress', 'blocked', 'pinned', 'deferred', 'closed'];
const PRIORITIES = [
  { value: 0, label: '0 – Critical' },
  { value: 1, label: '1 – High' },
  { value: 2, label: '2 – Medium' },
  { value: 3, label: '3 – Low' },
  { value: 4, label: '4 – Backlog' },
];

const DEFAULTS = { title: '', description: '', priority: 2, issueType: 'task' };

export default function BeadForm({ open, onClose, onSubmit, initial, projectId }) {
  const isEdit = Boolean(initial);

  const [form, setForm] = useState(isEdit ? {
    title:               initial.title || '',
    description:         initial.description || '',
    priority:            initial.priority ?? 2,
    issueType:           initial.issue_type || 'task',
    status:              initial.status || 'open',
    acceptanceCriteria:  initial.acceptance_criteria || '',
    notes:               initial.notes || '',
  } : DEFAULTS);

  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async () => {
    if (!form.title.trim()) { setError('Title is required'); return; }
    setLoading(true);
    setError('');
    try {
      await onSubmit(form);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth={isEdit ? 'md' : 'sm'}>
      <DialogTitle>{isEdit ? `Edit — ${initial.id}` : 'New Bead'}</DialogTitle>

      <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
        {error && <Alert severity="error">{error}</Alert>}

        <Grid container spacing={2}>
          <Grid item xs={12} sm={isEdit ? 6 : 12}>
            <TextField label="Title" fullWidth required value={form.title} onChange={set('title')} />
          </Grid>

          {isEdit && (
            <Grid item xs={4} sm={2}>
              <TextField select label="Status" fullWidth value={form.status} onChange={set('status')}>
                {STATUSES.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
              </TextField>
            </Grid>
          )}

          <Grid item xs={isEdit ? 4 : 6} sm={isEdit ? 2 : 6}>
            <TextField select label="Priority" fullWidth value={form.priority} onChange={set('priority')}>
              {PRIORITIES.map((p) => <MenuItem key={p.value} value={p.value}>{p.label}</MenuItem>)}
            </TextField>
          </Grid>

          <Grid item xs={isEdit ? 4 : 6} sm={isEdit ? 2 : 6}>
            <TextField select label="Type" fullWidth value={form.issueType} onChange={set('issueType')}>
              {ISSUE_TYPES.map((t) => <MenuItem key={t} value={t}>{t}</MenuItem>)}
            </TextField>
          </Grid>

          <Grid item xs={12}>
            <TextField
              label="Description"
              fullWidth multiline rows={3}
              value={form.description}
              onChange={set('description')}
            />
          </Grid>

          {isEdit && (
            <>
              <Grid item xs={12}>
                <TextField
                  label="Acceptance Criteria"
                  fullWidth multiline rows={3}
                  value={form.acceptanceCriteria}
                  onChange={set('acceptanceCriteria')}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Notes"
                  fullWidth multiline rows={2}
                  value={form.notes}
                  onChange={set('notes')}
                />
              </Grid>
            </>
          )}
        </Grid>

        {isEdit && projectId && (
          <>
            <Divider />
            <Typography variant="subtitle2">Comments</Typography>
            <BeadComments projectId={projectId} beadId={initial.id} />
          </>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={loading}>Cancel</Button>
        <Button variant="contained" onClick={handleSubmit} disabled={loading}>
          {isEdit ? 'Save' : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
