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
import TypeChip from './TypeChip';
import BeadForm from './BeadForm';
import BeadComments from './BeadComments';
import CopyIconButton from './CopyIconButton';

export default function BeadDetail({ bead, open, onClose, onEdit, onDelete, projectId }) {
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [reason, setReason] = useState('');

  if (!bead) return null;

  const handleEdit = async (form) => {
    await onEdit(bead.id, form);
  };

  const handleDelete = async () => {
    await onDelete(bead.id, reason || 'Closed via Beads Manager');
    setDeleteOpen(false);
    onClose();
  };

  return (
    <>
      <Drawer anchor="right" open={open} onClose={onClose} PaperProps={{ sx: { width: { xs: '100%', sm: 480 } } }}>
        <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', height: '100%' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Typography variant="caption" color="text.secondary" fontFamily="monospace">{bead.id}</Typography>
              <CopyIconButton text={bead.id} size="small" />
            </Box>
            <IconButton size="small" onClick={onClose}><CloseIcon /></IconButton>
          </Box>

          <Typography variant="h6" sx={{ mb: 1 }}>{bead.title}</Typography>

          <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
            <StatusChip status={bead.status} />
            <PriorityBadge priority={bead.priority} />
            {bead.issue_type && <TypeChip type={bead.issue_type} />}
          </Stack>

          <Divider sx={{ mb: 2 }} />

          {bead.description && (
            <>
              <Typography variant="subtitle2" gutterBottom>Description</Typography>
              <Typography variant="body2" sx={{ mb: 2, whiteSpace: 'pre-wrap' }}>{bead.description}</Typography>
            </>
          )}

          {bead.acceptance_criteria && (
            <>
              <Typography variant="subtitle2" gutterBottom>Acceptance Criteria</Typography>
              <Typography variant="body2" sx={{ mb: 2, whiteSpace: 'pre-wrap' }}>{bead.acceptance_criteria}</Typography>
            </>
          )}

          {bead.notes && (
            <>
              <Typography variant="subtitle2" gutterBottom>Notes</Typography>
              <Typography variant="body2" sx={{ mb: 2, whiteSpace: 'pre-wrap' }}>{bead.notes}</Typography>
            </>
          )}

          <Divider sx={{ mb: 2 }} />
          <BeadComments projectId={projectId} beadId={bead.id} />

          <Box sx={{ mt: 'auto' }}>
            <Divider sx={{ mb: 2 }} />
            {bead.created_at && (
              <Typography variant="caption" color="text.secondary" display="block">
                Created: {new Date(bead.created_at).toLocaleString()}
              </Typography>
            )}
            {bead.updated_at && (
              <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 2 }}>
                Updated: {new Date(bead.updated_at).toLocaleString()}
              </Typography>
            )}
            <Stack direction="row" spacing={1}>
              <Button startIcon={<EditIcon />} variant="outlined" onClick={() => setEditOpen(true)}>
                Edit
              </Button>
              <Button startIcon={<DeleteIcon />} color="error" variant="outlined" onClick={() => setDeleteOpen(true)}
                disabled={bead.status === 'closed'}>
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
            This will mark <strong>{bead.title}</strong> as closed.
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
