import React, { useEffect } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useVideoStore } from '../store/videoStore';
import { Card, CardActionArea, CardMedia, CardContent, Typography, Box } from '@mui/material';
import Navbar from '../components/Navbar';

const CourseListPage: React.FC = () => {
  const { courses, fetchCourses, loadingCourse, errorCourse } = useVideoStore();
  const navigate = useNavigate();

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  if (loadingCourse) {
    return <div>Cargando cursos...</div>;
  }

  if (errorCourse) {
    return <div>Error al cargar los cursos: {errorCourse}</div>;
  }

  return (
    <>
      <Navbar onBack={() => navigate('/')} />
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" fontWeight={700} color="primary" sx={{ mb: 4, textAlign: 'center' }}>
          Cursos Disponibles
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 4, justifyContent: 'center' }}>
          {courses.map((course) => (
            <Card key={course.id} sx={{ width: 345, transition: '0.3s', '&:hover': { transform: 'scale(1.03)' } }}>
            <CardActionArea component={RouterLink} to={`/course/${course.orden}`}>
              <CardMedia
                component="div"
                sx={{
                  height: 140,
                  backgroundImage: `url(${course.cover_image})`,
                  backgroundSize: 'contain',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat',
                  backgroundColor: '#f0f0f0' // Fallback color
                }}
                title={course.name}
              />
              <CardContent>
                <Typography gutterBottom variant="h5" component="div">
                  {course.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {course.description}
                </Typography>
              </CardContent>
            </CardActionArea>
            </Card>
          ))}
        </Box>
      </Box>
    </>
  );
};

export default CourseListPage;
