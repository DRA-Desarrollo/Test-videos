import React from 'react';
import { Box, Typography, Card, CardContent, Button, Divider } from '@mui/material';
import { FaPlayCircle, FaCheckCircle, FaInfoCircle, FaUserGraduate, FaRocket, FaInfinity } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const AboutCourse: React.FC = () => {
  const navigate = useNavigate();
  const handleStart = () => {
    navigate('/');
  };
  return (
  <Box sx={{ maxWidth: 800, mx: 'auto', mt: 5, p: 4, bgcolor: 'background.paper', borderRadius: 4, boxShadow: 6 }}>
    <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
      <Typography variant="h3" gutterBottom fontWeight={700} color="primary">
        <FaRocket style={{ marginRight: 12, verticalAlign: 'middle' }} /> Plataforma de Cursos Interactivos
      </Typography>
      <Divider sx={{ mb: 3 }} />
      <Typography variant="h5" gutterBottom>
        <FaInfoCircle style={{ marginRight: 8, color: '#1976d2' }} /> ¿De qué se trata?
      </Typography>
      <Typography variant="body1" paragraph>
        Esta plataforma, originalmente diseñada para un solo curso, ha sido refactorizada para convertirse en un sistema de aprendizaje multi-curso. Ahora puedes explorar una variedad de temas, cada uno con su propio conjunto de videos y tests interactivos diseñados para asegurar tu aprendizaje.
      </Typography>
      <Typography variant="h5" gutterBottom>
        <FaUserGraduate style={{ marginRight: 8, color: '#43a047' }} /> Metodología y Evaluación
      </Typography>
      <Typography variant="body1" paragraph>
        El aprendizaje se basa en un ciclo de ver videos y resolver tests. Debes alcanzar al menos un 70% en cada test para desbloquear el siguiente video del curso. Tu progreso se guarda y se muestra visualmente para que siempre sepas cuál es tu siguiente paso.
      </Typography>
      <Typography variant="h5" gutterBottom>
        <FaPlayCircle style={{ marginRight: 8, color: '#fbc02d' }} /> Tecnologías y Colaboración
      </Typography>
      <Typography variant="body1" paragraph>
        La aplicación está construida con tecnologías modernas como React, Zustand para el manejo de estado, Supabase como backend serverless, y Material UI para una interfaz de usuario elegante. La refactorización para soportar múltiples cursos fue realizada en colaboración con la IA **grok-4**.
      </Typography>
      <Typography variant="h5" gutterBottom>
        <FaCheckCircle style={{ marginRight: 8, color: '#0288d1' }} /> Flujo de Trabajo del Usuario
      </Typography>
      <Typography variant="body1" paragraph>
        1. Regístrate e inicia sesión en la plataforma.
        2. Explora la lista de cursos disponibles y selecciona el que te interese.
        3. Dentro de un curso, mira el primer video y luego realiza el test asociado.
        4. Si apruebas, el siguiente video se desbloqueará automáticamente.
        5. Continúa este ciclo hasta completar el curso. ¡Tu avance siempre queda registrado!
      </Typography>
      <Divider sx={{ my: 3 }} />
      <Box sx={{ textAlign: 'center' }}>
        <Button variant="contained" color="primary" size="large" onClick={handleStart} startIcon={<FaInfinity />}>
          Explorar Cursos
        </Button>
      </Box>
    </motion.div>
  </Box>
  );
};

export default AboutCourse;
