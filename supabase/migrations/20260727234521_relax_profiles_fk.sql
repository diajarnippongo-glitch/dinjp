/*
# Relax profiles FK for seed data

## Overview
The profiles table has a PK/FK on id referencing auth.users.
To seed mock student profiles for demo (before real students sign up),
we relax the constraint to allow arbitrary UUIDs.

## Changes
- Drop the existing FK constraint on profiles.id
- Re-add WITHOUT the FK reference (keeps the column as PK, loses the auth.users link)
*/

ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;
