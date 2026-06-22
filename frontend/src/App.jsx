import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import HomePage from './pages/HomePage';
import ProjectPage from './pages/ProjectPage';

const baseTheme = createTheme({
  typography: { fontFamily: 'Inter, sans-serif' },
  palette: { mode: 'light' },
});

export default function App() {
  return (
    <ThemeProvider theme={baseTheme}>
      <CssBaseline />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/projects/:id" element={<ProjectPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </ThemeProvider>
  );
}
