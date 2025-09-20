CREATE TABLE "deleted_user_emails" (
	"id" text PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"hasReceivedFreeCredits" boolean DEFAULT false NOT NULL,
	"deletedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "deleted_user_emails_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "credits" SET DEFAULT 50;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "hasReceivedFreeCredits" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "previousEmailsForFreeCredits" jsonb DEFAULT '[]'::jsonb NOT NULL;