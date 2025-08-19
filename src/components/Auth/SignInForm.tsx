import React, { useState } from 'react';
import { signIn, signUp } from '../../services/auth';
import { useAuthStore } from '../../store/authStore';
import { useNavigate } from 'react-router-dom';
import { Box, TextField, Button, Stack, Alert } from '@mui/material';

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
    <form onSubmit={handleSubmit} noValidate>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      <Stack spacing={2}>
        <TextField
          label="Email"
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          fullWidth
        />
        <TextField
          label="Contraseña"
          type="password"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          fullWidth
        />
        <Button type="submit" variant="contained" disabled={loading} fullWidth>
          {loading ? 'Cargando...' : 'Iniciar Sesión'}
        </Button>
      </Stack>
    </form>
  );
};

export default SignInForm;
