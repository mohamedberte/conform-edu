"use client";
import { useState, useEffect } from 'react';
import HomePage from '@/components/HomePage';
import AuthManager from '@/components/AuthManager';
import { authHelpers } from '@/lib/supabase';

export default function Home() {
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('register');
  const [isAuthenticating, setIsAuthenticating] = useState(true);
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);

  // Vérifier l'état d'authentification au chargement
  useEffect(() => {
    checkAuthenticationStatus();
  }, []);

  const checkAuthenticationStatus = async () => {
    try {
      const { user } = await authHelpers.getCurrentUser();
      if (user) {
        console.log('🔐 Utilisateur déjà connecté, redirection vers le dashboard...');
        setIsUserLoggedIn(true);
        setShowAuth(true); // Afficher AuthManager qui gèrera le dashboard approprié
      } else {
        console.log('👤 Aucun utilisateur connecté, affichage de la page d\'accueil');
        setIsUserLoggedIn(false);
      }
    } catch (error) {
      console.error('Erreur lors de la vérification d\'authentification:', error);
      setIsUserLoggedIn(false);
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleLogout = () => {
    console.log('🔒 Déconnexion effectuée, retour à la page d\'accueil');
    setIsUserLoggedIn(false);
    setShowAuth(false);
  };

  const handleGetStarted = () => {
    setAuthMode('register');
    setShowAuth(true);
  };

  const handleLogin = () => {
    setAuthMode('login');
    setShowAuth(true);
  };

  const handleBackToHome = () => {
    // Ne permettre le retour à l'accueil que si l'utilisateur n'est pas connecté
    if (!isUserLoggedIn) {
      setShowAuth(false);
    }
  };

  // Écran de chargement pendant la vérification d'authentification
  if (isAuthenticating) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Vérification de votre session...</p>
        </div>
      </main>
    );
  }

  // Si l'utilisateur est connecté OU qu'on est en mode auth, afficher AuthManager
  if (showAuth || isUserLoggedIn) {
    return (
      <main className="min-h-screen">
        <AuthManager 
          initialMode={authMode}
          onBackToHome={isUserLoggedIn ? undefined : handleBackToHome} // Pas de bouton retour si connecté
          onLogout={handleLogout} // Fonction pour gérer la déconnexion depuis le dashboard
        />
      </main>
    );
  }

  // Sinon, afficher la page d'accueil
  return (
    <main className="min-h-screen">
      <HomePage 
        onGetStarted={handleGetStarted}
        onLogin={handleLogin}
        onLearnMore={() => {
          // Scroll vers la section fonctionnalités
          document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
        }}
      />
    </main>
  );
}