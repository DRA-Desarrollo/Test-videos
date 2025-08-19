export interface Question {
  id: string;
  video_id: string;
  question_text: string;
  options: string[];
  correct_option_index: number;
  created_at: string;
}
