import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Box, Typography, Button, Alert, Paper } from '@mui/material';
import { useVideoStore } from '../store/videoStore';
import { useAuthStore } from '../store/authStore';
import { motion } from 'framer-motion';
import Celebration from '../components/Test/Celebration';
import DiplomaCelebration from '../components/Test/DiplomaCelebration';
import Navbar from '../components/Navbar';

interface TestPageProps {
  mode: 'light' | 'dark';
  onToggleMode: () => void;
}

const TestPage: React.FC<TestPageProps> = ({ mode, onToggleMode }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { state } = location;
  const { videoId } = useParams<{ videoId: string }>();
  
  // Intentar obtener datos del state primero, luego de sessionStorage
  const videoTitle = state?.videoTitle || sessionStorage.getItem('testVideoTitle') || 'Test';
  const questions = state?.questions || JSON.parse(sessionStorage.getItem('testQuestions') || '[]');
  
  const { user } = useAuthStore();
  const { postUserTestAnswers, userTestCompletions } = useVideoStore();
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<{ success: boolean; score: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const firstOptionRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!questions || questions.length === 0) {
      navigate('/'); // Redirigir si no hay preguntas
    }
    firstOptionRef.current?.focus();
  }, [questions, navigate]);

  const completion = userTestCompletions.find(c => c.video_id === videoId);
  const testPassed = completion?.passed;
  const allPerfect = userTestCompletions.filter(c => c.scorePercent === 100).length === 12;

  const handleChange = (qid: string, value: string) => {
    setAnswers(prev => ({ ...prev, [qid]: value }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    const res = await postUserTestAnswers(user?.id || videoId, videoId, answers);
    setResult(res);
    setLoading(false);
    if (res.score === 100) {
      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 5000);
    }
  };

  const handleBack = () => {
    navigate(-1); // Volver a la página anterior
  };

  if (testPassed) {
    return (
      <>
        <Navbar mode={mode} onToggleMode={onToggleMode} showBackButton onBack={handleBack} />
        <Box sx={{ p: 3, maxWidth: 600, mx: 'auto', mt: 4 }}>
          <Alert severity="success" sx={{ mt: 2 }}>
            ¡Test aprobado! Puntaje: {completion?.scorePercent ?? '--'}%
          </Alert>
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
            <Button onClick={handleBack} variant="outlined">
              Volver al video
            </Button>
          </Box>
        </Box>
      </>
    );
  }

  return (
    <>
      <Navbar mode={mode} onToggleMode={onToggleMode} showBackButton onBack={handleBack} />
      
      <Box sx={{ p: 3, maxWidth: 800, mx: 'auto', mt: 2 }}>
        <Paper sx={{ p: 3, borderRadius: 2 }}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            {showCelebration && <Celebration />}
            {allPerfect && <DiplomaCelebration />}
            
            <Typography variant="h5" gutterBottom sx={{ mb: 3, fontWeight: 'bold' }}>
              Test: {videoTitle}
            </Typography>
            
            {questions && questions.length > 0 ? (
              <Box sx={{ mt: 2 }}>
                <Typography variant="h6" gutterBottom>Selecciona las respuestas</Typography>
                {questions.map((q: any, qIndex: number) => (
                  <Box key={q.id} sx={{ mb: 3 }}>
                    <Typography id={`q-${q.id}-label`} variant="subtitle1" sx={{ mb: 2, fontWeight: 500 }}>
                      {q.question_text}
                    </Typography>
                    <Box role="radiogroup" aria-labelledby={`q-${q.id}-label`} sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                      {q.options.map((opt: string, idx: number) => {
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
                              p: 1.5,
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
                
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, mt: 3 }}>
                  <Button
                    variant="contained"
                    color="success"
                    disabled={loading || Object.keys(answers).length !== questions.length}
                    onClick={handleSubmit}
                    sx={{ minWidth: 150 }}
                  >
                    {loading ? 'Enviando...' : 'Enviar respuestas'}
                  </Button>
                  
                  {result && (
                    <Alert severity={result.success ? 'success' : 'error'} sx={{ width: '100%' }}>
                      {result.success
                        ? `¡Test aprobado! Puntaje: ${result.score}%`
                        : `No alcanzaste el puntaje mínimo. Puntaje: ${result.score}%`}
                    </Alert>
                  )}
                  
                  <Button onClick={handleBack} variant="outlined" sx={{ mt: 1 }}>
                    Volver al video
                  </Button>
                </Box>
              </Box>
            ) : (
              <Typography color="error">No se pudieron cargar las preguntas del test.</Typography>
            )}
          </motion.div>
        </Paper>
      </Box>
    </>
  );
};

export default TestPage;