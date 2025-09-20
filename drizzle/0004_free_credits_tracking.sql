-- Add fields for tracking free credits and preventing reuse
ALTER TABLE "user" 
ADD COLUMN "hasReceivedFreeCredits" boolean DEFAULT false NOT NULL,
ADD COLUMN "previousEmailsForFreeCredits" jsonb DEFAULT '[]' NOT NULL;

-- Update existing users to mark them as having received free credits
-- and update their credits from 20 to 50
UPDATE "user" 
SET 
  "hasReceivedFreeCredits" = true,
  "credits" = 50,
  "previousEmailsForFreeCredits" = to_jsonb(array["email"])
WHERE "credits" = 20;