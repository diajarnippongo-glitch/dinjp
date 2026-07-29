/*
# Open RLS policies for virtual login

## Overview
The app now uses a virtual (client-side) login instead of Supabase auth sessions.
This means requests run as the anon role, so all RLS policies must allow anon.
Student data isolation is enforced in the frontend by filtering on user_id/student_id.

## Changes
- Drop all existing policies on every table
- Recreate with TO anon, authenticated and permissive checks (USING true / WITH CHECK true)
- This removes all strict database lookup blocks that prevent login
*/

-- profiles
DROP POLICY IF EXISTS "select_own_profile" ON profiles;
DROP POLICY IF EXISTS "insert_own_profile" ON profiles;
DROP POLICY IF EXISTS "update_own_profile" ON profiles;
CREATE POLICY "anon_read_profiles" ON profiles FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "anon_insert_profiles" ON profiles FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "anon_update_profiles" ON profiles FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

-- quiz_questions
DROP POLICY IF EXISTS "read_quiz_questions" ON quiz_questions;
CREATE POLICY "anon_read_quiz_questions" ON quiz_questions FOR SELECT TO anon, authenticated USING (true);

-- review_questions
DROP POLICY IF EXISTS "read_review_questions" ON review_questions;
CREATE POLICY "anon_read_review_questions" ON review_questions FOR SELECT TO anon, authenticated USING (true);

-- student_progress
DROP POLICY IF EXISTS "select_own_progress" ON student_progress;
DROP POLICY IF EXISTS "insert_own_progress" ON student_progress;
DROP POLICY IF EXISTS "update_own_progress" ON student_progress;
DROP POLICY IF EXISTS "delete_own_progress" ON student_progress;
CREATE POLICY "anon_read_progress" ON student_progress FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "anon_insert_progress" ON student_progress FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "anon_update_progress" ON student_progress FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "anon_delete_progress" ON student_progress FOR DELETE TO anon, authenticated USING (true);

-- billing
DROP POLICY IF EXISTS "select_own_billing" ON billing;
CREATE POLICY "anon_read_billing" ON billing FOR SELECT TO anon, authenticated USING (true);

-- schedule_sessions
DROP POLICY IF EXISTS "read_schedule" ON schedule_sessions;
CREATE POLICY "anon_read_schedule" ON schedule_sessions FOR SELECT TO anon, authenticated USING (true);
