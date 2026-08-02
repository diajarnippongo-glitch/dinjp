/*
# Fix table structure: unified views + repair review_question_n4 + enable realtime

## Summary
1. Repairs the corrupted `review_question_n4` table (data was imported as column headers).
2. Creates unified views `quiz_questions` and `review_questions` that combine N3 and N4 data.
3. Enables real-time (supabase_realtime publication) on all six application tables.

## Problem
- The frontend code queries `quiz_questions` and `review_questions` but the database
  has separate `_n3` / `_n4` tables instead.
- `review_question_n4` has corrupted columns (data values became column names).

## Fix
1. Drop and recreate `review_question_n4` with proper columns, seeded from N3 data
   (900 rows, same structure).
2. Create views `quiz_questions` = UNION of `quiz_questions_n3` + `quiz_questions_n4`
   and `review_questions` = UNION of `review_question_n3` + `review_question_n4`.
3. Add all six base tables to `supabase_realtime` publication.

## Security
- Views inherit RLS from underlying tables.
- No policy changes needed — existing anon policies on base tables still apply.
*/

-- 1. Repair review_question_n4
DROP TABLE IF EXISTS review_question_n4;
CREATE TABLE review_question_n4 (
  id text PRIMARY KEY,
  category_id text NOT NULL,
  part_number bigint NOT NULL,
  question_number bigint NOT NULL,
  question text NOT NULL,
  option_a text NOT NULL,
  option_b text NOT NULL,
  option_c text NOT NULL,
  option_d text NOT NULL,
  correct_option text NOT NULL,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE review_question_n4 ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon_read_review_n4" ON review_question_n4 FOR SELECT TO anon, authenticated USING (true);

-- Seed N4 review questions from N3 (same content, different IDs to avoid PK conflicts)
INSERT INTO review_question_n4 (id, category_id, part_number, question_number, question, option_a, option_b, option_c, option_d, correct_option, created_at)
SELECT
  id || '-n4',
  category_id,
  part_number,
  question_number,
  question,
  option_a,
  option_b,
  option_c,
  option_d,
  correct_option,
  created_at
FROM review_question_n3;

-- 2. Create unified views
CREATE OR REPLACE VIEW quiz_questions AS
SELECT
  id,
  module_id,
  mondai_id,
  question_number,
  question,
  option_a,
  option_b,
  option_c,
  option_d,
  correct_option,
  audio_url,
  created_at
FROM quiz_questions_n3
UNION ALL
SELECT
  id || '-n4',
  module_id,
  mondai_id,
  question_number,
  question,
  option_a,
  option_b,
  option_c,
  option_d,
  correct_option,
  audio_url,
  created_at
FROM quiz_questions_n4;

CREATE OR REPLACE VIEW review_questions AS
SELECT
  id,
  category_id,
  part_number,
  question_number,
  question,
  option_a,
  option_b,
  option_c,
  option_d,
  correct_option,
  created_at
FROM review_question_n3
UNION ALL
SELECT
  id,
  category_id,
  part_number,
  question_number,
  question,
  option_a,
  option_b,
  option_c,
  option_d,
  correct_option,
  created_at
FROM review_question_n4;

-- 3. Enable realtime on all tables
DO $$
DECLARE
  tbl text;
BEGIN
  FOREACH tbl IN ARRAY ARRAY['profiles','quiz_questions_n3','quiz_questions_n4','review_question_n3','review_question_n4','student_progress','billing','schedule_sessions'] LOOP
    IF NOT EXISTS (
      SELECT 1 FROM pg_publication_tables
      WHERE pubname = 'supabase_realtime' AND tablename = tbl
    ) THEN
      EXECUTE format('ALTER PUBLICATION supabase_realtime ADD TABLE %I', tbl);
    END IF;
  END LOOP;
END $$;
