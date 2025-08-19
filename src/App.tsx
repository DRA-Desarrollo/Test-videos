import React, { useEffect, useMemo, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline, useMediaQuery } from '@mui/material';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import HomePage from './pages/HomePage';
import NotFoundPage from './pages/NotFoundPage';
import CourseListPage from './pages/CourseListPage';
import { useAuthStore } from './store/authStore';
import './App.css';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import AboutCourse from './pages/AboutCourse';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading } = useAuthStore();

  if (loading) {
    return <div>Cargando autenticación...</div>; // O un spinner de carga
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

function App() {
  const initializeAuth = useAuthStore((state) => state.initializeAuth);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  const prefersDark = useMediaQuery('(prefers-color-scheme: dark)');
  const [mode, setMode] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('theme-mode') as 'light' | 'dark' | null;
    return saved ?? (prefersDark ? 'dark' : 'light');
  });
  useEffect(() => {
    const saved = localStorage.getItem('theme-mode');
    if (!saved) setMode(prefersDark ? 'dark' : 'light');
  }, [prefersDark]);
  useEffect(() => {
    localStorage.setItem('theme-mode', mode);
  }, [mode]);
  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: mode,
          primary: { main: '#1976d2' },
          success: { main: '#2e7d32' }
        },
        shape: { borderRadius: 10 },
        components: {
          MuiDialog: {
            defaultProps: { fullWidth: true },
          },
        },
      }),
    [mode]
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Navbar mode={mode} onToggleMode={() => setMode(prev => (prev === 'light' ? 'dark' : 'light'))} />
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<RegisterPage />} />
          <Route
            path="/course/:courseOrder"
            element={
              <ProtectedRoute>
                <HomePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <CourseListPage />
              </ProtectedRoute>
            }
          />
          <Route path="/about" element={<AboutCourse />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
