import { create } from 'zustand';
import { supabase } from '../utils/supabaseClient';
import { getCourse, getCourses } from '../services/courses';
import { getVideosByCourseId } from '../services/videos';
import type { VideoState } from '../types/store';
import type { Video } from '../types/data';

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
    const { course } = get();
    if (!course) {
      // If there is no course, we can't determine the video.
      // Maybe fetch a default course or wait for one to be selected.
      return;
    }

    if (get().videos.length === 0) {
      await get().fetchVideosByCourseId(course.id, userId);
    }
    const allVideos = get().videos;

    if (allVideos.length === 0) {
      set({ currentVideoId: null, loadingVideos: false });
      return;
    }

    if (!userId) {
      // Si no hay usuario logueado, tomar el video con menor 'order'
      const sorted = [...allVideos].sort((a, b) => a.order - b.order);
      const firstVideo = sorted[0] || null;
      set({ currentVideoId: firstVideo ? firstVideo.id : null });
      return;
    }

    set({ loadingVideos: true, errorVideos: null });
    try {
      // 1. Obtener las pruebas completadas por el usuario
      const { data: completedTestsData, error: completedTestsError } = await supabase
        .from('user_scores') // Tabla de puntajes del usuario
        .select('video_id, score, passed, completed_at')
        .eq('user_id', userId);

      if (completedTestsError) {
        throw completedTestsError;
      }

      // Mapear completions al estado local
      set({
        userTestCompletions: (completedTestsData || []).map((c: any) => ({
          user_id: userId,
          video_id: String(c.video_id),
          completed_at: c.completed_at || new Date().toISOString(),
          passed: !!c.passed,
          scorePercent: typeof c.score === 'number' ? c.score : undefined,
        })),
      });

      const completedVideoIds = new Set((completedTestsData || []).map((c: any) => c.video_id));

      let nextVideo: Video | null = null;
      const sorted = [...allVideos].sort((a, b) => a.order - b.order);

      if (completedVideoIds.size === 0) {
        // Primer video: el de menor 'order'
        nextVideo = sorted[0] || null;
      } else {
        // Encontrar el orden más alto de los videos completados
        const completedVideoOrders = allVideos
          .filter(video => completedVideoIds.has(video.id))
          .map(video => video.order);

        const maxCompletedOrder = completedVideoOrders.length > 0
          ? Math.max(...completedVideoOrders)
          : -Infinity;

        // Siguiente es el primer video con 'order' mayor al máximo completado
        nextVideo = sorted.find(video => video.order > maxCompletedOrder) || null;

        // Si no se encontró un siguiente video y el usuario ha completado todos los videos
        if (!nextVideo && completedVideoIds.size === allVideos.length) {
          // Volver al primero como fallback
          nextVideo = sorted[0] || null;
        }
      }

      set({ currentVideoId: nextVideo ? nextVideo.id : null, loadingVideos: false });
    } catch (error: unknown) {
        // Calcula el progreso del test actual (0-100%)
      console.error('Error al determinar el video actual:', (error as { message: string }).message);
      set({ errorVideos: (error as { message: string }).message, loadingVideos: false });
    }
  }
}));
