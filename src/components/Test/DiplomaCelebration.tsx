import React from 'react';
import { motion } from 'framer-motion';
import { Box, Typography, Paper } from '@mui/material';
import { FaAward, FaUserGraduate } from 'react-icons/fa';

const DiplomaCelebration: React.FC = () => (
  <Box sx={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', pointerEvents: 'none', zIndex: 99999 }}>
    {/* Fuegos artificiales */}
    {[...Array(8)].map((_, i) => (
      <motion.div
        key={i}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1.5, opacity: 1 }}
        transition={{ duration: 1.2, delay: i * 0.2 }}
        style={{
          position: 'absolute',
          left: `${10 + i * 10}%`,
          top: `${20 + (i % 2) * 30}%`,
          width: 32,
          height: 32,
          borderRadius: '50%',
          background: ['#fbc02d', '#43a047', '#1976d2', '#e91e63', '#ff9800', '#00bcd4'][i % 6],
          boxShadow: '0 0 24px 8px #fff',
        }}
      />
    ))}
    {/* Diploma animado */}
    <motion.div
      initial={{ y: -200, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 1.2, delay: 1.5 }}
      style={{ position: 'absolute', left: '50%', top: '40%', transform: 'translate(-50%, -50%)' }}
    >
      <Paper sx={{ p: 4, borderRadius: 6, boxShadow: 8, textAlign: 'center', minWidth: 320 }}>
        <FaAward size={48} color="#fbc02d" style={{ marginBottom: 12 }} />
        <Typography variant="h4" fontWeight={700} color="primary" gutterBottom>
          ¡Diploma de React Quiz Pro!
        </Typography>
        <Typography variant="h6" color="success.main" gutterBottom>
          <FaUserGraduate style={{ marginRight: 8, verticalAlign: 'middle' }} />
          Felicitaciones, lograste el 100% en todos los tests
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Has demostrado excelencia y dedicación en cada módulo del curso. ¡Eres un verdadero profesional de React!
        </Typography>
      </Paper>
    </motion.div>
  </Box>
);

export default DiplomaCelebration;