'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  BookOpen, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  Loader2, 
  AlertCircle, 
  CheckCircle,
  ArrowRight,
  User
} from 'lucide-react';
import { authHelpers } from '@/lib/supabase';

interface LoginAreaProps {
  onSwitchToRegister?: () => void;
  onSwitchToForgotPassword?: () => void;
  onSuccess?: (user: any) => void;
}

export default function LoginArea({ 
  onSwitchToRegister, 
  onSwitchToForgotPassword, 
  onSuccess 
}: LoginAreaProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError('Veuillez remplir tous les champs');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { data, error: signInError } = await authHelpers.signIn(email, password);

      if (signInError) {
        throw new Error(signInError.message);
      }

      if (data.user) {
        // Récupérer le profil complet de l'utilisateur
        const { data: profile } = await authHelpers.getUserProfile(data.user.id);
        onSuccess?.(profile || data.user);
      }
    } catch (err: any) {
      console.error('Erreur de connexion:', err);
      
      // Messages d'erreur personnalisés en français
      if (err.message?.includes('Invalid login credentials')) {
        setError('Email ou mot de passe incorrect');
      } else if (err.message?.includes('Email not confirmed')) {
        setError('Veuillez confirmer votre email avant de vous connecter');
      } else if (err.message?.includes('Too many requests')) {
        setError('Trop de tentatives. Veuillez réessayer plus tard');
      } else {
        setError(err.message || 'Une erreur est survenue lors de la connexion');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-green-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-6">
            <div className="bg-gradient-to-r from-orange-500 to-green-500 p-3 rounded-xl">
              <BookOpen className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Bon retour ! 🇨🇮
          </h1>
          <p className="text-gray-600">
            Connectez-vous à votre compte Conform-Edu
          </p>
        </div>

        <Card className="bg-white shadow-xl border-0">
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-xl text-gray-900">
              Connexion
            </CardTitle>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center">
                  <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
                  <span className="text-sm">{error}</span>
                </div>
              )}

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                  Adresse email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-12 border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                    placeholder="votre@email.com"
                    disabled={loading}
                    required
                  />
                </div>
              </div>

              {/* Mot de passe */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                    Mot de passe
                  </Label>
                  <button
                    type="button"
                    onClick={onSwitchToForgotPassword}
                    className="text-sm text-orange-600 hover:text-orange-700 hover:underline"
                  >
                    Mot de passe oublié ?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10 h-12 border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                    placeholder="••••••••"
                    disabled={loading}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Bouton de connexion */}
              <Button
                type="submit"
                className="w-full h-12 bg-gradient-to-r from-orange-500 to-green-500 hover:from-orange-600 hover:to-green-600 text-white font-medium"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Connexion...
                  </>
                ) : (
                  <>
                    Se connecter
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </>
                )}
              </Button>
            </form>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white px-4 text-gray-500">ou</span>
              </div>
            </div>

            {/* Lien vers inscription */}
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-4">
                Vous n'avez pas encore de compte ?
              </p>
              <Button
                type="button"
                variant="outline"
                onClick={onSwitchToRegister}
                className="w-full h-12 border-orange-300 text-orange-700 hover:bg-orange-50"
              >
                <User className="mr-2 h-5 w-5" />
                Créer un compte
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Footer info */}
        <div className="text-center mt-6">
          <p className="text-xs text-gray-500">
            En vous connectant, vous acceptez nos{' '}
            <a href="#" className="text-orange-600 hover:underline">
              conditions d'utilisation
            </a>
          </p>
        </div>

        {/* Badge de plateforme */}
        <div className="flex justify-center mt-6">
          <Badge className="bg-gradient-to-r from-orange-100 to-green-100 text-orange-800 border-orange-200">
            🇨🇮 Plateforme 100% ivoirienne
          </Badge>
        </div>
      </div>
    </div>
  );
}
