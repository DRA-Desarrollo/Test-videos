import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { useNavigate, useParams } from 'react-router-dom';
import VideoCard from '../components/Video/VideoCard';
import VideoSidebar from '../components/Video/VideoSidebar';
import { CourseProgressBar, TestProgressBar } from '../components/ProgressBars';
import { useVideoStore } from '../store/videoStore';
import { Drawer, IconButton, Button, Box, Modal, Typography, Stack } from '@mui/material';
import { FaBars, FaStepBackward, FaStepForward, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import Navbar from '../components/Navbar';
import Test from '../components/Test/Test';
import { getQuestionsByVideoId } from '../services/questions';

interface HomePageProps {
  mode: 'light' | 'dark';
  onToggleMode: () => void;
}

const HomePage: React.FC<HomePageProps> = ({mode, onToggleMode }) => {
  const { courseId } = useParams<{ courseId: string }>();
  const { user, loading } = useAuthStore();
  const { getCourseProgress, getTestProgress, fetchCourse, course: currentCourse, loadingCourse, errorCourse, currentVideoId, videos, userTestCompletions, setCurrentVideo } = useVideoStore();
  const courseProgress = getCourseProgress();
  const testPercent = currentVideoId ? getTestProgress(currentVideoId) : 0;
  const [open, setOpen] = React.useState(false);
  const [testModalOpen, setTestModalOpen] = useState(false);
  const [questions, setQuestions] = useState<any[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const navigate = useNavigate();

  const currentVideo = React.useMemo(() => {
    if (!videos || videos.length === 0) return null;
    return videos.find(v => v.id === currentVideoId) || videos[0];
  }, [videos, currentVideoId]);

  const completion = currentVideo ? userTestCompletions.find(c => c.video_id === currentVideo.id) : undefined;
  const isLast = currentVideo ? videos.length > 0 && currentVideo.order === Math.max(...videos.map(v => v.order)) : false;
  const allVideosCompleted = videos.length > 0 && userTestCompletions.filter(c => c.passed).length === videos.length;
  
  // Lógica para deshabilitar el botón "Hacer Test"
  const disableTest = !currentVideo || !!completion?.passed || (allVideosCompleted && isLast);

  // Lógica para la navegación entre videos
  const passedVideos = videos.filter(v => {
    const completion = userTestCompletions.find(c => c.video_id === v.id);
    return completion?.passed;
  });

  const firstPendingVideo = videos.find(v => {
    const completion = userTestCompletions.find(c => c.video_id === v.id);
    return !completion?.passed;
  });

  const navigableVideos = [...passedVideos, ...(firstPendingVideo ? [firstPendingVideo] : [])].sort((a, b) => a.order - b.order);

  const getCurrentIndex = () => {
    return navigableVideos.findIndex(v => v.id === currentVideo?.id);
  };

  const canNavigateToFirst = getCurrentIndex() > 0;
  const canNavigateToPrevious = getCurrentIndex() > 0;
  const canNavigateToNext = getCurrentIndex() < navigableVideos.length - 1;
  const canNavigateToLast = getCurrentIndex() < navigableVideos.length - 1;

  const navigateToVideo = (video: any) => {
    setCurrentVideo(video.id);
  };

  const navigateToFirst = () => {
    if (canNavigateToFirst) {
      setCurrentVideo(navigableVideos[0].id);
    }
  };

  const navigateToPrevious = () => {
    const currentIndex = getCurrentIndex();
    if (currentIndex > 0) {
      setCurrentVideo(navigableVideos[currentIndex - 1].id);
    }
  };

  const navigateToNext = () => {
    const currentIndex = getCurrentIndex();
    if (currentIndex < navigableVideos.length - 1) {
      setCurrentVideo(navigableVideos[currentIndex + 1].id);
    }
  };

  const navigateToLast = () => {
    if (canNavigateToLast) {
      setCurrentVideo(navigableVideos[navigableVideos.length - 1].id);
    }
  };

  const handleOpenTest = async () => {
    if (!currentVideo || !user) return;
    
    setLoadingQuestions(true);
    try {
      const questionsData = await getQuestionsByVideoId(currentVideo.id);
      setQuestions(questionsData);
      setTestModalOpen(true);
    } catch (error) {
      console.error('Error al cargar preguntas:', error);
    } finally {
      setLoadingQuestions(false);
    }
  };

  const handleCloseTest = () => {
    setTestModalOpen(false);
    setQuestions([]);
  };


useEffect(() => {
  if (!courseId) return;
  if (loading) return;
  //console.log('(HomePage.tsx) Fetching course for courseId:', courseId, 'user:', user?.id);
  fetchCourse(courseId, user?.id);
}, [courseId, loading, user?.id]);
  
  //console.log('(HomePage.tsx 34) Current course:', currentCourse);  
  if (loadingCourse) {
    return <div>Cargando curso...</div>;
  }

  if (errorCourse) {
    return <div style={{ color: 'red' }}>Error al cargar el curso: {errorCourse}</div>;
  }

 if (!currentCourse) {
    return <div>Curso no encontrado.</div>;
  }

 
  return (
    <>
      <Navbar mode={mode} onToggleMode={onToggleMode} showBackButton onBack={() => navigate('/')} />
      <div style={{ display: 'flex', gap: 1, padding: 1, boxSizing: 'border-box', height: 'calc(100vh - 40px)' }}>
        {/* Panel colapsible con lista de videos */}
        <Drawer anchor="left" open={open} onClose={() => setOpen(false)}>
          <div style={{ width: 260, padding: 8 }}>
            <VideoSidebar video={currentVideo}/>
          </div>
        </Drawer>
        
        {/* Contenido principal */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 1, overflow: 'hidden' }}>
          {/* Barra de navegación y progreso */}
          <Stack direction="row" spacing={0.5} alignItems="center">
            <IconButton onClick={() => setOpen(true)} aria-label="abrir módulos">
              <FaBars />
            </IconButton>
            
            {/* Barra de progreso del curso */}
            <Box sx={{ flex: 1 }}>
              <CourseProgressBar current={courseProgress.current} total={courseProgress.total} percent={courseProgress.percent} />
            </Box>
          </Stack>

          {/* Card del video actual */}
          <div style={{ flex: 1, minHeight: 0 }}>
            {currentVideo ? (
              <VideoCard video={currentVideo} />
            ) : (
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                height: '100%', 
                border: '1px solid #ccc', 
                borderRadius: 8,
                backgroundColor: '#f5f5f5'
              }}>
                <Typography>No hay videos disponibles</Typography>
              </div>
            )}
          </div>

          {/* Barra de progreso del test, navegador y botón */}
          <Stack direction="column" spacing={0.5} flex={1} overflow="hidden">
            <TestProgressBar percent={testPercent} />
            
            <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={0.5}>
              {/* Navegación entre videos */}
              <Stack direction="row" alignItems="center" spacing={0.25}>
                <IconButton 
                  onClick={navigateToFirst} 
                  disabled={!canNavigateToFirst}
                  aria-label="primer video"
                  size="small"
                >
                  <FaStepBackward />
                </IconButton>
                <IconButton 
                  onClick={navigateToPrevious} 
                  disabled={!canNavigateToPrevious}
                  aria-label="video anterior"
                  size="small"
                >
                  <FaChevronLeft />
                </IconButton>
                <Typography variant="body2" sx={{ minWidth: 50, textAlign: 'center', fontSize: '0.6rem' }}>
                  {currentVideo ? `${currentVideo.order}/${videos.length}` : '0/0'}
                </Typography>
                <IconButton 
                  onClick={navigateToNext} 
                  disabled={!canNavigateToNext}
                  aria-label="siguiente video"
                  size="small"
                >
                  <FaChevronRight />
                </IconButton>
                <IconButton 
                  onClick={navigateToLast} 
                  disabled={!canNavigateToLast}
                  aria-label="último video"
                  size="small"
                >
                  <FaStepForward />
                </IconButton>
              </Stack>

              {/* Botón "Hacer Test" y estado */}
              <Stack direction="row" alignItems="center" spacing={0.25}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleOpenTest}
                  disabled={disableTest || loadingQuestions}
                  size="small"
                  sx={{ minWidth: 70, fontSize: '0.65rem', py: 0.25 }}
                >
                  {loadingQuestions ? 'Cargando...' : 'Hacer Test'}
                </Button>
                
                {allVideosCompleted && isLast && (
                  <Typography color="success.main" variant="body2" sx={{ fontSize: '0.6rem' }}>
                    ¡Curso completado!
                  </Typography>
                )}
              </Stack>
            </Stack>
          </Stack>
        </div>
      </div>

      {/* Modal para el Test */}
      <Modal
        open={testModalOpen}
        onClose={handleCloseTest}
        aria-labelledby="test-modal-title"
        aria-describedby="test-modal-description"
      >
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '90%',
          maxWidth: 600,
          bgcolor: 'background.paper',
          border: '2px solid #000',
          boxShadow: 24,
          p: 4,
          maxHeight: '80vh',
          overflowY: 'auto'
        }}>
          <Typography id="test-modal-title" variant="h6" component="h2" sx={{ mb: 2 }}>
            Test: {currentVideo?.title}
          </Typography>
          {questions.length > 0 && user && (
            <Test
              userId={user.id}
              videoId={currentVideo.id}
              questions={questions}
            />
          )}
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
            <Button onClick={handleCloseTest} variant="outlined">
              Cerrar
            </Button>
          </Box>
        </Box>
      </Modal>
    </>
  );
};

export default HomePage;
