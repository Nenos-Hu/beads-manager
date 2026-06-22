import React, { useEffect, useState } from 'react';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import AddIcon from '@mui/icons-material/Add';
import ProjectCard from '../components/ProjectCard';
import ColorSchemePicker from '../components/ColorSchemePicker';
import WorkspaceBrowser from '../components/WorkspaceBrowser';
import { api } from '../api/client';

export default function HomePage() {
  const [projects, setProjects] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ name: '', relativePath: '', colorScheme: 0 });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const load = async () => {
    const data = await api.getProjects();
    setProjects(data);
  };

  useEffect(() => { load(); }, []);

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const openDialog = () => {
    setForm({ name: '', relativePath: '', colorScheme: 0 });
    setError('');
    setDialogOpen(true);
  };

  const handleAdd = async () => {
    if (!form.name.trim() || !form.relativePath.trim()) {
      setError('Name and folder are required');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await api.addProject(form);
      await load();
      setDialogOpen(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this project from Beads Manager? (files are not deleted)')) return;
    await api.deleteProject(id);
    await load();
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4 }}>
        <Box>
          <Typography variant="h4" fontWeight={700}>Beads Manager</Typography>
          <Typography color="text.secondary">Manage your project beads</Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openDialog}>
          Add Project
        </Button>
      </Box>

      {projects.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 10 }}>
          <Typography color="text.secondary" gutterBottom>No projects yet.</Typography>
          <Button variant="outlined" startIcon={<AddIcon />} onClick={openDialog}>Add your first project</Button>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {projects.map((p) => (
            <Grid item key={p.id} xs={12} sm={6} md={4}>
              <ProjectCard project={p} onDelete={handleDelete} />
            </Grid>
          ))}
        </Grid>
      )}

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Add Project</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <TextField
            label="Project name"
            fullWidth
            required
            value={form.name}
            onChange={set('name')}
            sx={{ mb: 2, mt: 1 }}
          />

          <Typography variant="subtitle2" gutterBottom>Select folder from workspace</Typography>
          <WorkspaceBrowser onSelect={(path) => {
            setForm((f) => ({ ...f, relativePath: path }));
          }} />
          {form.relativePath && (
            <Alert severity="info" sx={{ mt: 1 }}>
              Selected: <strong>{form.relativePath}</strong>
            </Alert>
          )}
          {!form.relativePath && (
            <TextField
              label="Or type relative path manually"
              fullWidth
              value={form.relativePath}
              onChange={set('relativePath')}
              placeholder="e.g. my-project or frontend/my-app"
              sx={{ mt: 1 }}
              size="small"
            />
          )}

          <Typography variant="subtitle2" sx={{ mt: 2 }} gutterBottom>Color scheme</Typography>
          <ColorSchemePicker
            value={form.colorScheme}
            onChange={(id) => setForm((f) => ({ ...f, colorScheme: id }))}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)} disabled={loading}>Cancel</Button>
          <Button variant="contained" onClick={handleAdd} disabled={loading}>Add</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
