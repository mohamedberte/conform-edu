import { supabase } from '@/lib/supabase';
import type { Course } from '@/types/tutor';

export const createCourse = async (courseData: Omit<Course, 'id'>) => {
  try {
    const { data, error } = await supabase
      .from('courses')
      .insert(courseData)
      .select('*, subject:subjects(*, category:categories(*))')
      .single();

    if (error) throw error;
    return data as Course;
  } catch (error) {
    console.error('Error creating course:', error);
    throw error;
  }
};

export const updateCourse = async (courseId: string, courseData: Partial<Course>) => {
  try {
    const { data, error } = await supabase
      .from('courses')
      .update(courseData)
      .eq('id', courseId)
      .select('*, subject:subjects(*, category:categories(*))')
      .single();

    if (error) throw error;
    return data as Course;
  } catch (error) {
    console.error('Error updating course:', error);
    throw error;
  }
};

export const deleteCourse = async (courseId: string) => {
  try {
    const { error } = await supabase
      .from('courses')
      .delete()
      .eq('id', courseId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting course:', error);
    throw error;
  }
};
