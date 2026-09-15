-- 1. Remove the orphaned profile row with NULL id
DELETE FROM profiles WHERE id IS NULL;

-- 2. Add primary key on profiles.id
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'profiles'::regclass AND conname = 'profiles_pkey'
  ) THEN
    ALTER TABLE profiles ADD CONSTRAINT profiles_pkey PRIMARY KEY (id);
  END IF;
END $$;

-- 3. Clean up orphaned rows before adding FK
DELETE FROM billing
WHERE student_id IS NOT NULL
  AND student_id NOT IN (SELECT id FROM profiles);

DELETE FROM student_progress
WHERE user_id IS NOT NULL
  AND user_id NOT IN (SELECT id FROM profiles);

-- 4. Add FK: billing.student_id -> profiles.id
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'billing'::regclass AND conname = 'billing_student_id_fkey'
  ) THEN
    ALTER TABLE billing
      ADD CONSTRAINT billing_student_id_fkey
      FOREIGN KEY (student_id) REFERENCES profiles(id) ON DELETE CASCADE;
  END IF;
END $$;

-- 5. Add FK: student_progress.user_id -> profiles.id
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'student_progress'::regclass AND conname = 'student_progress_user_id_fkey'
  ) THEN
    ALTER TABLE student_progress
      ADD CONSTRAINT student_progress_user_id_fkey
      FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;
  END IF;
END $$;
