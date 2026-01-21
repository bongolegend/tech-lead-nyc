import { Request, Response } from 'express';
import prisma from '../db/client';

export const getRubricsBySessionId = async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;
    const rubrics = await prisma.gradingRubric.findMany({
      where: { sessionId: parseInt(sessionId) },
      include: {
        template: true,
        interviewer: {
          select: { email: true, name: true }
        },
        interviewee: {
          select: { email: true, name: true }
        }
      }
    });
    res.json(rubrics);
  } catch (error) {
    console.error('Error fetching rubrics:', error);
    res.status(500).json({ error: 'Failed to fetch rubrics' });
  }
};

export const getUserFeedback = async (req: Request, res: Response) => {
  try {
    const { userEmail } = req.params;
    const rubrics = await prisma.gradingRubric.findMany({
      where: { 
        intervieweeEmail: userEmail,
        completed: true
      },
      include: {
        template: true,
        interviewer: {
          select: { email: true, name: true }
        },
        interviewSession: {
          include: {
            match: {
              include: {
                meetupEvent: {
                  select: { sessionDate: true, title: true }
                }
              }
            }
          }
        }
      },
      orderBy: {
        completedAt: 'desc'
      }
    });
    res.json(rubrics);
  } catch (error) {
    console.error('Error fetching user feedback:', error);
    res.status(500).json({ error: 'Failed to fetch feedback' });
  }
};

export const updateRubric = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { points, feedback } = req.body;

    const rubric = await prisma.gradingRubric.update({
      where: { id: parseInt(id) },
      data: {
        points,
        feedback,
        completed: true,
        completedAt: new Date()
      },
      include: {
        template: true,
        interviewee: {
          select: { email: true, name: true }
        }
      }
    });

    res.json(rubric);
  } catch (error) {
    console.error('Error updating rubric:', error);
    res.status(500).json({ error: 'Failed to update rubric' });
  }
};

export const deleteRubric = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.gradingRubric.delete({
      where: { id: parseInt(id) },
    });

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting rubric:', error);
    res.status(500).json({ error: 'Failed to delete rubric' });
  }
};