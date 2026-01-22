/*
  Warnings:

  - You are about to drop the column `completed_at` on the `grading_rubrics` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `grading_rubrics` table. All the data in the column will be lost.
  - You are about to drop the column `interviewee_email` on the `grading_rubrics` table. All the data in the column will be lost.
  - You are about to drop the column `interviewer_email` on the `grading_rubrics` table. All the data in the column will be lost.
  - You are about to drop the column `q1_feedback` on the `grading_rubrics` table. All the data in the column will be lost.
  - You are about to drop the column `q1_points` on the `grading_rubrics` table. All the data in the column will be lost.
  - You are about to drop the column `q2_feedback` on the `grading_rubrics` table. All the data in the column will be lost.
  - You are about to drop the column `q2_points` on the `grading_rubrics` table. All the data in the column will be lost.
  - You are about to drop the column `template_id` on the `grading_rubrics` table. All the data in the column will be lost.
  - Added the required column `rubricData` to the `grading_rubrics` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "grading_rubrics" DROP CONSTRAINT "grading_rubrics_interviewee_email_fkey";

-- DropForeignKey
ALTER TABLE "grading_rubrics" DROP CONSTRAINT "grading_rubrics_interviewer_email_fkey";

-- DropForeignKey
ALTER TABLE "grading_rubrics" DROP CONSTRAINT "grading_rubrics_session_id_fkey";

-- DropForeignKey
ALTER TABLE "grading_rubrics" DROP CONSTRAINT "grading_rubrics_template_id_fkey";

-- DropIndex
DROP INDEX "grading_rubrics_session_id_interviewer_email_template_id_key";

-- AlterTable
ALTER TABLE "grading_rubrics" DROP COLUMN "completed_at",
DROP COLUMN "created_at",
DROP COLUMN "interviewee_email",
DROP COLUMN "interviewer_email",
DROP COLUMN "q1_feedback",
DROP COLUMN "q1_points",
DROP COLUMN "q2_feedback",
DROP COLUMN "q2_points",
DROP COLUMN "template_id",
ADD COLUMN     "completedAt" TIMESTAMP(3),
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "intervieweeEmail" VARCHAR(255),
ADD COLUMN     "interviewerEmail" VARCHAR(255),
ADD COLUMN     "rubricData" JSONB NOT NULL;

-- AddForeignKey
ALTER TABLE "grading_rubrics" ADD CONSTRAINT "grading_rubrics_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "interview_sessions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "grading_rubrics" ADD CONSTRAINT "grading_rubrics_interviewerEmail_fkey" FOREIGN KEY ("interviewerEmail") REFERENCES "users"("email") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "grading_rubrics" ADD CONSTRAINT "grading_rubrics_intervieweeEmail_fkey" FOREIGN KEY ("intervieweeEmail") REFERENCES "users"("email") ON DELETE SET NULL ON UPDATE CASCADE;
