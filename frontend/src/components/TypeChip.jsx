import React from 'react';
import Chip from '@mui/material/Chip';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import BugReportIcon from '@mui/icons-material/BugReport';
import BuildIcon from '@mui/icons-material/Build';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import ScienceIcon from '@mui/icons-material/Science';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import GavelIcon from '@mui/icons-material/Gavel';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';

const TYPE_MAP = {
  task:     { icon: <CheckCircleOutlineIcon />, color: 'info',      label: 'Task' },
  feature:  { icon: <AutoAwesomeIcon />,        color: 'primary',   label: 'Feature' },
  bug:      { icon: <BugReportIcon />,          color: 'error',     label: 'Bug' },
  chore:    { icon: <BuildIcon />,              color: 'default',   label: 'Chore' },
  epic:     { icon: <RocketLaunchIcon />,       color: 'secondary', label: 'Epic' },
  spike:    { icon: <ScienceIcon />,            color: 'warning',   label: 'Spike' },
  story:    { icon: <MenuBookIcon />,           color: 'success',   label: 'Story' },
  decision: { icon: <GavelIcon />,              color: 'default',   label: 'Decision' },
};

export default function TypeChip({ type, size = 'small' }) {
  const def = TYPE_MAP[type] ?? { icon: <HelpOutlineIcon />, color: 'default', label: type ?? '—' };
  return (
    <Chip
      icon={def.icon}
      label={def.label}
      color={def.color}
      size={size}
      variant="outlined"
    />
  );
}
