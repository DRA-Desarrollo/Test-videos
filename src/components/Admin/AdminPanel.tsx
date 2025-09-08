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
  Divider
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
  FaPercentage
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { getAllUsersProgress, UserProgressTree } from '../../services/admin';

interface AdminPanelProps {
  open: boolean;
  onClose: () => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ open, onClose }) => {
  const [usersData, setUsersData] = useState<UserProgressTree[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedUsers, setExpandedUsers] = useState<Set<string>>(new Set());
  const [expandedCourses, setExpandedCourses] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (open) {
      fetchData();
    }
  }, [open]);

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

  if (!open) return null;

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        right: 0,
        width: '500px',
        height: '100vh',
        backgroundColor: 'background.paper',
        borderLeft: 1,
        borderColor: 'divider',
        zIndex: 1300,
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {/* Header */}
      <Paper sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <FaChartBar />
            Panel de Administración
          </Typography>
          <IconButton onClick={onClose}>
            <FaCompressAlt />
          </IconButton>
        </Stack>
      </Paper>

      {/* Content */}
      <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
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

        {!loading && !error && (
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
      </Box>
    </Box>
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

  return (
    <Paper elevation={2} sx={{ overflow: 'hidden' }}>
      {/* User Header */}
      <Box
        sx={{
          p: 2,
          backgroundColor: user.admin ? 'primary.light' : 'grey.100',
          cursor: 'pointer',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
        onClick={onToggle}
      >
        <Stack direction="row" alignItems="center" spacing={2}>
          <FaUser />
          <Box>
            <Typography variant="subtitle1" fontWeight="bold">
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
        <IconButton size="small">
          {isExpanded ? <FaCompressAlt /> : <FaExpandAlt />}
        </IconButton>
      </Box>

      {/* Courses */}
      <Collapse in={isExpanded}>
        <Box sx={{ p: 2, backgroundColor: 'background.default' }}>
          {courses.length === 0 ? (
            <Typography color="text.secondary">No hay cursos disponibles</Typography>
          ) : (
            <Stack spacing={1}>
              {courses.map((courseTree) => (
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
  );
};

interface CourseProgressItemProps {
  courseTree: any;
  isExpanded: boolean;
  onToggle: () => void;
}

const CourseProgressItem: React.FC<CourseProgressItemProps> = ({
  courseTree,
  isExpanded,
  onToggle
}) => {
  const { course, videos } = courseTree;

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
            label={`${videos.length} videos`} 
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
          {videos.length === 0 ? (
            <Typography color="text.secondary">No hay videos en este curso</Typography>
          ) : (
            <Stack spacing={1}>
              {videos.map((videoTree: any) => (
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
  videoTree: any;
}

const VideoProgressItem: React.FC<VideoProgressItemProps> = ({ videoTree }) => {
  const { video, completions } = videoTree;

  const latestCompletion = completions.length > 0 ? completions[0] : null;

  return (
    <Paper 
      variant="outlined" 
      sx={{ 
        p: 1.5,
        borderLeft: 4,
        borderLeftColor: latestCompletion?.passed ? 'success.main' : 'error.main'
      }}
    >
      <Stack spacing={1}>
        {/* Video Header */}
        <Stack direction="row" alignItems="center" spacing={1}>
          <FaVideo />
          <Typography variant="body2" fontWeight="500">
            {video.title}
          </Typography>
          {latestCompletion && (
            <Chip
              icon={latestCompletion.passed ? <FaCheckCircle /> : <FaTimesCircle />}
              label={latestCompletion.passed ? 'Aprobado' : 'No aprobado'}
              color={latestCompletion.passed ? 'success' : 'error'}
              size="small"
            />
          )}
        </Stack>

        {/* Completion Details */}
        {latestCompletion && (
          <Stack 
            direction="row" 
            spacing={2} 
            sx={{ 
              pl: 3, 
              fontSize: '0.75rem',
              color: 'text.secondary'
            }}
          >
            <Stack direction="row" alignItems="center" spacing={0.5}>
              <FaPercentage />
              <span>{latestCompletion.score_percent}%</span>
            </Stack>
            <Stack direction="row" alignItems="center" spacing={0.5}>
              <FaCalendar />
              <span>
                {new Date(latestCompletion.completed_at).toLocaleDateString()}
              </span>
            </Stack>
          </Stack>
        )}

        {!latestCompletion && (
          <Typography variant="caption" color="text.secondary" sx={{ pl: 3 }}>
            Sin intentos realizados
          </Typography>
        )}
      </Stack>
    </Paper>
  );
};

export default AdminPanel;