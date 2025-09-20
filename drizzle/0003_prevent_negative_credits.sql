-- Add database constraint to prevent negative credits
ALTER TABLE "user" ADD CONSTRAINT "user_credits_non_negative" CHECK ("credits" >= 0);