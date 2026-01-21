-- CreateTable
CREATE TABLE "users" (
    "email" VARCHAR(255) NOT NULL,
    "name" VARCHAR(255),
    "google_id" VARCHAR(255),
    "professional_level" VARCHAR(50),
    "has_been_hiring_manager" BOOLEAN,
    "profile_completed" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "attendance_percentage" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "users_pkey" PRIMARY KEY ("email")
);

-- CreateTable
CREATE TABLE "meetup_events" (
    "id" SERIAL NOT NULL,
    "session_date" TIMESTAMP(3) NOT NULL,
    "title" VARCHAR(255),
    "description" TEXT,
    "location" VARCHAR(255),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "meetup_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "interview_questions" (
    "id" SERIAL NOT NULL,
    "meetup_event_id" INTEGER NOT NULL,
    "question_text" TEXT NOT NULL,
    "category" VARCHAR(100),
    "order_index" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "interview_questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "matches" (
    "id" SERIAL NOT NULL,
    "meetup_event_id" INTEGER NOT NULL,
    "user1_email" VARCHAR(255) NOT NULL,
    "user2_email" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "matches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attendance_events" (
    "id" SERIAL NOT NULL,
    "user_email" VARCHAR(255) NOT NULL,
    "meetup_event_id" INTEGER NOT NULL,
    "confirmed" BOOLEAN NOT NULL DEFAULT false,
    "attended" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "attendance_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "interview_sessions" (
    "id" SERIAL NOT NULL,
    "match_id" INTEGER NOT NULL,
    "user1_email" VARCHAR(255) NOT NULL,
    "user2_email" VARCHAR(255) NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "session_started" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMP(3),

    CONSTRAINT "interview_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rubric_templates" (
    "id" SERIAL NOT NULL,
    "criteria" TEXT NOT NULL,
    "max_points" INTEGER NOT NULL,
    "description" TEXT,
    "order_index" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "rubric_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "grading_rubrics" (
    "id" SERIAL NOT NULL,
    "session_id" INTEGER NOT NULL,
    "template_id" INTEGER NOT NULL,
    "interviewer_email" VARCHAR(255) NOT NULL,
    "interviewee_email" VARCHAR(255) NOT NULL,
    "points" INTEGER,
    "feedback" TEXT,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMP(3),

    CONSTRAINT "grading_rubrics_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_google_id_key" ON "users"("google_id");

-- CreateIndex
CREATE UNIQUE INDEX "meetup_events_session_date_key" ON "meetup_events"("session_date");

-- CreateIndex
CREATE UNIQUE INDEX "matches_meetup_event_id_user1_email_user2_email_key" ON "matches"("meetup_event_id", "user1_email", "user2_email");

-- CreateIndex
CREATE UNIQUE INDEX "attendance_events_user_email_meetup_event_id_key" ON "attendance_events"("user_email", "meetup_event_id");

-- CreateIndex
CREATE UNIQUE INDEX "interview_sessions_match_id_key" ON "interview_sessions"("match_id");

-- CreateIndex
CREATE UNIQUE INDEX "grading_rubrics_session_id_interviewer_email_template_id_key" ON "grading_rubrics"("session_id", "interviewer_email", "template_id");

-- AddForeignKey
ALTER TABLE "interview_questions" ADD CONSTRAINT "interview_questions_meetup_event_id_fkey" FOREIGN KEY ("meetup_event_id") REFERENCES "meetup_events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "matches" ADD CONSTRAINT "matches_meetup_event_id_fkey" FOREIGN KEY ("meetup_event_id") REFERENCES "meetup_events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "matches" ADD CONSTRAINT "matches_user1_email_fkey" FOREIGN KEY ("user1_email") REFERENCES "users"("email") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "matches" ADD CONSTRAINT "matches_user2_email_fkey" FOREIGN KEY ("user2_email") REFERENCES "users"("email") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance_events" ADD CONSTRAINT "attendance_events_user_email_fkey" FOREIGN KEY ("user_email") REFERENCES "users"("email") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance_events" ADD CONSTRAINT "attendance_events_meetup_event_id_fkey" FOREIGN KEY ("meetup_event_id") REFERENCES "meetup_events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interview_sessions" ADD CONSTRAINT "interview_sessions_match_id_fkey" FOREIGN KEY ("match_id") REFERENCES "matches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interview_sessions" ADD CONSTRAINT "interview_sessions_user1_email_fkey" FOREIGN KEY ("user1_email") REFERENCES "users"("email") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interview_sessions" ADD CONSTRAINT "interview_sessions_user2_email_fkey" FOREIGN KEY ("user2_email") REFERENCES "users"("email") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "grading_rubrics" ADD CONSTRAINT "grading_rubrics_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "interview_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "grading_rubrics" ADD CONSTRAINT "grading_rubrics_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "rubric_templates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "grading_rubrics" ADD CONSTRAINT "grading_rubrics_interviewer_email_fkey" FOREIGN KEY ("interviewer_email") REFERENCES "users"("email") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "grading_rubrics" ADD CONSTRAINT "grading_rubrics_interviewee_email_fkey" FOREIGN KEY ("interviewee_email") REFERENCES "users"("email") ON DELETE CASCADE ON UPDATE CASCADE;
