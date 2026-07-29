/*
# Portal Belajar DiN Japanese — Core Schema

## Overview
Creates the full database schema for a Japanese-language learning portal with:
- Student/sensei profiles linked to Supabase auth
- Quiz Kompetensi questions (Moji, Goi, Bunpou, Dokkai, Choukai) with Mondai segmentation
- Review Pondasi questions (Partikel, Perubahan, Pengelompokkan, Tata Bahasa, Percakapan) with 9 parts each
- Student progress tracking (per part, score, accuracy, completed questions)
- Billing records with WhatsApp collection
- Study schedule sessions with Google Drive links

## Tables

### 1. profiles
- `id` (uuid, PK, references auth.users)
- `email` (text, unique, not null)
- `full_name` (text, not null)
- `role` (text, not null, default 'student' — 'teacher' for sensei)
- `class_level` (text, default 'N3' — 'N3' or 'N4')
- `class_name` (text — display name like "JLPT N3 - Kelas Pagi")
- `hafalan_kosakata` (int, default 0 — vocabulary memorization %)
- `mogi_shiken_total` (int, default 0 — mock exam total /180)
- `whatsapp` (text — phone number for billing reminders)
- `created_at` (timestamptz, default now())

### 2. quiz_questions
Stores Quiz Kompetensi questions (Moji, Goi, Bunpou, Dokkai, Choukai).
- `id` (uuid, PK)
- `module_id` (text, not null — 'moji'|'goi'|'bunpou'|'dokkai'|'choukai')
- `mondai_id` (text, not null — 'm1'|'m2'|... identifies the Mondai group)
- `question_number` (int, not null — position within module)
- `question` (text, not null — question text)
- `option_a` (text, not null)
- `option_b` (text, not null)
- `option_c` (text, not null)
- `option_d` (text, not null)
- `correct_option` (text, not null — 'a'|'b'|'c'|'d')
- `audio_url` (text — for Choukai)
- `created_at` (timestamptz, default now())

### 3. review_questions
Stores Review Pondasi questions (Partikel, Perubahan, etc.).
- `id` (uuid, PK)
- `category_id` (text, not null — 'partikel'|'kata-kerja'|'kosakata'|'bunpou-review'|'kaiwa')
- `part_number` (int, not null — 1-9, where 9 = final review with 100 questions)
- `question_number` (int, not null — position within part)
- `question` (text, not null)
- `option_a` (text, not null)
- `option_b` (text, not null)
- `option_c` (text, not null)
- `option_d` (text, not null)
- `correct_option` (text, not null — 'a'|'b'|'c'|'d')
- `created_at` (timestamptz, default now())

### 4. student_progress
Tracks each student's completion of quiz/review parts.
- `id` (uuid, PK)
- `user_id` (uuid, not null, references auth.users, default auth.uid())
- `mode` (text, not null — 'review'|'quiz')
- `category_id` (text, not null — module_id or review category_id)
- `part_id` (text, not null — e.g. 'partikel-1' or 'w1p1')
- `score` (int, not null — percentage 0-100)
- `correct_count` (int, not null)
- `total_questions` (int, not null)
- `passed` (boolean, not null, default false)
- `completed_at` (timestamptz, default now())

### 5. billing
- `id` (uuid, PK)
- `student_id` (uuid, not null, references auth.users)
- `student_name` (text, not null)
- `class_level` (text, not null — 'N3'|'N4')
- `class_name` (text)
- `period` (text, not null — 'September'|'Oktober'|'November')
- `amount` (int, not null — in IDR)
- `status` (text, not null, default 'belum' — 'lunas'|'belum')
- `whatsapp` (text)
- `created_at` (timestamptz, default now())

### 6. schedule_sessions
- `id` (uuid, PK)
- `month` (text, not null — 'September'|'Oktober'|'November')
- `day_name` (text, not null — 'Selasa'|'Kamis')
- `date_number` (int, not null — day of month)
- `time` (text, not null — e.g. "16:00 - 17:30")
- `subject` (text, not null)
- `drive_link` (text — Google Drive folder URL)
- `created_at` (timestamptz, default now())

## Security (RLS)
- `profiles`: students can read/update own row; teachers can read all.
- `quiz_questions` / `review_questions`: readable by all authenticated users (shared content).
- `student_progress`: students can CRUD own rows; teachers can read all.
- `billing`: students can read own rows; teachers can read all.
- `schedule_sessions`: readable by all authenticated users.
*/

