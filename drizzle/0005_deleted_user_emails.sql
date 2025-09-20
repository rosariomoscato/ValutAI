-- Create table to track deleted user emails for free credits prevention
CREATE TABLE "deleted_user_emails" (
  "id" text PRIMARY KEY NOT NULL,
  "email" text NOT NULL,
  "hasReceivedFreeCredits" boolean DEFAULT false NOT NULL,
  "deletedAt" timestamp DEFAULT now() NOT NULL
);

-- Add unique constraint on email
ALTER TABLE "deleted_user_emails" ADD CONSTRAINT "deleted_user_emails_email_unique" UNIQUE("email");