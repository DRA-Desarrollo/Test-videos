import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Collapse, 
  IconButton, 
  Button, 
  CircularProgress,
  Alert,
  Chip,
  Stack,
  Divider,
  Container
} from '@mui/material';
import { 
  FaExpandAlt, 
  FaCompressAlt, 
  FaChartBar, 
  FaCheckCircle, 
  FaTimesCircle,
  FaUser,
  FaBook,
  FaVideo,
  FaCalendar,
  FaPercentage,
  FaArrowLeft
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

// Tipos de datos
interface User {
  id: string;
  email: string;
  admin?: boolean;
}

interface Course {
  id: string;
  name: string;
}

interface Video {
  id: string;
  title: string;
  order: number;
}

interface TestCompletion {
  video_id: string;
  completed_at: string;
  passed: boolean;
  scorePercent: number;
}

interface UserCourseVideo {
  user: User;
  course: Course;
  video: Video;
  completion: TestCompletion | null;
}

interface UserProgressTree {
  user: User;
  courses: {
    course: Course;
    videos: {
      video: Video;
      completion: TestCompletion | null;
    }[];
  }[];
}

import { getAllUsersProgress } from '../services/admin';

const AdminPage: React.FC = () => {
  const navigate = useNavigate();
  const [usersData, setUsersData] = useState<UserProgressTree[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedUsers, setExpandedUsers] = useState<Set<string>>(new Set());
  const [expandedCourses, setExpandedCourses] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAllUsersProgress();
      setUsersData(data);
    } catch (err) {
      setError('Error al cargar los datos de usuarios');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleUser = (userId: string) => {
    const newExpanded = new Set(expandedUsers);
    if (newExpanded.has(userId)) {
      newExpanded.delete(userId);
    } else {
      newExpanded.add(userId);
    }
    setExpandedUsers(newExpanded);
  };

  const toggleCourse = (courseId: string) => {
    const newExpanded = new Set(expandedCourses);
    if (newExpanded.has(courseId)) {
      newExpanded.delete(courseId);
    } else {
      newExpanded.add(courseId);
    }
    setExpandedCourses(newExpanded);
  };

  return (
    <>
      <Navbar 
        mode="light" 
        onToggleMode={() => {}} 
        showBackButton 
        onBack={() => navigate('/')} 
      />
      
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="h4" sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <FaChartBar />
                Panel de Administración - Calificaciones
              </Typography>
              <Button 
                variant="outlined" 
                startIcon={<FaArrowLeft />}
                onClick={() => navigate('/')}
              >
                Volver
              </Button>
            </Stack>
            <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
              Visualización de calificaciones de usuarios por curso y video
            </Typography>
          </Paper>

          {/* Content */}
          {loading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          )}
          
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {!loading && !error && usersData.length === 0 && (
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="h6" color="text.secondary">
                No hay calificaciones disponibles
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Los resultados aparecerán cuando los usuarios completen los tests
              </Typography>
            </Paper>
          )}

          {!loading && !error && usersData.length > 0 && (
            <Stack spacing={2}>
              {usersData.map((userTree) => (
                <UserProgressItem
                  key={userTree.user.id}
                  userTree={userTree}
                  isExpanded={expandedUsers.has(userTree.user.id)}
                  onToggle={() => toggleUser(userTree.user.id)}
                  expandedCourses={expandedCourses}
                  onToggleCourse={toggleCourse}
                />
              ))}
            </Stack>
          )}
        </motion.div>
      </Container>
    </>
  );
};

interface UserProgressItemProps {
  userTree: UserProgressTree;
  isExpanded: boolean;
  onToggle: () => void;
  expandedCourses: Set<string>;
  onToggleCourse: (courseId: string) => void;
}

