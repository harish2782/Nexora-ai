-- Nexora AI — PostgreSQL Schema

-- Users
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Resumes
CREATE TABLE IF NOT EXISTS resumes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  extracted_text TEXT,
  uploaded_at TIMESTAMPTZ DEFAULT NOW(),
  parse_status TEXT DEFAULT 'pending' CHECK (parse_status IN ('pending','success','failed','deleted')),
  deletion_status TEXT DEFAULT 'active' CHECK (deletion_status IN ('active','deleted'))
);

-- Canonical skills
CREATE TABLE IF NOT EXISTS skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  canonical_name TEXT UNIQUE NOT NULL,
  category TEXT NOT NULL,
  aliases TEXT[] DEFAULT '{}',
  description TEXT
);

-- Skill graph edges
CREATE TABLE IF NOT EXISTS skill_edges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_skill_id UUID NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
  target_skill_id UUID NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
  relationship_type TEXT NOT NULL CHECK (relationship_type IN ('prerequisite','related','commonly_used_together')),
  rationale TEXT,
  source_note TEXT,
  UNIQUE(source_skill_id, target_skill_id, relationship_type)
);

-- Role profiles
CREATE TABLE IF NOT EXISTS role_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT UNIQUE NOT NULL,
  description TEXT,
  source_note TEXT,
  last_reviewed_at DATE DEFAULT CURRENT_DATE
);

-- Role skill requirements
CREATE TABLE IF NOT EXISTS role_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_profile_id UUID NOT NULL REFERENCES role_profiles(id) ON DELETE CASCADE,
  skill_id UUID NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
  importance TEXT NOT NULL CHECK (importance IN ('required','preferred')),
  UNIQUE(role_profile_id, skill_id)
);

-- Job analyses
CREATE TABLE IF NOT EXISTS job_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  resume_id UUID REFERENCES resumes(id) ON DELETE SET NULL,
  role_profile_id UUID REFERENCES role_profiles(id) ON DELETE SET NULL,
  submitted_job_text TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  analysis_status TEXT DEFAULT 'pending' CHECK (analysis_status IN ('pending','processing','completed','failed')),
  methodology_version TEXT DEFAULT '1.0'
);

-- Skill evidence from analysis
CREATE TABLE IF NOT EXISTS skill_evidence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  analysis_id UUID NOT NULL REFERENCES job_analyses(id) ON DELETE CASCADE,
  skill_id UUID NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
  evidence_text TEXT,
  evidence_type TEXT DEFAULT 'semantic' CHECK (evidence_type IN ('exact','alias','semantic','none')),
  match_status TEXT NOT NULL CHECK (match_status IN ('matched','missing','uncertain')),
  confidence FLOAT DEFAULT 0.0
);

-- Roadmap tasks
CREATE TABLE IF NOT EXISTS roadmap_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  analysis_id UUID NOT NULL REFERENCES job_analyses(id) ON DELETE CASCADE,
  skill_id UUID REFERENCES skills(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  priority INTEGER DEFAULT 5,
  estimated_hours FLOAT DEFAULT 8,
  prerequisites UUID[] DEFAULT '{}',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','in_progress','completed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Project templates
CREATE TABLE IF NOT EXISTS project_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('beginner','intermediate','advanced')),
  suggested_deliverables TEXT[],
  source_note TEXT
);

-- Project → skill mapping
CREATE TABLE IF NOT EXISTS project_skills (
  project_id UUID NOT NULL REFERENCES project_templates(id) ON DELETE CASCADE,
  skill_id UUID NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
  PRIMARY KEY(project_id, skill_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_resumes_user ON resumes(user_id);
CREATE INDEX IF NOT EXISTS idx_analyses_user ON job_analyses(user_id);
CREATE INDEX IF NOT EXISTS idx_evidence_analysis ON skill_evidence(analysis_id);
CREATE INDEX IF NOT EXISTS idx_roadmap_analysis ON roadmap_tasks(analysis_id);
