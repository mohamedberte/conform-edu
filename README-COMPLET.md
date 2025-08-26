# 📚 Conform Edu - Plateforme Éducative Ivoirienne

Une plateforme moderne de tutoring/booster adaptée au système éducatif ivoirien, permettant aux élèves de trouver des professeurs particuliers et aux parents de suivre les progrès de leurs enfants.

## 🚀 Fonctionnalités

### ✅ Système d'authentification complet
- **Inscription multi-rôles** : Étudiant, Professeur, Parent
- **Connexion sécurisée** avec Supabase Auth
- **Navigation automatique** vers le dashboard approprié selon le rôle

### 👨‍🎓 Dashboard Étudiant
- **Recommandations de professeurs** personnalisées
- **Suivi des progrès** par matière avec graphiques
- **Planning des cours** et prochaines sessions
- **Marketplace de tuteurs** avec filtres par matière et région
- **Système de notes** et évaluations

### 👨‍🏫 Dashboard Professeur/Tuteur
- **Gestion des élèves** avec suivi individualisé
- **Planning flexible** et disponibilités
- **Système de revenus** avec comptabilisation en CFA
- **Demandes de cours** à accepter/refuser
- **Évaluations** et retours des élèves

### 👪 Dashboard Parent
- **Suivi multi-enfants** avec moyennes et progression
- **Communication directe** avec les tuteurs
- **Gestion des paiements** et factures
- **Planification des RDV** parent-professeur
- **Notifications** en temps réel

## 🛠️ Technologies utilisées

- **Frontend** : Next.js 14 avec TypeScript
- **Styling** : Tailwind CSS + shadcn/ui
- **Base de données** : PostgreSQL via Supabase
- **Authentification** : Supabase Auth
- **Icons** : Lucide React

## 📋 Prérequis

- Node.js 18+ 
- npm ou yarn
- Compte Supabase

## ⚡ Installation rapide

1. **Cloner le projet**
```bash
git clone <votre-repo>
cd conform-edu
```

2. **Installer les dépendances**
```bash
npm install
```

3. **Configurer Supabase**
```bash
# Créer un fichier .env.local
cp .env.example .env.local

# Ajouter vos clés Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. **Initialiser la base de données**
```bash
# Exécuter le script SQL dans Supabase SQL Editor
cat database-setup.sql
```

5. **Lancer l'application**
```bash
npm run dev
```

L'application sera disponible sur http://localhost:3000

## 🗃️ Architecture de la base de données

### Tables principales :
- **profiles** : Informations utilisateurs de base
- **student_profiles** : Données spécifiques aux élèves
- **teacher_profiles** : Profils des professeurs
- **classes** : Classes du système ivoirien (6ème à Terminale)
- **subjects** : Matières enseignées
- **courses** : Cours proposés par les professeurs
- **bookings** : Réservations de cours
- **lessons** : Sessions de cours effectuées
- **grades** : Notes et évaluations
- **payments** : Gestion des paiements

### Sécurité :
- **Row Level Security (RLS)** activé sur toutes les tables
- **Politiques d'accès** par rôle utilisateur
- **Triggers automatiques** pour la création de profils

## 🎯 Utilisation

### Pour les Développeurs

#### Ajouter de nouveaux dashboards :
1. Créer le composant dans `/src/components/`
2. Ajouter l'interface TypeScript
3. Intégrer dans `AuthManager.tsx`

#### Personnaliser les données :
- Modifier les fonctions `load*Data()` dans chaque dashboard
- Adapter les requêtes Supabase selon vos besoins
- Utiliser les commentaires `🔧 PERSONNALISATION` comme guides

#### Ajouter de nouvelles fonctionnalités :
```typescript
// Exemple : Ajouter une nouvelle requête
const loadCustomData = async (userId: string) => {
  const { data } = await supabase
    .from('your_table')
    .select('*')
    .eq('user_id', userId);
  
  return data || [];
};
```

### Pour les Utilisateurs

#### Inscription :
1. Choisir son rôle (Étudiant/Professeur/Parent)
2. Remplir ses informations personnelles
3. Compléter son profil spécifique au rôle

#### Navigation :
- **Étudiants** : Accès au dashboard avec recommandations et suivi
- **Professeurs** : Interface de gestion d'élèves et revenus
- **Parents** : Supervision des enfants et communication

## 🔧 Configuration avancée

### Variables d'environnement :
```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

# Optionnel : Configuration métier
NEXT_PUBLIC_APP_NAME="Conform Edu"
NEXT_PUBLIC_CURRENCY="CFA"
NEXT_PUBLIC_DEFAULT_LOCATION="Abidjan"
```

### Personnalisation du thème :
Modifier `tailwind.config.js` pour adapter les couleurs au branding :
```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: "votre-couleur-primaire",
        secondary: "votre-couleur-secondaire"
      }
    }
  }
}
```

## 📱 Responsive Design

L'application est entièrement responsive et optimisée pour :
- **Desktop** : Interface complète avec sidebars
- **Tablet** : Mise en page adaptée
- **Mobile** : Navigation simplifiée et touch-friendly

## 🔒 Sécurité

- **Authentification** gérée par Supabase
- **Autorisation** via Row Level Security
- **Validation** des données côté client et serveur
- **Protection CSRF** intégrée à Next.js

## 🚀 Déploiement

### Vercel (Recommandé) :
```bash
# Installer Vercel CLI
npm i -g vercel

# Déployer
vercel

# Ajouter les variables d'environnement dans le dashboard Vercel
```

### Autres plateformes :
- **Netlify** : Compatible avec build statique
- **Heroku** : Avec serveur Node.js
- **DigitalOcean** : Via Docker

## 📚 Documentation des composants

### AuthManager
Gestionnaire central de l'authentification et navigation.

### StudentDashboard
Interface élève avec recommandations et suivi de progression.

### TutorDashboard  
Interface professeur avec gestion d'élèves et revenus.

### ParentDashboard
Interface parent avec suivi multi-enfants.

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir `LICENSE` pour plus d'informations.

## 📞 Support

- **Email** : support@conformedu.com
- **Documentation** : [Wiki du projet]
- **Issues** : GitHub Issues

---

**Conform Edu** - Démocratiser l'accès à l'éducation de qualité en Côte d'Ivoire 🇨🇮
