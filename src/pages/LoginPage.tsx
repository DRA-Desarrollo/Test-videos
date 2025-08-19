import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { FaSignInAlt } from 'react-icons/fa';
import { motion } from 'framer-motion';
import SignInForm from '../components/Auth/SignInForm';

const LoginPage: React.FC = () => {
  return (
    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
      <Paper sx={{ maxWidth: 400, mx: 'auto', mt: 6, p: 4, borderRadius: 4, boxShadow: 5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <FaSignInAlt size={28} color="#1976d2" style={{ marginRight: 10 }} />
          <Typography variant="h5" fontWeight={700} color="primary">
            Iniciar Sesión
          </Typography>
        </Box>
        <SignInForm />
      </Paper>
    </motion.div>
  );
};

export default LoginPage;
