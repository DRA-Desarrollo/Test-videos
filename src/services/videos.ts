import { supabase } from '../utils/supabaseClient';
import type { Video } from '../types/data';

export const getVideosByCourseId = async (courseId: string): Promise<Video[]> => {
  const { data, error } = await supabase
    .from('videos')
    .select('*')
    .eq('course_id', courseId)
    .order('order', { ascending: true });

  if (error) throw error;
  return data as Video[];
};
