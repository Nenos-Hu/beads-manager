import React, { useState } from 'react';
import Drawer from '@mui/material/Drawer';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import StatusChip from './StatusChip';
import PriorityBadge from './PriorityBadge';
import BeadForm from './BeadForm';

export default function BeadDetail({ bead, open, onClose, onEdit, onDelete }) {
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [reason, setReason] = useState('');

  if (!bead) return null;

  const handleEdit = async (form) => {
    await onEdit(bead.ID, form);
  };

  const handleDelete = async () => {
    await onDelete(bead.ID, reason || 'Closed via Beads Manager');
    setDeleteOpen(false);
    onClose();
  };

  return (
    <>
      <Drawer anchor="right" open={open} onClose={onClose} PaperProps={{ sx: { width: { xs: '100%', sm: 480 } } }}>
        <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', height: '100%' }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="caption" color="text.secondary">{bead.ID}</Typography>
            <IconButton size="small" onClick={onClose}><CloseIcon /></IconButton>
          </Box>

          <Typography variant="h6" sx={{ mb: 1 }}>{bead.Title}</Typography>

          <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
            <StatusChip status={bead.Status} />
            <PriorityBadge priority={bead.Priority} />
            {bead.IssueType && (
              <Typography variant="caption" sx={{ border: '1px solid', borderColor: 'divider', px: 1, py: 0.3, borderRadius: 1, alignSelf: 'center' }}>
                {bead.IssueType}
              </Typography>
            )}
          </Stack>

          <Divider sx={{ mb: 2 }} />

          {bead.Description && (
            <>
              <Typography variant="subtitle2" gutterBottom>Description</Typography>
              <Typography variant="body2" sx={{ mb: 2, whiteSpace: 'pre-wrap' }}>{bead.Description}</Typography>
            </>
          )}

          {bead.AcceptanceCriteria && (
            <>
              <Typography variant="subtitle2" gutterBottom>Acceptance Criteria</Typography>
              <Typography variant="body2" sx={{ mb: 2, whiteSpace: 'pre-wrap' }}>{bead.AcceptanceCriteria}</Typography>
            </>
          )}

          {bead.Notes && (
            <>
              <Typography variant="subtitle2" gutterBottom>Notes</Typography>
              <Typography variant="body2" sx={{ mb: 2, whiteSpace: 'pre-wrap' }}>{bead.Notes}</Typography>
            </>
          )}

          <Box sx={{ mt: 'auto' }}>
            <Divider sx={{ mb: 2 }} />
            {bead.CreatedAt && (
              <Typography variant="caption" color="text.secondary" display="block">
                Created: {new Date(bead.CreatedAt).toLocaleString()}
              </Typography>
            )}
            {bead.UpdatedAt && (
              <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 2 }}>
                Updated: {new Date(bead.UpdatedAt).toLocaleString()}
              </Typography>
            )}
            <Stack direction="row" spacing={1}>
              <Button startIcon={<EditIcon />} variant="outlined" onClick={() => setEditOpen(true)}>
                Edit
              </Button>
              <Button startIcon={<DeleteIcon />} color="error" variant="outlined" onClick={() => setDeleteOpen(true)}
                disabled={bead.Status === 'closed'}>
                Close
              </Button>
            </Stack>
          </Box>
        </Box>
      </Drawer>

      {editOpen && (
        <BeadForm
          open={editOpen}
          onClose={() => setEditOpen(false)}
          onSubmit={handleEdit}
          initial={bead}
        />
      )}

      <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Close bead</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            This will mark <strong>{bead.Title}</strong> as closed.
          </Typography>
          <TextField
            label="Reason (optional)"
            fullWidth
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteOpen(false)}>Cancel</Button>
          <Button color="error" variant="contained" onClick={handleDelete}>Close Bead</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
