CREATE TABLE "dataset" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"fileName" text NOT NULL,
	"fileSize" integer NOT NULL,
	"rowCount" integer NOT NULL,
	"columnMapping" jsonb NOT NULL,
	"status" text DEFAULT 'processing' NOT NULL,
	"errorMessage" text,
	"userId" text NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "model" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"datasetId" text NOT NULL,
	"algorithm" text DEFAULT 'logistic_regression' NOT NULL,
	"hyperparameters" jsonb NOT NULL,
	"accuracy" numeric,
	"precision" numeric,
	"recall" numeric,
	"f1Score" numeric,
	"aucRoc" numeric,
	"brierScore" numeric,
	"featureImportance" jsonb,
	"status" text DEFAULT 'training' NOT NULL,
	"errorMessage" text,
	"trainingTime" integer,
	"userId" text NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "prediction" (
	"id" text PRIMARY KEY NOT NULL,
	"modelId" text NOT NULL,
	"customerSector" text,
	"customerSize" text,
	"discountPercentage" numeric,
	"totalPrice" numeric,
	"deliveryTime" integer,
	"channel" text,
	"salesRep" text,
	"leadSource" text,
	"winProbability" numeric NOT NULL,
	"confidence" numeric NOT NULL,
	"featureContributions" jsonb,
	"recommendations" jsonb,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "quote" (
	"id" text PRIMARY KEY NOT NULL,
	"datasetId" text NOT NULL,
	"customerSector" text,
	"customerSize" text,
	"discountPercentage" numeric,
	"totalPrice" numeric,
	"deliveryTime" integer,
	"channel" text,
	"salesRep" text,
	"leadSource" text,
	"outcome" text NOT NULL,
	"outcomeDate" timestamp,
	"discountAmount" numeric,
	"averageTicket" numeric,
	"responseTime" integer,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "report" (
	"id" text PRIMARY KEY NOT NULL,
	"modelId" text NOT NULL,
	"title" text NOT NULL,
	"content" jsonb NOT NULL,
	"insights" jsonb NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "role" text DEFAULT 'viewer' NOT NULL;--> statement-breakpoint
ALTER TABLE "dataset" ADD CONSTRAINT "dataset_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "model" ADD CONSTRAINT "model_datasetId_dataset_id_fk" FOREIGN KEY ("datasetId") REFERENCES "public"."dataset"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "model" ADD CONSTRAINT "model_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prediction" ADD CONSTRAINT "prediction_modelId_model_id_fk" FOREIGN KEY ("modelId") REFERENCES "public"."model"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quote" ADD CONSTRAINT "quote_datasetId_dataset_id_fk" FOREIGN KEY ("datasetId") REFERENCES "public"."dataset"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "report" ADD CONSTRAINT "report_modelId_model_id_fk" FOREIGN KEY ("modelId") REFERENCES "public"."model"("id") ON DELETE cascade ON UPDATE no action;