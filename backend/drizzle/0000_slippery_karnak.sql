CREATE TYPE "public"."processing_status" AS ENUM('pending', 'processing', 'completed', 'failed');--> statement-breakpoint
CREATE TYPE "public"."generation_mode" AS ENUM('document', 'pasted_text', 'topic');--> statement-breakpoint
CREATE TYPE "public"."note_visibility" AS ENUM('private', 'public');--> statement-breakpoint
CREATE TYPE "public"."quiz_difficulty" AS ENUM('easy', 'medium', 'hard');--> statement-breakpoint
CREATE TYPE "public"."quiz_generation_mode" AS ENUM('note', 'document', 'topic');--> statement-breakpoint
CREATE TYPE "public"."quiz_generation_status" AS ENUM('pending', 'processing', 'completed', 'failed');--> statement-breakpoint
CREATE TYPE "public"."quiz_visibility" AS ENUM('private', 'public');--> statement-breakpoint
CREATE TYPE "public"."quiz_attempt_status" AS ENUM('in_progress', 'submitted', 'abandoned');--> statement-breakpoint
CREATE TYPE "public"."quiz_question_type" AS ENUM('multiple_choice');--> statement-breakpoint
CREATE TYPE "public"."account_status" AS ENUM('active', 'pending_verification', 'suspended');--> statement-breakpoint
CREATE TABLE "document_meta" (
	"internal_id" bigserial PRIMARY KEY NOT NULL,
	"public_id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"user_id" bigint NOT NULL,
	"original_filename" varchar(255) NOT NULL,
	"mime_type" varchar(100) NOT NULL,
	"file_size_bytes" bigint NOT NULL,
	"storage_key" text NOT NULL,
	"checksum_sha256" char(64) NOT NULL,
	"processing_status" "processing_status" DEFAULT 'pending' NOT NULL,
	"processed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "document_meta_public_id_unique" UNIQUE("public_id"),
	CONSTRAINT "document_meta_storage_key_unique" UNIQUE("storage_key")
);
--> statement-breakpoint
CREATE TABLE "document_vector" (
	"internal_id" bigserial PRIMARY KEY NOT NULL,
	"document_id" bigint NOT NULL,
	"chunk_index" integer NOT NULL,
	"chunk_text" text NOT NULL,
	"embedding" vector(3072) NOT NULL,
	CONSTRAINT "document_vector_document_chunk_unique" UNIQUE("document_id","chunk_index"),
	CONSTRAINT "document_vector_chunk_index_check" CHECK ("document_vector"."chunk_index" >= 0)
);
--> statement-breakpoint
CREATE TABLE "notes" (
	"internal_id" bigserial PRIMARY KEY NOT NULL,
	"public_id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"user_id" bigint NOT NULL,
	"title" varchar(255) NOT NULL,
	"content" text NOT NULL,
	"source_document_id" bigint,
	"source_text" text,
	"topic" varchar(255),
	"generation_mode" "generation_mode" NOT NULL,
	"visibility" "note_visibility" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "notes_public_id_unique" UNIQUE("public_id")
);
--> statement-breakpoint
CREATE TABLE "note_shares" (
	"internal_id" bigserial PRIMARY KEY NOT NULL,
	"public_id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"note_id" bigint NOT NULL,
	"recipient_user_id" bigint NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"revoked_at" timestamp with time zone,
	CONSTRAINT "note_shares_public_id_unique" UNIQUE("public_id"),
	CONSTRAINT "note_shares_revoked_at_check" CHECK ("note_shares"."revoked_at" IS NULL OR "note_shares"."revoked_at" >= "note_shares"."created_at")
);
--> statement-breakpoint
CREATE TABLE "quizzes" (
	"internal_id" bigserial PRIMARY KEY NOT NULL,
	"public_id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"user_id" bigint NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"generation_mode" "quiz_generation_mode" NOT NULL,
	"source_note_id" bigint,
	"source_document_id" bigint,
	"source_topic" varchar(255),
	"requested_question_count" integer NOT NULL,
	"difficulty" "quiz_difficulty",
	"generation_status" "quiz_generation_status" DEFAULT 'pending' NOT NULL,
	"generation_error" text,
	"generated_at" timestamp with time zone,
	"visibility" "quiz_visibility" DEFAULT 'private' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "quizzes_public_id_unique" UNIQUE("public_id"),
	CONSTRAINT "quizzes_requested_question_count_check" CHECK ("quizzes"."requested_question_count" IN (5, 10, 15))
);
--> statement-breakpoint
CREATE TABLE "quiz_answers" (
	"internal_id" bigserial PRIMARY KEY NOT NULL,
	"public_id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"attempt_id" bigint NOT NULL,
	"question_id" bigint NOT NULL,
	"question_option_id" bigint NOT NULL,
	"is_correct" boolean NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "quiz_answers_public_id_unique" UNIQUE("public_id"),
	CONSTRAINT "quiz_answers_attempt_option_unique" UNIQUE("attempt_id","question_option_id")
);
--> statement-breakpoint
CREATE TABLE "quiz_attempts" (
	"internal_id" bigserial PRIMARY KEY NOT NULL,
	"public_id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"quiz_id" bigint NOT NULL,
	"user_id" bigint NOT NULL,
	"status" "quiz_attempt_status" DEFAULT 'in_progress' NOT NULL,
	"started_at" timestamp with time zone DEFAULT now() NOT NULL,
	"submitted_at" timestamp with time zone,
	"score" integer,
	"total_questions" integer NOT NULL,
	"score_percentage" numeric(5, 2),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "quiz_attempts_public_id_unique" UNIQUE("public_id"),
	CONSTRAINT "quiz_attempts_score_check" CHECK ("quiz_attempts"."score" IS NULL OR "quiz_attempts"."score" >= 0),
	CONSTRAINT "quiz_attempts_total_questions_check" CHECK ("quiz_attempts"."total_questions" > 0),
	CONSTRAINT "quiz_attempts_score_percentage_check" CHECK ("quiz_attempts"."score_percentage" IS NULL OR ("quiz_attempts"."score_percentage" >= 0 AND "quiz_attempts"."score_percentage" <= 100))
);
--> statement-breakpoint
CREATE TABLE "quiz_options" (
	"internal_id" bigserial PRIMARY KEY NOT NULL,
	"public_id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"question_id" bigint NOT NULL,
	"option_number" integer NOT NULL,
	"option_text" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "quiz_options_public_id_unique" UNIQUE("public_id"),
	CONSTRAINT "quiz_options_question_option_number_unique" UNIQUE("question_id","option_number"),
	CONSTRAINT "quiz_options_option_number_check" CHECK ("quiz_options"."option_number" >= 1)
);
--> statement-breakpoint
CREATE TABLE "quiz_questions" (
	"internal_id" bigserial PRIMARY KEY NOT NULL,
	"public_id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"quiz_id" bigint NOT NULL,
	"question_number" integer NOT NULL,
	"question_type" "quiz_question_type" NOT NULL,
	"question_text" text NOT NULL,
	"explanation" text,
	"hint" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "quiz_questions_public_id_unique" UNIQUE("public_id"),
	CONSTRAINT "quiz_questions_quiz_question_number_unique" UNIQUE("quiz_id","question_number"),
	CONSTRAINT "quiz_questions_question_number_check" CHECK ("quiz_questions"."question_number" >= 1)
);
--> statement-breakpoint
CREATE TABLE "quiz_shares" (
	"internal_id" bigserial PRIMARY KEY NOT NULL,
	"public_id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"quiz_id" bigint NOT NULL,
	"recipient_user_id" bigint NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"revoked_at" timestamp with time zone,
	CONSTRAINT "quiz_shares_public_id_unique" UNIQUE("public_id"),
	CONSTRAINT "quiz_shares_revoked_at_check" CHECK ("quiz_shares"."revoked_at" IS NULL OR "quiz_shares"."revoked_at" >= "quiz_shares"."created_at")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"internal_id" bigserial PRIMARY KEY NOT NULL,
	"public_id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"username" varchar(50) NOT NULL,
	"email" varchar(255) NOT NULL,
	"password_hash" text NOT NULL,
	"user_handle" varchar(30) NOT NULL,
	"account_status" "account_status" NOT NULL,
	"email_verified_at" timestamp with time zone,
	"last_login_at" timestamp with time zone,
	"user_handle_changed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "users_public_id_unique" UNIQUE("public_id"),
	CONSTRAINT "users_user_handle_unique" UNIQUE("user_handle")
);
--> statement-breakpoint
ALTER TABLE "document_meta" ADD CONSTRAINT "document_meta_user_id_users_internal_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("internal_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document_vector" ADD CONSTRAINT "document_vector_document_id_document_meta_internal_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."document_meta"("internal_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notes" ADD CONSTRAINT "notes_user_id_users_internal_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("internal_id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notes" ADD CONSTRAINT "notes_source_document_id_document_meta_internal_id_fk" FOREIGN KEY ("source_document_id") REFERENCES "public"."document_meta"("internal_id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "note_shares" ADD CONSTRAINT "note_shares_note_id_notes_internal_id_fk" FOREIGN KEY ("note_id") REFERENCES "public"."notes"("internal_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "note_shares" ADD CONSTRAINT "note_shares_recipient_user_id_users_internal_id_fk" FOREIGN KEY ("recipient_user_id") REFERENCES "public"."users"("internal_id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quizzes" ADD CONSTRAINT "quizzes_user_id_users_internal_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("internal_id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quizzes" ADD CONSTRAINT "quizzes_source_note_id_notes_internal_id_fk" FOREIGN KEY ("source_note_id") REFERENCES "public"."notes"("internal_id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quizzes" ADD CONSTRAINT "quizzes_source_document_id_document_meta_internal_id_fk" FOREIGN KEY ("source_document_id") REFERENCES "public"."document_meta"("internal_id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quiz_answers" ADD CONSTRAINT "quiz_answers_attempt_id_quiz_attempts_internal_id_fk" FOREIGN KEY ("attempt_id") REFERENCES "public"."quiz_attempts"("internal_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quiz_answers" ADD CONSTRAINT "quiz_answers_question_id_quiz_questions_internal_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."quiz_questions"("internal_id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quiz_answers" ADD CONSTRAINT "quiz_answers_question_option_id_quiz_options_internal_id_fk" FOREIGN KEY ("question_option_id") REFERENCES "public"."quiz_options"("internal_id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quiz_attempts" ADD CONSTRAINT "quiz_attempts_quiz_id_quizzes_internal_id_fk" FOREIGN KEY ("quiz_id") REFERENCES "public"."quizzes"("internal_id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quiz_attempts" ADD CONSTRAINT "quiz_attempts_user_id_users_internal_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("internal_id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quiz_options" ADD CONSTRAINT "quiz_options_question_id_quiz_questions_internal_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."quiz_questions"("internal_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quiz_questions" ADD CONSTRAINT "quiz_questions_quiz_id_quizzes_internal_id_fk" FOREIGN KEY ("quiz_id") REFERENCES "public"."quizzes"("internal_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quiz_shares" ADD CONSTRAINT "quiz_shares_quiz_id_quizzes_internal_id_fk" FOREIGN KEY ("quiz_id") REFERENCES "public"."quizzes"("internal_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quiz_shares" ADD CONSTRAINT "quiz_shares_recipient_user_id_users_internal_id_fk" FOREIGN KEY ("recipient_user_id") REFERENCES "public"."users"("internal_id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "document_vector_embedding_hnsw_idx"
ON "document_vector"
USING hnsw (
  ("embedding"::halfvec(3072)) halfvec_cosine_ops
);
CREATE INDEX "quiz_answers_attempt_question_idx" ON "quiz_answers" USING btree ("attempt_id","question_id");--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_lower_unique_idx" ON "users" USING btree (LOWER("email"));