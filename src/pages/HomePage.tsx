import React, { useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { useNavigate, useParams } from 'react-router-dom';
import VideoList from '../components/Video/VideoList';
import VideoSidebar from '../components/Video/VideoSidebar';
import { CourseProgressBar } from '../components/ProgressBars';
import { useVideoStore } from '../store/videoStore';
import { Drawer, IconButton } from '@mui/material';
import { FaBars } from 'react-icons/fa';
import Navbar from '../components/Navbar';

interface HomePageProps {
  mode: 'light' | 'dark';
  onToggleMode: () => void;
}

const HomePage: React.FC<HomePageProps> = ({mode, onToggleMode }) => {
  const { courseOrder } = useParams<{ courseOrder: string }>();
  const { user, signOut } = useAuthStore();
  const { getCourseProgress, fetchCourse, course: currentCourse, loadingCourse, errorCourse } = useVideoStore();
  const courseProgress = getCourseProgress();
  const [open, setOpen] = React.useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (courseOrder) {
      fetchCourse(parseInt(courseOrder, 10), user?.id);
    }
  }, [courseOrder, fetchCourse, user]);
  
  if (loadingCourse) {
    return <div>Cargando curso...</div>;
  }

  if (errorCourse) {
    return <div>Error al cargar el curso: {errorCourse}</div>;
  }

 if (!currentCourse) {
    return <div>Curso no encontrado.</div>;
  }
  
  return (
    <>
      <Navbar mode={mode} onToggleMode={onToggleMode} showBackButton onBack={() => navigate('/')} />
      <div style={{ display: 'flex', gap: 12, padding: 12, boxSizing: 'border-box' }}>
        <Drawer anchor="left" open={open} onClose={() => setOpen(false)}>
          <div style={{ width: 260, padding: 8 }}>
            <VideoSidebar />
          </div>
        </Drawer>
        <div style={{ flex: 1, maxWidth: '100%', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <IconButton onClick={() => setOpen(true)} aria-label="abrir módulos">
              <FaBars />
            </IconButton>
          </div>
          <div style={{ marginTop: 8 }}>
            <CourseProgressBar current={courseProgress.current} total={courseProgress.total} percent={courseProgress.percent} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <VideoList />
          </div>
        </div>
      </div>
    </>
  );
};

export default HomePage;