const UserProgressItem: React.FC<UserProgressItemProps> = ({
  userTree,
  isExpanded,
  onToggle,
  expandedCourses,
  onToggleCourse
}) => {
  const { user, courses } = userTree;
  
  // Filtrar cursos que tienen al menos un video con test completado
  const coursesWithTests = courses.filter(course => 
    course.videos.some(video => video.completion !== null)
  );

  // Si no hay cursos con tests, no mostrar el botón de expandir
  const hasTests = coursesWithTests.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Paper elevation={3} sx={{ overflow: 'hidden' }}>
        {/* User Header */}
        <Box
          sx={{
            p: 2,
            backgroundColor: hasTests ? 'primary.light' : 'grey.200',
            cursor: hasTests ? 'pointer' : 'default',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
          onClick={hasTests ? onToggle : undefined}
        >
          <Stack direction="row" alignItems="center" spacing={2}>
            <FaUser />
            <Box>
              <Typography variant="h6" fontWeight="bold">
                {user.email}
              </Typography>
              {user.admin && (
                <Chip 
                  label="ADMIN" 
                  color="primary" 
                  size="small" 
                  sx={{ mt: 0.5 }}
                />
              )}
            </Box>
          </Stack>
          {hasTests && (
            <IconButton size="small" color="inherit">
              {isExpanded ? <FaCompressAlt /> : <FaExpandAlt />}
            </IconButton>
          )}
        </Box>
        
        {/* Courses */}
        <Collapse in={isExpanded}>
          <Box sx={{ p: 2, backgroundColor: 'background.default' }}>
            {coursesWithTests.length === 0 ? (
              <Typography color="text.secondary">Este usuario no ha completado ningún test</Typography>
            ) : (
              <Stack spacing={1}>
                {coursesWithTests.map((courseTree) => (
                  <CourseProgressItem
                    key={courseTree.course.id}
                    courseTree={courseTree}
                    isExpanded={expandedCourses.has(courseTree.course.id)}
                    onToggle={() => onToggleCourse(courseTree.course.id)}
                  />
                ))}
              </Stack>
            )}
          </Box>
        </Collapse>
      </Paper>
    </motion.div>
  );
};

interface CourseProgressItemProps {
  courseTree: {
    course: Course;
    videos: {
      video: Video;
      completion: TestCompletion | null;
    }[];
  };
  isExpanded: boolean;
  onToggle: () => void;
}

const CourseProgressItem: React.FC<CourseProgressItemProps> = ({
  courseTree,
  isExpanded,
  onToggle
}) => {
  const { course, videos } = courseTree;
  
  // Filtrar videos que tienen tests completados
  const videosWithTests = videos.filter(video => video.completion !== null);

  return (
    <Paper variant="outlined" sx={{ overflow: 'hidden' }}>
      {/* Course Header */}
      <Box
        sx={{
          p: 1.5,
          backgroundColor: 'action.hover',
          cursor: 'pointer',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
        onClick={onToggle}
      >
        <Stack direction="row" alignItems="center" spacing={1}>
          <FaBook />
          <Typography variant="body1" fontWeight="500">
            {course.name}
          </Typography>
          <Chip 
            label={`${videosWithTests.length} test${videosWithTests.length !== 1 ? 's' : ''}`} 
            size="small" 
            variant="outlined"
          />
        </Stack>
        <IconButton size="small">
          {isExpanded ? <FaCompressAlt /> : <FaExpandAlt />}
        </IconButton>
      </Box>
      
      {/* Videos */}
      <Collapse in={isExpanded}>
        <Box sx={{ p: 1.5, backgroundColor: 'background.paper' }}>
          {videosWithTests.length === 0 ? (
            <Typography color="text.secondary">No hay tests completados en este curso</Typography>
          ) : (
            <Stack spacing={1}>
              {videosWithTests.map((videoTree) => (
                <VideoProgressItem key={videoTree.video.id} videoTree={videoTree} />
              ))}
            </Stack>
          )}
        </Box>
      </Collapse>
    </Paper>
  );
};

interface VideoProgressItemProps {
  videoTree: {
    video: Video;
    completion: TestCompletion | null;
  };
}

const VideoProgressItem: React.FC<VideoProgressItemProps> = ({ videoTree }) => {
  const { video, completion } = videoTree;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.2 }}
    >
      <Paper 
        variant="outlined" 
        sx={{ 
          p: 1.5,
          borderLeft: 4,
          borderLeftColor: completion?.passed ? 'success.main' : 'error.main',
          backgroundColor: completion ? 'background.paper' : 'action.hover'
        }}
      >
        <Stack spacing={1}>
          {/* Video Header */}
          <Stack direction="row" alignItems="center" spacing={1}>
            <FaVideo />
            <Typography variant="body2" fontWeight="500">
              {video.title}
            </Typography>
            {completion && (
              <Chip
                icon={completion.passed ? <FaCheckCircle /> : <FaTimesCircle />}
                label={completion.passed ? 'Aprobado' : 'No aprobado'}
                color={completion.passed ? 'success' : 'error'}
                size="small"
              />
            )}
          </Stack>
          
          {/* Completion Details */}
          {completion && (
            <Stack 
              direction="row" 
              spacing={3} 
              sx={{ 
                pl: 3, 
                fontSize: '0.875rem',
                color: 'text.secondary'
              }}
            >
              <Stack direction="row" alignItems="center" spacing={0.5}>
                <FaPercentage />
                <span><strong>% Alcanzado:</strong> {completion.scorePercent}%</span>
              </Stack>
              <Stack direction="row" alignItems="center" spacing={0.5}>
                <FaCalendar />
                <span>
                  <strong>Fecha test:</strong> {new Date(completion.completed_at).toLocaleDateString('es-ES')}
                </span>
              </Stack>
              <Stack direction="row" alignItems="center" spacing={0.5}>
                <span><strong>Estado:</strong> {completion.passed ? 'Si' : 'No'}</span>
              </Stack>
            </Stack>
          )}
        </Stack>
      </Paper>
    </motion.div>
  );
};

export default AdminPage;