import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  BookOpen, 
  Calendar, 
  Users, 
  TrendingUp,
  DollarSign,
  MessageSquare,
  Clock,
  Star,
  Settings,
  FileText,
  Video,
  Phone,
  MapPin,
  Bell,
  Plus,
  Eye,
  Edit,
  LogOut
} from "lucide-react";
import { authHelpers, supabase } from "@/lib/supabase";

// 🔧 PERSONNALISATION: Interface pour les données professeur
interface TutorDashboardData {
  profile: {
    first_name: string;
    last_name: string;
    specialization?: string;
    experience?: string;
  };
  activeStudents: any[];
  upcomingLessons: any[];
  earnings: {
    thisMonth: number;
    thisWeek: number;
    total: number;
  };
  schedule: any[];
  requests: any[];
  ratings: {
    average: number;
    total: number;
  };
}

interface TutorDashboardProps {
  onLogout?: () => void;
}

// 🔧 PERSONNALISATION: Dashboard pour les PROFESSEURS/TUTEURS
export default function TutorDashboard({ onLogout }: TutorDashboardProps) {
  const [dashboardData, setDashboardData] = useState<TutorDashboardData>({
    profile: { first_name: "", last_name: "" },
    activeStudents: [],
    upcomingLessons: [],
    earnings: { thisMonth: 0, thisWeek: 0, total: 0 },
    schedule: [],
    requests: [],
    ratings: { average: 0, total: 0 }
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadTutorData();
  }, []);

  const loadTutorData = async () => {
    try {
      const { user } = await authHelpers.getCurrentUser();
      if (!user) return;

      // 🔧 PERSONNALISATION: Données simulées pour le tuteur
      setDashboardData({
        profile: {
          first_name: "Michel",
          last_name: "Kouassi",
          specialization: "Mathématiques & Physique-Chimie",
          experience: "5 ans d'expérience"
        },
        activeStudents: [
          { id: 1, name: "Aminata Traoré", class: "1ère S", subject: "Mathématiques", sessions: 12, progress: 85 },
          { id: 2, name: "Jean-Baptiste Koffi", class: "Terminale S", subject: "Physique", sessions: 8, progress: 78 },
          { id: 3, name: "Fatoumata Diabaté", class: "2nde", subject: "Mathématiques", sessions: 6, progress: 92 },
          { id: 4, name: "Ibrahim Ouattara", class: "1ère S", subject: "Chimie", sessions: 10, progress: 70 }
        ],
        upcomingLessons: [
          { student: "Aminata T.", subject: "Mathématiques", time: "14:00", date: "Aujourd'hui", location: "Cocody", type: "Présentiel" },
          { student: "Jean-Baptiste K.", subject: "Physique", time: "16:00", date: "Aujourd'hui", location: "En ligne", type: "Visio" },
          { student: "Fatoumata D.", subject: "Mathématiques", time: "10:00", date: "Demain", location: "Plateau", type: "Présentiel" }
        ],
        earnings: {
          thisMonth: 485000, // CFA
          thisWeek: 125000,
          total: 2340000
        },
        schedule: [
          { day: "Lundi", hours: "14:00-18:00", students: 3 },
          { day: "Mardi", hours: "16:00-20:00", students: 2 },
          { day: "Mercredi", hours: "10:00-12:00, 14:00-16:00", students: 4 },
          { day: "Jeudi", hours: "14:00-18:00", students: 3 },
          { day: "Vendredi", hours: "16:00-18:00", students: 1 }
        ],
        requests: [
          { student: "Marie Coulibaly", subject: "Mathématiques", class: "Terminale S", message: "Besoin d'aide pour les équations différentielles", date: "Il y a 2h" },
          { student: "Serge Bamba", subject: "Physique", class: "1ère S", message: "Préparation contrôle mécanique", date: "Il y a 5h" }
        ],
        ratings: {
          average: 4.8,
          total: 47
        }
      });
    } catch (error) {
      console.error("Erreur:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement de votre espace professeur...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-2 rounded-lg">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Conform Edu - Espace Professeur</h1>
                <p className="text-sm text-gray-600">Système Éducatif Ivoirien</p>
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
                  Prof. {dashboardData.profile.first_name} {dashboardData.profile.last_name}
                </p>
                <p className="text-xs text-gray-600">{dashboardData.profile.specialization}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Message de bienvenue */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Bonjour Prof. {dashboardData.profile.first_name} ! 👨‍🏫
          </h2>
          <p className="text-gray-600">
            Gérez vos cours et accompagnez vos élèves vers la réussite.
          </p>
        </div>

        {/* Statistiques rapides */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm">Élèves actifs</p>
                  <p className="text-2xl font-bold">{dashboardData.activeStudents.length}</p>
                </div>
                <Users className="h-8 w-8 text-green-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">Cours cette semaine</p>
                  <p className="text-2xl font-bold">{dashboardData.upcomingLessons.length}</p>
                </div>
                <Calendar className="h-8 w-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm">Revenus ce mois</p>
                  <p className="text-2xl font-bold">{dashboardData.earnings.thisMonth.toLocaleString()}</p>
                  <p className="text-xs text-orange-100">CFA</p>
                </div>
                <DollarSign className="h-8 w-8 text-orange-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm">Note moyenne</p>
                  <p className="text-2xl font-bold">{dashboardData.ratings.average}/5</p>
                  <p className="text-xs text-purple-100">{dashboardData.ratings.total} avis</p>
                </div>
                <Star className="h-8 w-8 text-purple-200" />
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
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-green-600" />
                    Mes prochains cours
                  </div>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-1" />
                    Nouveau cours
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {dashboardData.upcomingLessons.map((lesson, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-100">
                      <div className="flex items-center space-x-4">
                        <div className="bg-green-600 text-white p-2 rounded-lg">
                          {lesson.type === 'Visio' ? <Video className="h-4 w-4" /> : <MapPin className="h-4 w-4" />}
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">{lesson.subject} - {lesson.student}</h4>
                          <p className="text-sm text-gray-600">{lesson.location} • {lesson.type}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">{lesson.date}</p>
                        <p className="text-sm text-gray-600">{lesson.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Gestion des élèves */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-600" />
                  Mes élèves ({dashboardData.activeStudents.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {dashboardData.activeStudents.map((student) => (
                    <div key={student.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-medium text-gray-900">{student.name}</h4>
                          <p className="text-sm text-blue-600">{student.class} - {student.subject}</p>
                          <p className="text-xs text-gray-600">{student.sessions} séances effectuées</p>
                        </div>
                        <div className="text-right">
                          <Badge variant={student.progress >= 80 ? "default" : student.progress >= 60 ? "secondary" : "destructive"}>
                            {student.progress}% de progression
                          </Badge>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <MessageSquare className="h-3 w-3 mr-1" />
                          Contacter
                        </Button>
                        <Button size="sm" variant="outline">
                          <FileText className="h-3 w-3 mr-1" />
                          Suivi
                        </Button>
                        <Button size="sm" variant="outline">
                          <Calendar className="h-3 w-3 mr-1" />
                          Programmer
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
            {/* Nouvelles demandes */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5 text-orange-600" />
                  Nouvelles demandes
                  <Badge variant="destructive">{dashboardData.requests.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {dashboardData.requests.map((request, index) => (
                  <div key={index} className="border-l-4 border-orange-500 pl-4 py-2">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium text-sm">{request.student}</h4>
                      <span className="text-xs text-gray-500">{request.date}</span>
                    </div>
                    <p className="text-sm text-blue-600 mb-1">{request.class} - {request.subject}</p>
                    <p className="text-xs text-gray-600 mb-3">{request.message}</p>
                    <div className="flex gap-2">
                      <Button size="sm" className="h-7 text-xs">Accepter</Button>
                      <Button size="sm" variant="outline" className="h-7 text-xs">Voir détails</Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Mon planning */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-purple-600" />
                  Mon planning
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {dashboardData.schedule.map((day, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <div>
                      <p className="font-medium text-sm">{day.day}</p>
                      <p className="text-xs text-gray-600">{day.hours}</p>
                    </div>
                    <Badge variant="secondary">
                      {day.students} élève{day.students > 1 ? 's' : ''}
                    </Badge>
                  </div>
                ))}
                <Button variant="outline" size="sm" className="w-full mt-3">
                  <Settings className="h-3 w-3 mr-1" />
                  Modifier planning
                </Button>
              </CardContent>
            </Card>

            {/* Revenus */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  Mes revenus
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Cette semaine</span>
                    <span className="font-medium">{dashboardData.earnings.thisWeek.toLocaleString()} CFA</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Ce mois</span>
                    <span className="font-medium text-green-600">{dashboardData.earnings.thisMonth.toLocaleString()} CFA</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Total</span>
                    <span className="font-bold">{dashboardData.earnings.total.toLocaleString()} CFA</span>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="w-full">
                  <Eye className="h-3 w-3 mr-1" />
                  Voir détails
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
                  <Plus className="h-4 w-4 mr-2" />
                  Créer un cours
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <FileText className="h-4 w-4 mr-2" />
                  Mes ressources
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Messagerie
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Edit className="h-4 w-4 mr-2" />
                  Mon profil
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
