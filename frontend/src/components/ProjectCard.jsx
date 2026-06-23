import React, { useEffect, useState } from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActionArea from '@mui/material/CardActionArea';
import CardActions from '@mui/material/CardActions';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';
import DeleteIcon from '@mui/icons-material/Delete';
import FolderIcon from '@mui/icons-material/Folder';
import { useNavigate } from 'react-router-dom';
import { COLOR_SCHEMES } from '../themes';
import { api } from '../api/client';

// Matches StatusChip colour scheme
const STATUS_DOT = {
  open:        { label: 'Open',        color: '#0288d1' }, // info
  in_progress: { label: 'In Progress', color: '#ed6c02' }, // warning
  blocked:     { label: 'Blocked',     color: '#d32f2f' }, // error
  pinned:      { label: 'Pinned',      color: '#9c27b0' }, // secondary
  deferred:    { label: 'Deferred',    color: '#9e9e9e' }, // default
  closed:      { label: 'Closed',      color: '#2e7d32' }, // success
};

const STAT_ORDER = ['open', 'in_progress', 'blocked', 'pinned', 'deferred', 'closed'];

function StatRow({ stats }) {
  if (!stats) {
    return (
      <Box sx={{ display: 'flex', gap: 1, mt: 1.5 }}>
        {[60, 80, 70].map((w, i) => <Skeleton key={i} variant="rounded" width={w} height={18} />)}
      </Box>
    );
  }

  const { byStatus, total } = stats;
  if (total === 0) {
    return (
      <Typography variant="caption" color="text.disabled" sx={{ mt: 1.5, display: 'block' }}>
        No beads yet
      </Typography>
    );
  }

  const entries = STAT_ORDER.filter((s) => byStatus[s] > 0).map((s) => ({
    ...STATUS_DOT[s],
    count: byStatus[s],
    key: s,
  }));

  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1.5 }}>
      {entries.map(({ key, label, color, count }) => (
        <Box key={key} sx={{ display: 'flex', alignItems: 'center', gap: 0.4 }}>
          <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: color, flexShrink: 0 }} />
          <Typography variant="caption" color="text.secondary" lineHeight={1}>
            {count} {label}
          </Typography>
        </Box>
      ))}
    </Box>
  );
}

export default function ProjectCard({ project, onDelete }) {
  const navigate = useNavigate();
  const scheme = COLOR_SCHEMES[project.colorScheme] ?? COLOR_SCHEMES[0];
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.getProjectStats(project.id).then(setStats).catch(() => setStats({ byStatus: {}, total: 0 }));
  }, [project.id]);

  return (
    <Card
      variant="outlined"
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderTop: `4px solid ${scheme.primary}`,
      }}
    >
      <CardActionArea sx={{ flexGrow: 1 }} onClick={() => navigate(`/projects/${project.id}`)}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <Box sx={{ width: 14, height: 14, borderRadius: '50%', background: `linear-gradient(135deg, ${scheme.primary} 50%, ${scheme.secondary} 50%)` }} />
            <Typography variant="caption" color="text.secondary">{scheme.name}</Typography>
          </Box>
          <Typography variant="h6" gutterBottom>{project.name}</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <FolderIcon fontSize="small" color="action" />
            <Typography variant="caption" color="text.secondary" fontFamily="monospace">
              {project.relativePath}
            </Typography>
          </Box>
          <StatRow stats={stats} />
        </CardContent>
      </CardActionArea>
      <CardActions sx={{ justifyContent: 'flex-end', pt: 0 }}>
        <Tooltip title="Remove project">
          <IconButton size="small" color="error" onClick={() => onDelete(project.id)}>
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </CardActions>
    </Card>
  );
}
