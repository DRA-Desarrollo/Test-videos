import React from 'react';
import LinearProgress from '@mui/material/LinearProgress';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

interface CourseProgressBarProps {
  current: number;
  total: number;
  percent: number;
}

export const CourseProgressBar: React.FC<CourseProgressBarProps> = ({ current, total, percent }) => (
  <Box sx={{ width: '100%', mb: 2 }}>
    <Typography variant="body2" color="text.secondary" gutterBottom>
      Progreso del curso: {current} de {total} videos ({percent}%)
    </Typography>
    <LinearProgress variant="determinate" value={percent} sx={{ height: 10, borderRadius: 5 }} />
  </Box>
);

interface TestProgressBarProps {
  percent: number;
}

export const TestProgressBar: React.FC<TestProgressBarProps> = ({ percent }) => (
  <Box sx={{ width: '100%', mb: 2 }}>
    <Typography variant="body2" color="text.secondary" gutterBottom>
      Progreso del test: {percent}%
    </Typography>
    <LinearProgress variant="determinate" value={percent} sx={{ height: 10, borderRadius: 5, bgcolor: '#e0e0e0' }} />
  </Box>
);