/*
# Relax student_progress FK for seed data

## Overview
The student_progress table has a FK on user_id referencing auth.users.
To seed mock progress records for demo (before real students sign up),
we relax the FK constraint to allow arbitrary UUIDs.

## Changes
- Drop the existing FK constraint on student_progress.user_id
- Re-add WITHOUT the FK reference
*/

ALTER TABLE student_progress DROP CONSTRAINT IF EXISTS student_progress_user_id_fkey;
