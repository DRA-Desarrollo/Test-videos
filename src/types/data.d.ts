export interface Course {
  id: string;
  name: string;
  orden: number;
  cover_image: string;
  description: string;
}

export interface Video {
  id: string;
  title: string;
  youtube_url: string;
  order: number;
  course_id: string;
}

export interface Question {
  id: string;
  video_id: string;
  question_text: string;
  options: string[];
  correct_option_index: number;
}

export interface UserTestCompletion {
  user_id: string;
  video_id: string;
  completed_at: string; // O el tipo de dato que uses para la fecha
  passed?: boolean;
  scorePercent?: number;
}
