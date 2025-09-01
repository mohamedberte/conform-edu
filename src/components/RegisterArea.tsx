'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  User, 
  Mail, 
  Phone, 
  Lock, 
  MapPin, 
  Calendar,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  UserCheck,
  GraduationCap,
  Users,
  Shield
} from 'lucide-react';
import { authHelpers, supabase } from '@/lib/supabase';

interface RegisterAreaProps {
  onSwitchToLogin?: () => void;
  onSuccess?: () => void;
}

type UserRole = 'student' | 'expert' | 'parent';
type FormStep = 1 | 2 | 3;

interface FormData {
  // Étape 1 - Informations de base
  email: string;
  password: string;
  confirmPassword: string;
  role: UserRole;
  
  // Étape 2 - Informations personnelles
  firstName: string;
  lastName: string;
  phone: string;
  city: string;
  district: string;
  dateOfBirth: string;
  gender: 'M' | 'F' | 'other';
  
  // Étape 3 - Spécifique au rôle
  // Pour Expert
  bio?: string;
  specializations?: string[];
  hourlyRateMin?: number;
  hourlyRateMax?: number;
  educationLevel?: string;
  yearsExperience?: number;
  
  // Pour Parent
  childrenInfo?: string;
}

const cities = [
  'Abidjan', 'Bouaké', 'Daloa', 'San-Pédro', 'Korhogo', 
  'Yamoussoukro', 'Man', 'Divo', 'Gagnoa', 'Anyama'
];

const specializations = [
  'Mathématiques', 'Français', 'Anglais', 'Sciences Physiques',
  'Sciences de la Vie et de la Terre', 'Histoire-Géographie',
  'Philosophie', 'Informatique', 'Arts', 'Musique', 'Sport',
  'Cuisine', 'Artisanat', 'Entrepreneuriat'
];

