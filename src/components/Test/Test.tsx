import React, { useState, useRef, useEffect } from 'react';
import { Box, Typography, Button, Alert } from '@mui/material';
import { useVideoStore } from '../../store/videoStore';
import { useAuthStore } from '../../store/authStore';
import { motion } from 'framer-motion';
import Celebration from './Celebration';
import DiplomaCelebration from './DiplomaCelebration';

interface TestProps {
  userId: string;
  videoId: string;
  questions: Array<{
    id: string;
    question_text: string;
    options: string[];
  }>;
}

const Test: React.FC<TestProps> = ({ userId, videoId, questions }) => {
  const { postUserTestAnswers, userTestCompletions } = useVideoStore();
  const { user } = useAuthStore();
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<{ success: boolean; score: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const firstOptionRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    firstOptionRef.current?.focus();
  }, []);

  const completion = userTestCompletions.find(c => c.video_id === videoId);
  const testPassed = completion?.passed;
  const allPerfect = userTestCompletions.filter(c => c.scorePercent === 100).length === 12;

  const handleChange = (qid: string, value: string) => {
    setAnswers(prev => ({ ...prev, [qid]: value }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    const res = await postUserTestAnswers(user?.id || userId, videoId, answers);
    setResult(res);
    setLoading(false);
    if (res.score === 100) {
      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 5000);
    }
  };

  if (testPassed) {
    return (
      <Alert severity="success" sx={{ mt: 2 }}>
        ¡Test aprobado! Puntaje: {completion?.scorePercent ?? '--'}%
      </Alert>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      {showCelebration && <Celebration />}
      {allPerfect && <DiplomaCelebration />}
      <Box sx={{ mt: 1 }}>
        <Typography variant="h6" gutterBottom>Selecciona las respuestas</Typography>
        {questions.map((q, qIndex) => (
          <Box key={q.id} sx={{ mb: 2 }}>
            <Typography id={`q-${q.id}-label`} variant="subtitle1" sx={{ mb: 1 }}>{q.question_text}</Typography>
            <Box role="radiogroup" aria-labelledby={`q-${q.id}-label`} sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {q.options.map((opt, idx) => {
                const checked = answers[q.id] === opt;
                return (
                  <Box
                    key={idx}
                    onClick={() => handleChange(q.id, opt)}
                    sx={{
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1.5,
                      p: 1,
                      borderRadius: 1.5,
                      border: '1px solid',
                      borderColor: checked ? 'success.light' : 'divider',
                      bgcolor: checked ? 'success.light' : 'background.paper',
                      transition: 'all 0.2s ease',
                      '&:hover': { borderColor: 'primary.light', bgcolor: checked ? 'success.light' : 'action.hover' }
                    }}
                    role="radio"
                    aria-checked={checked}
                    tabIndex={checked ? 0 : (idx === 0 ? 0 : -1)}
                    ref={qIndex === 0 && idx === 0 ? firstOptionRef : undefined}
                    onKeyDown={(e) => {
                      if (e.key === ' ' || e.key === 'Enter') {
                        e.preventDefault();
                        handleChange(q.id, opt);
                      } else if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
                        e.preventDefault();
                        const next = (e.currentTarget.nextElementSibling as HTMLElement | null);
                        next?.focus();
                      } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
                        e.preventDefault();
                        const prev = (e.currentTarget.previousElementSibling as HTMLElement | null);
                        prev?.focus();
                      }
                    }}
                  >
                    <motion.div
                      style={{
                        width: 22,
                        height: 22,
                        borderRadius: '50%',
                        border: '2px solid',
                        display: 'grid',
                        placeItems: 'center'
                      }}
                      animate={checked
                        ? { backgroundColor: '#2e7d32', borderColor: '#2e7d32' }
                        : { backgroundColor: 'transparent', borderColor: 'rgba(0,0,0,0.38)' }}
                      transition={{ duration: 0.2 }}
                    >
                      <motion.svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        initial={false}
                      >
                        <motion.path
                          d="M5 13l4 4L19 7"
                          fill="none"
                          stroke={checked ? '#fff' : 'transparent'}
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          animate={{ pathLength: checked ? 1 : 0 }}
                          transition={{ duration: 0.25, ease: 'easeInOut' }}
                        />
                      </motion.svg>
                    </motion.div>
                    <Typography variant="body1" sx={{ textAlign: 'left' }}>
                      {opt}
                    </Typography>
                  </Box>
                );
              })}
            </Box>
          </Box>
        ))}
        <Button
          variant="contained"
          color="success"
          disabled={loading || Object.keys(answers).length !== questions.length}
          onClick={handleSubmit}
          sx={{ mt: 2 }}
        >
          Enviar respuestas
        </Button>
        {result && (
          <Alert severity={result.success ? 'success' : 'error'} sx={{ mt: 2 }}>
            {result.success
              ? `¡Test aprobado! Puntaje: ${result.score}%`
              : `No alcanzaste el puntaje mínimo. Puntaje: ${result.score}%`}
          </Alert>
        )}
      </Box>
    </motion.div>
  );
};

export default Test;