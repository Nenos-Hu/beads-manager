import React, { useState } from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActionArea from '@mui/material/CardActionArea';
import CardActions from '@mui/material/CardActions';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Box from '@mui/material/Box';
import DeleteIcon from '@mui/icons-material/Delete';
import FolderIcon from '@mui/icons-material/Folder';
import { useNavigate } from 'react-router-dom';
import { COLOR_SCHEMES } from '../themes';

export default function ProjectCard({ project, onDelete }) {
  const navigate = useNavigate();
  const scheme = COLOR_SCHEMES[project.colorScheme] ?? COLOR_SCHEMES[0];

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
