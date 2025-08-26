import { useState, useEffect } from "react";
import LoginArea from "@/components/LoginArea";
import RegisterArea from "@/components/RegisterArea";
import StudentDashboard from "@/components/StudentDashboard";
import TutorDashboard from "@/components/TutorDashboard";
import ParentDashboard from "@/components/ParentDashboard";
import { authHelpers } from "@/lib/supabase";

// 🔧 PERSONNALISATION: Composant principal qui gère la navigation entre connexion et inscription
export default function AuthManager() {
  const [currentView, setCurrentView] = useState<'login' | 'register'>('login');
  const [user, setUser] = useState<any>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const { user } = await authHelpers.getCurrentUser();
      if (user) {
        setUser(user);
        const profile = await authHelpers.getUserProfile(user.id);
        setUserRole(profile?.role || null);
      }
    } catch (error) {
      console.error("Erreur d'authentification:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await authHelpers.signOut();
      setUser(null);
      setUserRole(null);
      setCurrentView('login');
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Vérification de l'authentification...</p>
        </div>
      </div>
    );
  }

  // Si l'utilisateur est connecté, afficher le dashboard approprié
  if (user && userRole) {
    switch (userRole) {
      case 'student':
        return <StudentDashboard onLogout={handleLogout} />;
      case 'teacher':
        return <TutorDashboard onLogout={handleLogout} />;
      case 'parent':
        return <ParentDashboard onLogout={handleLogout} />;
      default:
        return <StudentDashboard onLogout={handleLogout} />;
    }
  }

  const switchToRegister = () => {
    setCurrentView('register');
  };

  const switchToLogin = () => {
    setCurrentView('login');
  };

  if (currentView === 'register') {
    return <RegisterArea onSwitchToLogin={switchToLogin} onRegisterSuccess={checkAuth} />;
  }

  return <LoginArea onSwitchToRegister={switchToRegister} onLoginSuccess={checkAuth} />;
}
