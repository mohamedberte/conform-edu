-- Fonction RPC pour créer un cours en contournant les politiques RLS
CREATE OR REPLACE FUNCTION create_course_for_expert(
  p_expert_id UUID,
  p_subject_id UUID,
  p_title TEXT,
  p_description TEXT,
  p_course_type TEXT,
  p_level TEXT,
  p_duration_minutes INTEGER,
  p_max_students INTEGER,
  p_price_per_hour INTEGER,
  p_prerequisites TEXT[],
  p_objectives TEXT[],
  p_materials_needed TEXT[],
  p_location_type TEXT
)
RETURNS TABLE(id UUID, expert_id UUID, subject_id UUID, title TEXT, description TEXT, course_type TEXT, level TEXT, duration_minutes INTEGER, max_students INTEGER, price_per_hour INTEGER, prerequisites TEXT[], objectives TEXT[], materials_needed TEXT[], location_type TEXT, is_active BOOLEAN, created_at TIMESTAMPTZ, updated_at TIMESTAMPTZ)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_course_id UUID;
BEGIN
  -- Vérifier que l'expert existe
  IF NOT EXISTS (SELECT 1 FROM expert_profiles WHERE expert_profiles.id = p_expert_id) THEN
    RAISE EXCEPTION 'Expert profile not found';
  END IF;

  -- Vérifier que le sujet existe
  IF NOT EXISTS (SELECT 1 FROM subjects WHERE subjects.id = p_subject_id) THEN
    RAISE EXCEPTION 'Subject not found';
  END IF;

  -- Insérer le nouveau cours
  INSERT INTO courses (
    expert_id,
    subject_id,
    title,
    description,
    course_type,
    level,
    duration_minutes,
    max_students,
    price_per_hour,
    prerequisites,
    objectives,
    materials_needed,
    location_type,
    is_active,
    created_at,
    updated_at
  ) VALUES (
    p_expert_id,
    p_subject_id,
    p_title,
    p_description,
    p_course_type,
    p_level,
    p_duration_minutes,
    p_max_students,
    p_price_per_hour,
    p_prerequisites,
    p_objectives,
    p_materials_needed,
    p_location_type,
    true,
    NOW(),
    NOW()
  ) RETURNING courses.id INTO new_course_id;

  -- Retourner le cours créé
  RETURN QUERY
  SELECT 
    courses.id,
    courses.expert_id,
    courses.subject_id,
    courses.title,
    courses.description,
    courses.course_type,
    courses.level,
    courses.duration_minutes,
    courses.max_students,
    courses.price_per_hour,
    courses.prerequisites,
    courses.objectives,
    courses.materials_needed,
    courses.location_type,
    courses.is_active,
    courses.created_at,
    courses.updated_at
  FROM courses
  WHERE courses.id = new_course_id;
END;
$$;

-- Accorder les permissions à tous les utilisateurs authentifiés
GRANT EXECUTE ON FUNCTION create_course_for_expert TO authenticated;

-- Alternative: Politique RLS plus permissive pour la table courses
-- Permettre aux experts de créer leurs propres cours
CREATE POLICY "Experts can create their own courses" ON courses
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM expert_profiles 
      WHERE expert_profiles.id = courses.expert_id 
      AND expert_profiles.user_id = auth.uid()
    )
  );

-- Permettre aux experts de voir leurs propres cours
CREATE POLICY "Experts can view their own courses" ON courses
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM expert_profiles 
      WHERE expert_profiles.id = courses.expert_id 
      AND expert_profiles.user_id = auth.uid()
    )
  );

-- Permettre aux experts de modifier leurs propres cours
CREATE POLICY "Experts can update their own courses" ON courses
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM expert_profiles 
      WHERE expert_profiles.id = courses.expert_id 
      AND expert_profiles.user_id = auth.uid()
    )
  );

-- Activer RLS sur la table courses si ce n'est pas déjà fait
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
