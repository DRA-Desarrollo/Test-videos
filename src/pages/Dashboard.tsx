import React from 'react';
import { Box, Typography, Paper, Divider } from '@mui/material';
import { FaChartBar, FaVideo, FaCheckCircle } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { useVideoStore } from '../store/videoStore';
import { CourseProgressBar, TestProgressBar } from '../components/ProgressBars';

const Dashboard: React.FC = () => {
  const { getCourseProgress, currentVideoId, getTestProgress } = useVideoStore();
  const courseProgress = getCourseProgress();
  const testPercent = currentVideoId ? getTestProgress(currentVideoId) : 0;

  return (
    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
      <Paper sx={{ maxWidth: 600, mx: 'auto', mt: 4, p: 4, borderRadius: 4, boxShadow: 5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <FaChartBar size={32} color="#1976d2" style={{ marginRight: 12 }} />
          <Typography variant="h4" fontWeight={700} color="primary">
            Tu progreso
          </Typography>
        </Box>
        <CourseProgressBar {...courseProgress} />
        <Divider sx={{ my: 2 }} />
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <FaVideo size={28} color="#fbc02d" style={{ marginRight: 10 }} />
          <Typography variant="h6" fontWeight={500}>
            Test actual
          </Typography>
        </Box>
        <TestProgressBar percent={testPercent} />
        {testPercent >= 70 && (
          <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
            <FaCheckCircle size={24} color="#43a047" style={{ marginRight: 8 }} />
            <Typography color="success.main" variant="subtitle1">
              ¡Test aprobado! Puedes avanzar al siguiente video.
            </Typography>
          </Box>
        )}
      </Paper>
    </motion.div>
  );
};

export default Dashboard;
