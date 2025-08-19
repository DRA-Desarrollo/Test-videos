import { Session } from '@supabase/supabase-js';
import { AuthUser } from './auth';
import { Video, Course, UserTestCompletion } from './data';

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
  course: Course | null;
  courses: Course[];
  loadingCourse: boolean;
  errorCourse: string | null;
  fetchCourses: () => Promise<void>;
  fetchCourse: (courseOrder: number, userId: string | undefined) => Promise<void>;
  fetchVideosByCourseId: (courseId: string, userId: string | undefined) => Promise<void>;
  determineAndSetCurrentVideo: (userId: string | undefined) => Promise<void>;
  setCurrentVideo: (videoId: string | null) => void;
  getCourseProgress: () => { current: number; total: number; percent: number };
  getTestProgress: (videoId: string | number) => number;
  userTestCompletions: UserTestCompletion[];
  postUserTestAnswers: (
    userId: string,
    videoId: string | number,
    answers: Record<string, string>
  ) => Promise<{ success: boolean; score: number; error?: string }>;
}
