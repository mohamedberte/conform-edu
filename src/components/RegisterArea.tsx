import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BookOpen, Mail, Lock, Eye, EyeOff, Loader2, AlertCircle, CheckCircle, User, Phone, GraduationCap, Calendar } from "lucide-react";
import { useState, useEffect } from "react";
import { authHelpers } from "@/lib/supabase";

// 🔧 PERSONNALISATION: Types pour le formulaire d'inscription
interface RegisterFormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;
  role: 'student' | 'teacher' | 'parent';
  // Champs spécifiques aux étudiants
  studentNumber?: string;
  dateOfBirth?: string;
  academicYear?: string;
}

// 🔧 PERSONNALISATION: Props du composant
interface RegisterAreaProps extends React.ComponentProps<"div"> {
  onSwitchToLogin?: () => void; // Callback pour revenir à la connexion
  onRegisterSuccess?: () => void; // Callback après inscription réussie
}

export default function RegisterArea({
  className,
  onSwitchToLogin,
  onRegisterSuccess,
  ...props
}: RegisterAreaProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // États du formulaire
  const [formData, setFormData] = useState<RegisterFormData>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    role: "student", // Par défaut étudiant
    studentNumber: "",
    dateOfBirth: "",
    academicYear: "2024-2025"
  });

  // États de validation et feedback
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [step, setStep] = useState(1); // Étape du formulaire multi-étapes

  // 🔧 PERSONNALISATION: Fonctions de validation
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) return "L'adresse email est requise";
    if (!emailRegex.test(email)) return "Veuillez entrer une adresse email valide";
    return "";
  };

  const validatePassword = (password: string) => {
    if (!password) return "Le mot de passe est requis";
    if (password.length < 8) return "Le mot de passe doit contenir au moins 8 caractères";
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      return "Le mot de passe doit contenir au moins une majuscule, une minuscule et un chiffre";
    }
    return "";
  };

  const validateConfirmPassword = (password: string, confirmPassword: string) => {
    if (!confirmPassword) return "Veuillez confirmer votre mot de passe";
    if (password !== confirmPassword) return "Les mots de passe ne correspondent pas";
    return "";
  };

  const validateRequired = (value: string, fieldName: string) => {
    if (!value.trim()) return `${fieldName} est requis`;
    return "";
  };

  const validateStudentNumber = (studentNumber: string) => {
    if (formData.role === 'student' && !studentNumber) {
      return "Le numéro étudiant est requis pour les élèves";
    }
    if (studentNumber && !/^\d{6,10}$/.test(studentNumber)) {
      return "Le numéro étudiant doit contenir entre 6 et 10 chiffres";
    }
    return "";
  };

  // Gestion des changements de champs
  const handleInputChange = (field: keyof RegisterFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Validation en temps réel
    let error = "";
    switch (field) {
      case "email":
        error = validateEmail(value);
        break;
      case "password":
        error = validatePassword(value);
        // Revalider la confirmation si elle existe
        if (formData.confirmPassword) {
          setErrors(prev => ({
            ...prev,
            confirmPassword: validateConfirmPassword(value, formData.confirmPassword)
          }));
        }
        break;
      case "confirmPassword":
        error = validateConfirmPassword(formData.password, value);
        break;
      case "firstName":
        error = validateRequired(value, "Le prénom");
        break;
      case "lastName":
        error = validateRequired(value, "Le nom");
        break;
      case "studentNumber":
        error = validateStudentNumber(value);
        break;
    }
    
    setErrors(prev => ({ ...prev, [field]: error, general: "" }));
  };

  // Validation d'une étape
  const validateStep = (stepNumber: number) => {
    const newErrors: Record<string, string> = {};
    
    if (stepNumber === 1) {
      // Étape 1 : Informations personnelles
      newErrors.firstName = validateRequired(formData.firstName, "Le prénom");
      newErrors.lastName = validateRequired(formData.lastName, "Le nom");
      newErrors.email = validateEmail(formData.email);
      newErrors.role = !formData.role ? "Veuillez sélectionner un rôle" : "";
    } else if (stepNumber === 2) {
      // Étape 2 : Sécurité et informations spécifiques
      newErrors.password = validatePassword(formData.password);
      newErrors.confirmPassword = validateConfirmPassword(formData.password, formData.confirmPassword);
      
      if (formData.role === 'student') {
        newErrors.studentNumber = validateStudentNumber(formData.studentNumber!);
      }
    }
    
    setErrors(newErrors);
    return Object.values(newErrors).every(error => error === "");
  };

  // Navigation entre les étapes
  const nextStep = () => {
    if (validateStep(step)) {
      setStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    setStep(prev => Math.max(1, prev - 1));
  };

  // Soumission du formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation finale
    if (!validateStep(1) || !validateStep(2)) {
      setErrors(prev => ({ ...prev, general: "Veuillez corriger les erreurs dans le formulaire" }));
      return;
    }

    setIsLoading(true);
    setErrors({ general: "" });

    try {
      // 🔧 PERSONNALISATION: Inscription via Supabase
      const { data, error } = await authHelpers.signUp(
        formData.email,
        formData.password,
        {
          firstName: formData.firstName,
          lastName: formData.lastName,
          role: formData.role,
          phone: formData.phone || undefined
        }
      );

      if (error) {
        throw error;
      }

      // Si c'est un étudiant, créer le profil étudiant
      if (formData.role === 'student' && data.user && formData.studentNumber) {
        await authHelpers.createStudentProfile(data.user.id, {
          studentNumber: formData.studentNumber,
          dateOfBirth: formData.dateOfBirth || undefined,
          academicYear: formData.academicYear || "2024-2025"
        });
      }

      setIsSuccess(true);
      console.log("Inscription réussie !", data);
      
      // 🔧 PERSONNALISATION: Appeler le callback de succès si fourni
      if (onRegisterSuccess) {
        onRegisterSuccess();
      }
      
    } catch (error: any) {
      let errorMessage = "Une erreur est survenue lors de l'inscription";
      
      // 🔧 PERSONNALISATION: Gestion des erreurs Supabase
      if (error.message?.includes('already registered')) {
        errorMessage = "Cette adresse email est déjà utilisée";
      } else if (error.message?.includes('Invalid email')) {
        errorMessage = "Adresse email invalide";
      } else if (error.message?.includes('Password')) {
        errorMessage = "Mot de passe trop faible";
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setErrors(prev => ({ ...prev, general: errorMessage }));
    } finally {
      setIsLoading(false);
    }
  };

  // Reset du succès après 5 secondes
  useEffect(() => {
    if (isSuccess) {
      const timer = setTimeout(() => {
        setIsSuccess(false);
        onSwitchToLogin?.(); // Retour à la connexion
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [isSuccess, onSwitchToLogin]);

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
          <p className="text-gray-600">Rejoignez notre plateforme d'apprentissage</p>
        </div>

        {/* Carte d'inscription */}
        <Card className="shadow-xl border-0 bg-white/95 backdrop-blur-sm">
          <CardHeader className="text-center pb-2">
            <h2 className="text-2xl font-semibold text-gray-800">
              Inscription - Étape {step}/2
            </h2>
            <p className="text-sm text-gray-600">
              {step === 1 ? "Informations personnelles" : "Sécurité et finalisation"}
            </p>
            
            {/* Indicateur de progression */}
            <div className="flex justify-center mt-4">
              <div className="flex space-x-2">
                {[1, 2].map((stepNumber) => (
                  <div
                    key={stepNumber}
                    className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
                      stepNumber <= step
                        ? "bg-blue-600 text-white"
                        : "bg-gray-200 text-gray-600"
                    )}
                  >
                    {stepNumber}
                  </div>
                ))}
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Messages de feedback */}
            {isSuccess && (
              <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg text-green-800">
                <CheckCircle className="h-4 w-4 flex-shrink-0" />
                <span className="text-sm font-medium">
                  Inscription réussie ! Vérifiez votre email pour confirmer votre compte.
                </span>
              </div>
            )}

            {errors.general && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-800">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span className="text-sm">{errors.general}</span>
              </div>
            )}

            <form className="space-y-4" onSubmit={handleSubmit}>
              {/* ÉTAPE 1 : Informations personnelles */}
              {step === 1 && (
                <>
                  {/* Prénom et Nom */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName" className="text-sm font-medium text-gray-700">
                        Prénom *
                      </Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          id="firstName"
                          type="text"
                          placeholder="Jean"
                          required
                          value={formData.firstName}
                          onChange={(e) => handleInputChange("firstName", e.target.value)}
                          className={cn(
                            "pl-10 h-12 rounded-lg transition-colors",
                            errors.firstName 
                              ? "border-red-300 focus:border-red-500 focus:ring-red-500" 
                              : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                          )}
                        />
                      </div>
                      {errors.firstName && (
                        <p className="text-sm text-red-600 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {errors.firstName}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="lastName" className="text-sm font-medium text-gray-700">
                        Nom *
                      </Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          id="lastName"
                          type="text"
                          placeholder="Dupont"
                          required
                          value={formData.lastName}
                          onChange={(e) => handleInputChange("lastName", e.target.value)}
                          className={cn(
                            "pl-10 h-12 rounded-lg transition-colors",
                            errors.lastName 
                              ? "border-red-300 focus:border-red-500 focus:ring-red-500" 
                              : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                          )}
                        />
                      </div>
                      {errors.lastName && (
                        <p className="text-sm text-red-600 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {errors.lastName}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                      Adresse email *
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="jean.dupont@exemple.com"
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

                  {/* Rôle */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">
                      Je suis *
                    </Label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { value: 'student', label: 'Élève', icon: GraduationCap },
                        { value: 'teacher', label: 'Professeur', icon: BookOpen },
                        { value: 'parent', label: 'Parent', icon: User }
                      ].map(({ value, label, icon: Icon }) => (
                        <button
                          key={value}
                          type="button"
                          onClick={() => handleInputChange("role", value as any)}
                          className={cn(
                            "p-3 rounded-lg border-2 transition-all duration-200 flex flex-col items-center gap-2",
                            formData.role === value
                              ? "border-blue-500 bg-blue-50 text-blue-700"
                              : "border-gray-200 hover:border-gray-300 text-gray-600"
                          )}
                        >
                          <Icon className="h-5 w-5" />
                          <span className="text-xs font-medium">{label}</span>
                        </button>
                      ))}
                    </div>
                    {errors.role && (
                      <p className="text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {errors.role}
                      </p>
                    )}
                  </div>

                  {/* Téléphone (optionnel) */}
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
                      Téléphone (optionnel)
                    </Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="06 12 34 56 78"
                        value={formData.phone}
                        onChange={(e) => handleInputChange("phone", e.target.value)}
                        className="pl-10 h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg"
                      />
                    </div>
                  </div>

                  {/* Bouton Suivant */}
                  <Button 
                    type="button"
                    onClick={nextStep}
                    className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    Suivant
                  </Button>
                </>
              )}

              {/* ÉTAPE 2 : Mots de passe et informations spécifiques */}
              {step === 2 && (
                <>
                  {/* Mot de passe */}
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                      Mot de passe *
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Choisissez un mot de passe sécurisé"
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

                  {/* Confirmation mot de passe */}
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                      Confirmer le mot de passe *
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Répétez votre mot de passe"
                        required
                        value={formData.confirmPassword}
                        onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                        className={cn(
                          "pl-10 pr-10 h-12 rounded-lg transition-colors",
                          errors.confirmPassword 
                            ? "border-red-300 focus:border-red-500 focus:ring-red-500" 
                            : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        )}
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
                      <p className="text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {errors.confirmPassword}
                      </p>
                    )}
                  </div>

                  {/* Champs spécifiques aux étudiants */}
                  {formData.role === 'student' && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="studentNumber" className="text-sm font-medium text-gray-700">
                          Numéro étudiant *
                        </Label>
                        <div className="relative">
                          <GraduationCap className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input
                            id="studentNumber"
                            type="text"
                            placeholder="202400001"
                            required
                            value={formData.studentNumber}
                            onChange={(e) => handleInputChange("studentNumber", e.target.value)}
                            className={cn(
                              "pl-10 h-12 rounded-lg transition-colors",
                              errors.studentNumber 
                                ? "border-red-300 focus:border-red-500 focus:ring-red-500" 
                                : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                            )}
                          />
                        </div>
                        {errors.studentNumber && (
                          <p className="text-sm text-red-600 flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            {errors.studentNumber}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="dateOfBirth" className="text-sm font-medium text-gray-700">
                          Date de naissance (optionnel)
                        </Label>
                        <div className="relative">
                          <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input
                            id="dateOfBirth"
                            type="date"
                            value={formData.dateOfBirth}
                            onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
                            className="pl-10 h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg"
                          />
                        </div>
                      </div>
                    </>
                  )}

                  {/* Boutons de navigation */}
                  <div className="flex gap-3">
                    <Button 
                      type="button"
                      variant="outline"
                      onClick={prevStep}
                      className="flex-1 h-12 border-gray-300 rounded-lg"
                    >
                      Précédent
                    </Button>
                    
                    <Button 
                      type="submit" 
                      disabled={isLoading || isSuccess}
                      className="flex-1 h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Inscription...
                        </>
                      ) : isSuccess ? (
                        <>
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Inscrit !
                        </>
                      ) : (
                        "S'inscrire"
                      )}
                    </Button>
                  </div>
                </>
              )}
            </form>

            {/* Lien vers la connexion */}
            <div className="text-center text-sm text-gray-600 pt-4 border-t border-gray-200">
              Déjà un compte ?{" "}
              <button 
                onClick={onSwitchToLogin}
                className="text-blue-600 hover:text-blue-800 font-medium hover:underline"
              >
                Se connecter
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
