import React, { useEffect, useRef, useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import SendIcon from '@mui/icons-material/Send';
import { api } from '../api/client';

function initials(name) {
  return (name || '?').split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);
}

export default function BeadComments({ projectId, beadId }) {
  const [comments, setComments] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [text, setText]         = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]       = useState('');
  const bottomRef = useRef(null);

  const load = async () => {
    setLoading(true);
    try {
      const data = await api.getComments(projectId, beadId);
      setComments(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [beadId]);

  useEffect(() => {
    if (!loading) bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [comments, loading]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    setSubmitting(true);
    setError('');
    try {
      const comment = await api.addComment(projectId, beadId, text.trim());
      setComments((c) => [...c, comment]);
      setText('');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      <Typography variant="subtitle2">Comments</Typography>

      {loading && <CircularProgress size={20} sx={{ alignSelf: 'center', my: 1 }} />}

      {!loading && comments.length === 0 && (
        <Typography variant="caption" color="text.secondary">No comments yet.</Typography>
      )}

      {!loading && comments.length > 0 && (
        <Stack spacing={1.5} sx={{ maxHeight: 260, overflow: 'auto', pr: 0.5 }}>
          {comments.map((c) => (
            <Box key={c.id} sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
              <Avatar sx={{ width: 28, height: 28, fontSize: 11, bgcolor: 'primary.main' }}>
                {initials(c.author)}
              </Avatar>
              <Box sx={{ flex: 1 }}>
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'baseline' }}>
                  <Typography variant="caption" fontWeight={600}>{c.author}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {new Date(c.created_at).toLocaleString()}
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>{c.text}</Typography>
              </Box>
            </Box>
          ))}
          <div ref={bottomRef} />
        </Stack>
      )}

      {error && <Alert severity="error" sx={{ py: 0 }}>{error}</Alert>}

      <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', gap: 1, alignItems: 'flex-end', mt: 0.5 }}>
        <TextField
          size="small"
          multiline
          maxRows={4}
          placeholder="Add a comment…"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(e); } }}
          sx={{ flex: 1 }}
          disabled={submitting}
        />
        <Button
          type="submit"
          variant="contained"
          size="small"
          disabled={submitting || !text.trim()}
          sx={{ minWidth: 0, px: 1.5, py: 0.9 }}
        >
          {submitting ? <CircularProgress size={16} color="inherit" /> : <SendIcon fontSize="small" />}
        </Button>
      </Box>
    </Box>
  );
}
