/*
# Relax billing FK for seed data

## Overview
The billing table has a foreign key on student_id referencing auth.users.
To seed mock billing records for demo purposes (before real students sign up),
we relax the FK constraint to allow arbitrary UUIDs.

## Changes
- Drop the existing FK constraint on billing.student_id
- Re-add WITHOUT the FK reference (keeps the column, loses the auth.users link)
- This allows seed billing rows with mock student UUIDs
*/

ALTER TABLE billing DROP CONSTRAINT IF EXISTS billing_student_id_fkey;
