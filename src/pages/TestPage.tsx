import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  Button, 
  Alert, 
  Paper, 
  Card, 
  Stack, 
  Container,
  CircularProgress
} from '@mui/material';
import { useVideoStore } from '../store/videoStore';
import { useAuthStore } from '../store/authStore';
import { motion } from 'framer-motion';
import Celebration from '../components/Test/Celebration';
import DiplomaCelebration from '../components/Test/DiplomaCelebration';
import Navbar from '../components/Navbar';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import CloseIcon from '@mui/icons-material/Close';

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
      
      {/* Título anclado con estilo Material UI */}
      <Paper 
        square
        elevation={1}
        sx={{ 
          position: 'sticky', 
          top: 0, 
          zIndex: 1000,
          py: 2,
          px: 3,
          backgroundColor: 'background.paper'
        }}
      >
        <Container maxWidth="md">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Typography variant="h5" component="h1" sx={{ fontWeight: 'bold', textAlign: 'center' }}>
              Test: {videoTitle}
            </Typography>
          </motion.div>
        </Container>
      </Paper>
      
      {/* Contenido principal scrollable */}
      <Box sx={{ 
        px: 2, 
        py: 1,
        pb: 10, // Espacio para el pie anclado
        minHeight: 'calc(100vh - 140px)',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <Container maxWidth="md" sx={{ flex: 1 }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {showCelebration && <Celebration />}
            {allPerfect && <DiplomaCelebration />}
            
            <Card elevation={2} sx={{ p: 3 }}>
              {questions && questions.length > 0 ? (
                <Stack spacing={3}>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    <Typography variant="h6" color="text.secondary">
                      Selecciona las respuestas
                    </Typography>
                  </motion.div>
                  
                  {questions.map((q: any, qIndex: number) => (
                    <motion.div
                      key={q.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: 0.1 * qIndex }}
                    >
                      <Card variant="outlined" sx={{ p: 2, backgroundColor: 'background.default' }}>
                        <Typography 
                          id={`q-${q.id}-label`} 
                          variant="subtitle1" 
                          sx={{ mb: 2, fontWeight: 500 }}
                        >
                          {q.question_text}
                        </Typography>
                        
                        <Stack role="radiogroup" aria-labelledby={`q-${q.id}-label`} spacing={1.5}>
                          {q.options.map((opt: string, idx: number) => {
                            const checked = answers[q.id] === opt;
                            return (
                              <motion.div
                                key={idx}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                              >
                                <Paper
                                  onClick={() => handleChange(q.id, opt)}
                                  sx={{
                                    cursor: 'pointer',
                                    p: 1.5,
                                    borderRadius: 1.5,
                                    border: '2px solid',
                                    borderColor: checked ? 'success.main' : 'divider',
                                    bgcolor: checked ? 'success.light' : 'background.paper',
                                    transition: 'all 0.2s ease',
                                    '&:hover': { 
                                      borderColor: 'primary.light', 
                                      bgcolor: checked ? 'success.light' : 'action.hover' 
                                    }
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
                                  <Stack direction="row" alignItems="center" spacing={1.5}>
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
                                    <Typography variant="body1" sx={{ textAlign: 'left', flex: 1 }}>
                                      {opt}
                                    </Typography>
                                  </Stack>
                                </Paper>
                              </motion.div>
                            );
                          })}
                        </Stack>
                      </Card>
                    </motion.div>
                  ))}
                  
                  {/* Botón de enviar y mensaje de resultado */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * questions.length + 0.2 }}
                  >
                    <Stack spacing={2} alignItems="center">
                      <Button
                        variant="contained"
                        color="success"
                        disabled={loading || Object.keys(answers).length !== questions.length}
                        onClick={handleSubmit}
                        size="large"
                        sx={{ minWidth: 200 }}
                        startIcon={loading ? <CircularProgress size={20} color="inherit" /> : undefined}
                      >
                        {loading ? 'Enviando...' : 'Enviar respuestas'}
                      </Button>
                      
                      {result && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.3 }}
                        >
                          <Alert 
                            severity={result.success ? 'success' : 'error'} 
                            sx={{ width: '100%' }}
                            icon={result.success ? <CheckCircleIcon /> : <ErrorIcon />}
                          >
                            <Typography variant="subtitle1" fontWeight="bold">
                              {result.success
                                ? `¡Test aprobado! Puntaje: ${result.score}%`
                                : `No alcanzaste el puntaje mínimo. Puntaje: ${result.score}%`}
                            </Typography>
                          </Alert>
                        </motion.div>
                      )}
                    </Stack>
                  </motion.div>
                </Stack>
              ) : (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography color="error" variant="h6">
                    No se pudieron cargar las preguntas del test.
                  </Typography>
                </Box>
              )}
            </Card>
          </motion.div>
        </Container>
      </Box>
      
      {/* Pie anclado con Material UI */}
      <Paper 
        square
        elevation={3}
        sx={{ 
          position: 'fixed', 
          bottom: 0, 
          left: 0, 
          right: 0, 
          py: 2,
          zIndex: 1000,
          borderTop: 1,
          borderColor: 'divider'
        }}
      >
        <Container maxWidth="md">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              <Button 
                onClick={handleBack} 
                variant="outlined" 
                size="large"
                startIcon={<CloseIcon />}
                sx={{ minWidth: 150 }}
              >
                Cerrar
              </Button>
            </Box>
          </motion.div>
        </Container>
      </Paper>
    </>
  );
};

export default TestPage;