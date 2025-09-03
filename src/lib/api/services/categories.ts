import { supabase } from '@/lib/supabase';
import { Category, Subject } from '@/types/tutor';

export const getCategories = async () => {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .order('display_order');

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error loading categories:', error);
    return [];
  }
};

export const getSubjects = async () => {
  try {
    const { data, error } = await supabase
      .from('subjects')
      .select('*, category:categories(*)')
      .eq('is_active', true)
      .order('name');

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error loading subjects:', error);
    return [];
  }
};
