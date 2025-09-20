-- Fix welcome credits system
-- Change default credits from 50 to 0 for new users
-- This ensures new users start with 0 credits and receive exactly 50 as welcome bonus

-- Update the default value for credits column
ALTER TABLE "user" ALTER COLUMN credits SET DEFAULT 0;

-- Add a comment to document the change
COMMENT ON COLUMN "user"."credits" IS 'Starting credits for new users (0 + 50 welcome bonus)';