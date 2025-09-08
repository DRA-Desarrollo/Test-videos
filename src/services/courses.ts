import { supabase } from '../utils/supabaseClient';
import type { Course } from '../types/data';

export const getCourse = async (courseId: string): Promise<Course | null> => {
console.log('(courses.ts) Querying course with id:', courseId);  
  const { data, error } = await supabase
    .from('courses')
    .select('*')
    .eq('id', courseId)
    .single();

  if (error) {
    console.error('Error fetching course:', error);
    return null;
  }
  return data as Course;
};

export const getCourses = async (): Promise<Course[]> => {
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .order('orden', { ascending: true });
  
    if (error) throw error;
    return data as Course[];
  };
