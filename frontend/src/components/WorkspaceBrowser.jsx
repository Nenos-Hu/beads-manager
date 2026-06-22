import React, { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Button from '@mui/material/Button';
import FolderIcon from '@mui/icons-material/Folder';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SearchIcon from '@mui/icons-material/Search';
import { api } from '../api/client';

export default function WorkspaceBrowser({ onSelect }) {
  const [currentPath, setCurrentPath] = useState('.');
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  const browse = async (p) => {
    setLoading(true);
    try {
      const data = await api.browseWorkspace(p === '.' ? '' : p);
      setCurrentPath(data.current);
      setEntries(data.entries);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { browse('.'); }, []);

  const goUp = () => {
    const parts = currentPath.split('/').filter(Boolean);
    parts.pop();
    browse(parts.length ? parts.join('/') : '.');
  };

  const enter = (name) => {
    const next = currentPath === '.' ? name : `${currentPath}/${name}`;
    browse(next);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
        <Typography variant="caption" color="text.secondary" fontFamily="monospace">
          workspace/{currentPath === '.' ? '' : currentPath}
        </Typography>
        <Button
          size="small"
          variant="outlined"
          startIcon={<SearchIcon />}
          onClick={() => onSelect(currentPath)}
        >
          Scan this folder
        </Button>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
          <CircularProgress size={24} />
        </Box>
      ) : (
        <List dense sx={{ maxHeight: 220, overflow: 'auto', border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
          {currentPath !== '.' && (
            <ListItemButton onClick={goUp}>
              <ListItemIcon><ArrowBackIcon fontSize="small" /></ListItemIcon>
              <ListItemText primary=".." primaryTypographyProps={{ variant: 'body2' }} />
            </ListItemButton>
          )}
          {entries.length === 0 && (
            <ListItemText
              primary="No subfolders found"
              sx={{ px: 2, py: 1, color: 'text.secondary' }}
              primaryTypographyProps={{ variant: 'body2' }}
            />
          )}
          {entries.map((entry) => (
            <ListItemButton key={entry.name} onClick={() => enter(entry.name)}>
              <ListItemIcon>
                <FolderIcon fontSize="small" color={entry.hasBeads ? 'primary' : 'action'} />
              </ListItemIcon>
              <ListItemText
                primary={entry.name}
                secondary={entry.hasBeads ? 'beads initialized' : null}
                primaryTypographyProps={{ variant: 'body2' }}
                secondaryTypographyProps={{ variant: 'caption' }}
              />
            </ListItemButton>
          ))}
        </List>
      )}
    </Box>
  );
}
