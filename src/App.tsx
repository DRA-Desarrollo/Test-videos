import React, { useEffect, useMemo, useState, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline, useMediaQuery } from '@mui/material';
import { useAuthStore } from './store/authStore';
import './App.css';

const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const HomePage = lazy(() => import('./pages/HomePage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));
const CourseListPage = lazy(() => import('./pages/CourseListPage'));
const AboutCourse = lazy(() => import('./pages/AboutCourse'));

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
        <Suspense fallback={<div>Cargando...</div>}>
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
        </Suspense>
      </Router>
    </ThemeProvider>
  );
}

export default App;
