-- Update existing users to have 50 credits instead of 20
-- This migration ensures all users have the correct default credits

UPDATE "user" SET credits = 50 WHERE credits = 20 AND hasReceivedFreeCredits = false;

-- Also update users who should have received free credits but have wrong amount
UPDATE "user" SET credits = 50, hasReceivedFreeCredits = true WHERE credits < 50 AND hasReceivedFreeCredits = false;