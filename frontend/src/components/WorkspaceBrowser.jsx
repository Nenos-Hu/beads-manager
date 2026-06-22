import React, { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import FolderIcon from '@mui/icons-material/Folder';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { api } from '../api/client';

export default function WorkspaceBrowser({ onSelect }) {
  const [currentPath, setCurrentPath] = useState('');
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  const browse = async (p) => {
    setLoading(true);
    try {
      const data = await api.browseWorkspace(p);
      setCurrentPath(data.current);
      setEntries(data.entries);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { browse(''); }, []);

  const goUp = () => {
    const parts = currentPath.split('/').filter(Boolean);
    parts.pop();
    browse(parts.join('/'));
  };

  const enter = (name) => {
    const next = currentPath === '.' ? name : `${currentPath}/${name}`;
    browse(next);
  };

  const select = (name) => {
    const rel = currentPath === '.' ? name : `${currentPath}/${name}`;
    onSelect(rel);
  };

  return (
    <Box>
      <Typography variant="caption" color="text.secondary" sx={{ pl: 1 }}>
        workspace/{currentPath}
      </Typography>
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
          <CircularProgress size={24} />
        </Box>
      ) : (
        <List dense sx={{ maxHeight: 300, overflow: 'auto', border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
          {currentPath && currentPath !== '.' && (
            <ListItemButton onClick={goUp}>
              <ListItemIcon><ArrowBackIcon /></ListItemIcon>
              <ListItemText primary=".." />
            </ListItemButton>
          )}
          {entries.length === 0 && (
            <ListItemText primary="No folders found" sx={{ px: 2, color: 'text.secondary' }} />
          )}
          {entries.map((entry) => (
            <ListItemButton
              key={entry.name}
              onClick={() => enter(entry.name)}
              onDoubleClick={() => select(entry.name)}
              sx={{ '&:hover .select-hint': { opacity: 1 } }}
            >
              <ListItemIcon>
                <FolderIcon color={entry.hasBeads ? 'primary' : 'inherit'} />
              </ListItemIcon>
              <ListItemText
                primary={entry.name}
                secondary={entry.hasBeads ? 'beads initialized' : null}
              />
              <Typography
                className="select-hint"
                variant="caption"
                color="primary"
                sx={{ opacity: 0, transition: 'opacity 0.15s' }}
              >
                double-click to select
              </Typography>
            </ListItemButton>
          ))}
        </List>
      )}
    </Box>
  );
}
