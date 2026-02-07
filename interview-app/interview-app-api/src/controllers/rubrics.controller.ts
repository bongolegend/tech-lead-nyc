import { Request, Response } from "express";
import { Prisma } from "@prisma/client";
import prisma from "../db/client";

function foreignKeyConstraintMessage(fieldName: string | undefined): string | null {
  if (!fieldName || typeof fieldName !== "string") return null;
  if (fieldName.includes("intervieweeEmail"))
    return "Interviewee Email must be a registered user to submit a rubric";
  if (fieldName.includes("interviewerEmail"))
    return "Interviewer Email must be a registered user to submit a rubric";
  return null;
}

/* ---------- templates ---------- */
export const listRubricTemplates = async (_req: Request, res: Response) => {
  try {
    const templates = await prisma.rubricTemplate.findMany({
      orderBy: { orderIndex: "asc" },
    });
    res.json(templates);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch rubric templates" });
  }
};

/* ---------- create whole rubric ---------- */
export const createRubric = async (req: Request, res: Response) => {
  try {
    const {
      sessionId,
      interviewerEmail,
      intervieweeEmail,
      rubricData,
      completed,
    } = req.body;

    const rubric = await prisma.gradingRubric.create({
      data: {
        sessionId: sessionId ?? null,
        interviewerEmail: interviewerEmail ?? null,
        intervieweeEmail: intervieweeEmail ?? null,
        rubricData,
        completed: !!completed,
        completedAt: completed ? new Date() : null,
      },
    });

    res.status(201).json(rubric);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2003") {
      const message = foreignKeyConstraintMessage(error.meta?.field_name as string | undefined);
      if (message) {
        return res.status(400).json({ error: message });
      }
    }
    console.error("Error creating rubric:", error);
    res.status(500).json({ error: "Failed to create rubric" });
  }
};

/* ---------- user feedback ---------- */
export const getUserFeedback = async (req: Request, res: Response) => {
  try {
    const { userEmail } = req.params;

    const rubrics = await prisma.gradingRubric.findMany({
      where: {
        completed: true,
        OR: [
          { interviewerEmail: userEmail },
          { intervieweeEmail: userEmail },
        ],
      },
      orderBy: { createdAt: "desc" },
    });

    res.json(rubrics);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch feedback" });
  }
};

/* ---------- delete ---------- */
export const deleteRubric = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.gradingRubric.delete({
      where: { id: Number(id) },
    });
    res.status(204).send();
  } catch {
    res.status(500).json({ error: "Failed to delete rubric" });
  }
};
