import { createClient } from '@supabase/supabase-js'

// Configuration Supabase
// 🔧 PERSONNALISATION: Remplacez ces valeurs par vos vraies clés Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Client Supabase principal
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types TypeScript pour la nouvelle base de données Conform-Edu
// 🔧 PERSONNALISATION: Générez automatiquement ces types avec la CLI Supabase
export interface Database {
  public: {
    Tables: {
      // Table des profils utilisateurs étendus
      profiles: {
        Row: {
          id: string
          email: string
          first_name: string | null
          last_name: string | null
          role: 'student' | 'expert' | 'parent' | 'admin'
          avatar_url: string | null
          phone: string | null
          city: string | null
          district: string | null
          date_of_birth: string | null
          gender: 'M' | 'F' | 'other' | null
          preferred_language: 'fr' | 'en'
          is_verified: boolean
          verification_documents: any | null
          created_at: string
          updated_at: string
          is_active: boolean
        }
        Insert: {
          id: string
          email: string
          first_name?: string | null
          last_name?: string | null
          role?: 'student' | 'expert' | 'parent' | 'admin'
          avatar_url?: string | null
          phone?: string | null
          city?: string | null
          district?: string | null
          date_of_birth?: string | null
          gender?: 'M' | 'F' | 'other' | null
          preferred_language?: 'fr' | 'en'
          is_verified?: boolean
          verification_documents?: any | null
          created_at?: string
          updated_at?: string
          is_active?: boolean
        }
        Update: {
          id?: string
          email?: string
          first_name?: string | null
          last_name?: string | null
          role?: 'student' | 'expert' | 'parent' | 'admin'
          avatar_url?: string | null
          phone?: string | null
          city?: string | null
          district?: string | null
          date_of_birth?: string | null
          gender?: 'M' | 'F' | 'other' | null
          preferred_language?: 'fr' | 'en'
          is_verified?: boolean
          verification_documents?: any | null
          created_at?: string
          updated_at?: string
          is_active?: boolean
        }
      }
      // Table des profils experts/tuteurs
      expert_profiles: {
        Row: {
          id: string
          user_id: string
          expert_code: string
          bio: string | null
          years_experience: number | null
          education_level: string | null
          diplomas: any | null
          certifications: any | null
          specializations: string[] | null
          teaching_modes: string[] | null
          available_hours: any | null
          hourly_rate_min: number | null
          hourly_rate_max: number | null
          accepts_mobile_money: boolean
          mobile_money_number: string | null
          rating_average: number
          total_reviews: number
          total_hours_taught: number
          total_students: number
          is_verified: boolean
          verification_status: 'pending' | 'approved' | 'rejected'
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          expert_code: string
          bio?: string | null
          years_experience?: number | null
          education_level?: string | null
          diplomas?: any | null
          certifications?: any | null
          specializations?: string[] | null
          teaching_modes?: string[] | null
          available_hours?: any | null
          hourly_rate_min?: number | null
          hourly_rate_max?: number | null
          accepts_mobile_money?: boolean
          mobile_money_number?: string | null
          rating_average?: number
          total_reviews?: number
          total_hours_taught?: number
          total_students?: number
          is_verified?: boolean
          verification_status?: 'pending' | 'approved' | 'rejected'
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          expert_code?: string
          bio?: string | null
          years_experience?: number | null
          education_level?: string | null
          diplomas?: any | null
          certifications?: any | null
          specializations?: string[] | null
          teaching_modes?: string[] | null
          available_hours?: any | null
          hourly_rate_min?: number | null
          hourly_rate_max?: number | null
          accepts_mobile_money?: boolean
          mobile_money_number?: string | null
          rating_average?: number
          total_reviews?: number
          total_hours_taught?: number
          total_students?: number
          is_verified?: boolean
          verification_status?: 'pending' | 'approved' | 'rejected'
          created_at?: string
        }
      }
      // Table des catégories de formation
      categories: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          icon: string | null
          color: string | null
          is_active: boolean
          display_order: number
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description?: string | null
          icon?: string | null
          color?: string | null
          is_active?: boolean
          display_order?: number
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          description?: string | null
          icon?: string | null
          color?: string | null
          is_active?: boolean
          display_order?: number
          created_at?: string
        }
      }
      // Table des matières/sujets
      subjects: {
        Row: {
          id: string
          category_id: string
          name: string
          slug: string
          description: string | null
          level_tags: string[] | null
          age_groups: string[] | null
          keywords: string[] | null
          is_popular: boolean
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          category_id: string
          name: string
          slug: string
          description?: string | null
          level_tags?: string[] | null
          age_groups?: string[] | null
          keywords?: string[] | null
          is_popular?: boolean
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          category_id?: string
          name?: string
          slug?: string
          description?: string | null
          level_tags?: string[] | null
          age_groups?: string[] | null
          keywords?: string[] | null
          is_popular?: boolean
          is_active?: boolean
          created_at?: string
        }
      }
      // Table des cours proposés
      courses: {
        Row: {
          id: string
          expert_id: string
          subject_id: string
          title: string
          description: string | null
          course_type: 'individual' | 'group' | 'workshop' | 'bootcamp'
          level: 'debutant' | 'intermediaire' | 'avance'
          duration_minutes: number | null
          max_students: number
          price_per_hour: number
          package_deals: any | null
          prerequisites: string[] | null
          objectives: string[] | null
          materials_needed: string[] | null
          location_type: 'online' | 'home' | 'expert_place' | 'public_place'
          cover_image_url: string | null
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          expert_id: string
          subject_id: string
          title: string
          description?: string | null
          course_type?: 'individual' | 'group' | 'workshop' | 'bootcamp'
          level?: 'debutant' | 'intermediaire' | 'avance'
          duration_minutes?: number | null
          max_students?: number
          price_per_hour: number
          package_deals?: any | null
          prerequisites?: string[] | null
          objectives?: string[] | null
          materials_needed?: string[] | null
          location_type?: 'online' | 'home' | 'expert_place' | 'public_place'
          cover_image_url?: string | null
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          expert_id?: string
          subject_id?: string
          title?: string
          description?: string | null
          course_type?: 'individual' | 'group' | 'workshop' | 'bootcamp'
          level?: 'debutant' | 'intermediaire' | 'avance'
          duration_minutes?: number | null
          max_students?: number
          price_per_hour?: number
          package_deals?: any | null
          prerequisites?: string[] | null
          objectives?: string[] | null
          materials_needed?: string[] | null
          location_type?: 'online' | 'home' | 'expert_place' | 'public_place'
          cover_image_url?: string | null
          is_active?: boolean
          created_at?: string
        }
      }
      // Table des sessions de cours
      sessions: {
        Row: {
          id: string
          course_id: string
          student_id: string
          expert_id: string
          scheduled_date: string
          start_time: string
          end_time: string
          duration_minutes: number
          total_price: number
          status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show'
          meeting_link: string | null
          meeting_room: string | null
          notes: string | null
          homework: string | null
          resources_shared: any | null
          student_feedback: string | null
          expert_feedback: string | null
          student_rating: number | null
          expert_rating: number | null
          cancelled_by: string | null
          cancellation_reason: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          course_id: string
          student_id: string
          expert_id: string
          scheduled_date: string
          start_time: string
          end_time: string
          duration_minutes: number
          total_price: number
          status?: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show'
          meeting_link?: string | null
          meeting_room?: string | null
          notes?: string | null
          homework?: string | null
          resources_shared?: any | null
          student_feedback?: string | null
          expert_feedback?: string | null
          student_rating?: number | null
          expert_rating?: number | null
          cancelled_by?: string | null
          cancellation_reason?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          course_id?: string
          student_id?: string
          expert_id?: string
          scheduled_date?: string
          start_time?: string
          end_time?: string
          duration_minutes?: number
          total_price?: number
          status?: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show'
          meeting_link?: string | null
          meeting_room?: string | null
          notes?: string | null
          homework?: string | null
          resources_shared?: any | null
          student_feedback?: string | null
          expert_feedback?: string | null
          student_rating?: number | null
          expert_rating?: number | null
          cancelled_by?: string | null
          cancellation_reason?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}

// Type du client Supabase avec typage de la base de données
export type SupabaseClient = ReturnType<typeof createClient<Database>>

// Fonctions utilitaires pour l'authentification
// 🔧 PERSONNALISATION: Ajoutez vos propres fonctions métier ici

export const authHelpers = {
  // Inscription d'un nouvel utilisateur
  async signUp(email: string, password: string, userData: { 
    firstName: string
    lastName: string
    role: 'student' | 'expert' | 'admin' | 'parent'
    phone?: string
    city?: string
  }) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: userData.firstName,
          last_name: userData.lastName,
          role: userData.role,
          phone: userData.phone || null,
          city: userData.city || null
        }
      }
    })
    
    return { data, error }
  },

  // Connexion d'un utilisateur
  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    
    return { data, error }
  },

  // Déconnexion
  async signOut() {
    const { error } = await supabase.auth.signOut()
    return { error }
  },

  // Obtenir l'utilisateur actuel
  async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser()
    return { user, error }
  },

  // Obtenir le profil complet de l'utilisateur
  async getUserProfile(userId: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    
    return { data, error }
  },

  // Créer ou synchroniser le profil utilisateur
  async createOrUpdateUserProfile(user: any) {
    const profileData = {
      id: user.id,
      email: user.email,
      first_name: user.user_metadata?.first_name,
      last_name: user.user_metadata?.last_name,
      role: user.user_metadata?.role || 'student',
      phone: user.user_metadata?.phone,
      city: user.user_metadata?.city,
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('profiles')
      .upsert(profileData, { onConflict: 'id' })
      .select()
      .single();
    
    return { data, error };
  },

  // 🔧 NOUVELLES FONCTIONS POUR LE SYSTÈME DE MARKETPLACE

  // Rechercher des cours/experts
  async searchCourses(query: string, filters?: {
    category?: string
    subject?: string
    priceRange?: { min: number; max: number }
    location?: string
    level?: string
  }) {
    let queryBuilder = supabase
      .from('courses')
      .select(`
        *,
        expert_profiles(*,profiles(*)),
        subjects(*,categories(*))
      `)
      .eq('is_active', true)
    
    if (query) {
      queryBuilder = queryBuilder.or(`title.ilike.%${query}%,description.ilike.%${query}%`)
    }
    
    if (filters?.priceRange) {
      queryBuilder = queryBuilder
        .gte('price_per_hour', filters.priceRange.min)
        .lte('price_per_hour', filters.priceRange.max)
    }
    
    if (filters?.level) {
      queryBuilder = queryBuilder.eq('level', filters.level)
    }
    
    const { data, error } = await queryBuilder.limit(20)
    return { data, error }
  },

  // Créer un profil expert
  async createExpertProfile(userId: string, expertData: {
    bio: string
    specializations: string[]
    hourlyRateMin: number
    hourlyRateMax: number
    teachingModes: string[]
    educationLevel?: string
    yearsExperience?: number
  }) {
    // Générer un code expert unique
    const expertCode = `EXP${Date.now()}`
    
    const { data, error } = await supabase
      .from('expert_profiles')
      .insert({
        user_id: userId,
        expert_code: expertCode,
        bio: expertData.bio,
        specializations: expertData.specializations,
        hourly_rate_min: expertData.hourlyRateMin,
        hourly_rate_max: expertData.hourlyRateMax,
        teaching_modes: expertData.teachingModes,
        education_level: expertData.educationLevel || null,
        years_experience: expertData.yearsExperience || null
      })
    
    return { data, error }
  },

  // Réserver une session
  async bookSession(sessionData: {
    courseId: string
    studentId: string
    expertId: string
    scheduledDate: string
    startTime: string
    endTime: string
    durationMinutes: number
    totalPrice: number
  }) {
    const { data, error } = await supabase
      .from('sessions')
      .insert({
        course_id: sessionData.courseId,
        student_id: sessionData.studentId,
        expert_id: sessionData.expertId,
        scheduled_date: sessionData.scheduledDate,
        start_time: sessionData.startTime,
        end_time: sessionData.endTime,
        duration_minutes: sessionData.durationMinutes,
        total_price: sessionData.totalPrice,
        status: 'pending'
      })
    
    return { data, error }
  },

  // Obtenir les sessions d'un utilisateur
  async getUserSessions(userId: string, role: 'student' | 'expert') {
    const column = role === 'student' ? 'student_id' : 'expert_id'
    
    const { data, error } = await supabase
      .from('sessions')
      .select(`
        *,
        courses(*,subjects(*)),
        profiles!student_id(*),
        expert_profiles!expert_id(*,profiles(*))
      `)
      .eq(column, userId)
      .order('scheduled_date', { ascending: false })
    
    return { data, error }
  },

  // Obtenir les catégories avec statistiques
  async getCategoriesWithStats() {
    const { data, error } = await supabase
      .from('categories')
      .select(`
        *,
        subjects(count)
      `)
      .eq('is_active', true)
      .order('display_order')
    
    return { data, error }
  },

  // Obtenir la progression d'apprentissage
  async getLearningProgress(userId: string) {
    const { data, error } = await supabase
      .from('learning_progress')
      .select(`
        *,
        subjects(*,categories(*))
      `)
      .eq('user_id', userId)
    
    return { data, error }
  },

  // 🔧 PERSONNALISATION: Fonctions pour la gestion des mots de passe
  
  // Demander un email de réinitialisation de mot de passe
  resetPasswordForEmail: async (email: string, redirectTo?: string) => {
    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectTo || `${window.location.origin}/reset-password`
      });
      
      return { data, error };
    } catch (error) {
      console.error('Erreur lors de la demande de réinitialisation:', error);
      return { data: null, error };
    }
  },

  // Mettre à jour le mot de passe avec un token de réinitialisation
  updatePassword: async (newPassword: string) => {
    try {
      const { data, error } = await supabase.auth.updateUser({
        password: newPassword
      });
      
      return { data, error };
    } catch (error) {
      console.error('Erreur lors de la mise à jour du mot de passe:', error);
      return { data: null, error };
    }
  },

  // Vérifier si un token de réinitialisation est valide
  verifyResetToken: async (accessToken: string) => {
    try {
      const { data, error } = await supabase.auth.getUser(accessToken);
      return { data, error };
    } catch (error) {
      console.error('Erreur lors de la vérification du token:', error);
      return { data: null, error };
    }
  },

  // Établir une session avec un token d'accès (pour la réinitialisation)
  setSessionFromToken: async (accessToken: string, refreshToken: string = '') => {
    try {
      const { data, error } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken
      });
      
      return { data, error };
    } catch (error) {
      console.error('Erreur lors de l\'établissement de la session:', error);
      return { data: null, error };
    }
  },
}

// Hook pour écouter les changements d'authentification
export const useAuthStateChange = (callback: (user: any) => void) => {
  return supabase.auth.onAuthStateChange((event, session) => {
    callback(session?.user || null)
  })
}