import { create } from 'zustand';
import { supabase } from '../utils/supabaseClient'; // Ruta correcta a tu cliente de Supabase
import { getCourse, getCourses } from '../services/courses';
import { getVideosByCourseId } from '../services/videos';
import { Video, UserTestCompletion } from '../types/data'; // Importa los tipos de datos
import type { VideoState } from '../types/store'; // Importa VideoState desde el archivo correcto

export const useVideoStore = create<VideoState>((set, get) => ({
videos: [],
  currentVideoId: null,
  loadingVideos: false,
  errorVideos: null,
  userTestCompletions: [],
  course: null,
  courses: [],
  loadingCourse: false,
  errorCourse: null,

  fetchCourses: async () => {
    set({ loadingCourse: true, errorCourse: null });
    try {
      const courses = await getCourses();
      set({ courses, loadingCourse: false });
    } catch (error: unknown) {
      const errorMessage = (error as { message: string }).message;
      console.error('Error fetching courses:', errorMessage);
      set({ errorCourse: errorMessage, loadingCourse: false });
    }
  },

  fetchCourse: async (courseOrder: number, userId: string | undefined) => {
    set({ loadingCourse: true, errorCourse: null });
    try {
      const course = await getCourse(courseOrder);
      set({ course, loadingCourse: false });
      if (course) {
        get().fetchVideosByCourseId(course.id, userId);
      }
    } catch (error: unknown) {
      const errorMessage = (error as { message: string }).message;
      console.error('Error fetching course:', errorMessage);
      set({ errorCourse: errorMessage, loadingCourse: false });
    }
  },

  fetchVideos: async () => {
    set({ loadingVideos: true, errorVideos: null });
    try {
      const { data, error } = await supabase
        .from('videos')
        .select('*')
        .order('order', { ascending: true });

      if (error) {
        throw error;
      }
      set({ videos: data || [], loadingVideos: false });
    } catch (error: unknown) {
      console.error('Error al obtener videos:', (error as { message: string }).message);
      set({ errorVideos: (error as { message: string }).message, loadingVideos: false });
    }
  },

  fetchVideosByCourseId: async (courseId: string, userId: string | undefined) => {
    set({ loadingVideos: true, errorVideos: null });
    try {
      const videos = await getVideosByCourseId(courseId);
      set({ videos, loadingVideos: false });
      get().determineAndSetCurrentVideo(userId);
    } catch (error: unknown) {
      const errorMessage = (error as { message: string }).message;
      console.error('Error fetching videos:', errorMessage);
      set({ errorVideos: errorMessage, loadingVideos: false });
    }
  },
  
  setCurrentVideo: (videoId: string | null) => {
    set({ currentVideoId: videoId });
  },

  // Envía las respuestas del usuario, calcula el puntaje y actualiza el estado
  postUserTestAnswers: async (userId: string, videoId: string | number, answers: Record<string, string>) => {
    // Aquí deberías tener la lógica para comparar respuestas y calcular el puntaje
    // Suponiendo que tienes una función auxiliar para calcular el score
    // Ejemplo simple:
    const { data: questions, error: errorQuestions } = await supabase
      .from('questions')
      .select('*')
      .eq('video_id', videoId);

    if (errorQuestions) {
      set({ errorVideos: errorQuestions.message });
      return { success: false, score: 0, error: errorQuestions.message };
    }
    if (!questions || (questions as any[]).length === 0) {
      const msg = 'No hay preguntas para este video.';
      set({ errorVideos: msg });
      return { success: false, score: 0, error: msg };
    }

    // Calcular puntaje
    let correct = 0;
    (questions as any[]).forEach((q: any) => {
      const correctOpt = Array.isArray(q.options) ? q.options[q.correct_option_index] : undefined;
      if (correctOpt && answers[q.id] === correctOpt) correct++;
    });
    const scorePercent = questions && (questions as any[]).length > 0
      ? Math.round((correct / (questions as any[]).length) * 100)
      : 0;

    // Guardar en la tabla de completaciones
    const { error: errorInsert } = await supabase
      .from('user_scores')
      .upsert([
        {
          user_id: userId,
          video_id: videoId,
          score: scorePercent,
          passed: scorePercent >= 70,
          completed_at: new Date().toISOString(),
        },
      ]);

    if (errorInsert) {
      set({ errorVideos: errorInsert.message });
      return { success: false, score: scorePercent, error: errorInsert.message };
    }

    // Actualizar el estado local de completions para reflejar el progreso
    set((state) => {
      const rest = state.userTestCompletions.filter(
        (c: any) => !(c.user_id === userId && c.video_id === videoId)
      );
      return {
        userTestCompletions: [
          ...rest,
          {
            user_id: userId,
            video_id: String(videoId),
            completed_at: new Date().toISOString(),
            passed: scorePercent >= 70,
            scorePercent,
          },
        ],
      } as any;
    });

    return { success: scorePercent >= 70, score: scorePercent };
  },
  
   // Calcula el progreso del curso (ej: va por el 5 de 12)
  getCourseProgress: () => {
    const videos = get().videos || [];
    const passedIds = new Set(
      (get().userTestCompletions || []).filter((c: any) => c.passed).map((c: any) => c.video_id)
    );
    const passedOrders = videos.filter(v => passedIds.has(v.id)).map(v => v.order);
    const maxCompletedOrder = passedOrders.length > 0 ? Math.max(...passedOrders) : 0;
    const total = videos.length;
    const current = total === 0 ? 0 : Math.min(maxCompletedOrder + 1, total);
    const percent = total ? Math.round((current / total) * 100) : 0;
    return { current, total, percent };
  },

  getTestProgress: (videoId: string | number) => {
    const vid = String(videoId);
    const completion = (get().userTestCompletions || []).find((c: any) => String(c.video_id) === vid);
    if (!completion) return 0;
    return Math.round(completion.scorePercent || 0);
  },

  determineAndSetCurrentVideo: async (userId: string | undefined) => {
    // Si no hay usuario logueado, o si los videos aún no se han cargado,
    // intenta cargar los videos y establece el video actual al primero.
    if (get().videos.length === 0) {
      await get().fetchVideos();
    }
    const allVideos = get().videos;

    if (allVideos.length === 0) {
      set({ currentVideoId: null, loadingVideos: false });
      return;
    }

    if (!userId) {
      // Si no hay usuario logueado, por defecto va al primer video
      const firstVideo = allVideos.find(video => video.order === 1) || allVideos[0];
      set({ currentVideoId: firstVideo ? firstVideo.id : null });
      return;
    }

    set({ loadingVideos: true, errorVideos: null });
    try {
      // 1. Obtener las pruebas completadas por el usuario
      const { data: completedTestsData, error: completedTestsError } = await supabase
        .from('user_test_completions') // Asume que esta es tu tabla de completaciones de tests
        .select('video_id')
        .eq('user_id', userId);

      if (completedTestsError) {
        throw completedTestsError;
      }

      const completedVideoIds = new Set(completedTestsData?.map(c => c.video_id) || []);

      let nextVideo: Video | null = null;

      if (completedVideoIds.size === 0) {
        // Si no ha completado ningún test, va al video con orden 1
        nextVideo = allVideos.find(video => video.order === 1) || allVideos[0];
      } else {
        // Encontrar el orden más alto de los videos completados
        const completedVideoOrders = allVideos
          .filter(video => completedVideoIds.has(video.id))
          .map(video => video.order);

        const maxCompletedOrder = completedVideoOrders.length > 0
          ? Math.max(...completedVideoOrders)
          : 0;

        // Buscar el siguiente video en secuencia
        nextVideo = allVideos.find(video => video.order === maxCompletedOrder + 1) || null;

        // Si no se encontró un siguiente video y el usuario ha completado todos los videos
        if (!nextVideo && completedVideoIds.size === allVideos.length) {
          // El usuario ha completado todos los tests, se le puede mostrar el primero o dejarlo a criterio de la UI
          // Aquí lo establecemos al primer video para tener una posición.
          nextVideo = allVideos[0];
        }
      }

      set({ currentVideoId: nextVideo ? nextVideo.id : null, loadingVideos: false });

    } catch (error: unknown) {
      console.error('Error al determinar el video actual:', (error as { message: string }).message);
      set({ errorVideos: (error as { message: string }).message, loadingVideos: false });
    }
  }
}));