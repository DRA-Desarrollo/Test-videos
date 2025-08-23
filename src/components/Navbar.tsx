import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box, IconButton, Tooltip } from '@mui/material';
import { FaHome, FaInfoCircle, FaSignInAlt, FaSignOutAlt, FaUserCircle } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { MdDarkMode, MdLightMode } from 'react-icons/md';
import { useAuthStore } from '../store/authStore';
import { useVideoStore } from '../store/videoStore';
import { FaArrowLeft } from 'react-icons/fa';

interface NavbarProps {
  mode?: 'light' | 'dark';
  onToggleMode?: () => void;
  showBackButton?: boolean;
  onBack?: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ mode = 'light', onToggleMode, showBackButton = false, onBack }) => {
  const { user, signOut } = useAuthStore();
  const { course } = useVideoStore();

  return (
    <AppBar position="static" color="primary" sx={{ mb: 4 }}>
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 700 }}>
          {course ? course.name : 'Cursos'}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Tooltip title={mode === 'light' ? 'Cambiar a modo oscuro' : 'Cambiar a modo claro'}>
            <IconButton color="inherit" onClick={onToggleMode} aria-label="toggle theme mode">
              {mode === 'light' ? <MdDarkMode /> : <MdLightMode />}
            </IconButton>
          </Tooltip>
          <Button color="inherit" component={Link} to="/" startIcon={<FaHome />}>
            Dashboard
          </Button>
          <Button color="inherit" component={Link} to="/about" startIcon={<FaInfoCircle />}>
            Info Curso
          </Button>
          {user ? (
            <>
              <Button color="inherit" startIcon={<FaUserCircle />} disabled sx={{ textTransform: 'none', opacity: 0.85 }}>
                {user.email ?? 'Usuario'}
              </Button>
              {showBackButton ? (
                <Button color="inherit" onClick={onBack} startIcon={<FaArrowLeft />}>
                  Volver
                </Button>
              ) : (
                <Button color="inherit" onClick={signOut} startIcon={<FaSignOutAlt />}>
                  Salir
                </Button>
              )}
            </>
          ) : (
            <Button color="inherit" component={Link} to="/login" startIcon={<FaSignInAlt />}>
              Login
            </Button>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
