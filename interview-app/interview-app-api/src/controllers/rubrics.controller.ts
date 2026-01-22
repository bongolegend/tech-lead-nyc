import { Request, Response } from "express";
import prisma from "../db/client";

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
