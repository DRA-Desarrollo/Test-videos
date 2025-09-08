import { supabase } from '../utils/supabaseClient';
import type { PublicUser } from './auth';

// Interfaz para información de curso
export interface CourseInfo {
  id: string;
  name: string;
  description?: string;
  cover_image?: string;
}

// Interfaz para información de video
export interface VideoInfo {
  id: string;
  title: string;
  description?: string;
  youtube_url: string;
  course_id: string;
  order: number;
}

// Interfaz para información de test completion
export interface TestCompletionInfo {
  id: string;
  user_id: string;
  video_id: string;
  score_percent: number;
  passed: boolean;
  completed_at: string;
}

// Interfaz para el árbol de datos de usuario
export interface UserProgressTree {
  user: PublicUser;
  courses: CourseProgressTree[];
}

// Interfaz para el árbol de datos de curso
export interface CourseProgressTree {
  course: CourseInfo;
  videos: VideoProgressTree[];
}

// Interfaz para el árbol de datos de video
export interface VideoProgressTree {
  video: VideoInfo;
  completions: TestCompletionInfo[];
}

// Función para obtener todos los usuarios con sus progresos
export const getAllUsersProgress = async (): Promise<UserProgressTree[]> => {
  try {
    // Obtener todos los usuarios
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
      .order('email');
    
    if (usersError) {
      console.error('Error fetching users:', usersError);
      return [];
    }

    // Obtener todos los cursos
    const { data: courses, error: coursesError } = await supabase
      .from('courses')
      .select('*')
      .order('name');
    
    if (coursesError) {
      console.error('Error fetching courses:', coursesError);
      return [];
    }

    // Obtener todos los videos
    const { data: videos, error: videosError } = await supabase
      .from('videos')
      .select('*')
      .order('course_id, order');
    
    if (videosError) {
      console.error('Error fetching videos:', videosError);
      return [];
    }

    // Obtener todos los test completions
    const { data: completions, error: completionsError } = await supabase
      .from('user_test_completions')
      .select('*')
      .order('completed_at', { ascending: false });
    
    if (completionsError) {
      console.error('Error fetching test completions:', completionsError);
      return [];
    }

    // Construir el árbol de datos
    const userProgressTree: UserProgressTree[] = users.map(user => {
      const userCourses: CourseProgressTree[] = courses.map(course => {
        const courseVideos = videos.filter(video => video.course_id === course.id);
        
        const courseVideosWithProgress: VideoProgressTree[] = courseVideos.map(video => {
          const videoCompletions = completions.filter(completion => 
            completion.video_id === video.id && completion.user_id === user.id
          );
          
          return {
            video,
            completions: videoCompletions
          };
        });
        
        return {
          course,
          videos: courseVideosWithProgress
        };
      });
      
      return {
        user,
        courses: userCourses
      };
    });

    return userProgressTree;
  } catch (error) {
    console.error('Error in getAllUsersProgress:', error);
    return [];
  }
};

// Función para obtener el progreso de un usuario específico
export const getUserProgress = async (userId: string): Promise<UserProgressTree | null> => {
  try {
    // Obtener el usuario
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (userError || !user) {
      console.error('Error fetching user:', userError);
      return null;
    }

    // Obtener todos los cursos
    const { data: courses, error: coursesError } = await supabase
      .from('courses')
      .select('*')
      .order('name');
    
    if (coursesError) {
      console.error('Error fetching courses:', coursesError);
      return null;
    }

    // Obtener todos los videos
    const { data: videos, error: videosError } = await supabase
      .from('videos')
      .select('*')
      .order('course_id, order');
    
    if (videosError) {
      console.error('Error fetching videos:', videosError);
      return null;
    }

    // Obtener todos los test completions del usuario
    const { data: completions, error: completionsError } = await supabase
      .from('user_test_completions')
      .select('*')
      .eq('user_id', userId)
      .order('completed_at', { ascending: false });
    
    if (completionsError) {
      console.error('Error fetching test completions:', completionsError);
      return null;
    }

    // Construir el árbol de datos
    const userCourses: CourseProgressTree[] = courses.map(course => {
      const courseVideos = videos.filter(video => video.course_id === course.id);
      
      const courseVideosWithProgress: VideoProgressTree[] = courseVideos.map(video => {
        const videoCompletions = completions.filter(completion => 
          completion.video_id === video.id
        );
        
        return {
          video,
          completions: videoCompletions
        };
      });
      
      return {
        course,
        videos: courseVideosWithProgress
      };
    });

    return {
      user,
      courses: userCourses
    };
  } catch (error) {
    console.error('Error in getUserProgress:', error);
    return null;
  }
};