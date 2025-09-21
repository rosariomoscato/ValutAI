ALTER TABLE "user" ALTER COLUMN "credits" SET DEFAULT 0;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "isAdmin" boolean DEFAULT false NOT NULL;