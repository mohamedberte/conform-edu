import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BookOpen, Mail, Lock, Eye, EyeOff, Loader2, AlertCircle, CheckCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { authHelpers } from "@/lib/supabase";

// 🔧 PERSONNALISATION: Props du composant de connexion
interface LoginAreaProps extends React.ComponentProps<"div"> {
  onSwitchToRegister?: () => void; // Callback pour aller vers l'inscription
  onLoginSuccess?: () => void; // Callback après connexion réussie
}

export default function LoginArea({
  className,
  onSwitchToRegister,
  onLoginSuccess,
  ...props
}: LoginAreaProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [errors, setErrors] = useState({
    email: "",
    password: "",
    general: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Validation en temps réel
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) return "L'adresse email est requise";
    if (!emailRegex.test(email)) return "Veuillez entrer une adresse email valide";
    return "";
  };

  const validatePassword = (password: string) => {
    if (!password) return "Le mot de passe est requis";
    if (password.length < 6) return "Le mot de passe doit contenir au moins 6 caractères";
    return "";
  };

  // Gestion des changements de champs
  const handleInputChange = (field: "email" | "password", value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Validation en temps réel
    if (field === "email") {
      setErrors(prev => ({ ...prev, email: validateEmail(value) }));
    } else if (field === "password") {
      setErrors(prev => ({ ...prev, password: validatePassword(value) }));
    }
    
    // Effacer l'erreur générale si l'utilisateur recommence à taper
    if (errors.general) {
      setErrors(prev => ({ ...prev, general: "" }));
    }
  };

  // Soumission du formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation finale
    const emailError = validateEmail(formData.email);
    const passwordError = validatePassword(formData.password);
    
    if (emailError || passwordError) {
      setErrors({
        email: emailError,
        password: passwordError,
        general: ""
      });
      return;
    }

    setIsLoading(true);
    setErrors({ email: "", password: "", general: "" });

    try {
      // 🔧 PERSONNALISATION: Connexion via Supabase
      const { data, error } = await authHelpers.signIn(formData.email, formData.password);

      if (error) {
        throw error;
      }

      setIsSuccess(true);
      console.log("Connexion réussie !", data);
      
      // 🔧 PERSONNALISATION: Appeler le callback de succès si fourni
      if (onLoginSuccess) {
        onLoginSuccess();
      }
      
    } catch (error: any) {
      let errorMessage = "Email ou mot de passe incorrect";
      
      // 🔧 PERSONNALISATION: Gestion des erreurs Supabase
      if (error.message?.includes('Invalid login credentials')) {
        errorMessage = "Email ou mot de passe incorrect";
      } else if (error.message?.includes('Email not confirmed')) {
        errorMessage = "Veuillez confirmer votre email avant de vous connecter";
      } else if (error.message?.includes('Too many requests')) {
        errorMessage = "Trop de tentatives. Veuillez réessayer plus tard";
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setErrors(prev => ({
        ...prev,
        general: errorMessage
      }));
    } finally {
      setIsLoading(false);
    }
  };

  // Reset du succès après 3 secondes
  useEffect(() => {
    if (isSuccess) {
      const timer = setTimeout(() => setIsSuccess(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isSuccess]);

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4",
        className
      )}
      {...props}
    >
      <div className="w-full max-w-md">
        {/* Logo et titre */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-3 rounded-full">
              <BookOpen className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Conform Edu</h1>
          <p className="text-gray-600">Votre plateforme d'apprentissage</p>
        </div>

        {/* Carte de connexion */}
        <Card className="shadow-xl border-0 bg-white/95 backdrop-blur-sm">
          <CardHeader className="text-center pb-2">
            <h2 className="text-2xl font-semibold text-gray-800">Connexion</h2>
            <p className="text-sm text-gray-600">
              Accédez à votre espace d'apprentissage
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Message de succès */}
            {isSuccess && (
              <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg text-green-800">
                <CheckCircle className="h-4 w-4" />
                <span className="text-sm font-medium">Connexion réussie ! Redirection...</span>
              </div>
            )}

            {/* Message d'erreur général */}
            {errors.general && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-800">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm">{errors.general}</span>
              </div>
            )}

            <form className="space-y-4" onSubmit={handleSubmit}>
              {/* Champ Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                  Adresse email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="votre.email@exemple.com"
                    required
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className={cn(
                      "pl-10 h-12 rounded-lg transition-colors",
                      errors.email 
                        ? "border-red-300 focus:border-red-500 focus:ring-red-500" 
                        : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    )}
                  />
                </div>
                {errors.email && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Champ Mot de passe */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                  Mot de passe
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Entrez votre mot de passe"
                    required
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    className={cn(
                      "pl-10 pr-10 h-12 rounded-lg transition-colors",
                      errors.password 
                        ? "border-red-300 focus:border-red-500 focus:ring-red-500" 
                        : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    )}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.password}
                  </p>
                )}
              </div>

              {/* Mot de passe oublié */}
              <div className="text-right">
                <a href="#" className="text-sm text-blue-600 hover:text-blue-800 hover:underline">
                  Mot de passe oublié ?
                </a>
              </div>

              {/* Bouton de connexion */}
              <Button 
                type="submit" 
                disabled={isLoading || isSuccess}
                className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Connexion en cours...
                  </>
                ) : isSuccess ? (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Connecté !
                  </>
                ) : (
                  "Se connecter"
                )}
              </Button>

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-500">ou</span>
                </div>
              </div>

              {/* Connexion Google */}
              <Button
                type="button"
                variant="outline"
                disabled={isLoading || isSuccess}
                className="w-full h-12 border-gray-300 hover:bg-gray-50 rounded-lg flex items-center justify-center gap-3 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => {
                  // Ajouter la logique de connexion Google ici
                  console.log('Connexion avec Google');
                }}
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continuer avec Google
              </Button>
            </form>

            {/* Lien d'inscription */}
            <div className="text-center text-sm text-gray-600 pt-4 border-t border-gray-200">
              Pas encore de compte ?{" "}
              <button 
                onClick={onSwitchToRegister}
                className="text-blue-600 hover:text-blue-800 font-medium hover:underline"
              >
                Créer un compte
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8 text-xs text-gray-500">
          <p>© 2025 Conform Edu. Tous droits réservés.</p>
        </div>
      </div>
    </div>
  );
}