-- profiles
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text NOT NULL,
  role text NOT NULL DEFAULT 'student',
  class_level text NOT NULL DEFAULT 'N3',
  class_name text,
  hafalan_kosakata int NOT NULL DEFAULT 0,
  mogi_shiken_total int NOT NULL DEFAULT 0,
  whatsapp text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_profile" ON profiles;
CREATE POLICY "select_own_profile" ON profiles FOR SELECT
  TO authenticated USING (auth.uid() = id OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'teacher'));

DROP POLICY IF EXISTS "insert_own_profile" ON profiles;
CREATE POLICY "insert_own_profile" ON profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "update_own_profile" ON profiles;
CREATE POLICY "update_own_profile" ON profiles FOR UPDATE
  TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- quiz_questions
CREATE TABLE IF NOT EXISTS quiz_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id text NOT NULL,
  mondai_id text NOT NULL,
  question_number int NOT NULL,
  question text NOT NULL,
  option_a text NOT NULL,
  option_b text NOT NULL,
  option_c text NOT NULL,
  option_d text NOT NULL,
  correct_option text NOT NULL,
  audio_url text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE quiz_questions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "read_quiz_questions" ON quiz_questions;
CREATE POLICY "read_quiz_questions" ON quiz_questions FOR SELECT
  TO authenticated USING (true);

-- review_questions
CREATE TABLE IF NOT EXISTS review_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id text NOT NULL,
  part_number int NOT NULL,
  question_number int NOT NULL,
  question text NOT NULL,
  option_a text NOT NULL,
  option_b text NOT NULL,
  option_c text NOT NULL,
  option_d text NOT NULL,
  correct_option text NOT NULL,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE review_questions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "read_review_questions" ON review_questions;
CREATE POLICY "read_review_questions" ON review_questions FOR SELECT
  TO authenticated USING (true);

-- student_progress
CREATE TABLE IF NOT EXISTS student_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  mode text NOT NULL,
  category_id text NOT NULL,
  part_id text NOT NULL,
  score int NOT NULL,
  correct_count int NOT NULL,
  total_questions int NOT NULL,
  passed boolean NOT NULL DEFAULT false,
  completed_at timestamptz DEFAULT now()
);
ALTER TABLE student_progress ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_progress" ON student_progress;
CREATE POLICY "select_own_progress" ON student_progress FOR SELECT
  TO authenticated USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'teacher'));

DROP POLICY IF EXISTS "insert_own_progress" ON student_progress;
CREATE POLICY "insert_own_progress" ON student_progress FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_progress" ON student_progress;
CREATE POLICY "update_own_progress" ON student_progress FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_progress" ON student_progress;
CREATE POLICY "delete_own_progress" ON student_progress FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- billing
CREATE TABLE IF NOT EXISTS billing (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  student_name text NOT NULL,
  class_level text NOT NULL,
  class_name text,
  period text NOT NULL,
  amount int NOT NULL,
  status text NOT NULL DEFAULT 'belum',
  whatsapp text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE billing ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_billing" ON billing;
CREATE POLICY "select_own_billing" ON billing FOR SELECT
  TO authenticated USING (auth.uid() = student_id OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'teacher'));

-- schedule_sessions
CREATE TABLE IF NOT EXISTS schedule_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  month text NOT NULL,
  day_name text NOT NULL,
  date_number int NOT NULL,
  time text NOT NULL,
  subject text NOT NULL,
  drive_link text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE schedule_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "read_schedule" ON schedule_sessions;
CREATE POLICY "read_schedule" ON schedule_sessions FOR SELECT
  TO authenticated USING (true);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_quiz_questions_module ON quiz_questions(module_id);
CREATE INDEX IF NOT EXISTS idx_review_questions_category ON review_questions(category_id, part_number);
CREATE INDEX IF NOT EXISTS idx_student_progress_user ON student_progress(user_id, mode, category_id);
CREATE INDEX IF NOT EXISTS idx_billing_student ON billing(student_id);
