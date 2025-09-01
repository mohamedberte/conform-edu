'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import LoginArea from '@/components/LoginArea';
import RegisterArea from '@/components/RegisterArea';
import ForgotPasswordArea from '@/components/ForgotPasswordArea';
import StudentDashboard from '@/components/StudentDashboard';
import TutorDashboardNew from '@/components/TutorDashboardNew';
import ParentDashboard from '@/components/ParentDashboard';
import { authHelpers, supabase } from '@/lib/supabase';

interface AuthManagerProps {
  initialMode?: 'login' | 'register';
  onBackToHome?: () => void;
  onLogout?: () => void; // Callback pour notifier la déconnexion à la page parente
}

export default function AuthManager({ initialMode = 'login', onBackToHome, onLogout }: AuthManagerProps) {
  const [currentView, setCurrentView] = useState<'login' | 'register' | 'forgot-password'>(initialMode);
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
        console.log('👤 Utilisateur connecté:', {
          id: user.id,
          email: user.email,
          emailConfirmed: !!user.email_confirmed_at,
          role: user.user_metadata?.role
        });

        setUser(user);
        
        // Vérifier si l'expert doit finaliser son inscription
        if (user.user_metadata?.role === 'expert' && user.email_confirmed_at) {
          console.log('🎓 Expert détecté, vérification du profil...');
          
          // Vérifier si le profil expert existe déjà
          const { data: expertProfile, error: profileError } = await supabase
            .from('expert_profiles')
            .select('id')
            .eq('user_id', user.id)
            .single();
            
          console.log('📊 Résultat profil expert:', { expertProfile, profileError });
            
          if (!expertProfile) {
            console.log('🔄 Pas de profil expert trouvé, redirection vers /expert-setup...');
            // Pas de profil expert → rediriger vers la finalisation
            window.location.href = '/expert-setup';
            return;
          } else {
            console.log('✅ Profil expert trouvé:', expertProfile);
          }
        }
        
        // Récupérer le profil utilisateur pour connaître son rôle
        const { data: profile } = await authHelpers.getUserProfile(user.id);
        setUserRole(profile?.role || user.user_metadata?.role || null);
      } else {
        console.log('👤 Aucun utilisateur connecté');
      }
    } catch (error) {
      console.error('Erreur d\'authentification:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoginSuccess = (userData: any) => {
    setUser(userData);
    if (userData.role) {
      setUserRole(userData.role);
    }
  };

  const handleRegistrationSuccess = (userData: any) => {
    setUser(userData);
    if (userData.role) {
      setUserRole(userData.role);
    }
  };

  const handleLogout = async () => {
    try {
      await authHelpers.signOut();
      setUser(null);
      setUserRole(null);
      setCurrentView('login');
      
      // Notifier la page parente de la déconnexion
      if (onLogout) {
        onLogout();
      }
    } catch (error) {
      console.error('Erreur de déconnexion:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  // Si l'utilisateur est connecté, afficher le dashboard approprié
  if (user && userRole) {
    const dashboardProps = {
      user,
      onLogout: handleLogout,
      onBackToHome
    };

    switch (userRole) {
      case 'student':
        return <StudentDashboard {...dashboardProps} />;
      case 'expert':
        return <TutorDashboardNew {...dashboardProps} />;
      case 'parent':
        return <ParentDashboard {...dashboardProps} />;
      default:
        console.error('Rôle utilisateur non reconnu:', userRole);
        return (
          <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-green-50 flex items-center justify-center">
            <div className="text-center">
              <p className="text-red-600 mb-4">Erreur: Rôle utilisateur non reconnu</p>
              <Button onClick={handleLogout} variant="outline">
                Se déconnecter
              </Button>
            </div>
          </div>
        );
    }
  }

  // Interface d'authentification
  return (
    <div className="relative">
      {/* Bouton retour */}
      {onBackToHome && (
        <div className="absolute top-6 left-6 z-10">
          <Button
            onClick={onBackToHome}
            variant="ghost"
            size="sm"
            className="text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour à l'accueil
          </Button>
        </div>
      )}

      {/* Vues d'authentification */}
      {currentView === 'login' && (
        <LoginArea
          onSwitchToRegister={() => setCurrentView('register')}
          onSwitchToForgotPassword={() => setCurrentView('forgot-password')}
          onSuccess={handleLoginSuccess}
        />
      )}

      {currentView === 'register' && (
        <RegisterArea
          onSwitchToLogin={() => setCurrentView('login')}
          onSuccess={() => checkAuth()}
        />
      )}

      {currentView === 'forgot-password' && (
        <ForgotPasswordArea
          onBackToLogin={() => setCurrentView('login')}
        />
      )}
    </div>
  );
}
