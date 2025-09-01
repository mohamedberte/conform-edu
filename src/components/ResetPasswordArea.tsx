import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, Eye, EyeOff, Loader2, AlertCircle, CheckCircle, Shield } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

// 🔧 PERSONNALISATION: Props du composant de réinitialisation
interface ResetPasswordAreaProps extends React.ComponentProps<"div"> {
  accessToken?: string; // Token de réinitialisation depuis l'URL
  refreshToken?: string; // Token de rafraîchissement depuis l'URL
}

export default function ResetPasswordArea({
  className,
  accessToken,
  refreshToken,
  ...props
}: ResetPasswordAreaProps) {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: ""
  });
  const [errors, setErrors] = useState({
    password: "",
    confirmPassword: "",
    general: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [tokenValid, setTokenValid] = useState(true);

  // Vérification du token au chargement
  useEffect(() => {
    const checkToken = async () => {
      if (!accessToken) {
        console.error('No access token provided for password reset');
        setTokenValid(false);
        setErrors(prev => ({
          ...prev,
          general: "Lien de réinitialisation invalide ou expiré. Aucun token d'accès trouvé."
        }));
        return;
      }

      try {
        console.log('Validating reset token...');
        
        // Essayer d'établir la session avec le token
        const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken || ""
        });

        if (sessionError || !sessionData.user) {
          console.error('Session validation failed:', sessionError);
          setTokenValid(false);
          setErrors(prev => ({
            ...prev,
            general: "Lien de réinitialisation invalide ou expiré."
          }));
          return;
        }

        console.log('Reset token validated successfully');
        setTokenValid(true);
        
      } catch (error) {
        console.error("Erreur vérification token:", error);
        setTokenValid(false);
        setErrors(prev => ({
          ...prev,
          general: "Erreur lors de la vérification du lien de réinitialisation."
        }));
      }
    };

    checkToken();
  }, [accessToken, refreshToken]);

  // Validation du mot de passe
  const validatePassword = (password: string) => {
    if (!password) return "Le mot de passe est requis";
    if (password.length < 8) return "Le mot de passe doit contenir au moins 8 caractères";
    if (!/(?=.*[a-z])/.test(password)) return "Le mot de passe doit contenir au moins une minuscule";
    if (!/(?=.*[A-Z])/.test(password)) return "Le mot de passe doit contenir au moins une majuscule";
    if (!/(?=.*\d)/.test(password)) return "Le mot de passe doit contenir au moins un chiffre";
    return "";
  };

  // Validation de la confirmation
  const validateConfirmPassword = (confirmPassword: string, password: string) => {
    if (!confirmPassword) return "La confirmation du mot de passe est requise";
    if (confirmPassword !== password) return "Les mots de passe ne correspondent pas";
    return "";
  };

  // Gestion des changements de champs
  const handleInputChange = (field: "password" | "confirmPassword", value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    if (field === "password") {
      const passwordError = validatePassword(value);
      const confirmError = formData.confirmPassword ? validateConfirmPassword(formData.confirmPassword, value) : "";
      setErrors(prev => ({ 
        ...prev, 
        password: passwordError,
        confirmPassword: confirmError,
        general: ""
      }));
    } else {
      const confirmError = validateConfirmPassword(value, formData.password);
      setErrors(prev => ({ 
        ...prev, 
        confirmPassword: confirmError,
        general: ""
      }));
    }
  };

  // Réinitialisation du mot de passe
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!tokenValid || !accessToken) {
      setErrors(prev => ({
        ...prev,
        general: "Lien de réinitialisation invalide."
      }));
      return;
    }
    
    // Validation complète
    const passwordError = validatePassword(formData.password);
    const confirmError = validateConfirmPassword(formData.confirmPassword, formData.password);
    
    if (passwordError || confirmError) {
      setErrors(prev => ({
        ...prev,
        password: passwordError,
        confirmPassword: confirmError
      }));
      return;
    }

    setIsLoading(true);
    setErrors({ password: "", confirmPassword: "", general: "" });

    try {
      console.log('Starting password reset process...');
      
      // S'assurer que la session est active avec le token de réinitialisation
      const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken || ""
      });

      if (sessionError || !sessionData.user) {
        console.error('Session error during password reset:', sessionError);
        setErrors(prev => ({
          ...prev,
          general: "Lien de réinitialisation invalide ou expiré."
        }));
        return;
      }

      console.log('Session established, updating password...');
      
      // Mettre à jour le mot de passe
      const { error } = await supabase.auth.updateUser({
        password: formData.password
      });

      if (error) {
        console.error('Password update error:', error);
        if (error.message.includes("New password should be different")) {
          setErrors(prev => ({
            ...prev,
            general: "Le nouveau mot de passe doit être différent de l'ancien."
          }));
        } else if (error.message.includes("Password should be at least")) {
          setErrors(prev => ({
            ...prev,
            general: "Le mot de passe ne respecte pas les critères de sécurité."
          }));
        } else {
          setErrors(prev => ({
            ...prev,
            general: `Erreur lors de la mise à jour: ${error.message}`
          }));
        }
      } else {
        console.log('Password updated successfully');
        setIsSuccess(true);
        
        // Déconnexion pour forcer une nouvelle connexion
        await supabase.auth.signOut();
        
        // Redirection après succès
        setTimeout(() => {
          router.push('/login?message=password-updated');
        }, 3000);
      }
    } catch (error) {
      console.error("Erreur réinitialisation:", error);
      setErrors(prev => ({
        ...prev,
        general: "Une erreur technique est survenue. Veuillez réessayer ou demander un nouveau lien."
      }));
    } finally {
      setIsLoading(false);
    }
  };

  // Critères de mot de passe pour affichage
  const passwordCriteria = [
    { met: formData.password.length >= 8, text: "Au moins 8 caractères" },
    { met: /(?=.*[a-z])/.test(formData.password), text: "Une minuscule" },
    { met: /(?=.*[A-Z])/.test(formData.password), text: "Une majuscule" },
    { met: /(?=.*\d)/.test(formData.password), text: "Un chiffre" }
  ];

  if (!tokenValid) {
    return (
      <div className={cn("flex flex-col space-y-6", className)} {...props}>
        <Card className="w-full max-w-md mx-auto shadow-2xl border-0 bg-gradient-to-br from-white to-red-50">
          <CardContent className="p-8 text-center">
            <div className="bg-red-100 p-4 rounded-full w-16 h-16 mx-auto mb-4">
              <AlertCircle className="h-8 w-8 text-red-600 mx-auto mt-1" />
            </div>
            <h2 className="text-xl font-bold text-red-900 mb-2">
              Lien invalide ou expiré
            </h2>
            <p className="text-red-700 text-sm mb-4">
              {errors.general || "Ce lien de réinitialisation est invalide ou a expiré."}
            </p>
            <p className="text-gray-600 text-xs mb-6">
              Les liens de réinitialisation expirent après 1 heure pour des raisons de sécurité.
            </p>
            <div className="space-y-3">
              <Button 
                onClick={() => router.push('/login')}
                className="w-full bg-red-600 hover:bg-red-700 text-white"
              >
                Demander un nouveau lien
              </Button>
              <Button 
                onClick={() => router.push('/')}
                variant="outline"
                className="w-full border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Retour à l'accueil
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col space-y-6", className)} {...props}>
      <Card className="w-full max-w-md mx-auto shadow-2xl border-0 bg-gradient-to-br from-white to-green-50">
        <CardHeader className="space-y-1 pb-6 pt-8">
          <div className="flex items-center justify-center mb-6">
            <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-4 rounded-full shadow-lg">
              <Shield className="h-8 w-8 text-white" />
            </div>
          </div>
          
          {!isSuccess ? (
            <>
              <h2 className="text-2xl font-bold text-center text-gray-900 mb-2">
                Nouveau mot de passe
              </h2>
              <p className="text-center text-gray-600 text-sm">
                Créez un mot de passe sécurisé pour votre compte Conform Edu.
              </p>
            </>
          ) : (
            <>
              <h2 className="text-2xl font-bold text-center text-green-900 mb-2">
                Mot de passe modifié ! ✅
              </h2>
              <p className="text-center text-green-700 text-sm">
                Votre mot de passe a été mis à jour avec succès. Redirection en cours...
              </p>
            </>
          )}
        </CardHeader>

        <CardContent className="space-y-6 pb-8">
          {!isSuccess ? (
            <form onSubmit={handleResetPassword} className="space-y-6">
              {/* Affichage des erreurs générales */}
              {errors.general && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-700 text-sm flex items-center">
                    <AlertCircle className="h-4 w-4 mr-2" />
                    {errors.general}
                  </p>
                </div>
              )}

              {/* Nouveau mot de passe */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                  Nouveau mot de passe
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    placeholder="Votre nouveau mot de passe"
                    className={cn(
                      "pl-10 pr-10 h-12 border-gray-300 focus:border-green-500 focus:ring-green-500",
                      errors.password && "border-red-500 focus:border-red-500 focus:ring-red-500"
                    )}
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                
                {/* Critères de mot de passe */}
                {formData.password && (
                  <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs font-medium text-gray-700 mb-2">Critères de sécurité :</p>
                    <div className="grid grid-cols-2 gap-1">
                      {passwordCriteria.map((criterion, index) => (
                        <div key={index} className="flex items-center text-xs">
                          <div className={`w-2 h-2 rounded-full mr-2 ${criterion.met ? 'bg-green-500' : 'bg-gray-300'}`} />
                          <span className={criterion.met ? 'text-green-700' : 'text-gray-600'}>
                            {criterion.text}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {errors.password && (
                  <p className="text-red-600 text-xs flex items-center mt-1">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {errors.password}
                  </p>
                )}
              </div>

              {/* Confirmation du mot de passe */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                  Confirmer le mot de passe
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                    placeholder="Confirmez votre mot de passe"
                    className={cn(
                      "pl-10 pr-10 h-12 border-gray-300 focus:border-green-500 focus:ring-green-500",
                      errors.confirmPassword && "border-red-500 focus:border-red-500 focus:ring-red-500"
                    )}
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-red-600 text-xs flex items-center mt-1">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {errors.confirmPassword}
                  </p>
                )}
              </div>

              {/* Bouton de confirmation */}
              <Button 
                type="submit" 
                disabled={isLoading || !!errors.password || !!errors.confirmPassword || !formData.password || !formData.confirmPassword}
                className="w-full h-12 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Mise à jour en cours...
                  </>
                ) : (
                  <>
                    <Shield className="mr-2 h-4 w-4" />
                    Mettre à jour le mot de passe
                  </>
                )}
              </Button>
            </form>
          ) : (
            // Confirmation de succès
            <div className="text-center space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <p className="text-green-800 text-sm mb-2">
                  Votre mot de passe a été modifié avec succès !
                </p>
                <p className="text-xs text-green-700">
                  Vous allez être redirigé vers la page de connexion...
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Conseil de sécurité */}
      <Card className="w-full max-w-md mx-auto bg-orange-50 border-orange-200">
        <CardContent className="p-4">
          <h3 className="font-semibold text-orange-900 mb-2 text-sm">🔒 Conseil de sécurité</h3>
          <ul className="text-xs text-orange-800 space-y-1">
            <li>• Utilisez un mot de passe unique pour Conform Edu</li>
            <li>• Ne partagez jamais votre mot de passe</li>
            <li>• Considérez l'utilisation d'un gestionnaire de mots de passe</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
