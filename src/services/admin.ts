import { supabase } from '../utils/supabaseClient';

// Tipos de datos
export interface User {
  id: string;
  email: string;
  admin?: boolean;
}

export interface Course {
  id: string;
  name: string;
}

export interface Video {
  id: string;
  title: string;
  order: number;
  course_id: string;
}

export interface TestCompletion {
  video_id: string;
  completed_at: string;
  passed: boolean;
  scorePercent: number;
}

export interface UserProgressTree {
  user: User;
  courses: {
    course: Course;
    videos: {
      video: Video;
      completion: TestCompletion | null;
    }[];
  }[];
}

// Función para obtener todos los usuarios con sus progresos
export const getAllUsersProgress = async (): Promise<UserProgressTree[]> => {
  try {
    // Obtener todos los usuarios
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
      .order('email');

    if (usersError) throw usersError;

    // Obtener todas las completaciones de tests
    const { data: completions, error: completionsError } = await supabase
      .from('user_test_completions')
      .select('*')
      .order('completed_at', { ascending: false });

    if (completionsError) throw completionsError;

    // Obtener todos los videos
    const { data: videos, error: videosError } = await supabase
      .from('videos')
      .select('*')
      .order('order');

    if (videosError) throw videosError;

    // Obtener todos los cursos
    const { data: courses, error: coursesError } = await supabase
      .from('courses')
      .select('*');

    if (coursesError) throw coursesError;

    // Organizar los datos por usuario
    const userProgressMap = new Map<string, UserProgressTree>();

    // Inicializar todos los usuarios en el mapa
    users.forEach(user => {
      userProgressMap.set(user.id, {
        user: {
          id: user.id,
          email: user.email,
          admin: user.admin || false
        },
        courses: []
      });
    });

    // Agrupar videos por curso
    const videosByCourse = new Map<string, Video[]>();
    courses.forEach(course => {
      videosByCourse.set(course.id, videos.filter(v => v.course_id === course.id));
    });

    // Para cada completación, agregarla al usuario correspondiente
    completions.forEach(completion => {
      const userProgress = userProgressMap.get(completion.user_id);
      if (!userProgress) return;

      // Encontrar el video correspondiente
      const video = videos.find(v => v.id === completion.video_id);
      if (!video) return;

      // Encontrar el curso correspondiente
      const course = courses.find(c => c.id === video.course_id);
      if (!course) return;

      // Buscar si el curso ya existe en el progreso del usuario
      let courseProgress = userProgress.courses.find(c => c.course.id === course.id);
      
      if (!courseProgress) {
        courseProgress = {
          course,
          videos: []
        };
        userProgress.courses.push(courseProgress);
      }

      // Buscar si el video ya existe en el curso
      let videoProgress = courseProgress.videos.find(v => v.video.id === video.id);
      
      if (!videoProgress) {
        videoProgress = {
          video,
          completion: null
        };
        courseProgress.videos.push(videoProgress);
      }

      // Actualizar la completación (usar la más reciente si hay múltiples)
      if (!videoProgress.completion || 
          new Date(completion.completed_at) > new Date(videoProgress.completion.completed_at)) {
        videoProgress.completion = {
          video_id: completion.video_id,
          completed_at: completion.completed_at,
          passed: completion.passed,
          scorePercent: completion.score_percent || 0
        };
      }
    });

    // Convertir el mapa a array y filtrar usuarios que no tienen completaciones
    return Array.from(userProgressMap.values()).filter(userProgress => 
      userProgress.courses.some(course => 
        course.videos.some(video => video.completion !== null)
      )
    );

  } catch (error) {
    console.error('Error en getAllUsersProgress:', error);
    throw error;
  }
};

// Función para obtener el progreso de un usuario específico
export const getUserProgress = async (userId: string): Promise<UserProgressTree | null> => {
  try {
    const allUsersProgress = await getAllUsersProgress();
    return allUsersProgress.find(user => user.user.id === userId) || null;
  } catch (error) {
    console.error('Error en getUserProgress:', error);
    throw error;
  }
};

// Función para obtener estadísticas generales
export const getAdminStats = async () => {
  try {
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*', { count: 'exact' });

    if (usersError) throw usersError;

    const { data: completions, error: completionsError } = await supabase
      .from('user_test_completions')
      .select('*', { count: 'exact' });

    if (completionsError) throw completionsError;

    const { data: videos, error: videosError } = await supabase
      .from('videos')
      .select('*', { count: 'exact' });

    if (videosError) throw videosError;

    const { data: courses, error: coursesError } = await supabase
      .from('courses')
      .select('*', { count: 'exact' });

    if (coursesError) throw coursesError;

    const totalUsers = users?.length || 0;
    const totalCompletions = completions?.length || 0;
    const totalVideos = videos?.length || 0;
    const totalCourses = courses?.length || 0;

    const passedTests = completions?.filter(c => c.passed).length || 0;
    const averageScore = completions?.length > 0 
      ? completions.reduce((sum, c) => sum + (c.score_percent || 0), 0) / completions.length 
      : 0;

    return {
      totalUsers,
      totalCompletions,
      totalVideos,
      totalCourses,
      passedTests,
      failedTests: totalCompletions - passedTests,
      passRate: totalCompletions > 0 ? (passedTests / totalCompletions) * 100 : 0,
      averageScore: Math.round(averageScore)
    };

  } catch (error) {
    console.error('Error en getAdminStats:', error);
    throw error;
  }
};