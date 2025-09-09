import React, { useState } from 'react';
import { signIn, signUp } from '../../services/auth';
import { useAuthStore } from '../../store/authStore';
import { useNavigate } from 'react-router-dom';
import { Box, TextField, Button, Stack, Alert, Paper, Typography } from '@mui/material';
import { FaSignInAlt } from 'react-icons/fa';

const SignInForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const initializeAuth = useAuthStore((s) => s.initializeAuth);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await signIn(email, password);
    } catch (err: unknown) {
      // Si falla el login, intentamos registrar y luego loguear
      try {
        await signUp(email, password);
        await signIn(email, password);
      } catch (err2: unknown) {
        if (err2 instanceof Error) {
          setError(err2.message);
        } else {
          setError('Error desconocido');
        }
        setLoading(false);
        return;
      }
    }

    try {
      await initializeAuth();
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper
      elevation={8}
      sx={{
        width: '100%',
        maxWidth: 400,
        p: 4,
        borderRadius: 4,
        backgroundColor: 'white',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
        border: '1px solid rgba(0, 0, 0, 0.1)'
      }}
    >
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography 
          variant="h5" 
          sx={{ 
            color: 'primary.main',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 1
          }}
        >
          <FaSignInAlt />
          Iniciar Sesión
        </Typography>
      </Box>

      <form onSubmit={handleSubmit} noValidate>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        <Stack spacing={3}>
          <TextField
            label="Email *"
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            fullWidth
            variant="outlined"
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 3,
                '& fieldset': {
                  borderColor: 'rgba(0, 0, 0, 0.23)',
                },
                '&:hover fieldset': {
                  borderColor: 'rgba(0, 0, 0, 0.87)',
                },
                '&.Mui-focused fieldset': {
                  borderColor: 'primary.main',
                },
              },
            }}
          />
          
          <TextField
            label="Contraseña *"
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            fullWidth
            variant="outlined"
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 3,
                '& fieldset': {
                  borderColor: 'rgba(0, 0, 0, 0.23)',
                },
                '&:hover fieldset': {
                  borderColor: 'rgba(0, 0, 0, 0.87)',
                },
                '&.Mui-focused fieldset': {
                  borderColor: 'primary.main',
                },
              },
            }}
          />

          <Button
            type="submit"
            variant="contained"
            disabled={loading}
            fullWidth
            sx={{
              py: 1.5,
              borderRadius: 3,
              textTransform: 'uppercase',
              fontWeight: 600,
              fontSize: '0.875rem',
              letterSpacing: '0.5px',
              backgroundColor: 'primary.main',
              '&:hover': {
                backgroundColor: 'primary.dark',
              },
              '&:disabled': {
                backgroundColor: 'rgba(0, 0, 0, 0.12)',
              }
            }}
          >
            {loading ? 'Cargando...' : 'Iniciar Sesión'}
          </Button>
        </Stack>
      </form>

      <Box sx={{ textAlign: 'center', mt: 3 }}>
        <Typography variant="caption" color="text.secondary">
          ¿No tienes cuenta? Se creará automáticamente al iniciar sesión
        </Typography>
      </Box>
    </Paper>
  );
};

export default SignInForm;
