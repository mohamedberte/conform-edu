import { createClient } from '@supabase/supabase-js'

// Configuration Supabase
// 🔧 PERSONNALISATION: Remplacez ces valeurs par vos vraies clés Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Client Supabase principal
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types TypeScript pour la base de données
// 🔧 PERSONNALISATION: Générez automatiquement ces types avec la CLI Supabase
export interface Database {
  public: {
    Tables: {
      // Table des profils utilisateurs (complète les données auth.users)
      profiles: {
        Row: {
          id: string
          email: string
          first_name: string | null
          last_name: string | null
          role: 'student' | 'teacher' | 'admin' | 'parent'
          avatar_url: string | null
          phone: string | null
          created_at: string
          updated_at: string
          is_active: boolean
        }
        Insert: {
          id: string
          email: string
          first_name?: string | null
          last_name?: string | null
          role?: 'student' | 'teacher' | 'admin' | 'parent'
          avatar_url?: string | null
          phone?: string | null
          created_at?: string
          updated_at?: string
          is_active?: boolean
        }
        Update: {
          id?: string
          email?: string
          first_name?: string | null
          last_name?: string | null
          role?: 'student' | 'teacher' | 'admin' | 'parent'
          avatar_url?: string | null
          phone?: string | null
          created_at?: string
          updated_at?: string
          is_active?: boolean
        }
      }
      // Table des profils étudiants (informations spécifiques aux élèves)
      student_profiles: {
        Row: {
          id: string
          user_id: string
          student_number: string
          date_of_birth: string | null
          address: string | null
          emergency_contact: string | null
          class_id: string | null
          academic_year: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          student_number: string
          date_of_birth?: string | null
          address?: string | null
          emergency_contact?: string | null
          class_id?: string | null
          academic_year: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          student_number?: string
          date_of_birth?: string | null
          address?: string | null
          emergency_contact?: string | null
          class_id?: string | null
          academic_year?: string
          created_at?: string
        }
      }
      // Table des classes/niveaux
      classes: {
        Row: {
          id: string
          name: string
          level: 'seconde' | 'premiere' | 'terminale'
          specialization: string | null
          academic_year: string
          main_teacher_id: string | null
          max_students: number
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          level: 'seconde' | 'premiere' | 'terminale'
          specialization?: string | null
          academic_year: string
          main_teacher_id?: string | null
          max_students?: number
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          level?: 'seconde' | 'premiere' | 'terminale'
          specialization?: string | null
          academic_year?: string
          main_teacher_id?: string | null
          max_students?: number
          created_at?: string
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
    role: 'student' | 'teacher' | 'admin' | 'parent'
    phone?: string
  }) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: userData.firstName,
          last_name: userData.lastName,
          role: userData.role,
          phone: userData.phone || null
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
    
    return data
  },

  // Créer un profil étudiant
  async createStudentProfile(userId: string, studentData: {
    studentNumber: string
    dateOfBirth?: string
    address?: string
    emergencyContact?: string
    classId?: string
    academicYear: string
  }) {
    const { data, error } = await supabase
      .from('student_profiles')
      .insert({
        user_id: userId,
        student_number: studentData.studentNumber,
        date_of_birth: studentData.dateOfBirth || null,
        address: studentData.address || null,
        emergency_contact: studentData.emergencyContact || null,
        class_id: studentData.classId || null,
        academic_year: studentData.academicYear
      })
    
    return { data, error }
  }
}

// Hook pour écouter les changements d'authentification
export const useAuthStateChange = (callback: (user: any) => void) => {
  return supabase.auth.onAuthStateChange((event, session) => {
    callback(session?.user || null)
  })
}