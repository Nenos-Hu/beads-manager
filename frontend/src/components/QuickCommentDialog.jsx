import React, { useEffect, useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import { api } from '../api/client';

export default function QuickCommentDialog({ open, bead, projectId, onClose }) {
  const [text, setText]         = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]       = useState('');

  useEffect(() => {
    if (open) { setText(''); setError(''); }
  }, [open]);

  const handleSubmit = async () => {
    if (!text.trim()) return;
    setSubmitting(true);
    setError('');
    try {
      await api.addComment(projectId, bead.id, text.trim());
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>
        Add comment
        <Typography variant="caption" color="text.secondary" fontFamily="monospace" display="block">
          {bead?.id}
        </Typography>
      </DialogTitle>
      <DialogContent>
        {error && <Alert severity="error" sx={{ mb: 1 }}>{error}</Alert>}
        <TextField
          autoFocus
          multiline
          rows={3}
          fullWidth
          placeholder="Comment text… (Enter to submit)"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(); } }}
          sx={{ mt: 1 }}
          disabled={submitting}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={submitting}>Cancel</Button>
        <Button variant="contained" onClick={handleSubmit} disabled={submitting || !text.trim()}>
          {submitting ? <CircularProgress size={16} color="inherit" /> : 'Add'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
