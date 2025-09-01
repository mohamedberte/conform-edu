-- ====================================================================
-- NOUVEAU MODÈLE DE BASE DE DONNÉES CONFORM-EDU
-- Vision: Plateforme éducative complète pour l'écosystème ivoirien
-- ====================================================================

-- Extension pour les UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ====================================================================
-- 1. GESTION DES UTILISATEURS ÉTENDUE
-- ====================================================================

-- Table des profils utilisateurs (version étendue)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    email VARCHAR NOT NULL UNIQUE,
    first_name VARCHAR,
    last_name VARCHAR,
    role VARCHAR DEFAULT 'student' CHECK (role IN ('student', 'expert', 'parent', 'admin')),
    avatar_url VARCHAR,
    phone VARCHAR,
    city VARCHAR, -- Ville en Côte d'Ivoire
    district VARCHAR, -- Quartier/Commune
    date_of_birth DATE,
    gender VARCHAR CHECK (gender IN ('M', 'F', 'other')),
    preferred_language VARCHAR DEFAULT 'fr' CHECK (preferred_language IN ('fr', 'en')),
    is_verified BOOLEAN DEFAULT FALSE, -- Vérification d'identité
    verification_documents JSONB, -- Documents de vérification
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE
);

-- Table des profils experts (tuteurs/formateurs)
CREATE TABLE IF NOT EXISTS public.expert_profiles (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    expert_code VARCHAR UNIQUE NOT NULL, -- Code unique expert
    bio TEXT,
    years_experience INTEGER,
    education_level VARCHAR, -- Niveau d'études
    diplomas JSONB, -- Liste des diplômes [{"name", "institution", "year", "document_url"}]
    certifications JSONB, -- Certifications professionnelles
    specializations TEXT[], -- Domaines de spécialisation
    teaching_modes VARCHAR[] DEFAULT ARRAY['online', 'in_person'], -- Modes d'enseignement
    available_hours JSONB, -- Créneaux disponibles par jour
    hourly_rate_min INTEGER, -- Tarif minimum/heure (en CFA)
    hourly_rate_max INTEGER, -- Tarif maximum/heure (en CFA)
    accepts_mobile_money BOOLEAN DEFAULT TRUE,
    mobile_money_number VARCHAR,
    rating_average DECIMAL(3,2) DEFAULT 0.00,
    total_reviews INTEGER DEFAULT 0,
    total_hours_taught INTEGER DEFAULT 0,
    total_students INTEGER DEFAULT 0,
    is_verified BOOLEAN DEFAULT FALSE,
    verification_status VARCHAR DEFAULT 'pending' CHECK (verification_status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ====================================================================
-- 2. SYSTÈME DE DOMAINES ET FORMATIONS
-- ====================================================================

-- Table des catégories principales
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR NOT NULL,
    slug VARCHAR UNIQUE NOT NULL,
    description TEXT,
    icon VARCHAR, -- Classe d'icône Lucide
    color VARCHAR, -- Couleur hex
    is_active BOOLEAN DEFAULT TRUE,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Table des sous-domaines/matières
CREATE TABLE IF NOT EXISTS public.subjects (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    category_id UUID REFERENCES public.categories(id) NOT NULL,
    name VARCHAR NOT NULL,
    slug VARCHAR UNIQUE NOT NULL,
    description TEXT,
    level_tags VARCHAR[], -- ['débutant', 'intermédiaire', 'avancé']
    age_groups VARCHAR[], -- ['enfant', 'adolescent', 'adulte']
    keywords TEXT[], -- Mots-clés pour la recherche
    is_popular BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Table des formations/cours proposés par les experts
CREATE TABLE IF NOT EXISTS public.courses (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    expert_id UUID REFERENCES public.expert_profiles(id) NOT NULL,
    subject_id UUID REFERENCES public.subjects(id) NOT NULL,
    title VARCHAR NOT NULL,
    description TEXT,
    course_type VARCHAR CHECK (course_type IN ('individual', 'group', 'workshop', 'bootcamp')),
    level VARCHAR CHECK (level IN ('debutant', 'intermediaire', 'avance')),
    duration_minutes INTEGER, -- Durée standard d'une séance
    max_students INTEGER DEFAULT 1, -- Pour les cours de groupe
    price_per_hour INTEGER NOT NULL, -- Prix en CFA
    package_deals JSONB, -- Offres groupées [{"sessions": 5, "price": 10000, "discount": 10}]
    prerequisites TEXT[], -- Prérequis
    objectives TEXT[], -- Objectifs d'apprentissage
    materials_needed TEXT[], -- Matériel nécessaire
    location_type VARCHAR CHECK (location_type IN ('online', 'home', 'expert_place', 'public_place')),
    cover_image_url VARCHAR,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ====================================================================
-- 3. SYSTÈME DE RÉSERVATION ET SESSIONS
-- ====================================================================

-- Table des créneaux disponibles des experts
CREATE TABLE IF NOT EXISTS public.availability_slots (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    expert_id UUID REFERENCES public.expert_profiles(id) NOT NULL,
    day_of_week INTEGER NOT NULL CHECK (day_of_week >= 1 AND day_of_week <= 7),
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_recurring BOOLEAN DEFAULT TRUE, -- Récurrent chaque semaine
    specific_date DATE, -- Pour des créneaux exceptionnels
    is_available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Table des réservations/sessions
CREATE TABLE IF NOT EXISTS public.sessions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    course_id UUID REFERENCES public.courses(id) NOT NULL,
    student_id UUID REFERENCES public.profiles(id) NOT NULL,
    expert_id UUID REFERENCES public.expert_profiles(id) NOT NULL,
    scheduled_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    duration_minutes INTEGER NOT NULL,
    total_price INTEGER NOT NULL, -- Prix total en CFA
    status VARCHAR DEFAULT 'confirmed' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled', 'no_show')),
    meeting_link VARCHAR, -- Lien de visioconférence
    meeting_room VARCHAR, -- Salle physique
    notes TEXT, -- Notes de l'expert ou étudiant
    homework TEXT, -- Devoirs donnés
    resources_shared JSONB, -- Ressources partagées
    student_feedback TEXT,
    expert_feedback TEXT,
    student_rating INTEGER CHECK (student_rating >= 1 AND student_rating <= 5),
    expert_rating INTEGER CHECK (expert_rating >= 1 AND expert_rating <= 5),
    cancelled_by UUID REFERENCES public.profiles(id),
    cancellation_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ====================================================================
-- 4. SYSTÈME DE PAIEMENT
-- ====================================================================

-- Table des transactions
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    session_id UUID REFERENCES public.sessions(id),
    payer_id UUID REFERENCES public.profiles(id) NOT NULL, -- Qui paie (étudiant ou parent)
    recipient_id UUID REFERENCES public.expert_profiles(id) NOT NULL,
    amount INTEGER NOT NULL, -- Montant en CFA
    currency VARCHAR DEFAULT 'CFA',
    payment_method VARCHAR CHECK (payment_method IN ('mobile_money', 'bank_transfer', 'cash', 'credit_card')),
    mobile_money_provider VARCHAR, -- Orange Money, MTN Money, Moov Money
    transaction_reference VARCHAR,
    status VARCHAR DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
    platform_fee INTEGER DEFAULT 0, -- Commission plateforme
    expert_earnings INTEGER, -- Gains de l'expert après commission
    processed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ====================================================================
-- 5. SYSTÈME D'ÉVALUATION ET PROGRESSION
-- ====================================================================

-- Table des avis
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    session_id UUID REFERENCES public.sessions(id) NOT NULL,
    reviewer_id UUID REFERENCES public.profiles(id) NOT NULL, -- Qui donne l'avis
    reviewed_id UUID REFERENCES public.profiles(id) NOT NULL, -- Qui reçoit l'avis
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    categories JSONB, -- {"pedagogie": 5, "ponctualite": 4, "communication": 5}
    is_verified BOOLEAN DEFAULT FALSE, -- Avis vérifié après session
    is_visible BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Table des badges/achievements
CREATE TABLE IF NOT EXISTS public.badges (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR NOT NULL,
    description TEXT,
    icon VARCHAR,
    color VARCHAR,
    category VARCHAR, -- 'learning', 'teaching', 'engagement', 'milestone'
    requirements JSONB, -- Conditions pour obtenir le badge
    points_value INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Table des badges obtenus par les utilisateurs
CREATE TABLE IF NOT EXISTS public.user_badges (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) NOT NULL,
    badge_id UUID REFERENCES public.badges(id) NOT NULL,
    earned_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    session_id UUID REFERENCES public.sessions(id), -- Session qui a déclenché le badge
    UNIQUE(user_id, badge_id)
);

-- Table de progression par matière
CREATE TABLE IF NOT EXISTS public.learning_progress (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) NOT NULL,
    subject_id UUID REFERENCES public.subjects(id) NOT NULL,
    current_level VARCHAR DEFAULT 'debutant',
    total_hours INTEGER DEFAULT 0,
    total_sessions INTEGER DEFAULT 0,
    skills_mastered TEXT[], -- Compétences maîtrisées
    current_objectives TEXT[], -- Objectifs en cours
    progress_percentage INTEGER DEFAULT 0,
    last_session_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(user_id, subject_id)
);

-- ====================================================================
-- 6. GESTION FAMILIALE ET SUIVI PARENTAL
-- ====================================================================

-- Table des relations familiales
CREATE TABLE IF NOT EXISTS public.family_relationships (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    parent_id UUID REFERENCES public.profiles(id) NOT NULL,
    child_id UUID REFERENCES public.profiles(id) NOT NULL,
    relationship_type VARCHAR DEFAULT 'parent' CHECK (relationship_type IN ('parent', 'guardian', 'tutor')),
    can_book_sessions BOOLEAN DEFAULT TRUE,
    can_view_progress BOOLEAN DEFAULT TRUE,
    can_receive_notifications BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(parent_id, child_id)
);

-- ====================================================================
-- 7. SYSTÈME DE MESSAGING ET NOTIFICATIONS
-- ====================================================================

-- Table des conversations
CREATE TABLE IF NOT EXISTS public.conversations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    participants UUID[] NOT NULL, -- IDs des participants
    type VARCHAR DEFAULT 'direct' CHECK (type IN ('direct', 'group', 'support')),
    title VARCHAR,
    last_message_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Table des messages
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    conversation_id UUID REFERENCES public.conversations(id) NOT NULL,
    sender_id UUID REFERENCES public.profiles(id) NOT NULL,
    content TEXT,
    message_type VARCHAR DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'file', 'system')),
    file_url VARCHAR,
    is_read BOOLEAN DEFAULT FALSE,
    read_by JSONB, -- {"user_id": "timestamp"}
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ====================================================================
-- 8. DONNÉES DE RÉFÉRENCE IVOIRIENNES
-- ====================================================================

-- Table des villes de Côte d'Ivoire
CREATE TABLE IF NOT EXISTS public.cities (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR NOT NULL,
    region VARCHAR,
    is_major BOOLEAN DEFAULT FALSE, -- Grandes villes
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ====================================================================
-- INSERTION DES DONNÉES DE BASE
-- ====================================================================

-- Catégories principales
INSERT INTO public.categories (name, slug, description, icon, color, display_order) VALUES
    ('Scolaire', 'scolaire', 'Soutien scolaire et préparation aux examens', 'BookOpen', '#F97316', 1),
    ('Langues', 'langues', 'Apprentissage des langues étrangères', 'Languages', '#10B981', 2),
    ('Informatique', 'informatique', 'Programmation, bureautique et nouvelles technologies', 'Laptop', '#3B82F6', 3),
    ('Arts & Culture', 'arts-culture', 'Musique, peinture, danse et arts traditionnels', 'Palette', '#8B5CF6', 4),
    ('Sport & Bien-être', 'sport-bien-etre', 'Activités physiques et développement personnel', 'Activity', '#06B6D4', 5),
    ('Métiers & Artisanat', 'metiers-artisanat', 'Formations professionnelles et artisanales', 'Wrench', '#F59E0B', 6),
    ('Cuisine', 'cuisine', 'Art culinaire ivoirien et international', 'ChefHat', '#EF4444', 7),
    ('Entrepreneuriat', 'entrepreneuriat', 'Création et gestion d\'entreprise', 'TrendingUp', '#84CC16', 8)
ON CONFLICT (slug) DO NOTHING;

-- Villes principales de Côte d'Ivoire
INSERT INTO public.cities (name, region, is_major) VALUES
    ('Abidjan', 'Lagunes', true),
    ('Bouaké', 'Vallée du Bandama', true),
    ('Daloa', 'Haut-Sassandra', true),
    ('San-Pédro', 'Bas-Sassandra', true),
    ('Korhogo', 'Savanes', true),
    ('Yamoussoukro', 'Lacs', true),
    ('Man', 'Montagnes', false),
    ('Divo', 'Lôh-Djiboua', false),
    ('Gagnoa', 'Gôh', false),
    ('Anyama', 'Lagunes', false)
ON CONFLICT DO NOTHING;

-- Badges de base
INSERT INTO public.badges (name, description, icon, color, category, requirements, points_value) VALUES
    ('Premier Cours', 'Félicitations pour votre première session !', 'Star', '#F59E0B', 'milestone', '{"sessions_completed": 1}', 10),
    ('Apprenant Assidu', '10 sessions complétées', 'Trophy', '#10B981', 'learning', '{"sessions_completed": 10}', 50),
    ('Expert Populaire', '50 avis positifs reçus', 'Heart', '#EF4444', 'teaching', '{"positive_reviews": 50}', 100),
    ('Mentor du Mois', 'Plus de 20h enseignées dans le mois', 'Crown', '#8B5CF6', 'teaching', '{"monthly_hours": 20}', 200)
ON CONFLICT DO NOTHING;

-- ====================================================================
-- DONNÉES DE RÉFÉRENTIEL ÉTENDUES POUR LA CÔTE D'IVOIRE
-- ====================================================================

-- MATIÈRES/SUJETS PAR CATÉGORIE

-- 1. SCOLAIRE - Matières académiques
INSERT INTO public.subjects (category_id, name, slug, description, level_tags, age_groups, keywords, is_popular) 
SELECT 
    c.id,
    subject_data.name,
    subject_data.slug,
    subject_data.description,
    subject_data.level_tags,
    subject_data.age_groups,
    subject_data.keywords,
    subject_data.is_popular
FROM public.categories c,
(VALUES 
    -- Mathématiques
    ('Mathématiques Primaire', 'mathematiques-primaire', 'Mathématiques pour les classes de CP à CM2', ARRAY['debutant'], ARRAY['enfant'], ARRAY['maths', 'calcul', 'géométrie', 'primaire'], true),
    ('Mathématiques Collège', 'mathematiques-college', 'Mathématiques pour les classes de 6ème à 3ème', ARRAY['debutant', 'intermediaire'], ARRAY['adolescent'], ARRAY['maths', 'algèbre', 'géométrie', 'collège'], true),
    ('Mathématiques Lycée', 'mathematiques-lycee', 'Mathématiques pour les classes de Seconde à Terminale', ARRAY['intermediaire', 'avance'], ARRAY['adolescent'], ARRAY['maths', 'analyse', 'probabilités', 'lycée'], true),
    ('Préparation BAC Mathématiques', 'preparation-bac-maths', 'Préparation intensive au BAC Mathématiques', ARRAY['avance'], ARRAY['adolescent'], ARRAY['bac', 'examen', 'maths'], true),
    
    -- Sciences Physiques
    ('Physique-Chimie Collège', 'physique-chimie-college', 'Sciences physiques pour le collège', ARRAY['debutant', 'intermediaire'], ARRAY['adolescent'], ARRAY['physique', 'chimie', 'sciences', 'collège'], true),
    ('Physique-Chimie Lycée', 'physique-chimie-lycee', 'Sciences physiques pour le lycée', ARRAY['intermediaire', 'avance'], ARRAY['adolescent'], ARRAY['physique', 'chimie', 'sciences', 'lycée'], true),
    ('Préparation BAC Sciences', 'preparation-bac-sciences', 'Préparation BAC Physique-Chimie', ARRAY['avance'], ARRAY['adolescent'], ARRAY['bac', 'sciences', 'physique', 'chimie'], true),
    
    -- Sciences de la Vie et de la Terre
    ('SVT Collège', 'svt-college', 'Sciences de la Vie et de la Terre - Collège', ARRAY['debutant', 'intermediaire'], ARRAY['adolescent'], ARRAY['svt', 'biologie', 'géologie', 'collège'], true),
    ('SVT Lycée', 'svt-lycee', 'Sciences de la Vie et de la Terre - Lycée', ARRAY['intermediaire', 'avance'], ARRAY['adolescent'], ARRAY['svt', 'biologie', 'géologie', 'lycée'], true),
    
    -- Français
    ('Français Primaire', 'francais-primaire', 'Français pour les classes primaires', ARRAY['debutant'], ARRAY['enfant'], ARRAY['français', 'lecture', 'écriture', 'primaire'], true),
    ('Français Collège', 'francais-college', 'Français pour le collège - Grammaire, littérature', ARRAY['debutant', 'intermediaire'], ARRAY['adolescent'], ARRAY['français', 'grammaire', 'littérature', 'collège'], true),
    ('Français Lycée', 'francais-lycee', 'Français lycée - Dissertation, commentaire', ARRAY['intermediaire', 'avance'], ARRAY['adolescent'], ARRAY['français', 'dissertation', 'commentaire', 'lycée'], true),
    ('Préparation BAC Français', 'preparation-bac-francais', 'Préparation intensive au BAC Français', ARRAY['avance'], ARRAY['adolescent'], ARRAY['bac', 'français', 'oral', 'écrit'], true),
    
    -- Histoire-Géographie
    ('Histoire-Géographie Collège', 'histoire-geographie-college', 'Histoire et Géographie pour le collège', ARRAY['debutant', 'intermediaire'], ARRAY['adolescent'], ARRAY['histoire', 'géographie', 'collège'], true),
    ('Histoire-Géographie Lycée', 'histoire-geographie-lycee', 'Histoire et Géographie pour le lycée', ARRAY['intermediaire', 'avance'], ARRAY['adolescent'], ARRAY['histoire', 'géographie', 'lycée'], true),
    
    -- Philosophie
    ('Philosophie Terminale', 'philosophie-terminale', 'Philosophie pour les classes de Terminale', ARRAY['avance'], ARRAY['adolescent'], ARRAY['philosophie', 'terminale', 'dissertation'], true),
    
    -- Préparations aux concours
    ('Préparation BEPC', 'preparation-bepc', 'Préparation au Brevet d''Études du Premier Cycle', ARRAY['intermediaire'], ARRAY['adolescent'], ARRAY['bepc', 'brevet', 'examen'], true),
    ('Préparation BAC', 'preparation-bac', 'Préparation générale au Baccalauréat', ARRAY['avance'], ARRAY['adolescent'], ARRAY['bac', 'baccalauréat', 'examen'], true),
    ('Préparation Concours Grandes Écoles', 'preparation-concours-grandes-ecoles', 'Préparation aux concours d''entrée', ARRAY['avance'], ARRAY['adolescent', 'adulte'], ARRAY['concours', 'grandes écoles', 'prépa'], false)
) AS subject_data(name, slug, description, level_tags, age_groups, keywords, is_popular)
WHERE c.slug = 'scolaire'
ON CONFLICT (slug) DO NOTHING;

-- 2. LANGUES - Apprentissage des langues
INSERT INTO public.subjects (category_id, name, slug, description, level_tags, age_groups, keywords, is_popular) 
SELECT 
    c.id,
    subject_data.name,
    subject_data.slug,
    subject_data.description,
    subject_data.level_tags,
    subject_data.age_groups,
    subject_data.keywords,
    subject_data.is_popular
FROM public.categories c,
(VALUES 
    -- Français (pour non-francophones)
    ('Français Langue Étrangère', 'francais-langue-etrangere', 'Apprentissage du français pour non-francophones', ARRAY['debutant', 'intermediaire', 'avance'], ARRAY['enfant', 'adolescent', 'adulte'], ARRAY['français', 'fle', 'langue'], true),
    ('Français Expression Écrite', 'francais-expression-ecrite', 'Amélioration de l''expression écrite en français', ARRAY['intermediaire', 'avance'], ARRAY['adolescent', 'adulte'], ARRAY['français', 'écriture', 'rédaction'], true),
    ('Français Expression Orale', 'francais-expression-orale', 'Amélioration de l''expression orale', ARRAY['debutant', 'intermediaire', 'avance'], ARRAY['enfant', 'adolescent', 'adulte'], ARRAY['français', 'oral', 'communication'], true),
    
    -- Anglais
    ('Anglais Débutant', 'anglais-debutant', 'Initiation à l''anglais - Niveau débutant', ARRAY['debutant'], ARRAY['enfant', 'adolescent', 'adulte'], ARRAY['anglais', 'débutant', 'initiation'], true),
    ('Anglais Intermédiaire', 'anglais-intermediaire', 'Anglais niveau intermédiaire', ARRAY['intermediaire'], ARRAY['adolescent', 'adulte'], ARRAY['anglais', 'intermédiaire', 'conversation'], true),
    ('Anglais Avancé', 'anglais-avance', 'Anglais niveau avancé et perfectionnement', ARRAY['avance'], ARRAY['adolescent', 'adulte'], ARRAY['anglais', 'avancé', 'business'], true),
    ('Anglais Business', 'anglais-business', 'Anglais professionnel et des affaires', ARRAY['intermediaire', 'avance'], ARRAY['adulte'], ARRAY['anglais', 'business', 'professionnel'], false),
    ('Préparation TOEFL/TOEIC', 'preparation-toefl-toeic', 'Préparation aux tests TOEFL et TOEIC', ARRAY['intermediaire', 'avance'], ARRAY['adolescent', 'adulte'], ARRAY['toefl', 'toeic', 'certification'], false),
    
    -- Autres langues européennes
    ('Allemand', 'allemand', 'Apprentissage de l''allemand', ARRAY['debutant', 'intermediaire', 'avance'], ARRAY['adolescent', 'adulte'], ARRAY['allemand', 'europe'], false),
    ('Espagnol', 'espagnol', 'Apprentissage de l''espagnol', ARRAY['debutant', 'intermediaire', 'avance'], ARRAY['adolescent', 'adulte'], ARRAY['espagnol', 'amérique'], false),
    ('Italien', 'italien', 'Apprentissage de l''italien', ARRAY['debutant', 'intermediaire'], ARRAY['adolescent', 'adulte'], ARRAY['italien', 'europe'], false),
    
    -- Langues orientales
    ('Chinois Mandarin', 'chinois-mandarin', 'Apprentissage du chinois mandarin', ARRAY['debutant', 'intermediaire'], ARRAY['adolescent', 'adulte'], ARRAY['chinois', 'mandarin', 'asie'], false),
    ('Arabe', 'arabe', 'Apprentissage de l''arabe littéraire', ARRAY['debutant', 'intermediaire'], ARRAY['adolescent', 'adulte'], ARRAY['arabe', 'moyen-orient'], false),
    
    -- Langues locales ivoiriennes
    ('Baoulé', 'baoule', 'Apprentissage du Baoulé', ARRAY['debutant', 'intermediaire'], ARRAY['enfant', 'adolescent', 'adulte'], ARRAY['baoulé', 'langue locale', 'tradition'], true),
    ('Dioula', 'dioula', 'Apprentissage du Dioula', ARRAY['debutant', 'intermediaire'], ARRAY['enfant', 'adolescent', 'adulte'], ARRAY['dioula', 'langue locale', 'commerce'], true),
    ('Bété', 'bete', 'Apprentissage du Bété', ARRAY['debutant', 'intermediaire'], ARRAY['enfant', 'adolescent', 'adulte'], ARRAY['bété', 'langue locale', 'tradition'], false)
) AS subject_data(name, slug, description, level_tags, age_groups, keywords, is_popular)
WHERE c.slug = 'langues'
ON CONFLICT (slug) DO NOTHING;

-- 3. INFORMATIQUE - Technologies et programmation
INSERT INTO public.subjects (category_id, name, slug, description, level_tags, age_groups, keywords, is_popular) 
SELECT 
    c.id,
    subject_data.name,
    subject_data.slug,
    subject_data.description,
    subject_data.level_tags,
    subject_data.age_groups,
    subject_data.keywords,
    subject_data.is_popular
FROM public.categories c,
(VALUES 
    -- Initiation informatique
    ('Initiation Informatique', 'initiation-informatique', 'Découverte de l''informatique et de l''ordinateur', ARRAY['debutant'], ARRAY['enfant', 'adolescent', 'adulte'], ARRAY['informatique', 'ordinateur', 'initiation'], true),
    ('Navigation Internet', 'navigation-internet', 'Apprendre à naviguer sur Internet en sécurité', ARRAY['debutant'], ARRAY['adolescent', 'adulte'], ARRAY['internet', 'navigation', 'sécurité'], true),
    
    -- Bureautique
    ('Microsoft Word', 'microsoft-word', 'Traitement de texte avec Microsoft Word', ARRAY['debutant', 'intermediaire'], ARRAY['adolescent', 'adulte'], ARRAY['word', 'traitement de texte', 'bureautique'], true),
    ('Microsoft Excel', 'microsoft-excel', 'Tableur et calculs avec Microsoft Excel', ARRAY['debutant', 'intermediaire', 'avance'], ARRAY['adolescent', 'adulte'], ARRAY['excel', 'tableur', 'calcul'], true),
    ('Microsoft PowerPoint', 'microsoft-powerpoint', 'Création de présentations avec PowerPoint', ARRAY['debutant', 'intermediaire'], ARRAY['adolescent', 'adulte'], ARRAY['powerpoint', 'présentation', 'slides'], true),
    ('Pack Office Complet', 'pack-office-complet', 'Maîtrise complète de Microsoft Office', ARRAY['intermediaire', 'avance'], ARRAY['adolescent', 'adulte'], ARRAY['office', 'bureautique', 'productivité'], true),
    
    -- Programmation
    ('Programmation Python', 'programmation-python', 'Apprentissage de la programmation avec Python', ARRAY['debutant', 'intermediaire', 'avance'], ARRAY['adolescent', 'adulte'], ARRAY['python', 'programmation', 'code'], true),
    ('Programmation JavaScript', 'programmation-javascript', 'Développement web avec JavaScript', ARRAY['intermediaire', 'avance'], ARRAY['adolescent', 'adulte'], ARRAY['javascript', 'web', 'développement'], true),
    ('Programmation Java', 'programmation-java', 'Programmation orientée objet avec Java', ARRAY['intermediaire', 'avance'], ARRAY['adolescent', 'adulte'], ARRAY['java', 'programmation', 'objet'], false),
    ('Programmation C/C++', 'programmation-c-cpp', 'Programmation système avec C et C++', ARRAY['avance'], ARRAY['adolescent', 'adulte'], ARRAY['c', 'cpp', 'système'], false),
    
    -- Développement Web
    ('HTML/CSS', 'html-css', 'Création de sites web avec HTML et CSS', ARRAY['debutant', 'intermediaire'], ARRAY['adolescent', 'adulte'], ARRAY['html', 'css', 'web'], true),
    ('Développement Web Frontend', 'developpement-web-frontend', 'Développement frontend moderne (React, Vue)', ARRAY['intermediaire', 'avance'], ARRAY['adolescent', 'adulte'], ARRAY['frontend', 'react', 'vue'], false),
    ('Développement Web Backend', 'developpement-web-backend', 'Développement backend (Node.js, PHP)', ARRAY['avance'], ARRAY['adolescent', 'adulte'], ARRAY['backend', 'nodejs', 'php'], false),
    
    -- Design et Multimédia
    ('Photoshop', 'photoshop', 'Retouche photo et design avec Photoshop', ARRAY['debutant', 'intermediaire', 'avance'], ARRAY['adolescent', 'adulte'], ARRAY['photoshop', 'design', 'photo'], true),
    ('Illustrator', 'illustrator', 'Design vectoriel avec Adobe Illustrator', ARRAY['intermediaire', 'avance'], ARRAY['adolescent', 'adulte'], ARRAY['illustrator', 'vectoriel', 'design'], false),
    ('Canva', 'canva', 'Design graphique facile avec Canva', ARRAY['debutant', 'intermediaire'], ARRAY['adolescent', 'adulte'], ARRAY['canva', 'design', 'graphique'], true),
    
    -- Spécialisations
    ('Cybersécurité', 'cybersecurite', 'Sécurité informatique et protection des données', ARRAY['intermediaire', 'avance'], ARRAY['adulte'], ARRAY['sécurité', 'cybersécurité', 'protection'], false),
    ('Base de Données', 'base-de-donnees', 'Conception et gestion de bases de données', ARRAY['intermediaire', 'avance'], ARRAY['adulte'], ARRAY['database', 'sql', 'données'], false),
    ('Intelligence Artificielle', 'intelligence-artificielle', 'Introduction à l''IA et Machine Learning', ARRAY['avance'], ARRAY['adulte'], ARRAY['ia', 'machine learning', 'intelligence'], false)
) AS subject_data(name, slug, description, level_tags, age_groups, keywords, is_popular)
WHERE c.slug = 'informatique'
ON CONFLICT (slug) DO NOTHING;

-- 4. ARTS & CULTURE - Activités artistiques et culturelles
INSERT INTO public.subjects (category_id, name, slug, description, level_tags, age_groups, keywords, is_popular) 
SELECT 
    c.id,
    subject_data.name,
    subject_data.slug,
    subject_data.description,
    subject_data.level_tags,
    subject_data.age_groups,
    subject_data.keywords,
    subject_data.is_popular
FROM public.categories c,
(VALUES 
    -- Musique
    ('Piano', 'piano', 'Apprentissage du piano classique et moderne', ARRAY['debutant', 'intermediaire', 'avance'], ARRAY['enfant', 'adolescent', 'adulte'], ARRAY['piano', 'musique', 'clavier'], true),
    ('Guitare', 'guitare', 'Guitare acoustique et électrique', ARRAY['debutant', 'intermediaire', 'avance'], ARRAY['adolescent', 'adulte'], ARRAY['guitare', 'musique', 'cordes'], true),
    ('Violon', 'violon', 'Apprentissage du violon classique', ARRAY['debutant', 'intermediaire', 'avance'], ARRAY['enfant', 'adolescent', 'adulte'], ARRAY['violon', 'musique', 'cordes'], false),
    ('Batterie', 'batterie', 'Apprentissage de la batterie et percussion', ARRAY['debutant', 'intermediaire'], ARRAY['adolescent', 'adulte'], ARRAY['batterie', 'percussion', 'rythme'], false),
    ('Chant', 'chant', 'Technique vocale et chant', ARRAY['debutant', 'intermediaire', 'avance'], ARRAY['enfant', 'adolescent', 'adulte'], ARRAY['chant', 'voix', 'vocal'], true),
    ('Solfège', 'solfege', 'Théorie musicale et solfège', ARRAY['debutant', 'intermediaire'], ARRAY['enfant', 'adolescent', 'adulte'], ARRAY['solfège', 'théorie', 'musique'], false),
    
    -- Arts plastiques
    ('Dessin', 'dessin', 'Techniques de dessin au crayon et fusain', ARRAY['debutant', 'intermediaire', 'avance'], ARRAY['enfant', 'adolescent', 'adulte'], ARRAY['dessin', 'crayon', 'art'], true),
    ('Peinture', 'peinture', 'Peinture à l''huile, acrylique et aquarelle', ARRAY['debutant', 'intermediaire', 'avance'], ARRAY['adolescent', 'adulte'], ARRAY['peinture', 'toile', 'couleur'], true),
    ('Sculpture', 'sculpture', 'Sculpture sur bois, argile et pierre', ARRAY['intermediaire', 'avance'], ARRAY['adolescent', 'adulte'], ARRAY['sculpture', 'bois', 'argile'], false),
    
    -- Danse
    ('Danse Moderne', 'danse-moderne', 'Danse contemporaine et moderne', ARRAY['debutant', 'intermediaire', 'avance'], ARRAY['enfant', 'adolescent', 'adulte'], ARRAY['danse', 'moderne', 'mouvement'], true),
    ('Danse Traditionnelle Ivoirienne', 'danse-traditionnelle-ivoirienne', 'Danses traditionnelles de Côte d''Ivoire', ARRAY['debutant', 'intermediaire'], ARRAY['enfant', 'adolescent', 'adulte'], ARRAY['danse', 'tradition', 'ivoirien'], true),
    ('Ballet', 'ballet', 'Danse classique et ballet', ARRAY['debutant', 'intermediaire', 'avance'], ARRAY['enfant', 'adolescent'], ARRAY['ballet', 'classique', 'danse'], false),
    ('Hip-Hop', 'hip-hop', 'Danse Hip-Hop et street dance', ARRAY['debutant', 'intermediaire'], ARRAY['adolescent', 'adulte'], ARRAY['hip-hop', 'street', 'urbain'], true),
    
    -- Arts traditionnels
    ('Percussion Africaine', 'percussion-africaine', 'Djembé et percussions traditionnelles', ARRAY['debutant', 'intermediaire'], ARRAY['enfant', 'adolescent', 'adulte'], ARRAY['djembé', 'percussion', 'africain'], true),
    ('Conte et Narration', 'conte-narration', 'Art du conte traditionnel africain', ARRAY['debutant', 'intermediaire'], ARRAY['enfant', 'adolescent', 'adulte'], ARRAY['conte', 'narration', 'tradition'], false),
    ('Artisanat Traditionnel', 'artisanat-traditionnel', 'Techniques d''artisanat traditionnel ivoirien', ARRAY['debutant', 'intermediaire'], ARRAY['adolescent', 'adulte'], ARRAY['artisanat', 'tradition', 'manuel'], false)
) AS subject_data(name, slug, description, level_tags, age_groups, keywords, is_popular)
WHERE c.slug = 'arts-culture'
ON CONFLICT (slug) DO NOTHING;

-- 5. SPORT & BIEN-ÊTRE
INSERT INTO public.subjects (category_id, name, slug, description, level_tags, age_groups, keywords, is_popular) 
SELECT 
    c.id,
    subject_data.name,
    subject_data.slug,
    subject_data.description,
    subject_data.level_tags,
    subject_data.age_groups,
    subject_data.keywords,
    subject_data.is_popular
FROM public.categories c,
(VALUES 
    -- Fitness et Musculation
    ('Fitness', 'fitness', 'Entraînement physique et remise en forme', ARRAY['debutant', 'intermediaire', 'avance'], ARRAY['adolescent', 'adulte'], ARRAY['fitness', 'sport', 'forme'], true),
    ('Musculation', 'musculation', 'Renforcement musculaire et bodybuilding', ARRAY['debutant', 'intermediaire', 'avance'], ARRAY['adolescent', 'adulte'], ARRAY['musculation', 'force', 'muscle'], true),
    ('CrossFit', 'crossfit', 'Entraînement fonctionnel intensif', ARRAY['intermediaire', 'avance'], ARRAY['adolescent', 'adulte'], ARRAY['crossfit', 'intensif', 'fonctionnel'], false),
    
    -- Sports de combat
    ('Karaté', 'karate', 'Art martial traditionnel japonais', ARRAY['debutant', 'intermediaire', 'avance'], ARRAY['enfant', 'adolescent', 'adulte'], ARRAY['karaté', 'art martial', 'combat'], false),
    ('Taekwondo', 'taekwondo', 'Art martial coréen axé sur les coups de pied', ARRAY['debutant', 'intermediaire'], ARRAY['enfant', 'adolescent', 'adulte'], ARRAY['taekwondo', 'art martial', 'corée'], false),
    ('Boxe', 'boxe', 'Boxe anglaise et techniques de combat', ARRAY['debutant', 'intermediaire', 'avance'], ARRAY['adolescent', 'adulte'], ARRAY['boxe', 'combat', 'punch'], false),
    
    -- Bien-être et relaxation
    ('Yoga', 'yoga', 'Pratique du yoga pour le bien-être', ARRAY['debutant', 'intermediaire', 'avance'], ARRAY['adolescent', 'adulte'], ARRAY['yoga', 'bien-être', 'relaxation'], true),
    ('Méditation', 'meditation', 'Techniques de méditation et mindfulness', ARRAY['debutant', 'intermediaire'], ARRAY['adolescent', 'adulte'], ARRAY['méditation', 'mindfulness', 'zen'], true),
    ('Pilates', 'pilates', 'Renforcement du core et posture', ARRAY['debutant', 'intermediaire'], ARRAY['adolescent', 'adulte'], ARRAY['pilates', 'core', 'posture'], false),
    
    -- Sports collectifs
    ('Football', 'football', 'Technique et tactique du football', ARRAY['debutant', 'intermediaire', 'avance'], ARRAY['enfant', 'adolescent', 'adulte'], ARRAY['football', 'collectif', 'ballon'], true),
    ('Basketball', 'basketball', 'Techniques de basketball', ARRAY['debutant', 'intermediaire'], ARRAY['enfant', 'adolescent', 'adulte'], ARRAY['basketball', 'panier', 'collectif'], true),
    ('Volleyball', 'volleyball', 'Techniques de volleyball', ARRAY['debutant', 'intermediaire'], ARRAY['adolescent', 'adulte'], ARRAY['volleyball', 'filet', 'équipe'], false),
    
    -- Développement personnel
    ('Coaching Personnel', 'coaching-personnel', 'Développement personnel et coaching de vie', ARRAY['intermediaire'], ARRAY['adulte'], ARRAY['coaching', 'développement', 'personnel'], false),
    ('Gestion du Stress', 'gestion-du-stress', 'Techniques de gestion du stress', ARRAY['debutant', 'intermediaire'], ARRAY['adolescent', 'adulte'], ARRAY['stress', 'gestion', 'relaxation'], true),
    ('Confiance en Soi', 'confiance-en-soi', 'Développement de la confiance en soi', ARRAY['debutant', 'intermediaire'], ARRAY['adolescent', 'adulte'], ARRAY['confiance', 'estime', 'soi'], true)
) AS subject_data(name, slug, description, level_tags, age_groups, keywords, is_popular)
WHERE c.slug = 'sport-bien-etre'
ON CONFLICT (slug) DO NOTHING;

-- 6. MÉTIERS & ARTISANAT
INSERT INTO public.subjects (category_id, name, slug, description, level_tags, age_groups, keywords, is_popular) 
SELECT 
    c.id,
    subject_data.name,
    subject_data.slug,
    subject_data.description,
    subject_data.level_tags,
    subject_data.age_groups,
    subject_data.keywords,
    subject_data.is_popular
FROM public.categories c,
(VALUES 
    -- Artisanat traditionnel
    ('Tissage', 'tissage', 'Techniques de tissage traditionnel', ARRAY['debutant', 'intermediaire'], ARRAY['adolescent', 'adulte'], ARRAY['tissage', 'textile', 'tradition'], false),
    ('Poterie', 'poterie', 'Art de la poterie et céramique', ARRAY['debutant', 'intermediaire'], ARRAY['adolescent', 'adulte'], ARRAY['poterie', 'céramique', 'argile'], false),
    ('Menuiserie', 'menuiserie', 'Travail du bois et menuiserie', ARRAY['debutant', 'intermediaire', 'avance'], ARRAY['adolescent', 'adulte'], ARRAY['menuiserie', 'bois', 'artisanat'], true),
    ('Maçonnerie', 'maconnerie', 'Techniques de construction et maçonnerie', ARRAY['debutant', 'intermediaire'], ARRAY['adulte'], ARRAY['maçonnerie', 'construction', 'bâtiment'], true),
    
    -- Métiers techniques
    ('Électricité', 'electricite', 'Installation et maintenance électrique', ARRAY['debutant', 'intermediaire', 'avance'], ARRAY['adulte'], ARRAY['électricité', 'installation', 'technique'], true),
    ('Plomberie', 'plomberie', 'Installation et réparation de plomberie', ARRAY['debutant', 'intermediaire'], ARRAY['adulte'], ARRAY['plomberie', 'installation', 'eau'], true),
    ('Mécanique Auto', 'mecanique-auto', 'Réparation et maintenance automobile', ARRAY['debutant', 'intermediaire', 'avance'], ARRAY['adulte'], ARRAY['mécanique', 'auto', 'réparation'], true),
    ('Soudure', 'soudure', 'Techniques de soudure et métallurgie', ARRAY['debutant', 'intermediaire'], ARRAY['adulte'], ARRAY['soudure', 'métal', 'technique'], false),
    
    -- Métiers de service
    ('Coiffure', 'coiffure', 'Techniques de coiffure et styling', ARRAY['debutant', 'intermediaire', 'avance'], ARRAY['adolescent', 'adulte'], ARRAY['coiffure', 'beauté', 'styling'], true),
    ('Esthétique', 'esthetique', 'Soins esthétiques et beauté', ARRAY['debutant', 'intermediaire'], ARRAY['adolescent', 'adulte'], ARRAY['esthétique', 'beauté', 'soins'], true),
    ('Couture', 'couture', 'Techniques de couture et confection', ARRAY['debutant', 'intermediaire', 'avance'], ARRAY['adolescent', 'adulte'], ARRAY['couture', 'confection', 'textile'], true),
    
    -- Formation professionnelle
    ('Comptabilité', 'comptabilite', 'Bases de la comptabilité d''entreprise', ARRAY['debutant', 'intermediaire'], ARRAY['adulte'], ARRAY['comptabilité', 'finance', 'entreprise'], true),
    ('Secrétariat', 'secretariat', 'Techniques de secrétariat et administration', ARRAY['debutant', 'intermediaire'], ARRAY['adulte'], ARRAY['secrétariat', 'administration', 'bureau'], false),
    ('Vente et Commerce', 'vente-commerce', 'Techniques de vente et relation client', ARRAY['debutant', 'intermediaire'], ARRAY['adulte'], ARRAY['vente', 'commerce', 'client'], true)
) AS subject_data(name, slug, description, level_tags, age_groups, keywords, is_popular)
WHERE c.slug = 'metiers-artisanat'
ON CONFLICT (slug) DO NOTHING;

-- 7. CUISINE
INSERT INTO public.subjects (category_id, name, slug, description, level_tags, age_groups, keywords, is_popular) 
SELECT 
    c.id,
    subject_data.name,
    subject_data.slug,
    subject_data.description,
    subject_data.level_tags,
    subject_data.age_groups,
    subject_data.keywords,
    subject_data.is_popular
FROM public.categories c,
(VALUES 
    -- Cuisine ivoirienne
    ('Cuisine Ivoirienne Traditionnelle', 'cuisine-ivoirienne-traditionnelle', 'Plats traditionnels de Côte d''Ivoire', ARRAY['debutant', 'intermediaire'], ARRAY['adolescent', 'adulte'], ARRAY['ivoirien', 'tradition', 'attiéké'], true),
    ('Pâtisserie Ivoirienne', 'patisserie-ivoirienne', 'Desserts et pâtisseries locales', ARRAY['intermediaire'], ARRAY['adolescent', 'adulte'], ARRAY['pâtisserie', 'dessert', 'ivoirien'], false),
    
    -- Cuisine internationale
    ('Cuisine Française', 'cuisine-francaise', 'Art culinaire français', ARRAY['intermediaire', 'avance'], ARRAY['adulte'], ARRAY['français', 'gastronomie', 'technique'], false),
    ('Cuisine Italienne', 'cuisine-italienne', 'Spécialités italiennes et pâtes', ARRAY['debutant', 'intermediaire'], ARRAY['adolescent', 'adulte'], ARRAY['italien', 'pâtes', 'pizza'], true),
    ('Cuisine Asiatique', 'cuisine-asiatique', 'Saveurs d''Asie - Chinois, Thaï, Japonais', ARRAY['intermediaire'], ARRAY['adulte'], ARRAY['asiatique', 'wok', 'épices'], false),
    
    -- Spécialisations
    ('Pâtisserie', 'patisserie', 'Art de la pâtisserie et desserts', ARRAY['debutant', 'intermediaire', 'avance'], ARRAY['adolescent', 'adulte'], ARRAY['pâtisserie', 'gâteau', 'sucré'], true),
    ('Boulangerie', 'boulangerie', 'Fabrication de pain et viennoiseries', ARRAY['intermediaire', 'avance'], ARRAY['adulte'], ARRAY['boulangerie', 'pain', 'pétrissage'], false),
    ('Cuisine Végétarienne', 'cuisine-vegetarienne', 'Cuisine sans viande et équilibrée', ARRAY['debutant', 'intermediaire'], ARRAY['adolescent', 'adulte'], ARRAY['végétarien', 'légumes', 'santé'], false),
    
    -- Techniques culinaires
    ('Techniques de Base', 'techniques-de-base', 'Techniques culinaires fondamentales', ARRAY['debutant'], ARRAY['adolescent', 'adulte'], ARRAY['base', 'technique', 'fondamentaux'], true),
    ('Cuisine Rapide', 'cuisine-rapide', 'Repas rapides et équilibrés', ARRAY['debutant'], ARRAY['adolescent', 'adulte'], ARRAY['rapide', 'équilibré', 'pratique'], true),
    ('Art de la Table', 'art-de-la-table', 'Présentation et service à table', ARRAY['intermediaire'], ARRAY['adulte'], ARRAY['présentation', 'service', 'élégance'], false)
) AS subject_data(name, slug, description, level_tags, age_groups, keywords, is_popular)
WHERE c.slug = 'cuisine'
ON CONFLICT (slug) DO NOTHING;

-- 8. ENTREPRENEURIAT
INSERT INTO public.subjects (category_id, name, slug, description, level_tags, age_groups, keywords, is_popular) 
SELECT 
    c.id,
    subject_data.name,
    subject_data.slug,
    subject_data.description,
    subject_data.level_tags,
    subject_data.age_groups,
    subject_data.keywords,
    subject_data.is_popular
FROM public.categories c,
(VALUES 
    -- Création d'entreprise
    ('Création d''Entreprise', 'creation-entreprise', 'Guide complet pour créer son entreprise', ARRAY['debutant', 'intermediaire'], ARRAY['adulte'], ARRAY['création', 'entreprise', 'startup'], true),
    ('Business Plan', 'business-plan', 'Élaboration d''un business plan efficace', ARRAY['intermediaire'], ARRAY['adulte'], ARRAY['business plan', 'stratégie', 'financement'], true),
    ('Étude de Marché', 'etude-de-marche', 'Techniques d''analyse de marché', ARRAY['intermediaire'], ARRAY['adulte'], ARRAY['marché', 'analyse', 'concurrence'], false),
    
    -- Gestion d'entreprise
    ('Gestion Financière', 'gestion-financiere', 'Gestion des finances d''entreprise', ARRAY['intermediaire', 'avance'], ARRAY['adulte'], ARRAY['finance', 'gestion', 'comptabilité'], true),
    ('Management d''Équipe', 'management-equipe', 'Leadership et gestion d''équipe', ARRAY['intermediaire', 'avance'], ARRAY['adulte'], ARRAY['management', 'leadership', 'équipe'], true),
    ('Gestion de Projet', 'gestion-de-projet', 'Méthodologies de gestion de projet', ARRAY['intermediaire'], ARRAY['adulte'], ARRAY['projet', 'planning', 'méthode'], false),
    
    -- Marketing et Communication
    ('Marketing Digital', 'marketing-digital', 'Stratégies marketing en ligne', ARRAY['debutant', 'intermediaire'], ARRAY['adulte'], ARRAY['marketing', 'digital', 'en ligne'], true),
    ('Réseaux Sociaux Pro', 'reseaux-sociaux-pro', 'Utilisation professionnelle des réseaux sociaux', ARRAY['debutant', 'intermediaire'], ARRAY['adulte'], ARRAY['réseaux sociaux', 'professionnel', 'communication'], true),
    ('Communication d''Entreprise', 'communication-entreprise', 'Stratégies de communication', ARRAY['intermediaire'], ARRAY['adulte'], ARRAY['communication', 'stratégie', 'image'], false),
    
    -- E-commerce et numérique
    ('E-commerce', 'e-commerce', 'Création et gestion de boutique en ligne', ARRAY['intermediaire'], ARRAY['adulte'], ARRAY['e-commerce', 'boutique', 'vente en ligne'], true),
    ('Dropshipping', 'dropshipping', 'Modèle commercial dropshipping', ARRAY['debutant', 'intermediaire'], ARRAY['adulte'], ARRAY['dropshipping', 'e-commerce', 'logistique'], false),
    
    -- Spécialisations sectorielles
    ('Agrobusiness', 'agrobusiness', 'Entrepreneuriat dans l''agriculture', ARRAY['intermediaire'], ARRAY['adulte'], ARRAY['agriculture', 'agrobusiness', 'rural'], true),
    ('Entrepreneuriat Social', 'entrepreneuriat-social', 'Entreprises à impact social', ARRAY['intermediaire'], ARRAY['adulte'], ARRAY['social', 'impact', 'société'], false),
    ('Franchise', 'franchise', 'Développement en franchise', ARRAY['avance'], ARRAY['adulte'], ARRAY['franchise', 'réseau', 'expansion'], false)
) AS subject_data(name, slug, description, level_tags, age_groups, keywords, is_popular)
WHERE c.slug = 'entrepreneuriat'
ON CONFLICT (slug) DO NOTHING;

-- VILLES SUPPLÉMENTAIRES DE CÔTE D'IVOIRE
INSERT INTO public.cities (name, region, is_major) VALUES
    -- Autres grandes villes
    ('Sassandra', 'Bas-Sassandra', false),
    ('Soubré', 'Nawa', false),
    ('Odienné', 'Kabadougou', false),
    ('Bondoukou', 'Gontougo', false),
    ('Abengourou', 'Indénié-Djuablin', false),
    ('Agboville', 'Agnéby-Tiassa', false),
    ('Grand-Bassam', 'Sud-Comoé', false),
    ('Jacqueville', 'Grands-Ponts', false),
    ('Tiassalé', 'Agnéby-Tiassa', false),
    ('Adzopé', 'La Mé', false),
    ('Dabou', 'Grands-Ponts', false),
    ('Grand-Lahou', 'Grands-Ponts', false),
    ('Issia', 'Haut-Sassandra', false),
    ('Vavoua', 'Haut-Sassandra', false),
    ('Zuénoula', 'Marahoué', false),
    ('Séguéla', 'Worodougou', false),
    ('Ferkessédougou', 'Tchologo', false),
    ('Boundiali', 'Bagoué', false),
    ('Tengréla', 'Poro', false),
    ('Katiola', 'Hambol', false),
    ('Dabakala', 'Hambol', false),
    ('Béoumi', 'Gbêkê', false),
    ('Sakassou', 'Gbêkê', false),
    ('Toumodi', 'Bélier', false),
    ('Tiébissou', 'Bélier', false),
    ('M''Bahiakro', 'Iffou', false),
    ('Daoukro', 'Iffou', false),
    ('Bongouanou', 'Moronou', false),
    ('Arrah', 'Moronou', false)
ON CONFLICT DO NOTHING;

-- BADGES SUPPLÉMENTAIRES POUR GAMIFICATION
INSERT INTO public.badges (name, description, icon, color, category, requirements, points_value) VALUES
    -- Badges d'apprentissage
    ('Explorateur', 'Premier cours suivi avec succès', 'MapPin', '#3B82F6', 'milestone', '{"first_course": true}', 5),
    ('Persévérant', '5 sessions complétées', 'Target', '#F59E0B', 'learning', '{"sessions_completed": 5}', 25),
    ('Déterminé', '25 sessions complétées', 'Zap', '#EF4444', 'learning', '{"sessions_completed": 25}', 75),
    ('Champion', '50 sessions complétées', 'Crown', '#8B5CF6', 'learning', '{"sessions_completed": 50}', 150),
    ('Maître Apprenant', '100 sessions complétées', 'Award', '#F59E0B', 'learning', '{"sessions_completed": 100}', 300),
    
    -- Badges d'enseignement
    ('Nouveau Mentor', 'Première session enseignée', 'Users', '#10B981', 'teaching', '{"sessions_taught": 1}', 15),
    ('Formateur Actif', '10 sessions enseignées', 'UserCheck', '#10B981', 'teaching', '{"sessions_taught": 10}', 60),
    ('Expert Reconnu', '25 avis 5 étoiles reçus', 'Star', '#F59E0B', 'teaching', '{"five_star_reviews": 25}', 120),
    ('Mentor Étoile', '100 heures enseignées', 'Clock', '#06B6D4', 'teaching', '{"hours_taught": 100}', 250),
    ('Grand Maître', '500 heures enseignées', 'Gem', '#8B5CF6', 'teaching', '{"hours_taught": 500}', 500),
    
    -- Badges d'engagement
    ('Régulier', '7 jours d''activité consécutifs', 'Calendar', '#10B981', 'engagement', '{"consecutive_days": 7}', 30),
    ('Fidèle', '30 jours d''activité consécutifs', 'CalendarCheck', '#3B82F6', 'engagement', '{"consecutive_days": 30}', 100),
    ('Communicateur', '50 messages envoyés', 'MessageSquare', '#06B6D4', 'engagement', '{"messages_sent": 50}', 40),
    ('Partageur', '10 ressources partagées', 'Share2', '#8B5CF6', 'engagement', '{"resources_shared": 10}', 50),
    
    -- Badges spéciaux
    ('Polyglotte', 'Cours dans 3 langues différentes', 'Globe', '#10B981', 'learning', '{"different_languages": 3}', 80),
    ('Touche-à-tout', 'Cours dans 5 catégories différentes', 'Grid3x3', '#F59E0B', 'learning', '{"different_categories": 5}', 100),
    ('Early Bird', 'Cours avant 8h du matin', 'Sunrise', '#F59E0B', 'engagement', '{"early_sessions": 1}', 20),
    ('Night Owl', 'Cours après 20h', 'Moon', '#8B5CF6', 'engagement', '{"late_sessions": 1}', 20)
ON CONFLICT DO NOTHING;
