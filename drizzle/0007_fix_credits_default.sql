-- Fix default credits value and update existing users
-- This migration ensures all users have the correct 50 credit default

-- First, update the existing users to have 50 credits instead of 20
UPDATE "user" 
SET credits = 50, 
    hasReceivedFreeCredits = true,
    updatedAt = NOW()
WHERE credits < 50;

-- Verify the update
SELECT COUNT(*) as users_updated FROM "user" WHERE credits = 50;