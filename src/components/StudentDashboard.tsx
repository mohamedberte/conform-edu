import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  BookOpen, 
  Calendar, 
  Clock, 
  TrendingUp, 
  Users, 
  Star,
  PlayCircle,
  MessageSquare,
  Target,
  Award,
  Bell,
  ChevronRight,
  MapPin,
  Phone,
  LogOut
} from "lucide-react";
import { authHelpers, supabase } from "@/lib/supabase";

// 🔧 PERSONNALISATION: Interface pour les données élève
interface StudentDashboardData {
  profile: {
    first_name: string;
    last_name: string;
    class_name?: string;
    level?: string;
  };
  activeBookings: any[];
  availableTutors: any[];
  recentGrades: any[];
  upcomingLessons: any[];
  progress: {
    mathematics: number;
    french: number;
    sciences: number;
    english: number;
  };
}

interface StudentDashboardProps {
  onLogout?: () => void;
}

// 🔧 PERSONNALISATION: Dashboard pour les ÉLÈVES
export default function StudentDashboard({ onLogout }: StudentDashboardProps) {
  const [dashboardData, setDashboardData] = useState<StudentDashboardData>({
    profile: { first_name: "", last_name: "" },
    activeBookings: [],
    availableTutors: [],
    recentGrades: [],
    upcomingLessons: [],
    progress: { mathematics: 0, french: 0, sciences: 0, english: 0 }
  });
  const [isLoading, setIsLoading] = useState(true);

  // Chargement des données au montage
  useEffect(() => {
    loadStudentData();
  }, []);

  const loadStudentData = async () => {
    try {
      const { user } = await authHelpers.getCurrentUser();
      if (!user) return;

      // 🔧 PERSONNALISATION: Charger les données réelles de l'élève
      const profile = await authHelpers.getUserProfile(user.id);
      
      if (profile) {
        // Charger les informations de la classe si l'utilisateur est un étudiant
        let classInfo = null;
        if (profile.role === 'student') {
          const { data: studentProfile } = await supabase
            .from('student_profiles')
            .select(`
              *,
              classes (name, level)
            `)
            .eq('user_id', user.id)
            .single();
          
          classInfo = studentProfile?.classes;
        }

        setDashboardData({
          profile: {
            first_name: profile.first_name || "",
            last_name: profile.last_name || "",
            class_name: classInfo?.name,
            level: classInfo?.level
          },
          // 🔧 PERSONNALISATION: Remplacer par vraies requêtes - Cours actifs
          activeBookings: await loadActiveBookings(user.id),
          // 🔧 PERSONNALISATION: Remplacer par vraies requêtes - Tuteurs disponibles  
          availableTutors: await loadAvailableTutors(),
          // 🔧 PERSONNALISATION: Remplacer par vraies requêtes - Notes récentes
          recentGrades: await loadRecentGrades(user.id),
          // 🔧 PERSONNALISATION: Remplacer par vraies requêtes - Cours à venir
          upcomingLessons: await loadUpcomingLessons(user.id),
          // 🔧 PERSONNALISATION: Remplacer par vraies requêtes - Progression
          progress: await loadProgressData(user.id)
        });
      } else {
        // Données de fallback si pas de profil
        setDashboardData({
          profile: { first_name: "Étudiant", last_name: "" },
          activeBookings: [],
          availableTutors: [],
          recentGrades: [],
          upcomingLessons: [],
          progress: { mathematics: 0, french: 0, sciences: 0, english: 0 }
        });
      }
    } catch (error) {
      console.error("Erreur lors du chargement des données:", error);
      // Utiliser les données simulées en cas d'erreur
      setDashboardData({
        profile: { first_name: "Demo", last_name: "Student" },
        activeBookings: [
          { id: 1, tutor: "M. Kouassi Jean", subject: "Mathématiques", next_session: "2025-08-27T14:00:00", status: "confirmed" },
          { id: 2, tutor: "Mme Traoré Aminata", subject: "Français", next_session: "2025-08-28T16:00:00", status: "pending" }
        ],
        availableTutors: [
          { id: 1, name: "Dr. Bamba Michel", subject: "Physique-Chimie", rating: 4.8, price: 15000, location: "Cocody", experience: "5 ans" },
          { id: 2, name: "Prof. Diabaté Sarah", subject: "Anglais", rating: 4.9, price: 12000, location: "Plateau", experience: "8 ans" },
          { id: 3, name: "M. Yao Bernard", subject: "SVT", rating: 4.7, price: 13000, location: "Adjamé", experience: "6 ans" }
        ],
        recentGrades: [
          { subject: "Mathématiques", grade: 16, max: 20, date: "2025-08-20", type: "Contrôle" },
          { subject: "Français", grade: 14, max: 20, date: "2025-08-18", type: "Dissertation" },
          { subject: "Anglais", grade: 17, max: 20, date: "2025-08-15", type: "Oral" }
        ],
        upcomingLessons: [
          { subject: "Mathématiques", tutor: "M. Kouassi", time: "14:00", date: "Demain", type: "Cours particulier" },
          { subject: "Français", tutor: "Mme Traoré", time: "16:00", date: "Vendredi", type: "Soutien scolaire" }
        ],
        progress: {
          mathematics: 75,
          french: 68,
          sciences: 82,
          english: 79
        }
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 🔧 PERSONNALISATION: Fonctions pour charger les données réelles
  const loadActiveBookings = async (userId: string) => {
    try {
      const { data } = await supabase
        .from('bookings')
        .select(`
          *,
          courses (
            name,
            teacher_profiles (
              profiles (first_name, last_name)
            )
          )
        `)
        .eq('student_id', userId)
        .eq('status', 'confirmed')
        .limit(5);
      
      return data || [];
    } catch (error) {
      console.error("Erreur chargement bookings:", error);
      return [];
    }
  };

  const loadAvailableTutors = async () => {
    try {
      const { data } = await supabase
        .from('teacher_profiles')
        .select(`
          *,
          profiles (first_name, last_name),
          subjects (name)
        `)
        .eq('is_available', true)
        .limit(6);
      
      return data?.map(teacher => ({
        id: teacher.id,
        name: `${teacher.profiles?.first_name} ${teacher.profiles?.last_name}`,
        subject: teacher.subjects?.name || "Matière non spécifiée",
        rating: teacher.rating || 4.5,
        price: teacher.hourly_rate || 10000,
        location: teacher.location || "À distance",
        experience: teacher.experience || "Non spécifié"
      })) || [];
    } catch (error) {
      console.error("Erreur chargement tuteurs:", error);
      return [];
    }
  };

  const loadRecentGrades = async (userId: string) => {
    try {
      const { data } = await supabase
        .from('grades')
        .select(`
          *,
          subjects (name)
        `)
        .eq('student_id', userId)
        .order('created_at', { ascending: false })
        .limit(5);
      
      return data?.map(grade => ({
        subject: grade.subjects?.name || "Matière",
        grade: grade.score,
        max: grade.max_score || 20,
        date: new Date(grade.created_at).toLocaleDateString('fr-FR'),
        type: grade.type || "Évaluation"
      })) || [];
    } catch (error) {
      console.error("Erreur chargement notes:", error);
      return [];
    }
  };

  const loadUpcomingLessons = async (userId: string) => {
    try {
      const { data } = await supabase
        .from('lessons')
        .select(`
          *,
          courses (
            name,
            teacher_profiles (
              profiles (first_name, last_name)
            )
          )
        `)
        .eq('student_id', userId)
        .gte('scheduled_at', new Date().toISOString())
        .order('scheduled_at', { ascending: true })
        .limit(5);
      
      return data?.map(lesson => ({
        subject: lesson.courses?.name || "Cours",
        tutor: `${lesson.courses?.teacher_profiles?.profiles?.first_name} ${lesson.courses?.teacher_profiles?.profiles?.last_name}`,
        time: new Date(lesson.scheduled_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        date: new Date(lesson.scheduled_at).toLocaleDateString('fr-FR') === new Date().toLocaleDateString('fr-FR') ? "Aujourd'hui" : 
              new Date(lesson.scheduled_at).toLocaleDateString('fr-FR') === new Date(Date.now() + 24*60*60*1000).toLocaleDateString('fr-FR') ? "Demain" :
              new Date(lesson.scheduled_at).toLocaleDateString('fr-FR'),
        type: lesson.type || "Cours particulier"
      })) || [];
    } catch (error) {
      console.error("Erreur chargement lessons:", error);
      return [];
    }
  };

  const loadProgressData = async (userId: string) => {
    try {
      // Calculer la progression basée sur les notes récentes par matière
      const { data: grades } = await supabase
        .from('grades')
        .select(`
          score,
          max_score,
          subjects!inner (name)
        `)
        .eq('student_id', userId)
        .gte('created_at', new Date(Date.now() - 30*24*60*60*1000).toISOString()); // 30 derniers jours

      const progressBySubject: any = {
        mathematics: 0,
        french: 0,
        sciences: 0,
        english: 0
      };

      if (grades) {
        grades.forEach((grade: any) => {
          const subjectName = grade.subjects?.name?.toLowerCase();
          const percentage = (grade.score / (grade.max_score || 20)) * 100;
          
          if (subjectName?.includes('mathématiques') || subjectName?.includes('math')) {
            progressBySubject.mathematics = Math.max(progressBySubject.mathematics, percentage);
          } else if (subjectName?.includes('français')) {
            progressBySubject.french = Math.max(progressBySubject.french, percentage);
          } else if (subjectName?.includes('science') || subjectName?.includes('physique') || subjectName?.includes('svt')) {
            progressBySubject.sciences = Math.max(progressBySubject.sciences, percentage);
          } else if (subjectName?.includes('anglais') || subjectName?.includes('english')) {
            progressBySubject.english = Math.max(progressBySubject.english, percentage);
          }
        });
      }

      return progressBySubject;
    } catch (error) {
      console.error("Erreur chargement progression:", error);
      return { mathematics: 0, french: 0, sciences: 0, english: 0 };
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement de votre tableau de bord...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-green-50">
      {/* Header avec navigation */}
      <header className="bg-white/95 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-r from-orange-500 to-green-500 p-2 rounded-lg">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Conform Edu</h1>
                <p className="text-sm text-gray-600">Booster - Système Éducatif Ivoirien</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm">
                <Bell className="h-4 w-4" />
              </Button>
              {onLogout && (
                <Button variant="ghost" size="sm" onClick={onLogout}>
                  <LogOut className="h-4 w-4" />
                </Button>
              )}
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">
                  {dashboardData.profile.first_name} {dashboardData.profile.last_name}
                </p>
                <p className="text-xs text-gray-600">
                  {dashboardData.profile.class_name} - Élève
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Message de bienvenue */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Bienvenue, {dashboardData.profile.first_name} ! 🎓
          </h2>
          <p className="text-gray-600">
            Votre accompagnement personnalisé pour exceller dans vos études.
          </p>
        </div>

        {/* Statistiques rapides */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-orange-500 to-green-500 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm">Cours actifs</p>
                  <p className="text-2xl font-bold">{dashboardData.activeBookings.length}</p>
                </div>
                <Calendar className="h-8 w-8 text-orange-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm">Moyenne générale</p>
                  <p className="text-2xl font-bold">15.7/20</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm">Profs disponibles</p>
                  <p className="text-2xl font-bold">{dashboardData.availableTutors.length}</p>
                </div>
                <Users className="h-8 w-8 text-purple-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm">Heures cette semaine</p>
                  <p className="text-2xl font-bold">8h</p>
                </div>
                <Clock className="h-8 w-8 text-orange-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Colonne principale */}
          <div className="lg:col-span-2 space-y-8">
            {/* Prochains cours */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PlayCircle className="h-5 w-5 text-orange-600" />
                  Mes prochains cours
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {dashboardData.upcomingLessons.map((lesson, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gradient-to-r from-orange-50 to-green-50 rounded-lg border border-orange-100">
                      <div className="flex items-center space-x-4">
                        <div className="bg-orange-500 text-white p-2 rounded-lg">
                          <BookOpen className="h-4 w-4" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">{lesson.subject}</h4>
                          <p className="text-sm text-gray-600">avec {lesson.tutor}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">{lesson.date}</p>
                        <p className="text-sm text-gray-600">{lesson.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <Button className="w-full mt-4" variant="outline">
                  <Calendar className="h-4 w-4 mr-2" />
                  Voir tout mon planning
                </Button>
              </CardContent>
            </Card>

            {/* Professeurs recommandés */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-600" />
                  Professeurs recommandés pour vous
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {dashboardData.availableTutors.map((tutor) => (
                    <div key={tutor.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-medium text-gray-900">{tutor.name}</h4>
                          <p className="text-sm text-orange-600 font-medium">{tutor.subject}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <MapPin className="h-3 w-3 text-gray-400" />
                            <span className="text-xs text-gray-600">{tutor.location}</span>
                            <span className="text-xs text-gray-400">•</span>
                            <span className="text-xs text-gray-600">{tutor.experience}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-1 mb-1">
                            <Star className="h-3 w-3 text-yellow-500 fill-current" />
                            <span className="text-sm font-medium">{tutor.rating}</span>
                          </div>
                          <p className="text-lg font-bold text-green-600">{tutor.price.toLocaleString()} CFA</p>
                          <p className="text-xs text-gray-600">par cours</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" className="flex-1">
                          <MessageSquare className="h-3 w-3 mr-1" />
                          Contacter
                        </Button>
                        <Button size="sm" variant="outline" className="flex-1">
                          <Calendar className="h-3 w-3 mr-1" />
                          Réserver
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar droite */}
          <div className="space-y-6">
            {/* Progression des matières */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-green-600" />
                  Ma progression
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(dashboardData.progress).map(([subject, progress]) => (
                  <div key={subject} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="capitalize font-medium">
                        {subject === 'mathematics' ? 'Mathématiques' : 
                         subject === 'french' ? 'Français' :
                         subject === 'sciences' ? 'Sciences' : 'Anglais'}
                      </span>
                      <span className="text-gray-600">{progress}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Dernières notes */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-purple-600" />
                  Dernières notes
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {dashboardData.recentGrades.map((grade, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <div>
                      <p className="font-medium text-sm">{grade.subject}</p>
                      <p className="text-xs text-gray-600">{grade.type} - {grade.date}</p>
                    </div>
                    <Badge 
                      variant={grade.grade >= 16 ? "default" : grade.grade >= 12 ? "secondary" : "destructive"}
                      className="font-bold"
                    >
                      {grade.grade}/{grade.max}
                    </Badge>
                  </div>
                ))}
                <Button variant="outline" size="sm" className="w-full mt-3">
                  Voir toutes mes notes
                  <ChevronRight className="h-3 w-3 ml-1" />
                </Button>
              </CardContent>
            </Card>

            {/* Actions rapides */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Actions rapides</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full justify-start" variant="outline">
                  <Users className="h-4 w-4 mr-2" />
                  Trouver un prof
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Calendar className="h-4 w-4 mr-2" />
                  Programmer un cours
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Mes conversations
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Award className="h-4 w-4 mr-2" />
                  Mes objectifs
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
