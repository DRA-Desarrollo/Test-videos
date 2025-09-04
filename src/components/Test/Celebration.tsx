import React from 'react';
import { motion } from 'framer-motion';
import { Box } from '@mui/material';

const confettiColors = ['#fbc02d', '#43a047', '#1976d2', '#e91e63', '#ff9800', '#00bcd4'];

const ConfettiPiece = ({ x, y, color }: { x: number; y: number; color: string }) => (
  <motion.div
    initial={{ opacity: 1, y: 0 }}
    animate={{ opacity: 0, y: 100 }}
    transition={{ duration: 2 }}
    style={{
      position: 'absolute',
      left: `${x}%`,
      top: `${y}%`,
      width: 12,
      height: 12,
      background: color,
      borderRadius: 3,
      zIndex: 9999,
    }}
  />
);

const Celebration: React.FC = () => (
  <Box sx={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', pointerEvents: 'none', zIndex: 9999 }}>
    {[...Array(40)].map((_, i) => (
      <ConfettiPiece
        key={i}
        x={Math.random() * 100}
        y={Math.random() * 40}
        color={confettiColors[Math.floor(Math.random() * confettiColors.length)]}
      />
    ))}
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1.2, opacity: 1 }}
      transition={{ duration: 0.7 }}
      style={{
        position: 'absolute',
        left: '50%',
        top: '30%',
        transform: 'translate(-50%, -50%)',
        fontSize: 48,
        fontWeight: 700,
        color: '#e91e63',
        textShadow: '2px 2px 8px #fff',
      }}
    >
      ¡100% logrado!
    </motion.div>
  </Box>
);

export default Celebration;