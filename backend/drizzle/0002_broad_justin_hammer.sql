ALTER TABLE "document_vector" DROP CONSTRAINT "document_vector_document_chunk_unique";--> statement-breakpoint
ALTER TABLE "quiz_answers" DROP CONSTRAINT "quiz_answers_attempt_option_unique";--> statement-breakpoint
ALTER TABLE "quiz_options" DROP CONSTRAINT "quiz_options_question_option_number_unique";--> statement-breakpoint
ALTER TABLE "quiz_questions" DROP CONSTRAINT "quiz_questions_quiz_question_number_unique";--> statement-breakpoint
ALTER TABLE "document_meta" DROP CONSTRAINT "document_meta_user_id_users_internal_id_fk";
--> statement-breakpoint
ALTER TABLE "document_vector" DROP CONSTRAINT "document_vector_document_id_document_meta_internal_id_fk";
--> statement-breakpoint
ALTER TABLE "notes" DROP CONSTRAINT "notes_user_id_users_internal_id_fk";
--> statement-breakpoint
ALTER TABLE "notes" DROP CONSTRAINT "notes_source_document_id_document_meta_internal_id_fk";
--> statement-breakpoint
ALTER TABLE "note_shares" DROP CONSTRAINT "note_shares_note_id_notes_internal_id_fk";
--> statement-breakpoint
ALTER TABLE "note_shares" DROP CONSTRAINT "note_shares_recipient_user_id_users_internal_id_fk";
--> statement-breakpoint
ALTER TABLE "quizzes" DROP CONSTRAINT "quizzes_user_id_users_internal_id_fk";
--> statement-breakpoint
ALTER TABLE "quizzes" DROP CONSTRAINT "quizzes_source_note_id_notes_internal_id_fk";
--> statement-breakpoint
ALTER TABLE "quizzes" DROP CONSTRAINT "quizzes_source_document_id_document_meta_internal_id_fk";
--> statement-breakpoint
ALTER TABLE "quiz_answers" DROP CONSTRAINT "quiz_answers_attempt_id_quiz_attempts_internal_id_fk";
--> statement-breakpoint
ALTER TABLE "quiz_answers" DROP CONSTRAINT "quiz_answers_question_id_quiz_questions_internal_id_fk";
--> statement-breakpoint
ALTER TABLE "quiz_answers" DROP CONSTRAINT "quiz_answers_question_option_id_quiz_options_internal_id_fk";
--> statement-breakpoint
ALTER TABLE "quiz_attempts" DROP CONSTRAINT "quiz_attempts_quiz_id_quizzes_internal_id_fk";
--> statement-breakpoint
ALTER TABLE "quiz_attempts" DROP CONSTRAINT "quiz_attempts_user_id_users_internal_id_fk";
--> statement-breakpoint
ALTER TABLE "quiz_options" DROP CONSTRAINT "quiz_options_question_id_quiz_questions_internal_id_fk";
--> statement-breakpoint
ALTER TABLE "quiz_questions" DROP CONSTRAINT "quiz_questions_quiz_id_quizzes_internal_id_fk";
--> statement-breakpoint
ALTER TABLE "quiz_shares" DROP CONSTRAINT "quiz_shares_quiz_id_quizzes_internal_id_fk";
--> statement-breakpoint
ALTER TABLE "quiz_shares" DROP CONSTRAINT "quiz_shares_recipient_user_id_users_internal_id_fk";
--> statement-breakpoint
DROP INDEX "quiz_answers_attempt_question_idx";--> statement-breakpoint
ALTER TABLE "document_meta" ADD COLUMN "user_public_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "document_vector" ADD COLUMN "document_public_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "notes" ADD COLUMN "user_public_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "notes" ADD COLUMN "document_public_id" uuid;--> statement-breakpoint
ALTER TABLE "note_shares" ADD COLUMN "note_public_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "note_shares" ADD COLUMN "recipient_user_public_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "quizzes" ADD COLUMN "user_public_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "quizzes" ADD COLUMN "source_note_public_id" uuid;--> statement-breakpoint
ALTER TABLE "quizzes" ADD COLUMN "source_document_public_id" uuid;--> statement-breakpoint
ALTER TABLE "quiz_answers" ADD COLUMN "attempt_public_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "quiz_answers" ADD COLUMN "question_public_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "quiz_answers" ADD COLUMN "question_option_public_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "quiz_attempts" ADD COLUMN "quiz_public_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "quiz_attempts" ADD COLUMN "user_public_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "quiz_options" ADD COLUMN "question_public_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "quiz_questions" ADD COLUMN "quiz_public_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "quiz_shares" ADD COLUMN "quiz_public_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "quiz_shares" ADD COLUMN "recipient_user_public_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "document_meta" ADD CONSTRAINT "document_meta_user_public_id_users_public_id_fk" FOREIGN KEY ("user_public_id") REFERENCES "public"."users"("public_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document_vector" ADD CONSTRAINT "document_vector_document_public_id_document_meta_public_id_fk" FOREIGN KEY ("document_public_id") REFERENCES "public"."document_meta"("public_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notes" ADD CONSTRAINT "notes_user_public_id_users_public_id_fk" FOREIGN KEY ("user_public_id") REFERENCES "public"."users"("public_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notes" ADD CONSTRAINT "notes_document_public_id_document_meta_public_id_fk" FOREIGN KEY ("document_public_id") REFERENCES "public"."document_meta"("public_id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "note_shares" ADD CONSTRAINT "note_shares_note_public_id_notes_public_id_fk" FOREIGN KEY ("note_public_id") REFERENCES "public"."notes"("public_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "note_shares" ADD CONSTRAINT "note_shares_recipient_user_public_id_users_public_id_fk" FOREIGN KEY ("recipient_user_public_id") REFERENCES "public"."users"("public_id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quizzes" ADD CONSTRAINT "quizzes_user_public_id_users_public_id_fk" FOREIGN KEY ("user_public_id") REFERENCES "public"."users"("public_id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quizzes" ADD CONSTRAINT "quizzes_source_note_public_id_notes_public_id_fk" FOREIGN KEY ("source_note_public_id") REFERENCES "public"."notes"("public_id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quizzes" ADD CONSTRAINT "quizzes_source_document_public_id_document_meta_public_id_fk" FOREIGN KEY ("source_document_public_id") REFERENCES "public"."document_meta"("public_id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quiz_answers" ADD CONSTRAINT "quiz_answers_attempt_public_id_quiz_attempts_public_id_fk" FOREIGN KEY ("attempt_public_id") REFERENCES "public"."quiz_attempts"("public_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quiz_answers" ADD CONSTRAINT "quiz_answers_question_public_id_quiz_questions_public_id_fk" FOREIGN KEY ("question_public_id") REFERENCES "public"."quiz_questions"("public_id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quiz_answers" ADD CONSTRAINT "quiz_answers_question_option_public_id_quiz_options_public_id_fk" FOREIGN KEY ("question_option_public_id") REFERENCES "public"."quiz_options"("public_id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quiz_attempts" ADD CONSTRAINT "quiz_attempts_quiz_public_id_quizzes_public_id_fk" FOREIGN KEY ("quiz_public_id") REFERENCES "public"."quizzes"("public_id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quiz_attempts" ADD CONSTRAINT "quiz_attempts_user_public_id_users_public_id_fk" FOREIGN KEY ("user_public_id") REFERENCES "public"."users"("public_id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quiz_options" ADD CONSTRAINT "quiz_options_question_public_id_quiz_questions_public_id_fk" FOREIGN KEY ("question_public_id") REFERENCES "public"."quiz_questions"("public_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quiz_questions" ADD CONSTRAINT "quiz_questions_quiz_public_id_quizzes_public_id_fk" FOREIGN KEY ("quiz_public_id") REFERENCES "public"."quizzes"("public_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quiz_shares" ADD CONSTRAINT "quiz_shares_quiz_public_id_quizzes_public_id_fk" FOREIGN KEY ("quiz_public_id") REFERENCES "public"."quizzes"("public_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quiz_shares" ADD CONSTRAINT "quiz_shares_recipient_user_public_id_users_public_id_fk" FOREIGN KEY ("recipient_user_public_id") REFERENCES "public"."users"("public_id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "quiz_answers_attempt_question_idx" ON "quiz_answers" USING btree ("attempt_public_id","question_public_id");--> statement-breakpoint
ALTER TABLE "document_meta" DROP COLUMN "user_id";--> statement-breakpoint
ALTER TABLE "document_vector" DROP COLUMN "document_id";--> statement-breakpoint
ALTER TABLE "notes" DROP COLUMN "user_id";--> statement-breakpoint
ALTER TABLE "notes" DROP COLUMN "source_document_id";--> statement-breakpoint
ALTER TABLE "note_shares" DROP COLUMN "note_id";--> statement-breakpoint
ALTER TABLE "note_shares" DROP COLUMN "recipient_user_id";--> statement-breakpoint
ALTER TABLE "quizzes" DROP COLUMN "user_id";--> statement-breakpoint
ALTER TABLE "quizzes" DROP COLUMN "source_note_id";--> statement-breakpoint
ALTER TABLE "quizzes" DROP COLUMN "source_document_id";--> statement-breakpoint
ALTER TABLE "quiz_answers" DROP COLUMN "attempt_id";--> statement-breakpoint
ALTER TABLE "quiz_answers" DROP COLUMN "question_id";--> statement-breakpoint
ALTER TABLE "quiz_answers" DROP COLUMN "question_option_id";--> statement-breakpoint
ALTER TABLE "quiz_attempts" DROP COLUMN "quiz_id";--> statement-breakpoint
ALTER TABLE "quiz_attempts" DROP COLUMN "user_id";--> statement-breakpoint
ALTER TABLE "quiz_options" DROP COLUMN "question_id";--> statement-breakpoint
ALTER TABLE "quiz_questions" DROP COLUMN "quiz_id";--> statement-breakpoint
ALTER TABLE "quiz_shares" DROP COLUMN "quiz_id";--> statement-breakpoint
ALTER TABLE "quiz_shares" DROP COLUMN "recipient_user_id";--> statement-breakpoint
ALTER TABLE "document_vector" ADD CONSTRAINT "document_vector_document_chunk_unique" UNIQUE("document_public_id","chunk_index");--> statement-breakpoint
ALTER TABLE "quiz_answers" ADD CONSTRAINT "quiz_answers_attempt_option_unique" UNIQUE("attempt_public_id","question_option_public_id");--> statement-breakpoint
ALTER TABLE "quiz_options" ADD CONSTRAINT "quiz_options_question_option_number_unique" UNIQUE("question_public_id","option_number");--> statement-breakpoint
ALTER TABLE "quiz_questions" ADD CONSTRAINT "quiz_questions_quiz_question_number_unique" UNIQUE("quiz_public_id","question_number");