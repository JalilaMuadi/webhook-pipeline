CREATE TABLE "pipelines" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar NOT NULL,
	"processing_type" varchar NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
