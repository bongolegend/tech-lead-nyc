-- AlterTable
ALTER TABLE "rubric_templates" ADD COLUMN "question_id" INTEGER,
ADD COLUMN "category" VARCHAR(100);

-- AddForeignKey
ALTER TABLE "rubric_templates" ADD CONSTRAINT "rubric_templates_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "interview_questions"("id") ON DELETE SET NULL ON UPDATE CASCADE;
