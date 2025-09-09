import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import HomePage from './pages/HomePage';
import NotFoundPage from './pages/NotFoundPage';
import AboutCourse from './pages/AboutCourse';
import TestPage from './pages/TestPage';
import AdminPage from './pages/AdminPage';
import { useAuthStore } from './store/authStore';
import './App.css';
import CourseListPage from './pages/CourseListPage';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';

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

  const [themeMode, setThemeMode] = useState<'light' | 'dark'>('light');

  const toggleThemeMode = () => {
    setThemeMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
  };

  const theme = createTheme({
    palette: {
      mode: themeMode,
      background: {
        default: themeMode === 'light' ? '#ffffff' : '#121212', // Fondo claro/oscuro
        paper: themeMode === 'light' ? '#f5f5f5' : '#1e1e1e', // Fondo de tarjetas
      },
    },  
  });

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<RegisterPage />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <CourseListPage mode={themeMode} onToggleMode={toggleThemeMode} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/course/:courseId"
            element={
              <ProtectedRoute>
                <HomePage mode={themeMode} onToggleMode={toggleThemeMode} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/test/:videoId"
            element={
              <ProtectedRoute>
                <TestPage mode={themeMode} onToggleMode={toggleThemeMode} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminPage />
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
