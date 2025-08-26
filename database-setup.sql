-- SQL Script pour créer les tables de Conform Edu
-- 🔧 PERSONNALISATION: Exécutez ce script dans l'éditeur SQL de Supabase

-- Extension pour les UUID (si pas déjà activée)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table des profils utilisateurs (complète auth.users)
-- 🎯 Cette table stocke les informations communes à tous les utilisateurs
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    email VARCHAR NOT NULL UNIQUE,
    first_name VARCHAR,
    last_name VARCHAR,
    role VARCHAR DEFAULT 'student' CHECK (role IN ('student', 'teacher', 'admin', 'parent')),
    avatar_url VARCHAR,
    phone VARCHAR,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE
);

-- Table des classes/niveaux
-- 🎯 Stocke les informations sur les classes du lycée
CREATE TABLE IF NOT EXISTS public.classes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR NOT NULL, -- ex: "2nde A", "1ère S1", "Terminale ES"
    level VARCHAR NOT NULL CHECK (level IN ('seconde', 'premiere', 'terminale')),
    specialization VARCHAR, -- ex: "Scientifique", "Économique", "Littéraire"
    academic_year VARCHAR NOT NULL,
    main_teacher_id UUID REFERENCES public.profiles(id),
    max_students INTEGER DEFAULT 35,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Table des profils étudiants (informations spécifiques aux élèves)
