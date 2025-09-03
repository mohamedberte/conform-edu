import { supabase } from '@/lib/supabase';
import { ExpertProfile, DashboardStats, TutorSession, TutorBadge } from '@/types/tutor';

export const getExpertProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('expert_profiles')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error) throw error;
  return data as ExpertProfile;
};

export const getExpertStats = async (expertId: string): Promise<DashboardStats> => {
  // TODO: Implement real stats from database
  return {
    totalStudents: 45,
    totalSessions: 127,
    totalEarnings: 635000,
    averageRating: 4.8,
    thisMonthSessions: 23,
    thisMonthEarnings: 115000,
    upcomingSessions: 8,
    pendingReviews: 3
  };
};

export const getExpertRecentSessions = async (expertId: string): Promise<TutorSession[]> => {
  // TODO: Implement real sessions from database
  return [
    {
      id: '1',
      scheduled_date: '2024-12-01',
      start_time: '14:00',
      end_time: '15:00',
      status: 'completed',
      student_name: 'Aminata Touré',
      course_title: 'Mathématiques - Niveau 3ème',
      total_price: 3000,
      student_rating: 5
    },
    {
      id: '2',
      scheduled_date: '2024-12-01',
      start_time: '16:00',
      end_time: '17:30',
      status: 'confirmed',
      student_name: 'Kofi Asante',
      course_title: 'Physique - Terminale S',
      total_price: 4500
    }
  ];
};

export const getExpertBadges = async (userId: string): Promise<TutorBadge[]> => {
  // TODO: Implement real badges from database
  return [
    { name: 'Expert Vérifié', icon: 'Verified', color: '#10B981' },
    { name: 'Mentor Populaire', icon: 'Heart', color: '#EF4444' },
    { name: '100 Heures Enseignées', icon: 'Clock', color: '#F59E0B' }
  ];
};
