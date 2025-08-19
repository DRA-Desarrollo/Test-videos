import React from 'react';
import { Box, Typography, Card, CardContent, Button, Divider } from '@mui/material';
import { FaPlayCircle, FaCheckCircle, FaInfoCircle, FaUserGraduate, FaRocket } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const AboutCourse: React.FC = () => {
  const navigate = useNavigate();
  const handleStart = () => {
    if (window.history.length > 1) navigate(-1);
    else navigate('/');
  };
  return (
  <Box sx={{ maxWidth: 800, mx: 'auto', mt: 5, p: 4, bgcolor: 'background.paper', borderRadius: 4, boxShadow: 6 }}>
    <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
      <Typography variant="h3" gutterBottom fontWeight={700} color="primary">
        <FaRocket style={{ marginRight: 12, verticalAlign: 'middle' }} /> Curso React Quiz Pro
      </Typography>
      <Divider sx={{ mb: 3 }} />
      <Typography variant="h5" gutterBottom>
        <FaInfoCircle style={{ marginRight: 8, color: '#1976d2' }} /> ¿De qué se trata?
      </Typography>
      <Typography variant="body1" paragraph>
        Este curso te lleva paso a paso por los fundamentos y técnicas avanzadas de React, integrando tests interactivos y progresivos para asegurar tu aprendizaje. Cada video desbloquea el siguiente módulo tras superar el test correspondiente.
      </Typography>
      <Typography variant="h5" gutterBottom>
        <FaUserGraduate style={{ marginRight: 8, color: '#43a047' }} /> Metodología y Evaluación
      </Typography>
      <Typography variant="body1" paragraph>
        Aprendes viendo videos y resolviendo tests. Debes alcanzar al menos el 70% en cada test para avanzar. El progreso se muestra con barras visuales y no puedes repetir tests ya aprobados.
      </Typography>
      <Typography variant="h5" gutterBottom>
        <FaPlayCircle style={{ marginRight: 8, color: '#fbc02d' }} /> Tecnologías Utilizadas
      </Typography>
      <Typography variant="body1" paragraph>
        React, Zustand, Supabase, Material UI, Framer Motion, React Icons. Backend serverless y base de datos en la nube.
      </Typography>
      <Typography variant="h5" gutterBottom>
        <FaCheckCircle style={{ marginRight: 8, color: '#0288d1' }} /> Flujo de Trabajo
      </Typography>
      <Typography variant="body1" paragraph>
        1. Te registras y accedes al curso.
        2. Ves el video y realizas el test.
        3. Si apruebas, desbloqueas el siguiente video.
        4. Tu avance y puntaje quedan registrados.
      </Typography>
      <Divider sx={{ my: 3 }} />
      <Box sx={{ textAlign: 'center' }}>
        <Button variant="contained" color="primary" size="large" onClick={handleStart} startIcon={<FaRocket />}>
          ¡Comenzar ahora!
        </Button>
      </Box>
    </motion.div>
  </Box>
  );
};

export default AboutCourse;