-- 🎯 Données spécifiques aux étudiants, reliées aux profils généraux
CREATE TABLE IF NOT EXISTS public.student_profiles (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    student_number VARCHAR UNIQUE NOT NULL,
    date_of_birth DATE,
    address TEXT,
    emergency_contact VARCHAR,
    class_id UUID REFERENCES public.classes(id),
    academic_year VARCHAR NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Table des profils professeurs
-- 🎯 Données spécifiques aux enseignants
CREATE TABLE IF NOT EXISTS public.teacher_profiles (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    employee_number VARCHAR UNIQUE NOT NULL,
    specialization VARCHAR,
    hire_date DATE,
    office_room VARCHAR,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Table des matières
-- 🎯 Liste des matières enseignées dans le lycée
CREATE TABLE IF NOT EXISTS public.subjects (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR NOT NULL, -- ex: "Mathématiques", "Français", "Histoire"
    code VARCHAR UNIQUE NOT NULL, -- ex: "MATH", "FR", "HIST"
    coefficient INTEGER, -- coefficient pour le bac
    color VARCHAR, -- couleur pour l'interface (#hex)
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Table des cours/enseignements
-- 🎯 Relation entre matières, classes et professeurs
CREATE TABLE IF NOT EXISTS public.courses (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    subject_id UUID REFERENCES public.subjects(id) NOT NULL,
    class_id UUID REFERENCES public.classes(id) NOT NULL,
    teacher_id UUID REFERENCES public.teacher_profiles(id) NOT NULL,
    academic_year VARCHAR NOT NULL,
    hours_per_week INTEGER,
    start_date DATE,
    end_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Table des trimestres/périodes
-- 🎯 Découpage de l'année scolaire
CREATE TABLE IF NOT EXISTS public.periods (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR NOT NULL, -- "1er Trimestre", "2ème Trimestre"
    academic_year VARCHAR NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_current BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Table des évaluations
-- 🎯 Contrôles, devoirs, projets...
CREATE TABLE IF NOT EXISTS public.assessments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    course_id UUID REFERENCES public.courses(id) NOT NULL,
    period_id UUID REFERENCES public.periods(id) NOT NULL,
    title VARCHAR NOT NULL,
    type VARCHAR CHECK (type IN ('controle', 'devoir_surveille', 'oral', 'tp', 'projet')),
    date DATE,
    coefficient DECIMAL(3,1) DEFAULT 1.0,
    max_score DECIMAL(5,2) DEFAULT 20.00,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Table des notes
-- 🎯 Notes obtenues par les étudiants aux évaluations
CREATE TABLE IF NOT EXISTS public.grades (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    assessment_id UUID REFERENCES public.assessments(id) NOT NULL,
    student_id UUID REFERENCES public.student_profiles(id) NOT NULL,
    score DECIMAL(5,2),
    absent BOOLEAN DEFAULT FALSE,
    comment TEXT,
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(assessment_id, student_id)
);

-- Table des créneaux horaires
-- 🎯 Définition des heures de cours
CREATE TABLE IF NOT EXISTS public.time_slots (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    slot_number INTEGER, -- 1ère heure, 2ème heure, etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Table de l'emploi du temps
-- 🎯 Planning des cours
CREATE TABLE IF NOT EXISTS public.schedules (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    course_id UUID REFERENCES public.courses(id) NOT NULL,
    day_of_week INTEGER NOT NULL CHECK (day_of_week >= 1 AND day_of_week <= 7), -- 1=Lundi, 7=Dimanche
    time_slot_id UUID REFERENCES public.time_slots(id) NOT NULL,
    classroom VARCHAR,
    effective_date DATE,
    end_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Table des présences
-- 🎯 Suivi de l'assiduité des élèves
CREATE TABLE IF NOT EXISTS public.attendances (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    student_id UUID REFERENCES public.student_profiles(id) NOT NULL,
    schedule_id UUID REFERENCES public.schedules(id) NOT NULL,
    date DATE NOT NULL,
    status VARCHAR CHECK (status IN ('present', 'absent', 'late', 'excused')),
    reason TEXT,
    recorded_by UUID REFERENCES public.teacher_profiles(id),
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(student_id, schedule_id, date)
);

-- ====================================================================
-- FONCTIONS ET TRIGGERS AUTOMATIQUES
-- 🔧 PERSONNALISATION: Modifiez selon vos besoins métier
-- ====================================================================

-- Fonction pour mettre à jour automatiquement updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger pour mettre à jour automatiquement updated_at sur profiles
CREATE TRIGGER update_profiles_updated_at 
    BEFORE UPDATE ON public.profiles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Fonction pour créer automatiquement un profil lors de l'inscription
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, first_name, last_name, role, phone)
    VALUES (
        NEW.id,
        NEW.email,
        NEW.raw_user_meta_data->>'first_name',
        NEW.raw_user_meta_data->>'last_name',
        COALESCE(NEW.raw_user_meta_data->>'role', 'student'),
        NEW.raw_user_meta_data->>'phone'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger pour créer le profil automatiquement
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ====================================================================
-- POLITIQUES DE SÉCURITÉ RLS (Row Level Security)
-- 🔧 PERSONNALISATION: Ajustez les permissions selon vos besoins
-- ====================================================================

-- Activer RLS sur toutes les tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teacher_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.periods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.time_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendances ENABLE ROW LEVEL SECURITY;

-- Politique pour profiles : les utilisateurs peuvent voir et modifier leur propre profil
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- Politique pour student_profiles : les étudiants voient leur profil, les profs voient leurs élèves
CREATE POLICY "Students can view own profile" ON public.student_profiles
    FOR SELECT USING (
        auth.uid() = user_id 
        OR EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() 
            AND role IN ('teacher', 'admin')
        )
    );

-- Politique pour grades : les étudiants voient leurs notes, les profs voient les notes de leurs élèves
CREATE POLICY "Students can view own grades" ON public.grades
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.student_profiles sp
            WHERE sp.id = student_id AND sp.user_id = auth.uid()
        )
        OR EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = auth.uid() AND p.role IN ('teacher', 'admin')
        )
    );

-- Politique pour les matières : lecture pour tous les utilisateurs connectés
CREATE POLICY "Authenticated users can view subjects" ON public.subjects
    FOR SELECT TO authenticated USING (true);

-- Politique pour les classes : lecture pour tous les utilisateurs connectés
CREATE POLICY "Authenticated users can view classes" ON public.classes
    FOR SELECT TO authenticated USING (true);

-- ====================================================================
-- DONNÉES D'EXEMPLE (OPTIONNEL)
-- 🔧 PERSONNALISATION: Supprimez ou modifiez selon vos besoins
-- ====================================================================

-- Insertion des créneaux horaires standards
INSERT INTO public.time_slots (start_time, end_time, slot_number) VALUES
    ('08:00', '09:00', 1),
    ('09:00', '10:00', 2),
    ('10:15', '11:15', 3),
    ('11:15', '12:15', 4),
    ('13:30', '14:30', 5),
    ('14:30', '15:30', 6),
    ('15:45', '16:45', 7),
    ('16:45', '17:45', 8)
ON CONFLICT DO NOTHING;

-- Insertion des matières de base
INSERT INTO public.subjects (name, code, coefficient, color, description) VALUES
    ('Mathématiques', 'MATH', 4, '#3B82F6', 'Mathématiques générales et spécialisées'),
    ('Français', 'FR', 4, '#EF4444', 'Littérature française et expression écrite'),
    ('Histoire-Géographie', 'HIST', 3, '#F59E0B', 'Histoire et géographie'),
    ('Anglais LV1', 'EN', 3, '#10B981', 'Langue vivante anglaise'),
    ('Espagnol LV2', 'ES', 2, '#F97316', 'Langue vivante espagnole'),
    ('Physique-Chimie', 'PC', 4, '#8B5CF6', 'Sciences physiques et chimiques'),
    ('SVT', 'SVT', 3, '#059669', 'Sciences de la Vie et de la Terre'),
    ('Philosophie', 'PHILO', 4, '#6366F1', 'Philosophie (Terminale)'),
    ('EPS', 'EPS', 2, '#EC4899', 'Éducation Physique et Sportive')
ON CONFLICT (code) DO NOTHING;

-- Insertion des périodes pour l'année 2024-2025
INSERT INTO public.periods (name, academic_year, start_date, end_date, is_current) VALUES
    ('1er Trimestre', '2024-2025', '2024-09-02', '2024-12-20', true),
    ('2ème Trimestre', '2024-2025', '2025-01-06', '2025-04-04', false),
    ('3ème Trimestre', '2024-2025', '2025-04-22', '2025-07-04', false)
ON CONFLICT DO NOTHING;

-- Insertion des classes d'exemple
INSERT INTO public.classes (name, level, specialization, academic_year, max_students) VALUES
    ('2nde A', 'seconde', 'Générale', '2024-2025', 35),
    ('2nde B', 'seconde', 'Générale', '2024-2025', 35),
    ('1ère S1', 'premiere', 'Scientifique', '2024-2025', 30),
    ('1ère ES1', 'premiere', 'Économique et Social', '2024-2025', 32),
    ('1ère L1', 'premiere', 'Littéraire', '2024-2025', 28),
    ('Terminale S1', 'terminale', 'Scientifique', '2024-2025', 30),
    ('Terminale ES1', 'terminale', 'Économique et Social', '2024-2025', 32),
    ('Terminale L1', 'terminale', 'Littéraire', '2024-2025', 25)
ON CONFLICT DO NOTHING;
