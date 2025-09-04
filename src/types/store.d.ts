import { Session } from '@supabase/supabase-js';
import { AuthUser } from './auth';
import { Video, UserTestCompletion } from './data'; // Asegúrate de que UserTestCompletion esté definido en data.d.ts

export interface AuthState {
  user: AuthUser | null;
  session: Session | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  initializeAuth: () => Promise<void>;
}

export interface VideoState {
  videos: Video[];
  currentVideoId: string | null;
  loadingVideos: boolean;
  errorVideos: string | null;
  userTestCompletions: UserTestCompletion[]; // Añade esta línea
  course: Course | null;
  courses: Course[];
  loadingCourse: boolean;
  errorCourse: string | null;
  fetchCourses: () => Promise<void>;
  fetchCourse: (courseOrder: number, userId: string | undefined) => Promise<void>;
  fetchVideos: () => Promise<void>;
  fetchVideosByCourseId: (courseId: string, userId: string | undefined) => Promise<void>;
  determineAndSetCurrentVideo: (userId: string | undefined) => Promise<void>;
  setCurrentVideo: (videoId: string | null) => void;
  getCourseProgress: () => { current: number; total: number; percent: number }; // Asegúrate de incluir esta función
  getTestProgress: (videoId: string) => number; // Asegúrate de que sea exactamente así
  //userTestCompletions: UserTestCompletion[];
  postUserTestAnswers: (
    userId: string,
    videoId: string | number,
    answers: Record<string, string>
  ) => Promise<{ success: boolean; score: number; error?: string }>;
}  
