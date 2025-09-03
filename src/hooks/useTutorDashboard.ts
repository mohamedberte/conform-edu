import { useState, useEffect } from 'react';
import {
  getExpertProfile,
  getExpertStats,
  getExpertRecentSessions,
  getExpertBadges
} from '@/lib/api/services/expert';
import { getExpertCourses, updateCourseStatus } from '@/lib/api/services/courses';
import { getCategories, getSubjects } from '@/lib/api/services/categories';
import { createCourse as apiCreateCourse, updateCourse as apiUpdateCourse, deleteCourse } from '@/lib/api/services/course-operations';
import type {
  ExpertProfile,
  TutorUserProfile,
  DashboardStats,
  TutorSession,
  Course,
  Category,
  Subject,
  TutorBadge
} from '@/types/tutor';
import { supabase } from '@/lib/supabase';

interface UseTutorDashboardOptions {
  user: any;
}

export function useTutorDashboard({ user }: UseTutorDashboardOptions) {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [expertProfile, setExpertProfile] = useState<ExpertProfile | null>(null);
  const [userProfile, setUserProfile] = useState<TutorUserProfile | null>(null);
  const [recentSessions, setRecentSessions] = useState<TutorSession[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [badges, setBadges] = useState<TutorBadge[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  
  useEffect(() => {
    if (user) {
      loadDashboardData();
      loadCategoriesAndSubjects();
    }
  }, [user]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Charger le profil utilisateur
      let { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (error && error.code === 'PGRST116') {
        const { data: newProfile } = await supabase.rpc('upsert_user_profile', {
          user_id: user.id,
          email: user.email,
          first_name: user.user_metadata?.first_name,
          last_name: user.user_metadata?.last_name,
          role: user.user_metadata?.role || 'expert',
          phone: user.user_metadata?.phone,
          city: user.user_metadata?.city
        });
        
        profile = newProfile;
      }
      
      setUserProfile(profile);
      
      // Charger le profil expert et autres données
      const expertData = await getExpertProfile(user.id);
      setExpertProfile(expertData);

      if (expertData) {
        const [statsData, sessionsData, coursesData, badgesData] = await Promise.all([
          getExpertStats(expertData.id),
          getExpertRecentSessions(expertData.id),
          getExpertCourses(expertData.id),
          getExpertBadges(user.id)
        ]);

        setStats(statsData);
        setRecentSessions(sessionsData);
        setCourses(coursesData);
        setBadges(badgesData);
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCategoriesAndSubjects = async () => {
    try {
      const [categoriesData, subjectsData] = await Promise.all([
        getCategories(),
        getSubjects()
      ]);
      
      setCategories(categoriesData);
      setSubjects(subjectsData);
    } catch (error) {
      console.error('Error loading categories and subjects:', error);
    }
  };

  const toggleCourseStatus = async (courseId: string, currentStatus: boolean) => {
    try {
      const success = await updateCourseStatus(courseId, !currentStatus);
      if (success) {
        setCourses(prev => prev.map(course => 
          course.id === courseId 
            ? { ...course, is_active: !currentStatus }
            : course
        ));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error toggling course status:', error);
      return false;
    }
  };

  const addCourse = async (courseData: Omit<Course, 'id'>): Promise<Course> => {
    try {
      const newCourse = await apiCreateCourse(courseData);
      setCourses(prev => [...prev, newCourse]);
      return newCourse;
    } catch (error) {
      console.error('Error adding course:', error);
      throw error;
    }
  };

  const modifyCourse = async (courseId: string, courseData: Partial<Course>): Promise<Course> => {
    try {
      const updatedCourse = await apiUpdateCourse(courseId, courseData);
      setCourses(prev => prev.map(course => 
        course.id === courseId ? updatedCourse : course
      ));
      return updatedCourse;
    } catch (error) {
      console.error('Error updating course:', error);
      throw error;
    }
  };

  const removeCourse = async (courseId: string): Promise<boolean> => {
    try {
      await deleteCourse(courseId);
      setCourses(prev => prev.filter(course => course.id !== courseId));
      return true;
    } catch (error) {
      console.error('Error removing course:', error);
      throw error;
    }
  };

  return {
    loading,
    stats,
    expertProfile,
    userProfile,
    recentSessions,
    courses,
    badges,
    subjects,
    categories,
    toggleCourseStatus,
    loadDashboardData,
    loadCategoriesAndSubjects,
    addCourse,
    modifyCourse,
    removeCourse
  };
}
