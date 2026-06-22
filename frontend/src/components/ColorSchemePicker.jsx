import React from 'react';
import Box from '@mui/material/Box';
import Tooltip from '@mui/material/Tooltip';
import { COLOR_SCHEMES } from '../themes';

export default function ColorSchemePicker({ value, onChange }) {
  return (
    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', my: 1 }}>
      {COLOR_SCHEMES.map((scheme) => (
        <Tooltip key={scheme.id} title={scheme.name} arrow>
          <Box
            onClick={() => onChange(scheme.id)}
            sx={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              cursor: 'pointer',
              background: `linear-gradient(135deg, ${scheme.primary} 50%, ${scheme.secondary} 50%)`,
              border: value === scheme.id ? '3px solid #000' : '3px solid transparent',
              boxShadow: value === scheme.id ? '0 0 0 2px rgba(0,0,0,0.3)' : 'none',
              transition: 'transform 0.15s',
              '&:hover': { transform: 'scale(1.2)' },
            }}
          />
        </Tooltip>
      ))}
    </Box>
  );
}
