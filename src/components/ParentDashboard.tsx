import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  User, 
  Calendar, 
  BookOpen, 
  TrendingUp,
  MessageSquare,
  Bell,
  Users,
  GraduationCap,
  Star,
  Settings,
  FileText,
  CreditCard,
  MapPin,
  Clock,
  Eye,
  Plus,
  Phone,
  Mail,
  LogOut
} from "lucide-react";
import { authHelpers, supabase } from "@/lib/supabase";

// 🔧 PERSONNALISATION: Interface pour les données parent
interface Subject {
  name: string;
  grade: number;
  tutor: string;
  sessions: number;
  progress: number;
}

interface Child {
  id: number;
  name: string;
  class: string;
  school: string;
  averageGrade: number;
  subjects: Subject[];
  behavior: string;
  attendance: number;
}

interface ParentDashboardData {
  profile: {
    first_name: string;
    last_name: string;
    phone?: string;
    email?: string;
  };
  children: Child[];
  tutorInteractions: any[];
  payments: any[];
  notifications: any[];
  upcomingMeetings: any[];
}

interface ParentDashboardProps {
  onLogout?: () => void;
}

// 🔧 PERSONNALISATION: Dashboard pour les PARENTS
export default function ParentDashboard({ onLogout }: ParentDashboardProps) {
  const [dashboardData, setDashboardData] = useState<ParentDashboardData>({
    profile: { first_name: "", last_name: "" },
    children: [],
    tutorInteractions: [],
    payments: [],
    notifications: [],
    upcomingMeetings: []
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadParentData();
  }, []);

  const loadParentData = async () => {
    try {
      const { user } = await authHelpers.getCurrentUser();
      if (!user) return;

      // 🔧 PERSONNALISATION: Données simulées pour le parent
      setDashboardData({
        profile: {
          first_name: "Fatou",
          last_name: "Coulibaly",
          phone: "+225 07 12 34 56 78",
          email: "fatou.coulibaly@email.com"
        },
        children: [
          {
            id: 1,
            name: "Aminata Coulibaly",
            class: "1ère S",
            school: "Lycée Classique d'Abidjan",
            averageGrade: 14.5,
            subjects: [
              { name: "Mathématiques", grade: 16, tutor: "Prof. Michel Kouassi", sessions: 12, progress: 85 },
              { name: "Physique-Chimie", grade: 13, tutor: "Prof. Michel Kouassi", sessions: 8, progress: 78 },
              { name: "Français", grade: 15, tutor: "Mme. Akissi Brou", sessions: 6, progress: 88 }
            ],
            behavior: "Excellente",
            attendance: 95
          },
          {
            id: 2,
            name: "Ibrahim Coulibaly",
            class: "3ème",
            school: "Collège Saint-Augustin",
            averageGrade: 12.8,
            subjects: [
              { name: "Mathématiques", grade: 14, tutor: "Prof. Yao Kouamé", sessions: 10, progress: 72 },
              { name: "Anglais", grade: 11, tutor: "Miss Sarah Johnson", sessions: 8, progress: 68 }
            ],
            behavior: "Satisfaisante",
            attendance: 88
          }
        ],
        tutorInteractions: [
          {
            tutor: "Prof. Michel Kouassi",
            child: "Aminata",
            subject: "Mathématiques",
            lastMessage: "Aminata fait d'excellents progrès en géométrie. Je recommande de continuer sur cette lancée.",
            date: "Il y a 2 jours",
            rating: 5
          },
          {
            tutor: "Mme. Akissi Brou",
            child: "Aminata", 
            subject: "Français",
            lastMessage: "Très bonne amélioration en expression écrite. Les devoirs sont bien faits.",
            date: "Il y a 1 semaine",
            rating: 5
          }
        ],
        payments: [
          { tutor: "Prof. Michel Kouassi", amount: 80000, date: "15/11/2024", status: "Payé", child: "Aminata" },
          { tutor: "Mme. Akissi Brou", amount: 60000, date: "10/11/2024", status: "Payé", child: "Aminata" },
          { tutor: "Prof. Yao Kouamé", amount: 50000, date: "08/11/2024", status: "En attente", child: "Ibrahim" }
        ],
        notifications: [
          { type: "progress", message: "Aminata a terminé son chapitre de géométrie avec succès", date: "Il y a 1h" },
          { type: "payment", message: "Paiement en attente pour Prof. Yao Kouamé", date: "Il y a 3h" },
          { type: "meeting", message: "Rendez-vous parent-professeur planifié avec Prof. Michel", date: "Il y a 1 jour" }
        ],
        upcomingMeetings: [
          { tutor: "Prof. Michel Kouassi", child: "Aminata", date: "Demain", time: "17:00", type: "Bilan mensuel" },
          { tutor: "Prof. Yao Kouamé", child: "Ibrahim", date: "Vendredi", time: "16:30", type: "Point sur progression" }
        ]
      });
    } catch (error) {
      console.error("Erreur:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement de votre espace parent...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50">
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-2 rounded-lg">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Conform Edu - Espace Parent</h1>
                <p className="text-sm text-gray-600">Suivi éducatif de vos enfants</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm">
                <Bell className="h-4 w-4" />
                {dashboardData.notifications.length > 0 && (
                  <Badge variant="destructive" className="ml-1 text-xs px-1">
                    {dashboardData.notifications.length}
                  </Badge>
                )}
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
                <p className="text-xs text-gray-600">Parent</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Message de bienvenue */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Bonjour {dashboardData.profile.first_name} ! 👪
          </h2>
          <p className="text-gray-600">
            Suivez les progrès scolaires de vos enfants et communiquez avec leurs professeurs.
          </p>
        </div>

        {/* Statistiques rapides */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm">Enfants suivis</p>
                  <p className="text-2xl font-bold">{dashboardData.children.length}</p>
                </div>
                <GraduationCap className="h-8 w-8 text-purple-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm">Moyenne générale</p>
                  <p className="text-2xl font-bold">
                    {(dashboardData.children.reduce((acc, child) => acc + child.averageGrade, 0) / dashboardData.children.length).toFixed(1)}
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-orange-500 to-green-500 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm">Professeurs actifs</p>
                  <p className="text-2xl font-bold">
                    {new Set(dashboardData.children.flatMap(child => child.subjects.map((s: Subject) => s.tutor))).size}
                  </p>
                </div>
                <Users className="h-8 w-8 text-orange-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm">RDV ce mois</p>
                  <p className="text-2xl font-bold">{dashboardData.upcomingMeetings.length}</p>
                </div>
                <Calendar className="h-8 w-8 text-orange-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Colonne principale */}
          <div className="lg:col-span-2 space-y-8">
            {/* Mes enfants */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5 text-purple-600" />
                  Mes enfants
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {dashboardData.children.map((child) => (
                    <div key={child.id} className="border rounded-lg p-6 bg-gradient-to-r from-purple-50 to-pink-50">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-xl font-bold text-gray-900">{child.name}</h3>
                          <p className="text-purple-600 font-medium">{child.class} • {child.school}</p>
                          <div className="flex items-center gap-4 mt-2">
                            <Badge variant="secondary">Moyenne: {child.averageGrade}/20</Badge>
                            <Badge variant={child.attendance >= 90 ? "default" : "destructive"}>
                              Assiduité: {child.attendance}%
                            </Badge>
                            <Badge variant="outline">{child.behavior}</Badge>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <h4 className="font-medium text-gray-900">Cours de soutien:</h4>
                        {child.subjects.map((subject: Subject, idx: number) => (
                          <div key={idx} className="bg-white rounded-lg p-4 border border-purple-200">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <h5 className="font-medium text-gray-900">{subject.name}</h5>
                                <p className="text-sm text-purple-600">avec {subject.tutor}</p>
                              </div>
                              <div className="text-right">
                                <Badge variant={subject.grade >= 14 ? "default" : subject.grade >= 10 ? "secondary" : "destructive"}>
                                  {subject.grade}/20
                                </Badge>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span>Progression</span>
                                <span>{subject.progress}%</span>
                              </div>
                              <Progress value={subject.progress} className="h-2" />
                              <p className="text-xs text-gray-600">{subject.sessions} séances effectuées</p>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="flex gap-2 mt-4">
                        <Button size="sm" variant="outline">
                          <FileText className="h-3 w-3 mr-1" />
                          Bulletin
                        </Button>
                        <Button size="sm" variant="outline">
                          <MessageSquare className="h-3 w-3 mr-1" />
                          Contacter école
                        </Button>
                        <Button size="sm" variant="outline">
                          <Calendar className="h-3 w-3 mr-1" />
                          Planning
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Communications avec les professeurs */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-orange-600" />
                  Communications professeurs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {dashboardData.tutorInteractions.map((interaction, index) => (
                    <div key={index} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-medium text-gray-900">{interaction.tutor}</h4>
                          <p className="text-sm text-orange-600">{interaction.subject} - {interaction.child}</p>
                        </div>
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i} 
                              className={`h-3 w-3 ${i < interaction.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-gray-700 mb-2">{interaction.lastMessage}</p>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-500">{interaction.date}</span>
                        <Button size="sm" variant="outline">
                          <MessageSquare className="h-3 w-3 mr-1" />
                          Répondre
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
            {/* Notifications */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5 text-orange-600" />
                  Notifications
                  <Badge variant="destructive">{dashboardData.notifications.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {dashboardData.notifications.map((notification, index) => (
                  <div key={index} className="border-l-4 border-orange-500 pl-3 py-2">
                    <p className="text-sm text-gray-900">{notification.message}</p>
                    <span className="text-xs text-gray-500">{notification.date}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Prochains rendez-vous */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-green-600" />
                  Prochains RDV
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {dashboardData.upcomingMeetings.map((meeting, index) => (
                  <div key={index} className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium text-sm">{meeting.tutor}</h4>
                      <Badge variant="outline" className="text-xs">{meeting.type}</Badge>
                    </div>
                    <p className="text-sm text-green-600 mb-1">Pour {meeting.child}</p>
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      <Clock className="h-3 w-3" />
                      {meeting.date} à {meeting.time}
                    </div>
                    <Button size="sm" className="w-full mt-2 h-7">
                      Rejoindre
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Paiements */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-purple-600" />
                  Paiements récents
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {dashboardData.payments.slice(0, 3).map((payment, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <div>
                      <p className="font-medium text-sm">{payment.tutor}</p>
                      <p className="text-xs text-gray-600">{payment.child} • {payment.date}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-sm">{payment.amount.toLocaleString()} CFA</p>
                      <Badge variant={payment.status === "Payé" ? "default" : "destructive"} className="text-xs">
                        {payment.status}
                      </Badge>
                    </div>
                  </div>
                ))}
                <Button variant="outline" size="sm" className="w-full">
                  <Eye className="h-3 w-3 mr-1" />
                  Voir tout
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
                  Trouver un professeur
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Calendar className="h-4 w-4 mr-2" />
                  Planifier RDV
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <FileText className="h-4 w-4 mr-2" />
                  Télécharger bulletins
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Phone className="h-4 w-4 mr-2" />
                  Contacter support
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
