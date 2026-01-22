/*
  Warnings:

  - You are about to drop the column `feedback` on the `grading_rubrics` table. All the data in the column will be lost.
  - You are about to drop the column `points` on the `grading_rubrics` table. All the data in the column will be lost.
  - Added the required column `developing` to the `rubric_templates` table without a default value. This is not possible if the table is not empty.
  - Added the required column `exceptional` to the `rubric_templates` table without a default value. This is not possible if the table is not empty.
  - Added the required column `proficient` to the `rubric_templates` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "grading_rubrics" DROP COLUMN "feedback",
DROP COLUMN "points",
ADD COLUMN     "q1_feedback" TEXT,
ADD COLUMN     "q1_points" INTEGER,
ADD COLUMN     "q2_feedback" TEXT,
ADD COLUMN     "q2_points" INTEGER;

-- AlterTable
ALTER TABLE "rubric_templates" ADD COLUMN     "developing" TEXT NOT NULL,
ADD COLUMN     "exceptional" TEXT NOT NULL,
ADD COLUMN     "proficient" TEXT NOT NULL;