export default function RegisterArea({ onSwitchToLogin, onSuccess }: RegisterAreaProps) {
  const [currentStep, setCurrentStep] = useState<FormStep>(1);
  const [isComplete, setIsComplete] = useState(false);
  
  // Estados para datos de la base de datos
  const [dbCities, setDbCities] = useState<{id: string, name: string}[]>([]);
  const [dbSubjects, setDbSubjects] = useState<{id: string, name: string}[]>([]);
  const [citiesLoading, setCitiesLoading] = useState(true);
  const [subjectsLoading, setSubjectsLoading] = useState(true);

  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student',
    firstName: '',
    lastName: '',
    phone: '',
    city: '',
    district: '',
    dateOfBirth: '',
    gender: 'M',
    specializations: []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Cargar ciudades desde la base de datos
  const loadCities = async () => {
    try {
      setCitiesLoading(true);
      const { data, error } = await supabase
        .from('cities')
        .select('id, name')
        .order('name');

      if (error) {
        console.error('Error loading cities:', error);
        // Usar ciudades estáticas como fallback
        setDbCities(cities.map((city, index) => ({ id: (index + 1).toString(), name: city })));
      } else {
        setDbCities(data || []);
      }
    } catch (error) {
      console.error('Error loading cities:', error);
      // Usar ciudades estáticas como fallback
      setDbCities(cities.map((city, index) => ({ id: (index + 1).toString(), name: city })));
    } finally {
      setCitiesLoading(false);
    }
  };

  // Cargar materias desde la base de datos
  const loadSubjects = async () => {
    try {
      setSubjectsLoading(true);
      const { data, error } = await supabase
        .from('subjects')
        .select('id, name')
        .order('name');

      if (error) {
        console.error('Error loading subjects:', error);
        // Usar materias estáticas como fallback
        setDbSubjects(specializations.map((spec, index) => ({ id: (index + 1).toString(), name: spec })));
      } else {
        setDbSubjects(data || []);
      }
    } catch (error) {
      console.error('Error loading subjects:', error);
      // Usar materias estáticas como fallback
      setDbSubjects(specializations.map((spec, index) => ({ id: (index + 1).toString(), name: spec })));
    } finally {
      setSubjectsLoading(false);
    }
  };

  // Cargar datos al montar el componente
  useEffect(() => {
    loadCities();
    loadSubjects();
  }, []);

  const updateFormData = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateStep = (step: FormStep): boolean => {
    switch (step) {
      case 1:
        if (!formData.email || !formData.password || !formData.confirmPassword) {
          setError('Veuillez remplir tous les champs');
          return false;
        }
        if (formData.password !== formData.confirmPassword) {
          setError('Les mots de passe ne correspondent pas');
          return false;
        }
        if (formData.password.length < 6) {
          setError('Le mot de passe doit contenir au moins 6 caractères');
          return false;
        }
        break;
      case 2:
        if (!formData.firstName || !formData.lastName || !formData.phone || !formData.city) {
          setError('Veuillez remplir tous les champs obligatoires');
          return false;
        }
        break;
      case 3:
        // Pas de validation spéciale pour l'étape 3 maintenant
        // Les experts finaliseront leur profil après confirmation email
        break;
    }
    setError('');
    return true;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      // Pour les experts, passer directement de l'étape 2 à la soumission
      if (formData.role === 'expert' && currentStep === 2) {
        handleSubmit();
      } else {
        setCurrentStep((prev) => Math.min(prev + 1, 3) as FormStep);
      }
    }
  };

  const handlePrevious = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1) as FormStep);
  };

  const handleSubmit = async () => {
    if (!validateStep(3)) return;

    setLoading(true);
    setError('');

    try {
      console.log('🚀 Début inscription avec données:', {
        email: formData.email,
        role: formData.role,
        firstName: formData.firstName,
        lastName: formData.lastName
      });

      // Créer SEULEMENT le compte utilisateur de base (pas de profil expert)
      const { data: authData, error: authError } = await authHelpers.signUp(
        formData.email,
        formData.password,
        {
          firstName: formData.firstName,
          lastName: formData.lastName,
          role: formData.role,
          phone: formData.phone,
          city: formData.city
        }
      );

      if (authError) {
        console.error('❌ Erreur auth:', authError);
        throw new Error(authError.message);
      }

      console.log('✅ Compte créé:', authData);
      
      // NE PAS créer le profil expert maintenant
      // Il sera créé après confirmation email lors de la finalisation

      console.log('🎉 Inscription terminée avec succès');
      setIsComplete(true);
      
    } catch (err: any) {
      console.error('❌ Erreur inscription:', err);
      setError(err.message || 'Une erreur est survenue lors de l\'inscription');
    } finally {
      setLoading(false);
    }
  };

  const toggleSpecialization = (spec: string) => {
    const current = formData.specializations || [];
    if (current.includes(spec)) {
      updateFormData('specializations', current.filter(s => s !== spec));
    } else {
      updateFormData('specializations', [...current, spec]);
    }
  };

  const getRoleConfig = (role: UserRole) => {
    switch (role) {
      case 'student':
        return {
          title: 'Apprenant',
          description: 'Je souhaite apprendre et me former',
          icon: <GraduationCap className="h-6 w-6" />,
          color: 'from-orange-500 to-orange-600'
        };
      case 'expert':
        return {
          title: 'Expert/Tuteur',
          description: 'Je souhaite enseigner et partager mes connaissances',
          icon: <UserCheck className="h-6 w-6" />,
          color: 'from-green-500 to-green-600'
        };
      case 'parent':
        return {
          title: 'Parent',
          description: 'Je gère l\'apprentissage de mes enfants',
          icon: <Users className="h-6 w-6" />,
          color: 'from-blue-500 to-blue-600'
        };
    }
  };

  // Si l'inscription est terminée, afficher la page de confirmation
  if (isComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-green-50 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <Card className="bg-white shadow-xl border-0 text-center">
            <CardContent className="pt-12 pb-8">
              {/* Icône de succès */}
              <div className="bg-gradient-to-r from-green-500 to-green-600 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="h-10 w-10 text-white" />
              </div>

              {/* Message de succès */}
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                Inscription réussie ! 🎉
              </h2>
              
              <p className="text-gray-600 mb-6">
                Votre compte <strong>{getRoleConfig(formData.role).title}</strong> a été créé avec succès.
              </p>

              {/* Instructions */}
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6 text-left">
                <h3 className="font-semibold text-orange-800 mb-2 flex items-center">
                  <Mail className="h-4 w-4 mr-2" />
                  Prochaines étapes :
                </h3>
                <ul className="text-sm text-orange-700 space-y-1">
                  <li>• Vérifiez votre boîte email (<strong>{formData.email}</strong>)</li>
                  <li>• Cliquez sur le lien de confirmation reçu</li>
                  <li>• Connectez-vous à votre compte pour accéder à votre tableau de bord</li>
                  {formData.role === 'expert' && (
                    <li>• <strong>Finalisez votre inscription expert</strong> lors de votre première connexion</li>
                  )}
                </ul>
              </div>

              {/* Bouton de redirection */}
              <Button
                onClick={onSwitchToLogin}
                className="w-full bg-gradient-to-r from-orange-500 to-green-500 text-white"
              >
                Se connecter maintenant
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>

              {/* Note */}
              <p className="text-xs text-gray-500 mt-4">
                Vous n'avez pas reçu l'email ? Vérifiez vos spams ou contactez-nous.
              </p>
            </CardContent>
          </Card>

          {/* Badge plateforme */}
          <div className="flex justify-center mt-6">
            <Badge className="bg-gradient-to-r from-orange-100 to-green-100 text-orange-800 border-orange-200">
              🇨🇮 Bienvenue sur Conform-Edu
            </Badge>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-green-50 flex items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        {/* Header avec progression */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-6">
            <div className="bg-gradient-to-r from-orange-500 to-green-500 p-3 rounded-xl">
              <User className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Rejoignez Conform-Edu 🇨🇮
          </h1>
          <p className="text-gray-600">
            Créez votre compte et commencez votre parcours d'apprentissage
          </p>

          {/* Indicateur d'étape */}
          <div className="flex items-center justify-center mt-6 space-x-4">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`
                  w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold
                  ${currentStep >= step 
                    ? 'bg-gradient-to-r from-orange-500 to-green-500 text-white' 
                    : 'bg-gray-200 text-gray-600'
                  }
                `}>
                  {currentStep > step ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : (
                    step
                  )}
                </div>
                {step < 3 && (
                  <div className={`w-12 h-1 mx-2 ${
                    currentStep > step ? 'bg-gradient-to-r from-orange-500 to-green-500' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        <Card className="bg-white shadow-xl border-0">
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-xl text-gray-900">
              {currentStep === 1 && 'Informations de connexion'}
              {currentStep === 2 && 'Informations personnelles'}
              {currentStep === 3 && `Finalisation du profil ${getRoleConfig(formData.role).title}`}
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            {/* Étape 1: Informations de base */}
            {currentStep === 1 && (
              <div className="space-y-6">
                {/* Sélection du rôle */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium text-gray-700">
                    Je suis un(e) *
                  </Label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {(['student', 'expert', 'parent'] as UserRole[]).map((role) => {
                      const config = getRoleConfig(role);
                      return (
                        <button
                          key={role}
                          type="button"
                          onClick={() => updateFormData('role', role)}
                          className={`
                            p-4 rounded-xl border-2 transition-all text-left
                            ${formData.role === role
                              ? 'border-orange-500 bg-orange-50'
                              : 'border-gray-200 hover:border-orange-300'
                            }
                          `}
                        >
                          <div className={`inline-flex p-2 rounded-lg bg-gradient-to-r ${config.color} text-white mb-3`}>
                            {config.icon}
                          </div>
                          <h3 className="font-semibold text-gray-900">{config.title}</h3>
                          <p className="text-sm text-gray-600 mt-1">{config.description}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                    Adresse email *
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => updateFormData('email', e.target.value)}
                      className="pl-10 h-12 border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                      placeholder="votre@email.com"
                    />
                  </div>
                </div>

                {/* Mot de passe */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                      Mot de passe *
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <Input
                        id="password"
                        type="password"
                        value={formData.password}
                        onChange={(e) => updateFormData('password', e.target.value)}
                        className="pl-10 h-12 border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                        placeholder="••••••••"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                      Confirmer le mot de passe *
                    </Label>
                    <div className="relative">
                      <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <Input
                        id="confirmPassword"
                        type="password"
                        value={formData.confirmPassword}
                        onChange={(e) => updateFormData('confirmPassword', e.target.value)}
                        className="pl-10 h-12 border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                        placeholder="••••••••"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Étape 2: Informations personnelles */}
            {currentStep === 2 && (
              <div className="space-y-6">
                {/* Nom et Prénom */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName" className="text-sm font-medium text-gray-700">
                      Prénom *
                    </Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => updateFormData('firstName', e.target.value)}
                      className="h-12 border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                      placeholder="Votre prénom"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="lastName" className="text-sm font-medium text-gray-700">
                      Nom *
                    </Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => updateFormData('lastName', e.target.value)}
                      className="h-12 border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                      placeholder="Votre nom"
                    />
                  </div>
                </div>

                {/* Téléphone */}
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
                    Numéro de téléphone *
                  </Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => updateFormData('phone', e.target.value)}
                      className="pl-10 h-12 border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                      placeholder="+225 XX XX XX XX XX"
                    />
                  </div>
                </div>

                {/* Localisation */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city" className="text-sm font-medium text-gray-700">
                      Ville *
                    </Label>
                    <select
                      id="city"
                      value={formData.city}
                      onChange={(e) => updateFormData('city', e.target.value)}
                      className="w-full h-12 px-3 border border-gray-300 rounded-md focus:border-orange-500 focus:ring-orange-500"
                      disabled={citiesLoading}
                    >
                      <option value="">{citiesLoading ? 'Chargement...' : 'Sélectionner une ville'}</option>
                      {dbCities.map(city => (
                        <option key={city.id} value={city.name}>{city.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="district" className="text-sm font-medium text-gray-700">
                      Quartier/Commune
                    </Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <Input
                        id="district"
                        value={formData.district}
                        onChange={(e) => updateFormData('district', e.target.value)}
                        className="pl-10 h-12 border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                        placeholder="Votre quartier"
                      />
                    </div>
                  </div>
                </div>

                {/* Date de naissance et Genre */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="dateOfBirth" className="text-sm font-medium text-gray-700">
                      Date de naissance
                    </Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <Input
                        id="dateOfBirth"
                        type="date"
                        value={formData.dateOfBirth}
                        onChange={(e) => updateFormData('dateOfBirth', e.target.value)}
                        className="pl-10 h-12 border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="gender" className="text-sm font-medium text-gray-700">
                      Genre
                    </Label>
                    <select
                      id="gender"
                      value={formData.gender}
                      onChange={(e) => updateFormData('gender', e.target.value)}
                      className="w-full h-12 px-3 border border-gray-300 rounded-md focus:border-orange-500 focus:ring-orange-500"
                    >
                      <option value="M">Masculin</option>
                      <option value="F">Féminin</option>
                      <option value="other">Autre</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Étape 3: Spécifique au rôle */}
            {currentStep === 3 && (
              <div className="space-y-6">
                {formData.role === 'expert' && (
                  <>
                    {/* Bio */}
                    <div className="space-y-2">
                      <Label htmlFor="bio" className="text-sm font-medium text-gray-700">
                        Présentation *
                      </Label>
                      <textarea
                        id="bio"
                        value={formData.bio || ''}
                        onChange={(e) => updateFormData('bio', e.target.value)}
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:border-orange-500 focus:ring-orange-500"
                        placeholder="Présentez-vous en quelques mots, parlez de votre expérience..."
                      />
                    </div>

                    {/* Spécialisations */}
                    <div className="space-y-3">
                      <Label className="text-sm font-medium text-gray-700">
                        Spécialisations * (minimum 1)
                      </Label>
                      {subjectsLoading ? (
                        <div className="text-gray-500 text-sm">Chargement des spécialisations...</div>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {dbSubjects.map((subject) => (
                            <button
                              key={subject.id}
                              type="button"
                              onClick={() => toggleSpecialization(subject.name)}
                              className={`px-3 py-1 rounded-full text-sm transition-colors ${
                                formData.specializations?.includes(subject.name)
                                  ? 'bg-gradient-to-r from-orange-500 to-green-500 text-white'
                                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                              }`}
                            >
                              {subject.name}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Tarifs */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="hourlyRateMin" className="text-sm font-medium text-gray-700">
                          Tarif minimum/heure (CFA) *
                        </Label>
                        <Input
                          id="hourlyRateMin"
                          type="number"
                          value={formData.hourlyRateMin || ''}
                          onChange={(e) => updateFormData('hourlyRateMin', parseInt(e.target.value))}
                          className="h-12 border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                          placeholder="2000"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="hourlyRateMax" className="text-sm font-medium text-gray-700">
                          Tarif maximum/heure (CFA)
                        </Label>
                        <Input
                          id="hourlyRateMax"
                          type="number"
                          value={formData.hourlyRateMax || ''}
                          onChange={(e) => updateFormData('hourlyRateMax', parseInt(e.target.value))}
                          className="h-12 border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                          placeholder="5000"
                        />
                      </div>
                    </div>

                    {/* Expérience */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="educationLevel" className="text-sm font-medium text-gray-700">
                          Niveau d'études
                        </Label>
                        <select
                          id="educationLevel"
                          value={formData.educationLevel || ''}
                          onChange={(e) => updateFormData('educationLevel', e.target.value)}
                          className="w-full h-12 px-3 border border-gray-300 rounded-md focus:border-orange-500 focus:ring-orange-500"
                        >
                          <option value="">Sélectionner</option>
                          <option value="BAC">BAC</option>
                          <option value="BAC+2">BAC+2</option>
                          <option value="BAC+3">BAC+3</option>
                          <option value="BAC+5">BAC+5</option>
                          <option value="BAC+8">BAC+8 et plus</option>
                        </select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="yearsExperience" className="text-sm font-medium text-gray-700">
                          Années d'expérience
                        </Label>
                        <Input
                          id="yearsExperience"
                          type="number"
                          value={formData.yearsExperience || ''}
                          onChange={(e) => updateFormData('yearsExperience', parseInt(e.target.value))}
                          className="h-12 border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                          placeholder="5"
                        />
                      </div>
                    </div>
                  </>
                )}

                {formData.role === 'student' && (
                  <div className="text-center py-8">
                    <div className="bg-gradient-to-r from-orange-500 to-green-500 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <GraduationCap className="h-10 w-10 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      Parfait ! Votre compte apprenant est prêt
                    </h3>
                    <p className="text-gray-600">
                      Vous pourrez compléter votre profil et définir vos objectifs d'apprentissage après inscription.
                    </p>
                  </div>
                )}

                {formData.role === 'parent' && (
                  <div className="space-y-4">
                    <div className="text-center py-4">
                      <div className="bg-gradient-to-r from-blue-500 to-blue-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Users className="h-8 w-8 text-white" />
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 mb-2">
                        Espace Parent
                      </h3>
                      <p className="text-gray-600 text-sm">
                        Vous pourrez ajouter et gérer les profils de vos enfants après inscription.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Boutons de navigation */}
            <div className="flex justify-between pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={currentStep === 1 ? onSwitchToLogin : handlePrevious}
                className="border-gray-300 text-gray-700"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                {currentStep === 1 ? 'Se connecter' : 'Précédent'}
              </Button>

              {currentStep < 3 ? (
                <Button
                  type="button"
                  onClick={handleNext}
                  className="bg-gradient-to-r from-orange-500 to-green-500 text-white"
                >
                  Suivant
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading}
                  className="bg-gradient-to-r from-orange-500 to-green-500 text-white"
                >
                  {loading ? 'Création...' : 'Créer mon compte'}
                  <CheckCircle className="ml-2 h-4 w-4" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-6 text-sm text-gray-600">
          En vous inscrivant, vous acceptez nos{' '}
          <a href="#" className="text-orange-600 hover:underline">conditions d'utilisation</a>
          {' '}et notre{' '}
          <a href="#" className="text-orange-600 hover:underline">politique de confidentialité</a>.
        </div>
      </div>
    </div>
  );
}
