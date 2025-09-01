'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import ProfileMenu from '@/components/ui/profile-menu';
import { 
  Users, 
  Calendar, 
  DollarSign, 
  Star, 
  BookOpen, 
  Clock, 
  TrendingUp,
  MessageSquare,
  Award,
  CheckCircle,
  AlertCircle,
  Plus,
  Edit,
  Eye,
  Filter,
  BarChart3,
  Heart,
  Trophy,
  Crown,
  Activity,
  MapPin,
  Phone,
  Mail,
  Verified,
  Camera,
  Menu,
  X,
  Globe,
  Home,
  Building,
  ArrowLeft,
  ArrowRight,
  User
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface TutorDashboardProps {
  user: any;
  onLogout?: () => void;
}

interface DashboardStats {
  totalStudents: number;
  totalSessions: number;
  totalEarnings: number;
  averageRating: number;
  thisMonthSessions: number;
  thisMonthEarnings: number;
  upcomingSessions: number;
  pendingReviews: number;
}

interface ExpertProfile {
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

interface UserProfile {
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

interface Session {
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

interface Course {
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
  total_bookings?: number; // Optionnel car peut ne pas exister dans la base
  // Relations
  subject?: Subject;
}

interface Subject {
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
  // Relations
  category?: Category;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  color: string;
  is_active: boolean;
  display_order: number;
}

export default function TutorDashboard({ user, onLogout }: TutorDashboardProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [expertProfile, setExpertProfile] = useState<ExpertProfile | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [recentSessions, setRecentSessions] = useState<Session[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [badges, setBadges] = useState<any[]>([]);
  
  // États pour le popup d'ajout de cours
  const [showAddCourseModal, setShowAddCourseModal] = useState(false);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  
  // États pour la modification de cours
  const [showEditCourseModal, setShowEditCourseModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  
  // États pour les notifications
  const [notification, setNotification] = useState<{
    show: boolean;
    type: 'success' | 'error' | 'info';
    title: string;
    message: string;
  }>({
    show: false,
    type: 'success',
    title: '',
    message: ''
  });

  // Fonction utilitaire pour afficher les notifications
  const showNotification = (type: 'success' | 'error' | 'info', title: string, message: string) => {
    setNotification({
      show: true,
      type,
      title,
      message
    });
    
    // Auto-hide après 5 secondes
    setTimeout(() => {
      setNotification(prev => ({ ...prev, show: false }));
    }, 5000);
  };

  useEffect(() => {
    loadDashboardData();
    loadCategoriesAndSubjects();
  }, [user]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      console.log('🔄 Chargement des données dashboard...', { userId: user.id });
      
      // Essayer de récupérer le profil utilisateur complet depuis la table profiles
      let { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      // Si le profil n'existe pas, le créer à partir des données auth
      if (error && error.code === 'PGRST116') {
        console.log('📝 Création du profil utilisateur manquant...');
        const { data: newProfile } = await supabase.rpc('upsert_user_profile', {
          user_id: user.id,
          email: user.email,
          first_name: user.user_metadata?.first_name,
          last_name: user.user_metadata?.last_name,
          role: user.user_metadata?.role || 'expert',
          phone: user.user_metadata?.phone,
          city: user.user_metadata?.city
        });
        
        if (!newProfile) {
          // Fallback : insertion directe
          const { data: insertedProfile } = await supabase
            .from('profiles')
            .insert({
              id: user.id,
              email: user.email,
              first_name: user.user_metadata?.first_name,
              last_name: user.user_metadata?.last_name,
              role: user.user_metadata?.role || 'expert',
              phone: user.user_metadata?.phone,
              city: user.user_metadata?.city
            })
            .select()
            .single();
          
          profile = insertedProfile;
        } else {
          profile = newProfile;
        }
      }
      
      console.log('👤 Profil utilisateur:', profile);
      setUserProfile(profile);
      
      // Charger le profil expert
      const { data: expertData } = await supabase
        .from('expert_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      console.log('🎓 Profil expert:', expertData);
      setExpertProfile(expertData);

      if (expertData) {
        await Promise.all([
          loadStats(expertData.id),
          loadRecentSessions(expertData.id),
          loadCourses(expertData.id),
          loadBadges(user.id)
        ]);
      }
    } catch (error) {
      console.error('❌ Erreur lors du chargement:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async (expertId: string) => {
    // Simuler les statistiques (à remplacer par de vraies requêtes)
    const mockStats: DashboardStats = {
      totalStudents: 45,
      totalSessions: 127,
      totalEarnings: 635000,
      averageRating: 4.8,
      thisMonthSessions: 23,
      thisMonthEarnings: 115000,
      upcomingSessions: 8,
      pendingReviews: 3
    };
    setStats(mockStats);
  };

  const loadRecentSessions = async (expertId: string) => {
    // Simuler les sessions récentes
    const mockSessions: Session[] = [
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
    setRecentSessions(mockSessions);
  };

  const loadCourses = async (expertId: string) => {
    // Simuler les cours avec la structure complète de la base de données
    const mockCourses: Course[] = [
      {
        id: '1',
        expert_id: expertId,
        subject_id: 'math-college',
        title: 'Mathématiques - Niveau Collège',
        description: 'Soutien scolaire en mathématiques pour les classes de 6ème à 3ème. Algèbre, géométrie, calculs et résolution de problèmes.',
        course_type: 'individual',
        level: 'intermediaire',
        duration_minutes: 60,
        max_students: 1,
        price_per_hour: 3000,
        prerequisites: ['Bases du calcul', 'Arithmétique'],
        objectives: ['Maîtrise des équations', 'Géométrie plane', 'Résolution de problèmes'],
        materials_needed: ['Calculatrice', 'Cahier', 'Compas', 'Règle'],
        location_type: 'online',
        is_active: true,
        total_bookings: 45,
        subject: {
          id: 'math-college',
          category_id: 'scolaire',
          name: 'Mathématiques Collège',
          slug: 'mathematiques-college',
          description: 'Mathématiques niveau collège',
          level_tags: ['intermediaire'],
          age_groups: ['adolescent'],
          keywords: ['maths', 'algèbre', 'géométrie'],
          is_popular: true,
          is_active: true,
          category: {
            id: 'scolaire',
            name: 'Scolaire',
            slug: 'scolaire',
            description: 'Soutien scolaire et préparation aux examens',
            icon: 'BookOpen',
            color: '#F97316',
            is_active: true,
            display_order: 1
          }
        }
      }
    ];
    
    // Chargement depuis la base de données
    try {
      console.log('🔄 Chargement des cours pour expert:', expertId);
      
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

      if (error) {
        console.error('❌ Erreur lors du chargement des cours:', error);
        // Fallback vers les données simulées en cas d'erreur
        setCourses(mockCourses);
        return;
      }

      console.log('✅ Cours chargés depuis la base:', coursesData);
      setCourses(coursesData || []);
      
    } catch (error) {
      console.error('❌ Erreur lors du chargement des cours:', error);
      // Fallback vers les données simulées en cas d'erreur
      setCourses(mockCourses);
    }
  };

  const loadBadges = async (userId: string) => {
    // Simuler les badges
    const mockBadges = [
      { name: 'Expert Vérifié', icon: 'Verified', color: '#10B981' },
      { name: 'Mentor Populaire', icon: 'Heart', color: '#EF4444' },
      { name: '100 Heures Enseignées', icon: 'Clock', color: '#F59E0B' }
    ];
    setBadges(mockBadges);
  };

  const loadCategoriesAndSubjects = async () => {
    try {
      // Charger les catégories
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('display_order');

      if (categoriesError) {
        console.error('Erreur lors du chargement des catégories:', categoriesError);
        // Fallback avec des catégories de base
        setCategories([
          { id: '1', name: 'Scolaire', slug: 'scolaire', description: '', icon: '', color: '', is_active: true, display_order: 1 },
          { id: '2', name: 'Langues', slug: 'langues', description: '', icon: '', color: '', is_active: true, display_order: 2 },
          { id: '3', name: 'Informatique', slug: 'informatique', description: '', icon: '', color: '', is_active: true, display_order: 3 }
        ]);
      } else {
        setCategories(categoriesData || []);
      }

      // Charger les sujets
      const { data: subjectsData, error: subjectsError } = await supabase
        .from('subjects')
        .select('*, category:categories(*)')
        .eq('is_active', true)
        .order('name');

      if (subjectsError) {
        console.error('Erreur lors du chargement des sujets:', subjectsError);
        // Fallback avec des sujets de base
        setSubjects([
          { id: '1', category_id: '1', name: 'Mathématiques', slug: 'mathematiques', description: '', level_tags: [], age_groups: [], keywords: [], is_popular: true, is_active: true },
          { id: '2', category_id: '1', name: 'Français', slug: 'francais', description: '', level_tags: [], age_groups: [], keywords: [], is_popular: true, is_active: true },
          { id: '3', category_id: '2', name: 'Anglais', slug: 'anglais', description: '', level_tags: [], age_groups: [], keywords: [], is_popular: true, is_active: true }
        ]);
      } else {
        setSubjects(subjectsData || []);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des catégories et sujets:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getVerificationStatus = () => {
    if (!expertProfile) return null;
    
    switch (expertProfile.verification_status) {
      case 'approved':
        return (
          <Badge className="bg-green-100 text-green-800 border-green-200">
            <CheckCircle className="h-3 w-3 mr-1" />
            Profil Vérifié
          </Badge>
        );
      case 'pending':
        return (
          <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
            <Clock className="h-3 w-3 mr-1" />
            Vérification en cours
          </Badge>
        );
      case 'rejected':
        return (
          <Badge className="bg-red-100 text-red-800 border-red-200">
            <AlertCircle className="h-3 w-3 mr-1" />
            Vérification refusée
          </Badge>
        );
      default:
        return (
          <Badge className="bg-gray-100 text-gray-800 border-gray-200">
            <AlertCircle className="h-3 w-3 mr-1" />
            Non vérifié
          </Badge>
        );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement de votre tableau de bord...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <div className="h-12 w-12 bg-gradient-to-r from-green-500 to-orange-500 rounded-xl flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                  Tableau de bord - Expert
                </h1>
                <p className="text-gray-600 text-sm sm:text-base">
                  Bienvenue, {userProfile?.first_name} {userProfile?.last_name}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {/* Bouton menu mobile */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100"
              >
                {mobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
              
              {/* Menu profil - masqué sur très petit écran */}
              <div className="hidden sm:block">
                <ProfileMenu
                  user={user}
                  userProfile={userProfile}
                  expertProfile={expertProfile}
                  onProfileClick={() => setActiveTab('profile')}
                  onSettingsClick={() => console.log('Ouvrir les paramètres')}
                  onLogout={onLogout}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Navigation desktop */}
          <nav className="hidden lg:flex space-x-8">
            {[
              { id: 'overview', label: 'Vue d\'ensemble', icon: BarChart3 },
              { id: 'profile', label: 'Mon Profil', icon: Users },
              { id: 'courses', label: 'Mes Cours', icon: BookOpen },
              { id: 'sessions', label: 'Sessions', icon: Calendar },
              { id: 'earnings', label: 'Revenus', icon: DollarSign },
              { id: 'reviews', label: 'Évaluations', icon: Star },
              { id: 'messages', label: 'Messages', icon: MessageSquare }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center px-1 py-4 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-orange-500 text-orange-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {tab.label}
                </button>
              );
            })}
          </nav>

          {/* Navigation mobile - dropdown */}
          <div className="lg:hidden">
            {mobileMenuOpen && (
              <div className="absolute left-0 right-0 bg-white border-b shadow-lg z-50">
                <div className="px-4 py-2 space-y-1">
                  {[
                    { id: 'overview', label: 'Vue d\'ensemble', icon: BarChart3 },
                    { id: 'profile', label: 'Mon Profil', icon: Users },
                    { id: 'courses', label: 'Mes Cours', icon: BookOpen },
                    { id: 'sessions', label: 'Sessions', icon: Calendar },
                    { id: 'earnings', label: 'Revenus', icon: DollarSign },
                    { id: 'reviews', label: 'Évaluations', icon: Star },
                    { id: 'messages', label: 'Messages', icon: MessageSquare }
                  ].map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => {
                          setActiveTab(tab.id);
                          setMobileMenuOpen(false);
                        }}
                        className={`flex items-center w-full px-3 py-3 rounded-lg text-sm font-medium ${
                          activeTab === tab.id
                            ? 'bg-orange-50 text-orange-600 border-l-4 border-orange-500'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        }`}
                      >
                        <Icon className="h-5 w-5 mr-3" />
                        {tab.label}
                      </button>
                    );
                  })}
                  
                  {/* Menu profil sur mobile */}
                  <div className="border-t pt-3 mt-3 sm:hidden">
                    <div className="px-3 py-2">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="h-10 w-10 bg-gradient-to-r from-green-500 to-orange-500 rounded-full flex items-center justify-center text-white font-semibold">
                          {userProfile?.first_name?.[0]}{userProfile?.last_name?.[0]}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900 text-sm">
                            {userProfile?.first_name} {userProfile?.last_name}
                          </div>
                          <div className="text-xs text-gray-500">{user.email}</div>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          onLogout?.();
                          setMobileMenuOpen(false);
                        }}
                        className="flex items-center w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        <X className="h-4 w-4 mr-2" />
                        Déconnexion
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Onglet actuel affiché sur mobile */}
            <div className="flex items-center justify-between py-4">
              <div className="flex items-center">
                {(() => {
                  const currentTab = [
                    { id: 'overview', label: 'Vue d\'ensemble', icon: BarChart3 },
                    { id: 'profile', label: 'Mon Profil', icon: Users },
                    { id: 'courses', label: 'Mes Cours', icon: BookOpen },
                    { id: 'sessions', label: 'Sessions', icon: Calendar },
                    { id: 'earnings', label: 'Revenus', icon: DollarSign },
                    { id: 'reviews', label: 'Évaluations', icon: Star },
                    { id: 'messages', label: 'Messages', icon: MessageSquare }
                  ].find(tab => tab.id === activeTab);
                  
                  if (currentTab) {
                    const Icon = currentTab.icon;
                    return (
                      <>
                        <Icon className="h-5 w-5 mr-2 text-orange-600" />
                        <span className="font-medium text-gray-900">{currentTab.label}</span>
                      </>
                    );
                  }
                })()}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && (
          <div className="space-y-6 sm:space-y-8">
            {/* Statistiques principales */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              <Card>
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Étudiants actifs</p>
                      <p className="text-2xl sm:text-3xl font-bold text-gray-900">{stats?.totalStudents}</p>
                    </div>
                    <div className="h-10 w-10 sm:h-12 sm:w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Users className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                    </div>
                  </div>
                  <div className="mt-3 sm:mt-4 flex items-center text-sm">
                    <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                    <span className="text-green-600">+12% ce mois</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Sessions totales</p>
                      <p className="text-2xl sm:text-3xl font-bold text-gray-900">{stats?.totalSessions}</p>
                    </div>
                    <div className="h-10 w-10 sm:h-12 sm:w-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <Calendar className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
                    </div>
                  </div>
                  <div className="mt-3 sm:mt-4 flex items-center text-sm">
                    <span className="text-gray-600">{stats?.thisMonthSessions} ce mois</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Revenus totaux</p>
                      <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
                        {stats?.totalEarnings?.toLocaleString()} CFA
                      </p>
                    </div>
                    <div className="h-10 w-10 sm:h-12 sm:w-12 bg-orange-100 rounded-lg flex items-center justify-center">
                      <DollarSign className="h-5 w-5 sm:h-6 sm:w-6 text-orange-600" />
                    </div>
                  </div>
                  <div className="mt-3 sm:mt-4 flex items-center text-sm">
                    <span className="text-gray-600">{stats?.thisMonthEarnings?.toLocaleString()} CFA ce mois</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Note moyenne</p>
                      <div className="flex items-center mt-1">
                        <p className="text-2xl sm:text-3xl font-bold text-gray-900">{stats?.averageRating}</p>
                        <Star className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-400 ml-2 fill-current" />
                      </div>
                    </div>
                    <div className="h-10 w-10 sm:h-12 sm:w-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                      <Trophy className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-600" />
                    </div>
                  </div>
                  <div className="mt-3 sm:mt-4 flex items-center text-sm">
                    <span className="text-gray-600">{expertProfile?.total_reviews} avis reçus</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sessions récentes et prochaines */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
              {/* Sessions récentes */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Sessions récentes</span>
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-2" />
                      Voir tout
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentSessions.map((session) => (
                      <div key={session.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{session.student_name}</h4>
                          <p className="text-sm text-gray-600">{session.course_title}</p>
                          <div className="flex items-center mt-2 space-x-4">
                            <span className="text-xs text-gray-500">
                              {session.scheduled_date} • {session.start_time}-{session.end_time}
                            </span>
                            <Badge className={getStatusColor(session.status)}>
                              {session.status === 'completed' ? 'Terminé' : 
                               session.status === 'confirmed' ? 'Confirmé' : session.status}
                            </Badge>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-gray-900">{session.total_price} CFA</p>
                          {session.student_rating && (
                            <div className="flex items-center mt-1">
                              <Star className="h-4 w-4 text-yellow-400 fill-current" />
                              <span className="text-sm text-gray-600 ml-1">{session.student_rating}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Actions rapides */}
              <Card>
                <CardHeader>
                  <CardTitle>Actions rapides</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3 sm:gap-4">
                    <Button className="h-16 sm:h-20 bg-gradient-to-r from-green-500 to-green-600 text-white">
                      <div className="text-center">
                        <Plus className="h-5 w-5 sm:h-6 sm:w-6 mx-auto mb-1 sm:mb-2" />
                        <span className="text-xs sm:text-sm">Nouveau cours</span>
                      </div>
                    </Button>
                    <Button variant="outline" className="h-16 sm:h-20">
                      <div className="text-center">
                        <Calendar className="h-5 w-5 sm:h-6 sm:w-6 mx-auto mb-1 sm:mb-2" />
                        <span className="text-xs sm:text-sm">Mes créneaux</span>
                      </div>
                    </Button>
                    <Button variant="outline" className="h-16 sm:h-20">
                      <div className="text-center">
                        <Edit className="h-5 w-5 sm:h-6 sm:w-6 mx-auto mb-1 sm:mb-2" />
                        <span className="text-xs sm:text-sm">Modifier profil</span>
                      </div>
                    </Button>
                    <Button variant="outline" className="h-16 sm:h-20">
                      <div className="text-center">
                        <MessageSquare className="h-5 w-5 sm:h-6 sm:w-6 mx-auto mb-1 sm:mb-2" />
                        <span className="text-xs sm:text-sm">Messages</span>
                      </div>
                    </Button>
                  </div>

                  {/* Badges et accomplissements */}
                  <div className="mt-6 sm:mt-8">
                    <h3 className="font-medium text-gray-900 mb-3 sm:mb-4">Mes badges</h3>
                    <div className="flex flex-wrap gap-2">
                      {badges.map((badge, index) => (
                        <Badge key={index} className="bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 border-purple-200 text-xs">
                          <Award className="h-3 w-3 mr-1" />
                          {badge.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {activeTab === 'profile' && expertProfile && (
          <div className="space-y-6 sm:space-y-8">
            {/* Profil expert détaillé */}
            <Card>
              <CardHeader>
                <CardTitle className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <span>Mon profil Expert</span>
                  <Button className="w-full sm:w-auto">
                    <Edit className="h-4 w-4 mr-2" />
                    Modifier
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
                  {/* Photo et informations de base */}
                  <div className="text-center lg:text-left">
                    <div className="relative inline-block">
                      <div className="h-24 w-24 sm:h-32 sm:w-32 bg-gradient-to-r from-green-500 to-orange-500 rounded-full flex items-center justify-center mx-auto lg:mx-0 mb-4">
                        <span className="text-2xl sm:text-4xl font-bold text-white">
                          {userProfile?.first_name?.[0]}{userProfile?.last_name?.[0]}
                        </span>
                      </div>
                      <button className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 bg-white border border-gray-300 rounded-full p-1.5 sm:p-2 shadow-sm hover:shadow-md">
                        <Camera className="h-3 w-3 sm:h-4 sm:w-4 text-gray-600" />
                      </button>
                    </div>
                    <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                      {userProfile?.first_name} {userProfile?.last_name}
                    </h2>
                    <p className="text-sm sm:text-base text-gray-600">Code Expert: {expertProfile.expert_code}</p>
                    <div className="mt-3 sm:mt-4">
                      {getVerificationStatus()}
                    </div>
                  </div>

                  {/* Informations détaillées */}
                  <div className="lg:col-span-2 space-y-6">
                    {/* Informations de contact */}
                    <div>
                      <h3 className="font-medium text-gray-900 mb-3">Informations de contact</h3>
                      <div className="space-y-2">
                        <div className="flex items-center text-gray-600">
                          <Mail className="h-4 w-4 mr-3" />
                          {user.email}
                        </div>
                        <div className="flex items-center text-gray-600">
                          <Phone className="h-4 w-4 mr-3" />
                          {userProfile?.phone || 'Non renseigné'}
                        </div>
                        <div className="flex items-center text-gray-600">
                          <MapPin className="h-4 w-4 mr-3" />
                          {userProfile?.city || 'Non renseigné'}
                        </div>
                      </div>
                    </div>

                    {/* Présentation */}
                    <div>
                      <h3 className="font-medium text-gray-900 mb-3">Ma présentation</h3>
                      <p className="text-gray-600 leading-relaxed">
                        {expertProfile.bio || 'Aucune présentation ajoutée.'}
                      </p>
                    </div>

                    {/* Spécialisations */}
                    <div>
                      <h3 className="font-medium text-gray-900 mb-3">Spécialisations</h3>
                      <div className="flex flex-wrap gap-2">
                        {expertProfile.specializations?.map((spec, index) => (
                          <Badge key={index} className="bg-blue-100 text-blue-800">
                            {spec}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Tarifs et expérience */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="font-medium text-gray-900 mb-3">Tarifs</h3>
                        <p className="text-2xl font-bold text-green-600">
                          {expertProfile.hourly_rate_min} - {expertProfile.hourly_rate_max} CFA/h
                        </p>
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900 mb-3">Expérience</h3>
                        <p className="text-lg text-gray-600">
                          {expertProfile.years_experience} années • {expertProfile.education_level}
                        </p>
                      </div>
                    </div>

                    {/* Statistiques */}
                    <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-gray-900">{expertProfile.total_students}</p>
                        <p className="text-sm text-gray-600">Étudiants</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-gray-900">{expertProfile.total_hours_taught}h</p>
                        <p className="text-sm text-gray-600">Heures enseignées</p>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center">
                          <p className="text-2xl font-bold text-gray-900">{expertProfile.rating_average}</p>
                          <Star className="h-5 w-5 text-yellow-400 ml-1 fill-current" />
                        </div>
                        <p className="text-sm text-gray-600">{expertProfile.total_reviews} avis</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'courses' && (
          <div className="space-y-6 sm:space-y-8">
            {/* En-tête avec statistiques des cours */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              <Card>
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Cours actifs</p>
                      <p className="text-2xl sm:text-3xl font-bold text-gray-900">
                        {courses.filter(c => c.is_active).length}
                      </p>
                    </div>
                    <div className="h-10 w-10 sm:h-12 sm:w-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <BookOpen className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
                    </div>
                  </div>
                  <div className="mt-3 sm:mt-4 flex items-center text-sm">
                    <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                    <span className="text-green-600">+2 ce mois</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total réservations</p>
                      <p className="text-2xl sm:text-3xl font-bold text-gray-900">
                        {courses.reduce((total, course) => total + (course.total_bookings || 0), 0)}
                      </p>
                    </div>
                    <div className="h-10 w-10 sm:h-12 sm:w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Users className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                    </div>
                  </div>
                  <div className="mt-3 sm:mt-4 flex items-center text-sm">
                    <span className="text-gray-600">15 cette semaine</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Revenus cours</p>
                      <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
                        {(courses.reduce((total, course) => total + (course.price_per_hour * (course.total_bookings || 0)), 0)).toLocaleString()} CFA
                      </p>
                    </div>
                    <div className="h-10 w-10 sm:h-12 sm:w-12 bg-orange-100 rounded-lg flex items-center justify-center">
                      <DollarSign className="h-5 w-5 sm:h-6 sm:w-6 text-orange-600" />
                    </div>
                  </div>
                  <div className="mt-3 sm:mt-4 flex items-center text-sm">
                    <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                    <span className="text-green-600">+18% ce mois</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Cours populaire</p>
                      <p className="text-lg sm:text-xl font-bold text-gray-900">
                        {courses.sort((a, b) => (b.total_bookings || 0) - (a.total_bookings || 0))[0]?.title.substring(0, 20)}...
                      </p>
                    </div>
                    <div className="h-10 w-10 sm:h-12 sm:w-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                      <Trophy className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-600" />
                    </div>
                  </div>
                  <div className="mt-3 sm:mt-4 flex items-center text-sm">
                    <span className="text-gray-600">
                      {courses.sort((a, b) => (b.total_bookings || 0) - (a.total_bookings || 0))[0]?.total_bookings || 0} réservations
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Barre d'actions */}
            <Card>
              <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
                            onClick={() => setShowAddCourseModal(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Nouveau cours
                    </Button>
                    <Button variant="outline">
                      <Filter className="h-4 w-4 mr-2" />
                      Filtrer
                    </Button>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">Trier par:</span>
                    <select className="border border-gray-300 rounded-lg px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500">
                      <option>Plus récent</option>
                      <option>Plus populaire</option>
                      <option>Meilleur tarif</option>
                      <option>Alphabétique</option>
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Liste des cours avec toutes les informations détaillées */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {/* Action rapide pour créer un cours - toujours en première position */}
              <Card className="border-2 border-dashed border-gray-300 hover:border-orange-400 transition-all duration-300 group cursor-pointer"
                    onClick={() => setShowAddCourseModal(true)}>
                <CardContent className="p-6 flex flex-col items-center justify-center h-full min-h-[400px]">
                  <div className="text-center space-y-6">
                    <div className="h-20 w-20 bg-gradient-to-r from-green-100 to-orange-100 group-hover:from-green-200 group-hover:to-orange-200 rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-110 mx-auto">
                      <Plus className="h-10 w-10 text-orange-600 group-hover:text-orange-700 transition-colors" />
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 group-hover:text-orange-600 transition-colors mb-3">
                        Créer un nouveau cours
                      </h3>
                      <p className="text-gray-600 text-sm leading-relaxed max-w-xs mx-auto">
                        Développez votre offre en ajoutant de nouveaux cours dans vos domaines d'expertise
                      </p>
                    </div>

                    <div className="bg-gradient-to-r from-green-50 to-orange-50 rounded-lg p-4 max-w-xs mx-auto">
                      <div className="text-center">
                        <p className="text-orange-600 font-medium text-sm">
                          Assistant de création
                        </p>
                        <p className="text-xs text-gray-600 mt-1">Guidé étape par étape</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Liste des cours existants */}
              {courses.length > 0 && courses.map((course) => (
                <Card key={course.id} className="hover:shadow-lg transition-all duration-200 overflow-hidden">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between mb-3">
                      <CardTitle className="text-lg font-semibold text-gray-900 leading-tight pr-2">
                        {course.title}
                      </CardTitle>
                      <div className="flex items-center space-x-1 flex-shrink-0">
                        <button 
                          className="p-1.5 rounded-full hover:bg-gray-100 transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingCourse(course);
                            setShowEditCourseModal(true);
                          }}
                          title="Modifier le cours"
                        >
                          <Edit className="h-4 w-4 text-gray-500 hover:text-orange-600" />
                        </button>
                        <button 
                          className="p-1.5 rounded-full hover:bg-gray-100 transition-colors"
                          title="Voir les détails"
                        >
                          <Eye className="h-4 w-4 text-gray-500 hover:text-blue-600" />
                        </button>
                      </div>
                    </div>
                    
                    {/* Badges de statut et catégorie */}
                    <div className="flex flex-wrap gap-2 mb-3">
                      <Badge className={course.is_active ? 'bg-green-100 text-green-800 border-green-200' : 'bg-gray-100 text-gray-800 border-gray-200'}>
                        {course.is_active ? '✓ Actif' : '⏸ Inactif'}
                      </Badge>
                      <Badge 
                        className="text-xs" 
                        style={{ backgroundColor: course.subject?.category?.color + '20', color: course.subject?.category?.color, borderColor: course.subject?.category?.color + '40' }}
                      >
                        {course.subject?.category?.name}
                      </Badge>
                      <Badge variant="outline" className="text-xs font-medium">
                        {course.level === 'debutant' ? 'Débutant' : 
                         course.level === 'intermediaire' ? 'Intermédiaire' : 'Avancé'}
                      </Badge>
                    </div>
                    
                    {/* Informations de base */}
                    <div className="flex flex-wrap gap-2 text-xs text-gray-600">
                      <span className="flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {course.duration_minutes}min
                      </span>
                      <span className="flex items-center">
                        <Users className="h-3 w-3 mr-1" />
                        Max {course.max_students}
                      </span>
                      <span className="flex items-center">
                        {course.location_type === 'online' && <Globe className="h-3 w-3 mr-1" />}
                        {course.location_type === 'home' && <Home className="h-3 w-3 mr-1" />}
                        {course.location_type === 'expert_place' && <MapPin className="h-3 w-3 mr-1" />}
                        {course.location_type === 'public_place' && <Building className="h-3 w-3 mr-1" />}
                        {course.location_type === 'online' ? 'En ligne' : 
                         course.location_type === 'home' ? 'À domicile' : 
                         course.location_type === 'expert_place' ? 'Chez l\'expert' : 'Lieu public'}
                      </span>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pt-0 space-y-4">
                    {/* Description */}
                    <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">
                      {course.description}
                    </p>
                    
                    {/* Type de cours */}
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">Type de cours:</span>
                        <Badge variant="outline" className="text-xs">
                          {course.course_type === 'individual' ? 'Individuel' : 
                           course.course_type === 'group' ? 'Groupe' : 
                           course.course_type === 'workshop' ? 'Atelier' : 'Bootcamp'}
                        </Badge>
                      </div>
                    </div>

                    {/* Prérequis, Objectifs et Matériel - Design en accordéon/sections */}
                    <div className="space-y-3">
                      {/* Prérequis */}
                      {course.prerequisites && course.prerequisites.length > 0 && (
                        <div className="border border-blue-200 rounded-lg p-3 bg-blue-50/50">
                          <div className="flex items-center mb-2">
                            <div className="h-6 w-6 bg-blue-500 rounded-full flex items-center justify-center mr-2">
                              <CheckCircle className="h-3 w-3 text-white" />
                            </div>
                            <h4 className="text-sm font-semibold text-blue-900">Prérequis</h4>
                          </div>
                          <ul className="space-y-1">
                            {course.prerequisites.map((prereq, idx) => (
                              <li key={idx} className="flex items-center text-xs text-blue-800">
                                <div className="h-1 w-1 bg-blue-400 rounded-full mr-2"></div>
                                {prereq}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Objectifs */}
                      {course.objectives && course.objectives.length > 0 && (
                        <div className="border border-green-200 rounded-lg p-3 bg-green-50/50">
                          <div className="flex items-center mb-2">
                            <div className="h-6 w-6 bg-green-500 rounded-full flex items-center justify-center mr-2">
                              <Trophy className="h-3 w-3 text-white" />
                            </div>
                            <h4 className="text-sm font-semibold text-green-900">Objectifs d'apprentissage</h4>
                          </div>
                          <ul className="space-y-1">
                            {course.objectives.map((objective, idx) => (
                              <li key={idx} className="flex items-center text-xs text-green-800">
                                <div className="h-1 w-1 bg-green-400 rounded-full mr-2"></div>
                                {objective}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Matériel nécessaire */}
                      {course.materials_needed && course.materials_needed.length > 0 && (
                        <div className="border border-orange-200 rounded-lg p-3 bg-orange-50/50">
                          <div className="flex items-center mb-2">
                            <div className="h-6 w-6 bg-orange-500 rounded-full flex items-center justify-center mr-2">
                              <Award className="h-3 w-3 text-white" />
                            </div>
                            <h4 className="text-sm font-semibold text-orange-900">Matériel requis</h4>
                          </div>
                          <div className="grid grid-cols-2 gap-1">
                            {course.materials_needed.map((material, idx) => (
                              <div key={idx} className="flex items-center text-xs text-orange-800 bg-orange-100 rounded px-2 py-1">
                                <div className="h-1.5 w-1.5 bg-orange-500 rounded-full mr-1.5"></div>
                                {material}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Tarif et statistiques */}
                    <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className="text-xl font-bold text-green-600">
                            {course.price_per_hour.toLocaleString()} CFA/h
                          </p>
                          <p className="text-xs text-gray-600">Tarif horaire</p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-blue-600">
                            {course.total_bookings || 0}
                          </p>
                          <p className="text-xs text-gray-600">Réservations</p>
                        </div>
                      </div>
                      
                      {/* Revenus générés */}
                      <div className="border-t border-gray-200 pt-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <DollarSign className="h-4 w-4 text-orange-600 mr-1" />
                            <span className="text-sm font-medium text-gray-700">Revenus générés</span>
                          </div>
                          <span className="text-sm font-bold text-orange-600">
                            {(course.price_per_hour * (course.total_bookings || 0)).toLocaleString()} CFA
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Actions du cours */}
                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                      <div className="flex items-center space-x-3">
                        <button className="flex items-center text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors">
                          <Calendar className="h-4 w-4 mr-1" />
                          Créneaux
                        </button>
                        <button className="flex items-center text-purple-600 hover:text-purple-800 text-sm font-medium transition-colors">
                          <BarChart3 className="h-4 w-4 mr-1" />
                          Stats
                        </button>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className={course.is_active ? 'text-red-600 hover:text-red-800' : 'text-green-600 hover:text-green-800'}
                      >
                        {course.is_active ? 'Désactiver' : 'Activer'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Message si aucun cours */}
            {courses.length === 0 && (
              <Card className="border-2 border-dashed border-gray-200">
                <CardContent className="p-12 text-center">
                  <div className="h-20 w-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <BookOpen className="h-10 w-10 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-medium text-gray-900 mb-3">Aucun cours créé</h3>
                  <p className="text-gray-600 mb-6 max-w-md mx-auto">
                    Vous n'avez pas encore créé de cours. Commencez par créer votre premier cours pour commencer à enseigner !
                  </p>
                  <Button 
                    className="bg-gradient-to-r from-green-500 to-orange-500 hover:from-green-600 hover:to-orange-600 text-white transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
                    onClick={() => setShowAddCourseModal(true)}
                  >
                    <Plus className="h-5 w-5 mr-2" />
                    Créer mon premier cours
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Conseils et astuces */}
            {courses.length > 0 && (
            <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Award className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-blue-900 mb-2">💡 Conseils pour optimiser vos cours</h3>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• Utilisez des titres clairs et descriptifs</li>
                      <li>• Ajoutez des mots-clés pertinents dans la description</li>
                      <li>• Proposez des tarifs compétitifs selon votre expérience</li>
                      <li>• Mettez à jour régulièrement vos disponibilités</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
            )}
          </div>
        )}

        {/* Autres onglets à implémenter */}
        {activeTab !== 'overview' && activeTab !== 'profile' && activeTab !== 'courses' && (
          <div className="text-center py-12">
            <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Section en développement</h3>
            <p className="text-gray-600">Cette section sera bientôt disponible.</p>
          </div>
        )}
      </div>

      {/* Popup Modal pour Ajouter un Nouveau Cours */}
      {showAddCourseModal && (
        <AddCourseModal 
          isOpen={showAddCourseModal}
          onClose={() => setShowAddCourseModal(false)}
          subjects={subjects}
          categories={categories}
          expertProfile={expertProfile}
          onCourseCreated={(newCourse) => {
            setCourses(prev => [...prev, newCourse]);
            setShowAddCourseModal(false);
          }}
          onShowNotification={showNotification}
        />
      )}

      {/* Popup Modal pour Modifier un Cours */}
      {showEditCourseModal && editingCourse && (
        <EditCourseModal 
          isOpen={showEditCourseModal}
          onClose={() => {
            setShowEditCourseModal(false);
            setEditingCourse(null);
          }}
          course={editingCourse}
          subjects={subjects}
          categories={categories}
          expertProfile={expertProfile}
          onCourseUpdated={(updatedCourse) => {
            setCourses(prev => prev.map(course => 
              course.id === updatedCourse.id ? updatedCourse : course
            ));
            setShowEditCourseModal(false);
            setEditingCourse(null);
          }}
          onShowNotification={showNotification}
        />
      )}

      {/* Composant de Notification */}
      {notification.show && (
        <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-5 duration-300">
          <div className={`max-w-md rounded-lg shadow-lg border-l-4 p-4 ${
            notification.type === 'success' 
              ? 'bg-green-50 border-green-500 text-green-800' 
              : notification.type === 'error'
              ? 'bg-red-50 border-red-500 text-red-800'
              : 'bg-blue-50 border-blue-500 text-blue-800'
          }`}>
            <div className="flex items-start">
              <div className="flex-shrink-0">
                {notification.type === 'success' && (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                )}
                {notification.type === 'error' && (
                  <AlertCircle className="h-5 w-5 text-red-600" />
                )}
                {notification.type === 'info' && (
                  <Clock className="h-5 w-5 text-blue-600" />
                )}
              </div>
              <div className="ml-3 flex-1">
                <h3 className="text-sm font-medium">
                  {notification.title}
                </h3>
                <p className="mt-1 text-sm opacity-90">
                  {notification.message}
                </p>
              </div>
              <div className="ml-4 flex-shrink-0">
                <button
                  onClick={() => setNotification(prev => ({ ...prev, show: false }))}
                  className="inline-flex rounded-md hover:bg-white hover:bg-opacity-20 p-1.5 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Composant Modal pour Modifier un Cours
interface EditCourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  course: Course;
  subjects: Subject[];
  categories: Category[];
  expertProfile: ExpertProfile | null;
  onCourseUpdated: (course: Course) => void;
  onShowNotification: (type: 'success' | 'error' | 'info', title: string, message: string) => void;
}

function EditCourseModal({ isOpen, onClose, course, subjects, categories, expertProfile, onCourseUpdated, onShowNotification }: EditCourseModalProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    // Étape 1: Informations de base
    title: course.title,
    description: course.description,
    subject_id: course.subject_id,
    category_id: course.subject?.category_id || '',
    level: course.level as 'debutant' | 'intermediaire' | 'avance',
    
    // Étape 2: Configuration du cours
    course_type: course.course_type as 'individual' | 'group' | 'workshop' | 'bootcamp',
    duration_minutes: course.duration_minutes,
    max_students: course.max_students,
    location_type: course.location_type as 'online' | 'home' | 'expert_place' | 'public_place',
    
    // Étape 3: Tarification
    price_per_hour: course.price_per_hour,
    
    // Étape 4: Détails pédagogiques
    prerequisites: course.prerequisites || [],
    objectives: course.objectives || [],
    materials_needed: course.materials_needed || []
  });

  // Réinitialiser le formulaire quand le cours change
  useEffect(() => {
    if (course) {
      setFormData({
        title: course.title,
        description: course.description,
        subject_id: course.subject_id,
        category_id: course.subject?.category_id || '',
        level: course.level as 'debutant' | 'intermediaire' | 'avance',
        course_type: course.course_type as 'individual' | 'group' | 'workshop' | 'bootcamp',
        duration_minutes: course.duration_minutes,
        max_students: course.max_students,
        location_type: course.location_type as 'online' | 'home' | 'expert_place' | 'public_place',
        price_per_hour: course.price_per_hour,
        prerequisites: course.prerequisites || [],
        objectives: course.objectives || [],
        materials_needed: course.materials_needed || []
      });
      setCurrentStep(1);
    }
  }, [course]);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      
      // Validation de base
      if (!formData.title || !formData.description || !formData.subject_id || !formData.price_per_hour) {
        onShowNotification('error', '❌ Champs manquants', 'Veuillez remplir tous les champs obligatoires avant de continuer.');
        return;
      }

      if (!expertProfile?.id) {
        onShowNotification('error', '❌ Profil manquant', 'Erreur: Profil expert non trouvé. Veuillez vous reconnecter.');
        return;
      }

      console.log('🔄 Modification du cours...', formData);

      // Mettre à jour le cours dans la base de données
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
        .eq('id', course.id)
        .eq('expert_id', expertProfile.id) // Sécurité: seul le propriétaire peut modifier
        .select(`
          *,
          subject:subjects(
            *,
            category:categories(*)
          )
        `)
        .single();

      if (error) {
        console.error('❌ Erreur lors de la modification du cours:', error);
        onShowNotification(
          'error',
          '❌ Erreur de modification',
          'Impossible de modifier le cours. Veuillez vérifier vos informations et réessayer.'
        );
        return;
      }

      console.log('✅ Cours modifié avec succès:', updatedCourseData);
      
      // Afficher un message de succès
      onShowNotification(
        'success',
        '✏️ Cours modifié avec succès !',
        `Les modifications de "${formData.title}" ont été sauvegardées et sont maintenant visibles.`
      );
      
      // Mettre à jour la liste des cours
      onCourseUpdated(updatedCourseData);
      
    } catch (error: any) {
      console.error('❌ Erreur lors de la modification:', error);
      onShowNotification(
        'error',
        '❌ Erreur inattendue',
        'Une erreur inattendue s\'est produite lors de la modification. Veuillez réessayer.'
      );
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-white bg-opacity-20 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Modifier le cours</h2>
            <p className="text-gray-600 mt-1">Étape {currentStep} sur 4</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-6 w-6 text-gray-500" />
          </button>
        </div>

        {/* Progress bar */}
        <div className="px-6 py-4 bg-gray-50">
          <div className="flex items-center space-x-2">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex items-center flex-1">
                <div className={`h-2 rounded-full flex-1 ${
                  step <= currentStep ? 'bg-orange-500' : 'bg-gray-200'
                }`} />
                {step < 4 && <div className="w-2" />}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-sm text-gray-600">
            <span className={currentStep >= 1 ? 'text-orange-600 font-medium' : ''}>Infos</span>
            <span className={currentStep >= 2 ? 'text-orange-600 font-medium' : ''}>Config</span>
            <span className={currentStep >= 3 ? 'text-orange-600 font-medium' : ''}>Tarif</span>
            <span className={currentStep >= 4 ? 'text-orange-600 font-medium' : ''}>Détails</span>
          </div>
        </div>

        {/* Content - Reuse the same form structure as AddCourseModal */}
        <div className="p-6">
          {/* Step 1: Basic Information */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Informations de base</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Titre du cours *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Ex: Mathématiques niveau collège"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={4}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Décrivez votre cours, les compétences enseignées, votre approche pédagogique..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Catégorie
                  </label>
                  <select
                    value={formData.category_id}
                    onChange={(e) => {
                      setFormData(prev => ({ ...prev, category_id: e.target.value, subject_id: '' }));
                    }}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="">Sélectionner une catégorie</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Matière *
                  </label>
                  <select
                    value={formData.subject_id}
                    onChange={(e) => setFormData(prev => ({ ...prev, subject_id: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="">Sélectionner une matière</option>
                    {subjects
                      .filter(subject => !formData.category_id || subject.category_id === formData.category_id)
                      .map((subject) => (
                        <option key={subject.id} value={subject.id}>
                          {subject.name}
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Niveau
                </label>
                <select
                  value={formData.level}
                  onChange={(e) => setFormData(prev => ({ ...prev, level: e.target.value as any }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="debutant">Débutant</option>
                  <option value="intermediaire">Intermédiaire</option>
                  <option value="avance">Avancé</option>
                </select>
              </div>
            </div>
          )}

          {/* Step 2: Course Configuration */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Configuration du cours</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type de cours
                </label>
                <select
                  value={formData.course_type}
                  onChange={(e) => {
                    const newType = e.target.value as any;
                    setFormData(prev => ({ 
                      ...prev, 
                      course_type: newType,
                      max_students: newType === 'individual' ? 1 : newType === 'group' ? 6 : newType === 'workshop' ? 12 : 20
                    }));
                  }}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="individual">Cours individuel</option>
                  <option value="group">Cours en groupe</option>
                  <option value="workshop">Atelier</option>
                  <option value="bootcamp">Bootcamp intensif</option>
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Durée (minutes)
                  </label>
                  <select
                    value={formData.duration_minutes}
                    onChange={(e) => setFormData(prev => ({ ...prev, duration_minutes: parseInt(e.target.value) }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value={30}>30 minutes</option>
                    <option value={45}>45 minutes</option>
                    <option value={60}>1 heure</option>
                    <option value={90}>1h30</option>
                    <option value={120}>2 heures</option>
                    <option value={180}>3 heures</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre max d'étudiants
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={formData.max_students}
                    onChange={(e) => setFormData(prev => ({ ...prev, max_students: parseInt(e.target.value) || 1 }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lieu de cours
                </label>
                <select
                  value={formData.location_type}
                  onChange={(e) => setFormData(prev => ({ ...prev, location_type: e.target.value as any }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="online">En ligne (visioconférence)</option>
                  <option value="home">À domicile (chez l'étudiant)</option>
                  <option value="expert_place">Chez l'expert</option>
                  <option value="public_place">Lieu public (bibliothèque, café...)</option>
                </select>
              </div>
            </div>
          )}

          {/* Step 3: Pricing */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Tarification</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Prix par heure (CFA) *
                </label>
                <input
                  type="number"
                  min="1000"
                  step="500"
                  value={formData.price_per_hour}
                  onChange={(e) => setFormData(prev => ({ ...prev, price_per_hour: parseInt(e.target.value) || 0 }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Ex: 5000"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Prix recommandé selon votre niveau: 2000-8000 CFA/h
                </p>
              </div>

              <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                <h4 className="font-medium text-orange-900 mb-2">💰 Calcul automatique</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-orange-800">Prix par session ({formData.duration_minutes}min):</span>
                    <span className="font-medium text-orange-900">
                      {Math.round((formData.price_per_hour * formData.duration_minutes) / 60).toLocaleString()} CFA
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-orange-800">Revenus potentiels/semaine (5 cours):</span>
                    <span className="font-medium text-orange-900">
                      {Math.round((formData.price_per_hour * formData.duration_minutes * 5) / 60).toLocaleString()} CFA
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Pedagogical Details */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Détails pédagogiques</h3>
              
              {/* Prerequisites */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Prérequis
                </label>
                <div className="space-y-2">
                  {formData.prerequisites.map((prereq, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={prereq}
                        onChange={(e) => {
                          const newPrereqs = [...formData.prerequisites];
                          newPrereqs[index] = e.target.value;
                          setFormData(prev => ({ ...prev, prerequisites: newPrereqs }));
                        }}
                        className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                        placeholder="Ex: Bases en arithmétique"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const newPrereqs = formData.prerequisites.filter((_, i) => i !== index);
                          setFormData(prev => ({ ...prev, prerequisites: newPrereqs }));
                        }}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, prerequisites: [...prev.prerequisites, ''] }))}
                    className="flex items-center text-orange-600 hover:text-orange-700 text-sm"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Ajouter un prérequis
                  </button>
                </div>
              </div>

              {/* Objectives */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Objectifs d'apprentissage
                </label>
                <div className="space-y-2">
                  {formData.objectives.map((objective, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={objective}
                        onChange={(e) => {
                          const newObjectives = [...formData.objectives];
                          newObjectives[index] = e.target.value;
                          setFormData(prev => ({ ...prev, objectives: newObjectives }));
                        }}
                        className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                        placeholder="Ex: Maîtriser les équations du premier degré"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const newObjectives = formData.objectives.filter((_, i) => i !== index);
                          setFormData(prev => ({ ...prev, objectives: newObjectives }));
                        }}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, objectives: [...prev.objectives, ''] }))}
                    className="flex items-center text-orange-600 hover:text-orange-700 text-sm"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Ajouter un objectif
                  </button>
                </div>
              </div>

              {/* Materials */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Matériel nécessaire
                </label>
                <div className="space-y-2">
                  {formData.materials_needed.map((material, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={material}
                        onChange={(e) => {
                          const newMaterials = [...formData.materials_needed];
                          newMaterials[index] = e.target.value;
                          setFormData(prev => ({ ...prev, materials_needed: newMaterials }));
                        }}
                        className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                        placeholder="Ex: Calculatrice scientifique"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const newMaterials = formData.materials_needed.filter((_, i) => i !== index);
                          setFormData(prev => ({ ...prev, materials_needed: newMaterials }));
                        }}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, materials_needed: [...prev.materials_needed, ''] }))}
                    className="flex items-center text-orange-600 hover:text-orange-700 text-sm"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Ajouter du matériel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <button
            onClick={prevStep}
            disabled={currentStep === 1}
            className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Précédent
          </button>

          <div className="flex space-x-3">
            <Button variant="outline" onClick={onClose}>
              Annuler
            </Button>
            
            {currentStep < 4 ? (
              <Button onClick={nextStep} className="bg-orange-500 hover:bg-orange-600">
                Suivant
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button 
                onClick={handleSubmit}
                disabled={loading}
                className="bg-green-500 hover:bg-green-600 text-white"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Modification...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Modifier le cours
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Composant Modal pour Ajouter un Cours
interface AddCourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  subjects: Subject[];
  categories: Category[];
  expertProfile: ExpertProfile | null;
  onCourseCreated: (course: Course) => void;
  onShowNotification: (type: 'success' | 'error' | 'info', title: string, message: string) => void;
}

function AddCourseModal({ isOpen, onClose, subjects, categories, expertProfile, onCourseCreated, onShowNotification }: AddCourseModalProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    // Étape 1: Informations de base
    title: '',
    description: '',
    subject_id: '',
    category_id: '',
    level: 'debutant' as 'debutant' | 'intermediaire' | 'avance',
    
    // Étape 2: Configuration du cours
    course_type: 'individual' as 'individual' | 'group' | 'workshop' | 'bootcamp',
    duration_minutes: 60,
    max_students: 1,
    location_type: 'online' as 'online' | 'home' | 'expert_place' | 'public_place',
    
    // Étape 3: Tarification
    price_per_hour: 0,
    
    // Étape 4: Détails pédagogiques
    prerequisites: [] as string[],
    objectives: [] as string[],
    materials_needed: [] as string[]
  });

  const [currentPrerequisite, setCurrentPrerequisite] = useState('');
  const [currentObjective, setCurrentObjective] = useState('');
  const [currentMaterial, setCurrentMaterial] = useState('');

  const filteredSubjects = formData.category_id 
    ? subjects.filter(s => s.category_id === formData.category_id)
    : subjects;

  const addToList = (type: 'prerequisites' | 'objectives' | 'materials_needed', value: string) => {
    if (!value.trim()) return;
    setFormData(prev => ({
      ...prev,
      [type]: [...prev[type], value.trim()]
    }));
    if (type === 'prerequisites') setCurrentPrerequisite('');
    if (type === 'objectives') setCurrentObjective('');
    if (type === 'materials_needed') setCurrentMaterial('');
  };

  const removeFromList = (type: 'prerequisites' | 'objectives' | 'materials_needed', index: number) => {
    setFormData(prev => ({
      ...prev,
      [type]: prev[type].filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      
      // Validation de base
      if (!formData.title || !formData.description || !formData.subject_id || !formData.price_per_hour) {
        onShowNotification('error', '❌ Champs manquants', 'Veuillez remplir tous les champs obligatoires avant de continuer.');
        return;
      }

      if (!expertProfile?.id) {
        onShowNotification('error', '❌ Profil manquant', 'Erreur: Profil expert non trouvé. Veuillez vous reconnecter.');
        return;
      }

      console.log('🔄 Création du cours...', formData);

      // Créer le cours dans la base de données via RPC pour contourner RLS
      const { data: courseData, error } = await supabase.rpc('create_course_for_expert', {
        p_expert_id: expertProfile.id,
        p_subject_id: formData.subject_id,
        p_title: formData.title,
        p_description: formData.description,
        p_course_type: formData.course_type,
        p_level: formData.level,
        p_duration_minutes: formData.duration_minutes,
        p_max_students: formData.max_students,
        p_price_per_hour: formData.price_per_hour,
        p_prerequisites: formData.prerequisites,
        p_objectives: formData.objectives,
        p_materials_needed: formData.materials_needed,
        p_location_type: formData.location_type
      });

      if (error) {
        console.error('❌ Erreur RPC, tentative avec insert direct...', error);
        
        // Fallback: tentative d'insertion directe avec service key
        const { data: directCourseData, error: directError } = await supabase
          .from('courses')
          .insert({
            expert_id: expertProfile.id,
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

        if (directError) {
          console.error('❌ Erreur lors de la création du cours:', directError);
          console.error('❌ Détails de l\'erreur:', JSON.stringify(directError, null, 2));
          onShowNotification(
            'error', 
            '❌ Erreur de création', 
            'Impossible de créer le cours. Veuillez vérifier vos informations et réessayer.'
          );
          return;
        }

        console.log('✅ Cours créé avec succès (insert direct):', directCourseData);
        
        // Ajouter le nouveau cours à la liste
        onCourseCreated(directCourseData);
      } else {
        console.log('✅ Cours créé avec succès (RPC):', courseData);
        
        // Recharger le cours créé avec ses relations
        const { data: fullCourseData } = await supabase
          .from('courses')
          .select(`
            *,
            subject:subjects(
              *,
              category:categories(*)
            )
          `)
          .eq('id', courseData.id)
          .single();
        
        onCourseCreated(fullCourseData || courseData);
      }
      
      // Afficher un message de succès
      onShowNotification(
        'success',
        '🎉 Cours créé avec succès !',
        `Votre cours "${formData.title}" a été ajouté à votre catalogue. Il est maintenant visible par les étudiants.`
      );
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        subject_id: '',
        category_id: '',
        level: 'debutant',
        course_type: 'individual',
        duration_minutes: 60,
        max_students: 1,
        location_type: 'online',
        price_per_hour: 0,
        prerequisites: [],
        objectives: [],
        materials_needed: []
      });
      setCurrentStep(1);
      
    } catch (error) {
      console.error('❌ Erreur lors de la création du cours:', error);
      onShowNotification(
        'error',
        '❌ Erreur inattendue',
        'Une erreur inattendue s\'est produite. Veuillez réessayer ou contacter le support.'
      );
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-white bg-opacity-20 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden animate-in fade-in zoom-in duration-300">
        {/* Header du Modal */}
        <div className="bg-gradient-to-r from-orange-500 to-green-500 p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Créer un nouveau cours</h2>
              <p className="text-orange-100 mt-1">Étape {currentStep} sur 4</p>
            </div>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition-all duration-200 hover:scale-110"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          
          {/* Barre de progression */}
          <div className="mt-4 bg-white bg-opacity-20 rounded-full h-2">
            <div 
              className="bg-white rounded-full h-2 transition-all duration-300"
              style={{ width: `${(currentStep / 4) * 100}%` }}
            />
          </div>
        </div>

        {/* Contenu du Modal */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {/* Étape 1: Informations de base */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <div className="h-16 w-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="h-8 w-8 text-orange-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Informations de base</h3>
                <p className="text-gray-600">Décrivez votre cours et choisissez la matière</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Titre du cours *
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      placeholder="Ex: Cours de mathématiques niveau lycée"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description du cours *
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      placeholder="Décrivez votre cours, ce que les étudiants vont apprendre..."
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Catégorie *
                  </label>
                  <select
                    value={formData.category_id}
                    onChange={(e) => setFormData(prev => ({ ...prev, category_id: e.target.value, subject_id: '' }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  >
                    <option value="">Sélectionner une catégorie</option>
                    {categories.map(category => (
                      <option key={category.id} value={category.id}>{category.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Matière *
                  </label>
                  <select
                    value={formData.subject_id}
                    onChange={(e) => setFormData(prev => ({ ...prev, subject_id: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    disabled={!formData.category_id}
                  >
                    <option value="">Sélectionner une matière</option>
                    {filteredSubjects.map(subject => (
                      <option key={subject.id} value={subject.id}>{subject.name}</option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Niveau du cours *
                  </label>
                  <div className="flex space-x-4">
                    {[
                      { value: 'debutant', label: 'Débutant', color: 'bg-green-100 text-green-800' },
                      { value: 'intermediaire', label: 'Intermédiaire', color: 'bg-yellow-100 text-yellow-800' },
                      { value: 'avance', label: 'Avancé', color: 'bg-red-100 text-red-800' }
                    ].map(level => (
                      <button
                        key={level.value}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, level: level.value as any }))}
                        className={`flex-1 py-3 px-4 rounded-lg border-2 transition-all ${
                          formData.level === level.value
                            ? 'border-orange-500 bg-orange-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${level.color}`}>
                          {level.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Étape 2: Configuration du cours */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Configuration du cours</h3>
                <p className="text-gray-600">Définissez le format et les modalités</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type de cours *
                  </label>
                  <div className="space-y-3">
                    {[
                      { value: 'individual', label: 'Cours individuel', icon: User, desc: 'Un étudiant à la fois' },
                      { value: 'group', label: 'Cours en groupe', icon: Users, desc: 'Plusieurs étudiants' },
                      { value: 'workshop', label: 'Atelier', icon: Award, desc: 'Session pratique' },
                      { value: 'bootcamp', label: 'Bootcamp', icon: Trophy, desc: 'Formation intensive' }
                    ].map(type => (
                      <button
                        key={type.value}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, course_type: type.value as any }))}
                        className={`w-full p-3 border-2 rounded-lg text-left transition-all ${
                          formData.course_type === type.value
                            ? 'border-orange-500 bg-orange-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <type.icon className="h-5 w-5 text-gray-600" />
                          <div>
                            <div className="font-medium">{type.label}</div>
                            <div className="text-sm text-gray-500">{type.desc}</div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Lieu du cours *
                  </label>
                  <div className="space-y-3">
                    {[
                      { value: 'online', label: 'En ligne', icon: Globe, desc: 'Visioconférence' },
                      { value: 'home', label: 'À domicile', icon: Home, desc: 'Chez l\'étudiant' },
                      { value: 'expert_place', label: 'Chez moi', icon: Building, desc: 'Chez l\'expert' },
                      { value: 'public_place', label: 'Lieu public', icon: MapPin, desc: 'Bibliothèque, café...' }
                    ].map(location => (
                      <button
                        key={location.value}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, location_type: location.value as any }))}
                        className={`w-full p-3 border-2 rounded-lg text-left transition-all ${
                          formData.location_type === location.value
                            ? 'border-orange-500 bg-orange-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <location.icon className="h-5 w-5 text-gray-600" />
                          <div>
                            <div className="font-medium">{location.label}</div>
                            <div className="text-sm text-gray-500">{location.desc}</div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Durée par session (minutes) *
                  </label>
                  <select
                    value={formData.duration_minutes}
                    onChange={(e) => setFormData(prev => ({ ...prev, duration_minutes: parseInt(e.target.value) }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  >
                    <option value={30}>30 minutes</option>
                    <option value={45}>45 minutes</option>
                    <option value={60}>1 heure</option>
                    <option value={90}>1h30</option>
                    <option value={120}>2 heures</option>
                    <option value={180}>3 heures</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre maximum d'étudiants *
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={formData.max_students}
                    onChange={(e) => setFormData(prev => ({ ...prev, max_students: parseInt(e.target.value) }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Étape 3: Tarification */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <DollarSign className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Tarification</h3>
                <p className="text-gray-600">Définissez le prix de votre cours</p>
              </div>

              <div className="max-w-md mx-auto space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Prix par heure (CFA) *
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      step="500"
                      value={formData.price_per_hour}
                      onChange={(e) => setFormData(prev => ({ ...prev, price_per_hour: parseInt(e.target.value) }))}
                      className="w-full px-4 py-4 text-2xl font-bold text-center border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      placeholder="5000"
                    />
                    <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
                      CFA
                    </span>
                  </div>
                </div>

                {/* Suggestions de prix */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-3">💡 Suggestions de prix</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Cours débutant:</span>
                      <span className="font-medium">2000 - 4000 CFA/h</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Cours intermédiaire:</span>
                      <span className="font-medium">4000 - 7000 CFA/h</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Cours avancé:</span>
                      <span className="font-medium">7000 - 12000 CFA/h</span>
                    </div>
                  </div>
                </div>

                {/* Calcul automatique */}
                {formData.price_per_hour > 0 && (
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <h4 className="font-medium text-blue-900 mb-2">💰 Estimation des revenus</h4>
                    <div className="space-y-1 text-sm text-blue-800">
                      <div className="flex justify-between">
                        <span>Par session ({formData.duration_minutes}min):</span>
                        <span className="font-medium">
                          {Math.round((formData.price_per_hour * formData.duration_minutes) / 60).toLocaleString()} CFA
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>4 sessions/semaine:</span>
                        <span className="font-medium">
                          {Math.round(((formData.price_per_hour * formData.duration_minutes) / 60) * 4).toLocaleString()} CFA
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Étape 4: Détails pédagogiques */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <div className="h-16 w-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Détails pédagogiques</h3>
                <p className="text-gray-600">Optionnel: Ajoutez des prérequis, objectifs et matériel</p>
              </div>

              <div className="space-y-6">
                {/* Prérequis */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Prérequis (optionnel)
                  </label>
                  <div className="flex space-x-2 mb-2">
                    <input
                      type="text"
                      value={currentPrerequisite}
                      onChange={(e) => setCurrentPrerequisite(e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                      placeholder="Ex: Connaissances de base en algèbre"
                      onKeyPress={(e) => e.key === 'Enter' && addToList('prerequisites', currentPrerequisite)}
                    />
                    <Button 
                      type="button"
                      onClick={() => addToList('prerequisites', currentPrerequisite)}
                      className="bg-orange-500 hover:bg-orange-600 transform hover:scale-105 transition-all duration-200 shadow-md hover:shadow-lg"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.prerequisites.map((item, index) => (
                      <Badge key={index} className="bg-blue-100 text-blue-800 border-blue-200">
                        {item}
                        <button
                          type="button"
                          onClick={() => removeFromList('prerequisites', index)}
                          className="ml-2 text-blue-600 hover:text-blue-800"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Objectifs */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Objectifs d'apprentissage (optionnel)
                  </label>
                  <div className="flex space-x-2 mb-2">
                    <input
                      type="text"
                      value={currentObjective}
                      onChange={(e) => setCurrentObjective(e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                      placeholder="Ex: Maîtriser les équations du second degré"
                      onKeyPress={(e) => e.key === 'Enter' && addToList('objectives', currentObjective)}
                    />
                    <Button 
                      type="button"
                      onClick={() => addToList('objectives', currentObjective)}
                      className="bg-orange-500 hover:bg-orange-600 transform hover:scale-105 transition-all duration-200 shadow-md hover:shadow-lg"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.objectives.map((item, index) => (
                      <Badge key={index} className="bg-green-100 text-green-800 border-green-200">
                        {item}
                        <button
                          type="button"
                          onClick={() => removeFromList('objectives', index)}
                          className="ml-2 text-green-600 hover:text-green-800"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Matériel nécessaire */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Matériel nécessaire (optionnel)
                  </label>
                  <div className="flex space-x-2 mb-2">
                    <input
                      type="text"
                      value={currentMaterial}
                      onChange={(e) => setCurrentMaterial(e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                      placeholder="Ex: Calculatrice scientifique"
                      onKeyPress={(e) => e.key === 'Enter' && addToList('materials_needed', currentMaterial)}
                    />
                    <Button 
                      type="button"
                      onClick={() => addToList('materials_needed', currentMaterial)}
                      className="bg-orange-500 hover:bg-orange-600 transform hover:scale-105 transition-all duration-200 shadow-md hover:shadow-lg"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.materials_needed.map((item, index) => (
                      <Badge key={index} className="bg-orange-100 text-orange-800 border-orange-200">
                        {item}
                        <button
                          type="button"
                          onClick={() => removeFromList('materials_needed', index)}
                          className="ml-2 text-orange-600 hover:text-orange-800"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer avec boutons de navigation */}
        <div className="border-t bg-gray-50 p-6">
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={() => currentStep > 1 ? setCurrentStep(currentStep - 1) : onClose()}
              disabled={loading}
              className="hover:bg-gray-100 transition-colors duration-200"
            >
              {currentStep > 1 ? (
                <>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Précédent
                </>
              ) : (
                'Annuler'
              )}
            </Button>

            {currentStep < 4 ? (
              <Button
                onClick={() => setCurrentStep(currentStep + 1)}
                className="bg-gradient-to-r from-orange-500 to-green-500 hover:from-orange-600 hover:to-green-600 text-white transform hover:scale-105 transition-all duration-200 shadow-md hover:shadow-lg"
                disabled={loading}
              >
                Suivant
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white transform hover:scale-105 transition-all duration-200 shadow-md hover:shadow-lg"
                disabled={loading || !formData.title || !formData.description || !formData.subject_id || !formData.price_per_hour}
              >
                {loading ? (
                  'Création en cours...'
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Créer le cours
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
