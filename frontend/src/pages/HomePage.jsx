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
import Divider from '@mui/material/Divider';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Checkbox from '@mui/material/Checkbox';
import CircularProgress from '@mui/material/CircularProgress';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddIcon from '@mui/icons-material/Add';
import FolderSpecialIcon from '@mui/icons-material/FolderSpecial';
import ProjectCard from '../components/ProjectCard';
import ColorSchemePicker from '../components/ColorSchemePicker';
import WorkspaceBrowser from '../components/WorkspaceBrowser';
import { api } from '../api/client';

// Steps: 'browse' → 'discovered'
export default function HomePage() {
  const [projects, setProjects] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Browse step
  const [step, setStep] = useState('browse');
  const [scannedPath, setScannedPath] = useState('');
  const [discovering, setDiscovering] = useState(false);
  const [discoverError, setDiscoverError] = useState('');

  // Discovered step
  const [discovered, setDiscovered] = useState([]);  // { relativePath, name, checked, customName }
  const [colorScheme, setColorScheme] = useState(0);

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  const load = async () => {
    const data = await api.getProjects();
    setProjects(data);
  };

  useEffect(() => { load(); }, []);

  const openDialog = () => {
    setStep('browse');
    setScannedPath('');
    setDiscovered([]);
    setDiscoverError('');
    setSaveError('');
    setColorScheme(0);
    setDialogOpen(true);
  };

  const handleScan = async (folderPath) => {
    setScannedPath(folderPath);
    setDiscovering(true);
    setDiscoverError('');
    try {
      const result = await api.discoverProjects(folderPath === '.' ? '' : folderPath);
      const existingPaths = new Set(projects.map((p) => p.relativePath));
      const items = (result.projects || [])
        .filter((p) => !existingPaths.has(p.relativePath))
        .map((p) => ({ ...p, checked: true, customName: p.name }));

      if (items.length === 0) {
        setDiscoverError(
          result.projects?.length > 0
            ? 'All found projects are already added.'
            : 'No beads projects found in this folder (up to 3 levels deep).',
        );
        return;
      }

      setDiscovered(items);
      setStep('discovered');
    } catch (err) {
      setDiscoverError(err.message);
    } finally {
      setDiscovering(false);
    }
  };

  const toggleItem = (idx) => {
    setDiscovered((d) => d.map((item, i) => i === idx ? { ...item, checked: !item.checked } : item));
  };

  const setItemName = (idx, name) => {
    setDiscovered((d) => d.map((item, i) => i === idx ? { ...item, customName: name } : item));
  };

  const handleAdd = async () => {
    const toAdd = discovered.filter((d) => d.checked);
    if (toAdd.length === 0) { setSaveError('Select at least one project.'); return; }
    setSaving(true);
    setSaveError('');
    try {
      for (const item of toAdd) {
        await api.addProject({
          name: item.customName || item.name,
          relativePath: item.relativePath,
          colorScheme,
        });
      }
      await load();
      setDialogOpen(false);
    } catch (err) {
      setSaveError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this project from Beads Manager? (files are not deleted)')) return;
    await api.deleteProject(id);
    await load();
  };

  const checkedCount = discovered.filter((d) => d.checked).length;

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
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {step === 'discovered' && (
              <IconButton size="small" onClick={() => { setStep('browse'); setDiscoverError(''); }} sx={{ mr: 0.5 }}>
                <ArrowBackIcon fontSize="small" />
              </IconButton>
            )}
            {step === 'browse' ? 'Select a folder to scan' : 'Projects found'}
          </Box>
        </DialogTitle>

        <DialogContent>
          {step === 'browse' && (
            <>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Navigate to any folder and click <strong>Scan this folder</strong> — the app will find all beads projects inside it (up to 3 levels deep).
              </Typography>
              <WorkspaceBrowser onSelect={handleScan} />
              {discovering && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2 }}>
                  <CircularProgress size={16} />
                  <Typography variant="body2" color="text.secondary">Scanning…</Typography>
                </Box>
              )}
              {discoverError && <Alert severity="warning" sx={{ mt: 2 }}>{discoverError}</Alert>}
            </>
          )}

          {step === 'discovered' && (
            <>
              <Alert severity="success" sx={{ mb: 2 }} icon={<FolderSpecialIcon />}>
                Found <strong>{discovered.length}</strong> beads project{discovered.length !== 1 ? 's' : ''} in{' '}
                <Typography component="span" variant="body2" fontFamily="monospace">{scannedPath}</Typography>
              </Alert>

              <List dense disablePadding sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, mb: 2 }}>
                {discovered.map((item, idx) => (
                  <React.Fragment key={item.relativePath}>
                    {idx > 0 && <Divider component="li" />}
                    <ListItem alignItems="flex-start" sx={{ gap: 1, py: 1.5 }}>
                      <ListItemIcon sx={{ minWidth: 36, mt: 0.5 }}>
                        <Checkbox
                          edge="start"
                          checked={item.checked}
                          onChange={() => toggleItem(idx)}
                          size="small"
                        />
                      </ListItemIcon>
                      <ListItemText
                        disableTypography
                        primary={
                          <TextField
                            size="small"
                            label="Name"
                            value={item.customName}
                            onChange={(e) => setItemName(idx, e.target.value)}
                            fullWidth
                            sx={{ mb: 0.5 }}
                          />
                        }
                        secondary={
                          <Chip
                            label={item.relativePath}
                            size="small"
                            variant="outlined"
                            sx={{ fontFamily: 'monospace', fontSize: '0.7rem' }}
                          />
                        }
                      />
                    </ListItem>
                  </React.Fragment>
                ))}
              </List>

              <Divider sx={{ mb: 2 }} />
              <Typography variant="subtitle2" gutterBottom>Color scheme for all added projects</Typography>
              <ColorSchemePicker value={colorScheme} onChange={setColorScheme} />

              {saveError && <Alert severity="error" sx={{ mt: 2 }}>{saveError}</Alert>}
            </>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setDialogOpen(false)} disabled={saving}>Cancel</Button>
          {step === 'discovered' && (
            <Button
              variant="contained"
              onClick={handleAdd}
              disabled={saving || checkedCount === 0}
              startIcon={saving ? <CircularProgress size={16} /> : <AddIcon />}
            >
              Add {checkedCount > 0 ? checkedCount : ''} project{checkedCount !== 1 ? 's' : ''}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Container>
  );
}
