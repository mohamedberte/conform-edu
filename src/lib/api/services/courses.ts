import { supabase } from '@/lib/supabase';
import { Course } from '@/types/tutor';

interface CourseFormData {
  title: string;
  description: string;
  subject_id: string;
  level: 'debutant' | 'intermediaire' | 'avance';
  course_type: 'individual' | 'group' | 'workshop' | 'bootcamp';
  duration_minutes: number;
  max_students: number;
  location_type: 'online' | 'home' | 'expert_place' | 'public_place';
  price_per_hour: number;
  prerequisites?: string[];
  objectives?: string[];
  materials_needed?: string[];
}

export const getExpertCourses = async (expertId: string) => {
  try {
    const { data: coursesData, error } = await supabase
      .from('courses')
      .select(`
        *,
        subject:subjects(
          *,
          category:categories(*)
        )
      `)
      .eq('expert_id', expertId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return coursesData || [];
  } catch (error) {
    console.error('Error loading courses:', error);
    return [];
  }
};

export const updateCourseStatus = async (courseId: string, isActive: boolean) => {
  try {
    const { error } = await supabase
      .from('courses')
      .update({ is_active: isActive })
      .eq('id', courseId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error updating course status:', error);
    return false;
  }
};

export const createCourse = async (expertId: string, formData: CourseFormData) => {
  try {
    const { data: courseData, error } = await supabase
      .from('courses')
      .insert({
        expert_id: expertId,
        subject_id: formData.subject_id,
        title: formData.title,
        description: formData.description,
        course_type: formData.course_type,
        level: formData.level,
        duration_minutes: formData.duration_minutes,
        max_students: formData.max_students,
        price_per_hour: formData.price_per_hour,
        prerequisites: formData.prerequisites,
        objectives: formData.objectives,
        materials_needed: formData.materials_needed,
        location_type: formData.location_type,
        is_active: true
      })
      .select(`
        *,
        subject:subjects(
          *,
          category:categories(*)
        )
      `)
      .single();

    if (error) throw error;
    return { data: courseData, error: null };
  } catch (error) {
    console.error('Error creating course:', error);
    return { data: null, error };
  }
};

export const updateCourse = async (courseId: string, expertId: string, formData: CourseFormData) => {
  try {
    const { data: updatedCourseData, error } = await supabase
      .from('courses')
      .update({
        title: formData.title,
        description: formData.description,
        subject_id: formData.subject_id,
        level: formData.level,
        course_type: formData.course_type,
        duration_minutes: formData.duration_minutes,
        max_students: formData.max_students,
        location_type: formData.location_type,
        price_per_hour: formData.price_per_hour,
        prerequisites: formData.prerequisites,
        objectives: formData.objectives,
        materials_needed: formData.materials_needed
      })
      .eq('id', courseId)
      .eq('expert_id', expertId)  // Security: only owner can modify
      .select(`
        *,
        subject:subjects(
          *,
          category:categories(*)
        )
      `)
      .single();

    if (error) throw error;
    return { data: updatedCourseData, error: null };
  } catch (error) {
    console.error('Error updating course:', error);
    return { data: null, error };
  }
};
