import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Link from '@mui/material/Link';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import Popover from '@mui/material/Popover';
import Tooltip from '@mui/material/Tooltip';
import AddIcon from '@mui/icons-material/Add';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PaletteIcon from '@mui/icons-material/Palette';
import RefreshIcon from '@mui/icons-material/Refresh';
import { buildTheme } from '../themes';
import { api } from '../api/client';
import BeadList from '../components/BeadList';
import BeadForm from '../components/BeadForm';
import BeadDetail from '../components/BeadDetail';
import ColorSchemePicker from '../components/ColorSchemePicker';

export default function ProjectPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [beads, setBeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notInit, setNotInit] = useState(false);

  const [createOpen, setCreateOpen] = useState(false);
  const [selectedBead, setSelectedBead] = useState(null);

  const [paletteAnchor, setPaletteAnchor] = useState(null);

  const loadProject = async () => {
    const projects = await api.getProjects();
    const p = projects.find((x) => x.id === id);
    if (!p) { navigate('/'); return; }
    setProject(p);
    return p;
  };

  const loadBeads = async (p = project) => {
    if (!p) return;
    setLoading(true);
    setError('');
    setNotInit(false);
    try {
      const data = await api.getBeads(p.id);
      setBeads(Array.isArray(data) ? data : []);
    } catch (err) {
      if (err.message.includes('not initialized') || err.message.includes('.beads')) {
        setNotInit(true);
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProject().then((p) => loadBeads(p));
  }, [id]);

  const handleCreate = async (form) => {
    await api.createBead(id, form);
    await loadBeads();
  };

  const handleEdit = async (beadId, form) => {
    await api.updateBead(id, beadId, form);
    await loadBeads();
    setSelectedBead(null);
  };

  const handleClose = async (beadId, reason) => {
    await api.closeBead(id, beadId, reason);
    await loadBeads();
  };

  const handleInitBeads = async () => {
    setLoading(true);
    try {
      await api.initProject(id);
      await loadBeads();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleColorChange = async (schemeId) => {
    const updated = await api.updateProject(id, { colorScheme: schemeId });
    setProject(updated);
    setPaletteAnchor(null);
  };

  if (!project) return null;

  const theme = buildTheme(project.colorScheme);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <IconButton size="small" onClick={() => navigate('/')}><ArrowBackIcon /></IconButton>
          <Breadcrumbs>
            <Link underline="hover" color="inherit" onClick={() => navigate('/')} sx={{ cursor: 'pointer' }}>
              Projects
            </Link>
            <Typography color="text.primary">{project.name}</Typography>
          </Breadcrumbs>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
          <Box>
            <Typography variant="h5" fontWeight={700}>{project.name}</Typography>
            <Typography variant="caption" color="text.secondary" fontFamily="monospace">
              {project.relativePath}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title="Change color scheme">
              <IconButton onClick={(e) => setPaletteAnchor(e.currentTarget)} color="primary">
                <PaletteIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Refresh">
              <IconButton onClick={() => loadBeads()} disabled={loading}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => setCreateOpen(true)} disabled={notInit}>
              New Bead
            </Button>
          </Box>
        </Box>

        <Divider sx={{ mb: 3 }} />

        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        )}

        {!loading && error && (
          <Alert severity="error">{error}</Alert>
        )}

        {!loading && notInit && (
          <Alert
            severity="warning"
            action={
              <Button color="inherit" size="small" onClick={handleInitBeads}>
                Run bd init
              </Button>
            }
          >
            This project has not been initialized with Beads. Click the button to run <code>bd init</code>.
          </Alert>
        )}

        {!loading && !error && !notInit && (
          <BeadList
            beads={beads}
            onSelect={(b) => setSelectedBead(b)}
          />
        )}

        <Popover
          open={Boolean(paletteAnchor)}
          anchorEl={paletteAnchor}
          onClose={() => setPaletteAnchor(null)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <Box sx={{ p: 2 }}>
            <Typography variant="subtitle2" gutterBottom>Color Scheme</Typography>
            <ColorSchemePicker value={project.colorScheme} onChange={handleColorChange} />
          </Box>
        </Popover>

        {createOpen && (
          <BeadForm open={createOpen} onClose={() => setCreateOpen(false)} onSubmit={handleCreate} />
        )}

        <BeadDetail
          bead={selectedBead}
          open={Boolean(selectedBead)}
          onClose={() => setSelectedBead(null)}
          onEdit={handleEdit}
          onDelete={handleClose}
        />
      </Container>
    </ThemeProvider>
  );
}
