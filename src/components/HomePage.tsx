'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  BookOpen, 
  Users, 
  Target, 
  Shield, 
  Smartphone, 
  CreditCard,
  Eye,
  Globe,
  Trophy,
  Star,
  Play,
  ArrowRight,
  Check,
  Award,
  Heart,
  Zap,
  MessageCircle,
  ChevronRight,
  Search,
  UserCheck,
  TrendingUp,
  Menu,
  X
} from 'lucide-react';

interface HomePageProps {
  onGetStarted?: () => void;
  onLogin?: () => void;
  onLearnMore?: () => void;
}

export default function HomePage({ onGetStarted, onLogin, onLearnMore }: HomePageProps) {
  const [activeTab, setActiveTab] = useState('apprenant');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const features = [
    {
      icon: <Globe className="h-6 w-6" />,
      title: "100% Local",
      description: "Adapté aux réalités africaines avec mobile first et paiements mobile money"
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: "Crédibilité",
      description: "Profils d'experts validés avec CV, diplômes et avis vérifiés"
    },
    {
      icon: <CreditCard className="h-6 w-6" />,
      title: "Accessible",
      description: "Prix adaptés, paiement à la séance ou par abonnement"
    },
    {
      icon: <Eye className="h-6 w-6" />,
      title: "Suivi Parental",
      description: "Visibilité complète sur l'évolution des enfants"
    },
    {
      icon: <Smartphone className="h-6 w-6" />,
      title: "Multi-Support",
      description: "Web + app mobile optimisée pour connexions faibles"
    },
    {
      icon: <BookOpen className="h-6 w-6" />,
      title: "Multi-Domaines",
      description: "Scolaire, musique, sport, arts et métiers pratiques"
    }
  ];

  const learnerFeatures = [
    "Profil personnalisé avec objectifs adaptés",
    "Matching intelligent avec les meilleurs experts",
    "Bibliothèque de ressources gratuites",
    "Badges et points de progression",
    "Suivi en temps réel des performances"
  ];

  const stats = [
    { value: "10,000+", label: "Étudiants actifs", icon: <Users className="h-5 w-5" /> },
    { value: "500+", label: "Experts certifiés", icon: <UserCheck className="h-5 w-5" /> },
    { value: "95%", label: "Taux de réussite", icon: <TrendingUp className="h-5 w-5" /> },
    { value: "50+", label: "Domaines couverts", icon: <Award className="h-5 w-5" /> }
  ];

  const domains = [
    { name: "Mathématiques", color: "bg-orange-500" },
    { name: "Sciences", color: "bg-green-500" },
    { name: "Français", color: "bg-orange-400" },
    { name: "Anglais", color: "bg-green-400" },
    { name: "Programmation", color: "bg-orange-600" },
    { name: "Musique", color: "bg-green-600" },
    { name: "Cuisine", color: "bg-orange-300" },
    { name: "Entrepreneuriat", color: "bg-green-300" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-green-50">
      {/* Header/Navigation */}
      <header className="bg-white/95 backdrop-blur-sm border-b border-orange-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-orange-500 to-green-500 p-2 rounded-xl">
                <BookOpen className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-orange-600 to-green-600 bg-clip-text text-transparent">
                  Conform-Edu
                </h1>
                <p className="text-xs sm:text-sm text-gray-600 hidden sm:block">Votre plateforme éducative</p>
              </div>
            </div>
            
            {/* Navigation Desktop */}
            <div className="hidden md:flex items-center space-x-6">
              <nav className="flex space-x-6">
                <a href="#features" className="text-gray-700 hover:text-orange-600 transition-colors">Fonctionnalités</a>
                <a href="#avantages" className="text-gray-700 hover:text-orange-600 transition-colors">Avantages</a>
                <a href="#domaines" className="text-gray-700 hover:text-orange-600 transition-colors">Domaines</a>
              </nav>
              <Button 
                onClick={onLogin}
                className="bg-gradient-to-r from-orange-500 to-green-500 hover:from-orange-600 hover:to-green-600 text-white"
              >
                Se connecter
              </Button>
            </div>

            {/* Menu Mobile */}
            <div className="md:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg text-gray-700 hover:bg-gray-100"
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>

          {/* Menu Mobile Dropdown */}
          {mobileMenuOpen && (
            <div className="md:hidden mt-4 pb-4 border-t border-gray-200">
              <nav className="flex flex-col space-y-4 mt-4">
                <a href="#features" className="text-gray-700 hover:text-orange-600 transition-colors py-2">Fonctionnalités</a>
                <a href="#avantages" className="text-gray-700 hover:text-orange-600 transition-colors py-2">Avantages</a>
                <a href="#domaines" className="text-gray-700 hover:text-orange-600 transition-colors py-2">Domaines</a>
                <Button 
                  onClick={() => {
                    onLogin?.();
                    setMobileMenuOpen(false);
                  }}
                  className="bg-gradient-to-r from-orange-500 to-green-500 hover:from-orange-600 hover:to-green-600 text-white mt-4"
                >
                  Se connecter
                </Button>
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-12 sm:py-20 px-4 sm:px-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 to-green-500/5"></div>
        <div className="container mx-auto relative">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="space-y-6 sm:space-y-8 text-center lg:text-left">
              <div className="space-y-4">
                <Badge className="bg-gradient-to-r from-orange-100 to-green-100 text-orange-800 border-orange-200 inline-flex">
                  🇨🇮 Plateforme d'apprentissage
                </Badge>
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                  <span className="text-gray-900">Éduquer.</span>
                  <br />
                  <span className="bg-gradient-to-r from-orange-500 to-green-500 bg-clip-text text-transparent">
                    Connecter.
                  </span>
                  <br />
                  <span className="text-gray-900">Impacter.</span>
                </h1>
                <p className="text-lg sm:text-xl text-gray-600 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                  La première plateforme éducative adaptée aux réalités africaines. 
                  Connectez-vous avec des experts locaux certifiés pour booster votre apprentissage.
                </p>
              </div>

              {/* Barre de recherche */}
              <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6 border border-orange-200">
                <div className="flex flex-col gap-3 sm:gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Rechercher une formation, un domaine..."
                        className="w-full pl-12 pr-4 py-3 sm:py-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm sm:text-base"
                      />
                    </div>
                  </div>
                  <Button 
                    className="bg-gradient-to-r from-orange-500 to-green-500 hover:from-orange-600 hover:to-green-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl shadow-lg w-full sm:w-auto"
                  >
                    <Search className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                    Rechercher
                  </Button>
                </div>
                
                {/* Tags de recherche populaire */}
                <div className="flex flex-wrap gap-2 mt-4 justify-center lg:justify-start">
                  <span className="text-sm text-gray-600 mr-2 hidden sm:inline">Populaire:</span>
                  {['Maths', 'Français', 'Anglais', 'Info'].map((tag) => (
                    <button
                      key={tag}
                      className="px-2 sm:px-3 py-1 bg-gradient-to-r from-orange-100 to-green-100 text-orange-700 rounded-full text-xs sm:text-sm hover:from-orange-200 hover:to-green-200 transition-colors"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  size="lg"
                  onClick={onGetStarted}
                  className="bg-gradient-to-r from-orange-500 to-green-500 hover:from-orange-600 hover:to-green-600 text-white text-base sm:text-lg px-6 sm:px-8 py-4 sm:py-6 rounded-xl shadow-lg hover:shadow-xl transition-all w-full sm:w-auto"
                >
                  Commencer dès maintenant
                  <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                </Button>
                <Button 
                  size="lg"
                  variant="outline"
                  onClick={onLearnMore}
                  className="border-orange-300 text-orange-700 hover:bg-orange-50 text-base sm:text-lg px-6 sm:px-8 py-4 sm:py-6 rounded-xl w-full sm:w-auto"
                >
                  <Play className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                  Voir la démo
                </Button>
              </div>

              {/* Stats mini */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className="flex items-center justify-center mb-2 text-orange-600">
                      {stat.icon}
                    </div>
                    <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                    <div className="text-sm text-gray-600">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="bg-gradient-to-br from-orange-400 to-green-400 rounded-3xl p-8 shadow-2xl">
                <div className="bg-white rounded-2xl p-6 space-y-4">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-green-500 rounded-full flex items-center justify-center">
                      <Search className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <div className="font-semibold">Trouver un expert</div>
                      <div className="text-sm text-gray-600">Mathématiques • Niveau Terminale</div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl">
                        <div className="w-8 h-8 bg-gradient-to-r from-orange-400 to-green-400 rounded-full"></div>
                        <div className="flex-1">
                          <div className="font-medium text-sm">Expert Math {i}</div>
                          <div className="flex items-center space-x-2">
                            <div className="flex">
                              {[1,2,3,4,5].map((star) => (
                                <Star key={star} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                              ))}
                            </div>
                            <span className="text-xs text-gray-600">5.0 • 120 avis</span>
                          </div>
                        </div>
                        <div className="text-sm font-medium text-orange-600">2500 CFA/h</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Objectifs Section */}
      <section className="py-20 px-6 bg-gradient-to-r from-orange-50 to-green-50">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Notre mission en 3 mots
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Transformez l'éducation en Côte d'Ivoire grâce à une approche innovante et locale
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0 shadow-xl hover:shadow-2xl transition-all">
              <CardContent className="p-8 text-center">
                <div className="bg-white/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                  <BookOpen className="h-8 w-8" />
                </div>
                <h3 className="text-2xl font-bold mb-4">Éduquer</h3>
                <p className="text-orange-100 leading-relaxed">
                  Offrir un soutien et une montée en compétence accessibles à tous, 
                  adaptés aux réalités locales ivoiriennes.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white border-2 border-gray-200 shadow-xl hover:shadow-2xl transition-all">
              <CardContent className="p-8 text-center">
                <div className="bg-gradient-to-r from-orange-500 to-green-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-gray-900">Connecter</h3>
                <p className="text-gray-600 leading-relaxed">
                  Créer une passerelle fiable entre apprenants, experts locaux certifiés 
                  et parents impliqués dans l'éducation.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0 shadow-xl hover:shadow-2xl transition-all">
              <CardContent className="p-8 text-center">
                <div className="bg-white/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Target className="h-8 w-8" />
                </div>
                <h3 className="text-2xl font-bold mb-4">Impacter</h3>
                <p className="text-green-100 leading-relaxed">
                  Réduire l'échec scolaire, booster l'insertion professionnelle 
                  et valoriser les compétences locales.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Avantages Section */}
      <section id="avantages" className="py-16 sm:py-20 px-4 sm:px-6">
        <div className="container mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Pourquoi Choisir Conform-Edu ?
            </h2>
            <p className="text-lg sm:text-xl text-gray-600">
              Une plateforme pensée pour les réalités africaines
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="bg-white shadow-lg hover:shadow-xl transition-all border-0 hover:scale-105">
                <CardContent className="p-4 sm:p-6">
                  <div className="bg-gradient-to-r from-orange-500 to-green-500 w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center text-white mb-4">
                    {feature.icon}
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                  <p className="text-sm sm:text-base text-gray-600 leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Fonctionnalités pour Apprenants */}
      <section id="features" className="py-16 sm:py-20 px-4 sm:px-6 bg-gradient-to-br from-white to-orange-50">
        <div className="container mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Fonctionnalités pour Apprenants
            </h2>
            <p className="text-lg sm:text-xl text-gray-600">
              Tout ce dont vous avez besoin pour réussir votre apprentissage
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="space-y-6">
              {learnerFeatures.map((feature, index) => (
                <div key={index} className="flex items-start space-x-4">
                  <div className="bg-gradient-to-r from-orange-500 to-green-500 w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <Check className="h-4 w-4 text-white" />
                  </div>
                  <p className="text-lg text-gray-700">{feature}</p>
                </div>
              ))}
              
              <Button 
                size="lg"
                onClick={onGetStarted}
                className="mt-8 bg-gradient-to-r from-orange-500 to-green-500 hover:from-orange-600 hover:to-green-600 text-white"
              >
                Créer mon profil apprenant
                <ChevronRight className="ml-2 h-5 w-5" />
              </Button>
            </div>

            <div className="relative">
              <Card className="bg-gradient-to-br from-orange-100 to-green-100 border-0 shadow-xl">
                <CardContent className="p-8">
                  <div className="text-center mb-6">
                    <div className="w-20 h-20 bg-gradient-to-r from-orange-500 to-green-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                      <Trophy className="h-10 w-10 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900">Votre Progression</h3>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">Mathématiques</span>
                      <span className="text-orange-600 font-semibold">85%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div className="bg-gradient-to-r from-orange-500 to-green-500 h-3 rounded-full" style={{width: '85%'}}></div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">Français</span>
                      <span className="text-green-600 font-semibold">92%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div className="bg-gradient-to-r from-orange-500 to-green-500 h-3 rounded-full" style={{width: '92%'}}></div>
                    </div>
                    
                    <div className="text-center pt-4">
                      <Badge className="bg-gradient-to-r from-orange-500 to-green-500 text-white">
                        🏆 Niveau Expert atteint !
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Domaines Section */}
      <section id="domaines" className="py-20 px-6 bg-gradient-to-r from-green-50 to-orange-50">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Domaines d'Apprentissage
            </h2>
            <p className="text-xl text-gray-600">
              Du scolaire aux métiers pratiques, explorez tous les domaines
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            {domains.map((domain, index) => (
              <Card key={index} className="bg-white shadow-md hover:shadow-lg transition-all border-0 hover:scale-105 cursor-pointer">
                <CardContent className="p-4 text-center">
                  <div className={`w-3 h-3 ${domain.color} rounded-full mx-auto mb-2`}></div>
                  <p className="font-medium text-gray-800">{domain.name}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center">
            <Button 
              size="lg" 
              variant="outline"
              className="border-orange-300 text-orange-700 hover:bg-orange-50"
            >
              Voir tous les domaines
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Section Témoignages */}
      <section className="py-20 px-6 bg-white">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Ce que disent nos utilisateurs
            </h2>
            <p className="text-xl text-gray-600">
              Découvrez les témoignages de notre communauté ivoirienne
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/*
              {
                name: "Aïcha Kouassi",
                role: "Étudiante en Terminale C",
                city: "Abidjan",
                avatar: "👩🏾‍🎓",
                rating: 5,
                comment: "Grâce à Conform-Edu, j'ai trouvé un excellent prof de maths qui m'a aidée à passer de 8/20 à 16/20 en 3 mois ! Le système de paiement mobile money est parfait.",
                subject: "Mathématiques"
              },
              {
                name: "Mamadou Traoré",
                role: "Parent de 2 enfants",
                city: "Bouaké",
                avatar: "👨🏾‍💼",
                rating: 5,
                comment: "En tant que parent, j'apprécie le suivi en temps réel des progrès de mes enfants. Les tarifs sont accessibles et les professeurs très compétents.",
                subject: "Suivi parental"
              },
              {
                name: "Marie-Claire Bamba",
                role: "Professeure de français",
                city: "San-Pédro",
                avatar: "👩🏾‍🏫",
                rating: 5,
                comment: "Excellent moyen de partager mes connaissances et d'arrondir mes fins de mois. L'interface est simple même avec une connexion lente !",
                subject: "Enseignement"
              }
            */}
            {Array(3).fill(0).map((_, index) => (
              <Card key={index} className="bg-gradient-to-br from-orange-50 to-green-50 border-0 shadow-lg transition-all">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="text-3xl mr-3">👤</div>
                    <div>
                      <h4 className="font-bold text-gray-900">Nom Prénom</h4>
                      <p className="text-sm text-gray-600">Rôle de l'utilisateur</p>
                      <p className="text-xs text-orange-600">📍 Ville</p>
                    </div>
                  </div>
                  
                  <div className="flex mb-3">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  
                  <p className="text-gray-700 italic mb-3">"Témoignage de l'utilisateur sur la plateforme."</p>
                  
                  <Badge className="bg-gradient-to-r from-orange-100 to-green-100 text-orange-800 border-orange-200">
                    Matière ou service utilisé
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Section Comment ça marche */}
      <section className="py-20 px-6 bg-gradient-to-br from-green-50 to-orange-50">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Comment ça marche ?
            </h2>
            <p className="text-xl text-gray-600">
              Commencez votre apprentissage en 3 étapes simples
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/*
              {
                step: "01",
                icon: <UserCheck className="h-8 w-8" />,
                title: "Créez votre profil",
                description: "Inscrivez-vous gratuitement et définissez vos objectifs d'apprentissage. Choisissez vos matières et votre niveau.",
                color: "from-orange-500 to-orange-600"
              },
              {
                step: "02",
                icon: <Search className="h-8 w-8" />,
                title: "Trouvez votre expert",
                description: "Parcourez notre catalogue d'experts certifiés. Consultez les profils, avis et tarifs pour faire le bon choix.",
                color: "from-green-500 to-green-600"
              },
              {
                step: "03",
                icon: <Zap className="h-8 w-8" />,
                title: "Commencez à apprendre",
                description: "Réservez vos cours, payez en toute sécurité et suivez votre progression en temps réel. C'est parti !",
                color: "from-orange-500 to-green-500"
              }
            */}
            {Array(3).fill(0).map((_, index) => (
              <div key={index} className="relative">
                <Card className="bg-white shadow-lg transition-all border-0 h-full">
                  <CardContent className="p-8 text-center">
                    <div className="relative mb-6">
                      <div className={`bg-gradient-to-r from-orange-500 to-green-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto text-white`}>
                        <UserCheck className="h-8 w-8" />
                      </div>
                      <div className="absolute -top-2 -right-2 bg-gray-900 text-white text-sm font-bold w-8 h-8 rounded-full flex items-center justify-center">
                        0{index + 1}
                      </div>
                    </div>
                    
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Titre de l'étape</h3>
                    <p className="text-gray-600 leading-relaxed">Description de l'étape en cours.</p>
                  </CardContent>
                </Card>
                
                {index < 2 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                    <ArrowRight className="h-6 w-6 text-orange-400" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* CTA Final */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 bg-gradient-to-r from-orange-500 to-green-500 text-white">
        <div className="container mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6">
            Prêt à Transformer Votre Apprentissage ?
          </h2>
          <p className="text-lg sm:text-xl mb-6 sm:mb-8 text-orange-100 max-w-2xl mx-auto">
            Rejoignez des milliers d'apprenants qui font confiance à Conform-Edu 
            pour leur réussite éducative et professionnelle.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg"
              onClick={onGetStarted}
              className="bg-white text-orange-600 hover:bg-orange-50 text-base sm:text-lg px-6 sm:px-8 py-4 sm:py-6 rounded-xl shadow-lg w-full sm:w-auto"
            >
              Commencer dès maintenant
              <Zap className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
            <Button 
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white/10 text-lg px-8 py-6 rounded-xl"
            >
              <MessageCircle className="mr-2 h-5 w-5" />
              Contacter l'équipe
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-6">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="bg-gradient-to-r from-orange-500 to-green-500 p-2 rounded-xl">
                  <BookOpen className="h-6 w-6 text-white" />
                </div>
                <span className="text-xl font-bold">Conform-Edu</span>
              </div>
              <p className="text-gray-400">
                La première plateforme éducative 100% ivoirienne. 
                Éduquer, Connecter, Impacter.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Plateforme</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-orange-400 transition-colors">Comment ça marche</a></li>
                <li><a href="#" className="hover:text-orange-400 transition-colors">Tarifs</a></li>
                <li><a href="#" className="hover:text-orange-400 transition-colors">Devenir expert</a></li>
                <li><a href="#" className="hover:text-orange-400 transition-colors">Mobile App</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-orange-400 transition-colors">Centre d'aide</a></li>
                <li><a href="#" className="hover:text-orange-400 transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-orange-400 transition-colors">FAQ</a></li>
                <li><a href="#" className="hover:text-orange-400 transition-colors">Blog</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Légal</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-orange-400 transition-colors">Confidentialité</a></li>
                <li><a href="#" className="hover:text-orange-400 transition-colors">Conditions</a></li>
                <li><a href="#" className="hover:text-orange-400 transition-colors">Cookies</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>© 2025 Conform-Edu. Tous droits réservés. Fait avec ❤️ en Côte d'Ivoire 🇨🇮</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
