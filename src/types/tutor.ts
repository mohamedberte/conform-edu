export interface DashboardStats {
  totalStudents: number;
  totalSessions: number;
  totalEarnings: number;
  averageRating: number;
  thisMonthSessions: number;
  thisMonthEarnings: number;
  upcomingSessions: number;
  pendingReviews: number;
}

export interface ExpertProfile {
  id: string;
  user_id: string;
  expert_code: string;
  bio: string;
  years_experience: number;
  education_level: string;
  specializations: string[];
  teaching_modes: string[];
  hourly_rate_min: number;
  hourly_rate_max: number;
  rating_average: number;
  total_reviews: number;
  total_hours_taught: number;
  total_students: number;
  is_verified: boolean;
  verification_status: string;
}

export interface TutorUserProfile {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  phone: string;
  city: string;
  district: string;
  date_of_birth: string;
  gender: string;
}

export interface TutorSession {
  id: string;
  scheduled_date: string;
  start_time: string;
  end_time: string;
  status: string;
  student_name: string;
  course_title: string;
  total_price: number;
  student_rating?: number;
}

export interface Course {
  id: string;
  expert_id: string;
  subject_id: string;
  title: string;
  description: string;
  course_type: 'individual' | 'group' | 'workshop' | 'bootcamp';
  level: 'debutant' | 'intermediaire' | 'avance';
  duration_minutes: number;
  max_students: number;
  price_per_hour: number;
  package_deals?: any;
  prerequisites?: string[];
  objectives?: string[];
  materials_needed?: string[];
  location_type: 'online' | 'home' | 'expert_place' | 'public_place';
  cover_image_url?: string;
  is_active: boolean;
  created_at?: string;
  total_bookings?: number;
  subject?: Subject;
}

export interface Subject {
  id: string;
  category_id: string;
  name: string;
  slug: string;
  description: string;
  level_tags: string[];
  age_groups: string[];
  keywords: string[];
  is_popular: boolean;
  is_active: boolean;
  category?: Category;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  color: string;
  is_active: boolean;
  display_order: number;
}

export interface TutorBadge {
  name: string;
  icon: string;
  color: string;
}
