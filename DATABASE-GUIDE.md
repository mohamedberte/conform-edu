# 🗃️ Guide Base de Données - Conform Edu

## Configuration Supabase

### 1. Créer un projet Supabase
1. Aller sur [supabase.com](https://supabase.com)
2. Créer un nouveau projet
3. Noter l'URL du projet et la clé API anonyme

### 2. Exécuter le script SQL
```sql
-- Copier-coller le contenu du fichier database-setup.sql
-- dans l'éditeur SQL de Supabase
```

### 3. Configurer l'authentification
Dans Supabase Dashboard > Authentication > Settings :
- **Confirm email** : Activé (optionnel)
- **Enable email confirmations** : Selon vos besoins

## Structure des données

### 📊 Schéma des tables

```
profiles (utilisateurs de base)
├── student_profiles (infos élèves)
├── teacher_profiles (infos professeurs)
└── parent_profiles (infos parents)

classes (6ème à Terminale)
subjects (matières enseignées)
courses (offres de cours)
├── bookings (réservations)
└── lessons (cours effectués)
    └── grades (notes/évaluations)

payments (paiements)
assignments (devoirs)
resources (ressources pédagogiques)
```

### 🔐 Sécurité (RLS)

Toutes les tables ont des politiques de sécurité :

#### Profiles
- **Select** : Utilisateurs peuvent voir leur propre profil
- **Update** : Utilisateurs peuvent modifier leur profil

#### Student_profiles  
- **Select** : Élève, parents et professeurs autorisés
- **Insert/Update** : Élève propriétaire uniquement

#### Teacher_profiles
- **Select** : Public (pour la recherche de tuteurs)
- **Insert/Update** : Professeur propriétaire uniquement

#### Courses
- **Select** : Public
- **Insert/Update** : Professeur créateur uniquement

#### Bookings
- **Select** : Élève et professeur concernés
- **Insert** : Élève uniquement
- **Update** : Professeur pour confirmer/refuser

#### Grades
- **Select** : Élève, professeur et parents
- **Insert/Update** : Professeur uniquement

## 📝 Exemples de requêtes

### Inscription d'un nouvel utilisateur
```typescript
// 1. Inscription via Supabase Auth
const { data, error } = await authHelpers.signUp(
  "email@example.com",
  "password",
  {
    firstName: "Jean",
    lastName: "Kouassi", 
    role: "student",
    phone: "+225 0123456789"
  }
);

// 2. Le trigger create_profile_for_new_user crée automatiquement 
// un enregistrement dans la table profiles

// 3. Créer le profil spécifique (étudiant)
await authHelpers.createStudentProfile(user.id, {
  studentNumber: "STU2024001",
  academicYear: "2024-2025",
  classId: "class_1ere_s_id"
});
```

### Recherche de tuteurs
```typescript
const { data: tutors } = await supabase
  .from('teacher_profiles')
  .select(`
    *,
    profiles!inner (first_name, last_name, email),
    subjects!inner (name),
    courses (id, name, price)
  `)
  .eq('is_available', true)
  .eq('subjects.name', 'Mathématiques')
  .gte('rating', 4.0)
  .order('rating', { ascending: false });
```

### Suivi des progrès d'un élève
```typescript
const { data: progress } = await supabase
  .from('grades')
  .select(`
    score,
    max_score,
    created_at,
    subjects (name),
    courses (name)
  `)
  .eq('student_id', studentId)
  .gte('created_at', '2024-01-01')
  .order('created_at', { ascending: false });
```

### Gestion des réservations
```typescript
// Créer une réservation
const { data: booking } = await supabase
  .from('bookings')
  .insert({
    student_id: studentId,
    course_id: courseId,
    teacher_id: teacherId,
    scheduled_at: '2024-12-01T14:00:00',
    status: 'pending'
  });

// Confirmer par le professeur
const { data } = await supabase
  .from('bookings')
  .update({ status: 'confirmed' })
  .eq('id', bookingId)
  .eq('teacher_id', teacherId); // Vérification propriétaire
```

## 🔄 Triggers et fonctions

### create_profile_for_new_user()
```sql
-- Se déclenche automatiquement à l'inscription
-- Crée un profil de base dans la table profiles
-- Utilise les métadonnées de auth.users
```

### handle_updated_at()
```sql
-- Met à jour automatically le champ updated_at
-- Sur toutes les tables qui en ont un
```

## 📈 Optimisations

### Index recommandés
```sql
-- Index sur les recherches fréquentes
CREATE INDEX idx_teacher_profiles_available ON teacher_profiles(is_available);
CREATE INDEX idx_courses_subject ON courses(subject_id);
CREATE INDEX idx_bookings_student ON bookings(student_id);
CREATE INDEX idx_bookings_teacher ON bookings(teacher_id);
CREATE INDEX idx_grades_student ON grades(student_id);
```

### Vues utiles
```sql
-- Vue des cours disponibles avec infos complètes
CREATE VIEW available_courses AS
SELECT 
  c.*,
  tp.rating,
  tp.hourly_rate,
  p.first_name || ' ' || p.last_name as teacher_name,
  s.name as subject_name
FROM courses c
JOIN teacher_profiles tp ON c.teacher_id = tp.user_id
JOIN profiles p ON tp.user_id = p.id  
JOIN subjects s ON c.subject_id = s.id
WHERE tp.is_available = true;
```

## 🚨 Bonnes pratiques

### Sécurité
- **Toujours utiliser RLS** : Ne jamais désactiver Row Level Security
- **Valider côté serveur** : Doubler la validation client par du serveur
- **Limiter les permissions** : Utiliser la clé anonyme en frontend

### Performance  
- **Utiliser select()** : Spécifier les colonnes nécessaires
- **Paginer les résultats** : Utiliser range() pour de gros datasets
- **Cache intelligent** : Mettre en cache les données peu changeantes

### Développement
- **Typage TypeScript** : Générer les types depuis Supabase
- **Gestion d'erreurs** : Wrapper les appels dans try/catch
- **Logs structurés** : Logger les erreurs importantes

## 🔧 Maintenance

### Sauvegarde
```bash
# Sauvegarde via CLI Supabase
supabase db dump --local > backup.sql

# Restauration
supabase db reset --linked
psql -h localhost -p 54322 -U postgres -d postgres < backup.sql
```

### Migrations
```sql
-- Ajouter une nouvelle colonne
ALTER TABLE teacher_profiles 
ADD COLUMN specializations TEXT[];

-- Créer une nouvelle table
CREATE TABLE notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 📞 Dépannage

### Erreurs communes

#### "Row Level Security is enabled"
- **Cause** : Pas de politique RLS pour l'opération
- **Solution** : Ajouter une politique ou vérifier les permissions

#### "Permission denied for table"
- **Cause** : Tentative d'accès sans droits suffisants  
- **Solution** : Vérifier le rôle utilisateur et les politiques RLS

#### "Could not connect to database"
- **Cause** : Configuration Supabase incorrecte
- **Solution** : Vérifier les variables d'environnement

### Debug des politiques RLS
```sql
-- Voir les politiques actives
SELECT schemaname, tablename, policyname, cmd, qual 
FROM pg_policies 
WHERE tablename = 'your_table_name';

-- Tester une requête en tant qu'utilisateur
SET SESSION ROLE your_user_id;
SELECT * FROM your_table;
```

---

Pour plus d'aide : **documentation@conformedu.com**
