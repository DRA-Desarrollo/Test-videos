import { supabase } from '../utils/supabaseClient';
import type { Question } from '../types/question';

export const getQuestionsByVideoId = async (videoId: string): Promise<Question[]> => {
  const { data, error } = await supabase
    .from('questions')
    .select('*')
    .eq('video_id', videoId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data as Question[];
};
