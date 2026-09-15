import React, { useEffect, useMemo, useState } from 'react';
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
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Snackbar from '@mui/material/Snackbar';
import AddIcon from '@mui/icons-material/Add';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PaletteIcon from '@mui/icons-material/Palette';
import RefreshIcon from '@mui/icons-material/Refresh';
import DownloadIcon from '@mui/icons-material/Download';
import DataObjectIcon from '@mui/icons-material/DataObject';
import TableChartIcon from '@mui/icons-material/TableChart';
import { buildTheme } from '../themes';
import { api } from '../api/client';
import BeadList, { DEFAULT_STATUSES } from '../components/BeadList';
import BeadForm from '../components/BeadForm';
import BeadDashboard from '../components/BeadDashboard';
import QuickCommentDialog from '../components/QuickCommentDialog';
import ColorSchemePicker from '../components/ColorSchemePicker';

// Data is loaded once on mount and then only re-fetched on explicit user
// action: the Refresh button, or after a create / edit / inline update.
// There is intentionally no polling, SSE, or timer-driven refresh. Every
// fetch spawns a `bd` process on the backend (~0.8 s, ~110 MB), so
// background refreshes were the single biggest resource cost of this app.
export default function ProjectPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [project, setProject]       = useState(null);
  const [beads, setBeads]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastLoaded, setLastLoaded] = useState(null);
  const [error, setError]           = useState('');
  const [notInit, setNotInit]       = useState(false);

  const [createOpen, setCreateOpen]   = useState(false);
  const [editBead, setEditBead]       = useState(null);   // bead being edited
  const [commentBead, setCommentBead] = useState(null);   // bead for quick comment

  const [selectedStatuses, setSelectedStatuses]     = useState(DEFAULT_STATUSES);
  const [selectedPriorities, setSelectedPriorities] = useState([]);

  const [paletteAnchor, setPaletteAnchor] = useState(null);

  const [exportAnchor, setExportAnchor] = useState(null);
  const [exporting, setExporting]       = useState(false);
  const [exportError, setExportError]   = useState('');

  const handleExport = async (format) => {
    setExportAnchor(null);
    setExporting(true);
    setExportError('');
    try {
      await api.exportBeads(id, format);
    } catch (err) {
      setExportError(err.message);
    } finally {
      setExporting(false);
    }
  };

  const handleStatusCardClick = (status) => {
    setSelectedStatuses((prev) =>
      prev.length === 1 && prev[0] === status ? DEFAULT_STATUSES : [status]
    );
  };

  const handlePriorityCardClick = (priority) => {
    setSelectedPriorities((prev) =>
      prev.length === 1 && prev[0] === priority ? [] : [priority]
    );
  };

  const loadProject = async () => {
    const projects = await api.getProjects();
    const p = projects.find((x) => x.id === id);
    if (!p) { navigate('/'); return; }
    setProject(p);
    return p;
  };

  // `silent` keeps the current list on screen (button spinner only) instead of
  // swapping the whole page for a progress indicator.
  const loadBeads = async (p, silent = false) => {
    const target = p ?? project;
    if (!target) return;
    if (silent) setRefreshing(true); else setLoading(true);
    setError('');
    setNotInit(false);
    try {
      const data = await api.getBeads(target.id);
      setBeads(Array.isArray(data) ? data : []);
      setLastLoaded(new Date());
    } catch (err) {
      if (err.message.includes('not initialized') || err.message.includes('.beads')) {
        setNotInit(true);
      } else {
        setError(err.message);
      }
    } finally {
      if (silent) setRefreshing(false); else setLoading(false);
    }
  };

  useEffect(() => {
    loadProject().then((p) => loadBeads(p));
  }, [id]);

  const handleRefresh = () => loadBeads(undefined, true);

  const handleCreate = async (form) => {
    await api.createBead(id, form);
    await loadBeads(undefined, true);
  };

  const handleEditSubmit = async (form) => {
    await api.updateBead(id, editBead.id, {
      title:               form.title,
      description:         form.description,
      priority:            form.priority,
      status:              form.status,
      issueType:           form.issueType,
      acceptanceCriteria:  form.acceptanceCriteria,
      notes:               form.notes,
    });
    await loadBeads(undefined, true);
  };

  // Optimistic update, then replace the row with the bead the backend returns
  // (one `bd update` instead of `bd update` + `bd list`). Falls back to a full
  // reload only if the response is not a bead or the update failed.
  const handleInlineUpdate = async (beadId, changes) => {
    setBeads((prev) => prev.map((b) => b.id === beadId ? { ...b, ...changes } : b));
    try {
      const updated = await api.updateBead(id, beadId, changes);
      if (updated && updated.id === beadId) {
        setBeads((prev) => prev.map((b) => b.id === beadId ? updated : b));
      } else {
        await loadBeads(undefined, true);
      }
    } catch {
      await loadBeads(undefined, true);
    }
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

  // buildTheme() creates a fresh MUI theme object; without memoization every
  // state change (typing in the search box, toggling a filter) would rebuild it
  // and force Emotion to regenerate the whole stylesheet.
  const theme = useMemo(
    () => buildTheme(project?.colorScheme),
    [project?.colorScheme],
  );

  if (!project) return null;

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
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {lastLoaded && (
              <Typography variant="caption" color="text.secondary" sx={{ mr: 0.5 }}>
                Loaded {lastLoaded.toLocaleTimeString()}
              </Typography>
            )}
            <Tooltip title="Change color scheme">
              <IconButton onClick={(e) => setPaletteAnchor(e.currentTarget)} color="primary">
                <PaletteIcon />
              </IconButton>
            </Tooltip>
            <Button
              variant="outlined"
              startIcon={refreshing ? <CircularProgress size={16} color="inherit" /> : <RefreshIcon />}
              onClick={handleRefresh}
              disabled={loading || refreshing}
            >
              Refresh
            </Button>
            <Button
              variant="outlined"
              startIcon={exporting ? <CircularProgress size={16} color="inherit" /> : <DownloadIcon />}
              onClick={(e) => setExportAnchor(e.currentTarget)}
              disabled={loading || notInit || exporting}
            >
              Export
            </Button>
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

        {!loading && error && <Alert severity="error">{error}</Alert>}

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
          <>
            <BeadDashboard
              beads={beads}
              selectedStatuses={selectedStatuses}
              onStatusClick={handleStatusCardClick}
              selectedPriorities={selectedPriorities}
              onPriorityClick={handlePriorityCardClick}
            />
            <BeadList
              beads={beads}
              onEdit={setEditBead}
              onQuickComment={setCommentBead}
              onUpdate={handleInlineUpdate}
              selectedStatuses={selectedStatuses}
              onStatusesChange={setSelectedStatuses}
              selectedPriorities={selectedPriorities}
              onPrioritiesChange={setSelectedPriorities}
            />
          </>
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

        <Menu
          open={Boolean(exportAnchor)}
          anchorEl={exportAnchor}
          onClose={() => setExportAnchor(null)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <MenuItem onClick={() => handleExport('json')}>
            <ListItemIcon><DataObjectIcon fontSize="small" /></ListItemIcon>
            <ListItemText primary="Export as JSON" secondary="All beads, all fields" />
          </MenuItem>
          <MenuItem onClick={() => handleExport('csv')}>
            <ListItemIcon><TableChartIcon fontSize="small" /></ListItemIcon>
            <ListItemText primary="Export as CSV" secondary="Opens in Excel / Sheets" />
          </MenuItem>
        </Menu>

        <Snackbar
          open={Boolean(exportError)}
          autoHideDuration={6000}
          onClose={() => setExportError('')}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert severity="error" onClose={() => setExportError('')} variant="filled">
            Export failed: {exportError}
          </Alert>
        </Snackbar>

        {createOpen && (
          <BeadForm open={createOpen} onClose={() => setCreateOpen(false)} onSubmit={handleCreate} />
        )}

        {editBead && (
          <BeadForm
            open={Boolean(editBead)}
            onClose={() => setEditBead(null)}
            onSubmit={handleEditSubmit}
            initial={editBead}
            projectId={id}
          />
        )}

        <QuickCommentDialog
          open={Boolean(commentBead)}
          bead={commentBead}
          projectId={id}
          onClose={() => setCommentBead(null)}
        />
      </Container>
    </ThemeProvider>
  );
}
