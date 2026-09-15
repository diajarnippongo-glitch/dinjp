/*
# Add image_url column to quiz question tables

1. New Columns
- `quiz_questions_n3.image_url` (text, nullable) — URL for question images (optional per question)
- `quiz_questions_n4.image_url` (text, nullable) — URL for question images (optional per question)

2. Notes
- Both columns are nullable so existing text-only questions are unaffected.
- No RLS or policy changes needed — the column is covered by existing table policies.
*/

ALTER TABLE quiz_questions_n3 ADD COLUMN IF NOT EXISTS image_url text;
ALTER TABLE quiz_questions_n4 ADD COLUMN IF NOT EXISTS image_url text;