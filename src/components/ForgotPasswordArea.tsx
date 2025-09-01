import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, ArrowLeft, Loader2, AlertCircle, CheckCircle, RefreshCw } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/lib/supabase";

// 🔧 PERSONNALISATION: Props du composant de réinitialisation
interface ForgotPasswordAreaProps extends React.ComponentProps<"div"> {
  onBackToLogin?: () => void; // Callback pour retourner à la connexion
}

export default function ForgotPasswordArea({
  className,
  onBackToLogin,
  ...props
}: ForgotPasswordAreaProps) {
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState({
    email: "",
    general: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  // Validation email
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) return "L'adresse email est requise";
    if (!emailRegex.test(email)) return "Veuillez entrer une adresse email valide";
    return "";
  };

  // Gestion du changement d'email
  const handleEmailChange = (value: string) => {
    setEmail(value);
    const emailError = validateEmail(value);
    setErrors(prev => ({ ...prev, email: emailError, general: "" }));
  };

  // Envoi de l'email de réinitialisation
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    const emailError = validateEmail(email);
    if (emailError) {
      setErrors(prev => ({ ...prev, email: emailError }));
      return;
    }

    setIsLoading(true);
    setErrors({ email: "", general: "" });

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        if (error.message.includes("Email not confirmed")) {
          setErrors(prev => ({
            ...prev,
            general: "Votre compte n'est pas encore vérifié. Vérifiez votre email pour activer votre compte."
          }));
        } else if (error.message.includes("Invalid login credentials")) {
          setErrors(prev => ({
            ...prev,
            general: "Aucun compte trouvé avec cette adresse email."
          }));
        } else {
          setErrors(prev => ({
            ...prev,
            general: "Erreur lors de l'envoi de l'email. Veuillez réessayer."
          }));
        }
      } else {
        setIsSuccess(true);
        setEmailSent(true);
      }
    } catch (error) {
      console.error("Erreur réinitialisation:", error);
      setErrors(prev => ({
        ...prev,
        general: "Une erreur technique est survenue. Veuillez réessayer plus tard."
      }));
    } finally {
      setIsLoading(false);
    }
  };

  // Renvoyer l'email
  const handleResendEmail = async () => {
    setIsLoading(true);
    setErrors({ email: "", general: "" });

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (!error) {
        setErrors(prev => ({
          ...prev,
          general: ""
        }));
      }
    } catch (error) {
      console.error("Erreur renvoi email:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col space-y-6", className)} {...props}>
      <Card className="w-full max-w-md mx-auto shadow-2xl border-0 bg-gradient-to-br from-white to-orange-50">
        <CardHeader className="space-y-1 pb-8 pt-8">
          <div className="flex items-center justify-center mb-6">
            <div className="bg-gradient-to-br from-orange-500 to-green-500 p-4 rounded-full shadow-lg">
              <Mail className="h-8 w-8 text-white" />
            </div>
          </div>
          
          {!emailSent ? (
            <>
              <h2 className="text-2xl font-bold text-center text-gray-900 mb-2">
                Mot de passe oublié ?
              </h2>
              <p className="text-center text-gray-600 text-sm">
                Pas de souci ! Entrez votre adresse email et nous vous enverrons un lien pour réinitialiser votre mot de passe.
              </p>
            </>
          ) : (
            <>
              <h2 className="text-2xl font-bold text-center text-gray-900 mb-2">
                Email envoyé ! 📧
              </h2>
              <p className="text-center text-gray-600 text-sm">
                Nous avons envoyé un lien de réinitialisation à <strong>{email}</strong>. Vérifiez votre boîte de réception et vos spams.
              </p>
            </>
          )}
        </CardHeader>

        <CardContent className="space-y-6 pb-8">
          {!emailSent ? (
            // Formulaire de demande de réinitialisation
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
                    value={email}
                    onChange={(e) => handleEmailChange(e.target.value)}
                    placeholder="votre@email.com"
                    className={cn(
                      "pl-10 h-12 border-gray-300 focus:border-orange-500 focus:ring-orange-500",
                      errors.email && "border-red-500 focus:border-red-500 focus:ring-red-500"
                    )}
                    disabled={isLoading}
                  />
                </div>
                {errors.email && (
                  <p className="text-red-600 text-xs flex items-center mt-1">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Bouton d'envoi */}
              <Button 
                type="submit" 
                disabled={isLoading || !email || !!errors.email}
                className="w-full h-12 bg-gradient-to-r from-orange-500 to-green-500 hover:from-orange-600 hover:to-green-600 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Envoi en cours...
                  </>
                ) : (
                  <>
                    <Mail className="mr-2 h-4 w-4" />
                    Envoyer le lien de réinitialisation
                  </>
                )}
              </Button>
            </form>
          ) : (
            // Confirmation d'envoi d'email
            <div className="space-y-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
                <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <p className="text-green-800 text-sm mb-4">
                  L'email de réinitialisation a été envoyé avec succès !
                </p>
                <div className="text-xs text-green-700 space-y-1">
                  <p>• Vérifiez votre boîte de réception</p>
                  <p>• Regardez dans vos spams si besoin</p>
                  <p>• Le lien expire dans 24 heures</p>
                </div>
              </div>

              {/* Actions après envoi */}
              <div className="space-y-3">
                <Button 
                  onClick={handleResendEmail}
                  disabled={isLoading}
                  variant="outline"
                  className="w-full h-11 border-orange-300 text-orange-600 hover:bg-orange-50 hover:border-orange-400"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Renvoi en cours...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Renvoyer l'email
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Retour à la connexion */}
          <div className="text-center pt-4 border-t border-gray-200">
            <Button
              onClick={onBackToLogin}
              variant="ghost" 
              className="text-gray-600 hover:text-gray-800 hover:bg-gray-100 font-medium"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour à la connexion
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Aide supplémentaire */}
      <Card className="w-full max-w-md mx-auto bg-orange-50 border-orange-200">
        <CardContent className="p-4">
          <h3 className="font-semibold text-orange-900 mb-2 text-sm">💡 Aide</h3>
          <ul className="text-xs text-orange-800 space-y-1">
            <li>• Vous ne recevez pas l'email ? Vérifiez vos spams</li>
            <li>• L'email peut prendre quelques minutes à arriver</li>
            <li>• Problème persistant ? Contactez le support</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
