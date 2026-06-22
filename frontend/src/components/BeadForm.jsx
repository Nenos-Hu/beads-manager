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

const ISSUE_TYPES = ['task', 'feature', 'bug', 'chore', 'epic', 'spike', 'story', 'decision'];
const PRIORITIES = [
  { value: 0, label: '0 – Critical' },
  { value: 1, label: '1 – High' },
  { value: 2, label: '2 – Medium' },
  { value: 3, label: '3 – Low' },
  { value: 4, label: '4 – Backlog' },
];

const DEFAULTS = { title: '', description: '', priority: 2, issueType: 'task' };

export default function BeadForm({ open, onClose, onSubmit, initial }) {
  const [form, setForm] = useState(initial ? {
    title: initial.title || '',
    description: initial.description || '',
    priority: initial.priority ?? 2,
    issueType: initial.issue_type || 'task',
  } : DEFAULTS);
  const [error, setError] = useState('');
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
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{initial ? 'Edit Bead' : 'New Bead'}</DialogTitle>
      <DialogContent>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <Grid container spacing={2} sx={{ mt: 0.5 }}>
          <Grid item xs={12}>
            <TextField
              label="Title"
              fullWidth
              required
              value={form.title}
              onChange={set('title')}
              disabled={!!initial}
              helperText={initial ? 'Title cannot be changed via the web UI' : ''}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Description"
              fullWidth
              multiline
              rows={4}
              value={form.description}
              onChange={set('description')}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              select
              label="Priority"
              fullWidth
              value={form.priority}
              onChange={set('priority')}
            >
              {PRIORITIES.map((p) => (
                <MenuItem key={p.value} value={p.value}>{p.label}</MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={6}>
            <TextField
              select
              label="Type"
              fullWidth
              value={form.issueType}
              onChange={set('issueType')}
              disabled={!!initial}
              helperText={initial ? 'Type cannot be changed' : ''}
            >
              {ISSUE_TYPES.map((t) => (
                <MenuItem key={t} value={t}>{t}</MenuItem>
              ))}
            </TextField>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>Cancel</Button>
        <Button variant="contained" onClick={handleSubmit} disabled={loading}>
          {initial ? 'Save' : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
