import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { useNavigate, useParams } from 'react-router-dom';
import VideoCard from '../components/Video/VideoCard';
import VideoSidebar from '../components/Video/VideoSidebar';
import { CourseProgressBar, TestProgressBar } from '../components/ProgressBars';
import { useVideoStore } from '../store/videoStore';
import { Drawer, IconButton, Button, Box, Stack, Typography, Divider } from '@mui/material';
import { FaBars, FaStepBackward, FaStepForward, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import Navbar from '../components/Navbar';
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
    if (!currentVideo || !user) {
      console.log('No hay currentVideo o user:', { currentVideo, user });
      return;
    }
    
    setLoadingQuestions(true);
    try {
      console.log('Cargando preguntas para video:', currentVideo.id);
      const questionsData = await getQuestionsByVideoId(currentVideo.id);
      console.log('Preguntas cargadas:', questionsData?.length || 0);
      
      // Guardar las preguntas en sessionStorage como respaldo
      if (questionsData) {
        sessionStorage.setItem('testQuestions', JSON.stringify(questionsData));
        sessionStorage.setItem('testVideoTitle', currentVideo.title);
        sessionStorage.setItem('testVideoId', currentVideo.id);
      }
      
      // Redirigir a la página de test
      navigate(`/test/${currentVideo.id}`);
    } catch (error) {
      console.error('Error al cargar preguntas:', error);
    } finally {
      setLoadingQuestions(false);
    }
  };

  const handleCloseTest = () => {
    // Ya no se necesita, el test está en otra página
  };

useEffect(() => {
  if (!courseId) return;
  if (loading) return;
  fetchCourse(courseId, user?.id);
}, [courseId, loading, user?.id]);
  
  if (loadingCourse) {
    return <Box>Cargando curso...</Box>;
  }

  if (errorCourse) {
    return <Typography color="error">Error al cargar el curso: {errorCourse}</Typography>;
  }

 if (!currentCourse) {
    return <Typography>Curso no encontrado.</Typography>;
  }

  return (
    <>
      <Navbar mode={mode} onToggleMode={onToggleMode} showBackButton onBack={() => navigate('/')} />
      
      {/* Contenedor principal con flujo normal y ancho controlado */}
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        height: 'calc(100vh - 64px)', // Restar altura exacta del navbar
        maxWidth: '1200px',           // Ancho máximo como el navbar
        mx: 'auto',                   // Centrar horizontalmente
        width: '100%',                // Ancho completo hasta el máximo
        overflow: 'hidden'
      }}>
        {/* Panel colapsible con lista de videos */}
        <Drawer anchor="left" open={open} onClose={() => setOpen(false)}>
          <Box sx={{ width: 260, p: 2 }}>
            <VideoSidebar 
              video={currentVideo}
              videos={videos}
              currentVideoId={currentVideoId}
              userTestCompletions={userTestCompletions}
              onVideoSelect={setCurrentVideo}
            />
          </Box>
        </Drawer>
        
        {/* Contenido principal - distribuido con alturas específicas */}
        <Box sx={{ 
          flex: 1, 
          display: 'flex', 
          flexDirection: 'column',
          overflow: 'hidden'
        }}>
          {/* Barra de navegación y progreso - altura fija reducida */}
          <Box sx={{ 
            height: '50px', // Reducido de 60px a 50px
            p: 0.5, // Reducido padding
            backgroundColor: 'background.paper', 
            borderBottom: 1, 
            borderColor: 'divider',
            display: 'flex',
            alignItems: 'center'
          }}>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ width: '100%' }}>
              <IconButton onClick={() => setOpen(true)} aria-label="abrir módulos">
                <FaBars />
              </IconButton>
              
              {/* Barra de progreso del curso */}
              <Box sx={{ flex: 1 }}>
                <CourseProgressBar current={courseProgress.current} total={courseProgress.total} percent={courseProgress.percent} />
              </Box>
            </Stack>
          </Box>

          {/* Card del video actual - equilibrio perfecto */}
          <Box sx={{ 
            flex: 0.85, // Entre 0.7 y 1 - equilibrio
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            p: 1, // Padding normal
            minHeight: 0,
            backgroundColor: 'background.default'
          }}>
            {currentVideo ? (
              <Box sx={{ 
                width: '100%',
                height: '100%',
                maxWidth: '950px', // Entre 800px y 1000px
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <VideoCard video={currentVideo} />
              </Box>
            ) : (
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                height: '100%', 
                width: '100%',
                border: 1, 
                borderColor: 'grey.300',
                borderRadius: 1,
                bgcolor: 'grey.100'
              }}>
                <Typography>No hay videos disponibles</Typography>
              </Box>
            )}
          </Box>

          {/* Barra inferior con progreso, navegador y botón - altura justa */}
          <Box sx={{ 
            height: '100px', // Entre 90px y 120px
            backgroundColor: 'background.paper', 
            borderTop: 1, 
            borderColor: 'divider',
            p: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <Stack spacing={0.3}>
              <TestProgressBar percent={testPercent} />
              
              <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
                {/* Navegación entre videos */}
                <Stack direction="row" alignItems="center" spacing={1}>
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
                  <Typography variant="body2" sx={{ minWidth: 50, textAlign: 'center', fontSize: '0.8rem' }}>
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
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleOpenTest}
                    disabled={disableTest || loadingQuestions}
                    size="small"
                    sx={{ 
                      minWidth: 100,
                      fontWeight: 'bold'
                    }}
                  >
                    {loadingQuestions ? 'Cargando...' : 'Hacer Test'}
                  </Button>
                  
                  {allVideosCompleted && isLast && (
                    <Typography color="success.main" variant="body2" sx={{ fontWeight: 'bold' }}>
                      ¡Curso completado!
                    </Typography>
                  )}
                </Stack>
              </Stack>
            </Stack>
          </Box>
        </Box>
      </Box>
    </>
  );
};

export default HomePage;