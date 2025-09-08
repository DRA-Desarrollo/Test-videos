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

  fetchCourse: async (courseId: string, userId: string | undefined) => {
    set({ loadingCourse: true, errorCourse: null });
    try {
      console.log('Fetching course with id:', courseId);
      const course = await getCourse(courseId);
      console.log('Fetched course:', course);
      set({ course, loadingCourse: false });
      if (course) {
        await get().fetchVideosByCourseId(course.id, userId);
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
    set({ loadingVideos: true, errorVideos: null, currentVideoId: null });
    try {
      const videos = await getVideosByCourseId(courseId);
      set({ videos: videos.sort((a,b) => a.order - b.order) });
      if (userId) {
        await get().fetchUserCompletionsForCourse(userId);
      }
      await get().determineAndSetCurrentVideo(userId);
      // Fallback extra: asegurar un video seleccionado
      if (!get().currentVideoId) {
        const first = [...(get().videos || [])].sort((a, b) => a.order - b.order)[0];
        set({ currentVideoId: first ? first.id : null });
      }
      set({ loadingVideos: false });
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

    // Guardar/actualizar en la tabla de completaciones oficial
    const { error: errorInsert } = await supabase
      .from('user_test_completions')
      .upsert([
        {
          user_id: userId,
          video_id: videoId,
          score_percent: scorePercent,
          passed: scorePercent >= 70,
          completed_at: new Date().toISOString(),
        },
      ]);

    if (errorInsert) {
      set({ errorVideos: errorInsert.message });
      return { success: false, score: scorePercent, error: errorInsert.message };
    }

    // Refrescar completions desde DB y recalcular el siguiente video
    try {
      await get().fetchUserCompletionsForCourse(userId);
      await get().determineAndSetCurrentVideo(userId);
    } catch (_) {}

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
    // Trabajar dentro del contexto del curso actual: get().videos ya viene filtrado por courseId
    const courseVideos = [...(get().videos || [])].sort((a, b) => a.order - b.order);

    // Si no hay videos para el curso actual
    if (courseVideos.length === 0) {
      set({ currentVideoId: null });
      return;
    }

    // Si por cualquier motivo no hay usuario, caer al primer video del curso
    if (!userId) {
      const firstVideo = courseVideos.find(v => v.order === 1) || courseVideos[0];
      set({ currentVideoId: firstVideo ? firstVideo.id : null });
      return;
    }

    try {
      const videoIds = courseVideos.map(v => v.id);

      // Obtener completados SOLO para los videos de este curso y ese usuario
      let completed: Array<{ video_id: string; passed: boolean; score_percent: number }> = [];
      if (videoIds.length > 0) {
        const { data, error } = await supabase
          .from('user_test_completions')
          .select('video_id, passed, score_percent')
          .eq('user_id', userId)
          .in('video_id', videoIds);
        if (error) throw error;
        completed = data || [];
      }

      const passedIds = new Set(completed.filter(c => c.passed).map(c => c.video_id));
      
      // Caso 1: No hay completados, mostrar primer video
      if (completed.length === 0) {
        const firstVideo = courseVideos.find(v => v.order === 1) || courseVideos[0];
        set({ currentVideoId: firstVideo ? firstVideo.id : null });
        return;
      }

      // Caso 2: Buscar el siguiente video no aprobado
      const nextPending = courseVideos.find(v => !passedIds.has(v.id));
      if (nextPending) {
        set({ currentVideoId: nextPending.id });
        return;
      }

      // Caso 3: Todos los videos están aprobados, mostrar el último
      const lastVideo = courseVideos[courseVideos.length - 1];
      set({ currentVideoId: lastVideo ? lastVideo.id : null });
      
    } catch (error: unknown) {
      console.error('Error al determinar el video actual:', (error as { message: string }).message);
      // Fallback seguro: posicionar en el primer video del curso
      const fallback = courseVideos[0];
      set({ currentVideoId: fallback ? fallback.id : null, errorVideos: (error as { message: string }).message });
    }
  },

  // Carga las completions del usuario para el curso actual (videos en memoria)
  fetchUserCompletionsForCourse: async (userId: string) => {
    const vids = get().videos || [];
    const ids = vids.map(v => v.id);
    if (ids.length === 0) {
      set({ userTestCompletions: [] as any });
      return;
    }

    const { data, error } = await supabase
      .from('user_test_completions')
      .select('user_id, video_id, passed, score_percent, completed_at')
      .eq('user_id', userId)
      .in('video_id', ids);

    if (error) {
      console.error('Error fetching completions:', error.message);
      return;
    }

    const mapped = (data || []).map((c: any) => ({
      user_id: c.user_id,
      video_id: c.video_id,
      completed_at: c.completed_at,
      passed: !!c.passed,
      scorePercent: typeof c.score_percent === 'number' ? c.score_percent : 0,
    }));

    set({ userTestCompletions: mapped as any });
  }
}));