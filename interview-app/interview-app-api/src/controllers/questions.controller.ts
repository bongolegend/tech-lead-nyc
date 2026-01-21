import { Request, Response } from 'express';
import prisma from '../db/client';

export const getAllQuestions = async (req: Request, res: Response) => {
  try {
    const questions = await prisma.interviewQuestion.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
    
    res.json(questions);
  } catch (error) {
    console.error('Error fetching questions:', error);
    res.status(500).json({ error: 'Failed to fetch questions' });
  }
};

export const getQuestionById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const question = await prisma.interviewQuestion.findUnique({
      where: { id: parseInt(id) },
    });
    

    if (!question) {
      return res.status(404).json({ error: 'Question not found' });
    }

    res.json(question);
  } catch (error) {
    console.error('Error fetching question:', error);
    res.status(500).json({ error: 'Failed to fetch question' });
  }
};

export const createQuestion = async (req: Request, res: Response) => {
  try {
    const { questionText, category, meetupEventId, orderIndex } = req.body;

    const question = await prisma.interviewQuestion.create({
      data: {
        questionText,
        category,
        meetupEventId,
        orderIndex,
      },
    });

    res.status(201).json(question);
  } catch (error) {
    console.error('Error creating question:', error);
    res.status(500).json({ error: 'Failed to create question' });
  }
};

export const updateQuestion = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { questionText, category, orderIndex } = req.body;

    const question = await prisma.interviewQuestion.update({
      where: { id: parseInt(id) },
      data: {
        questionText,
        category,
        orderIndex,
      },
    });

    res.json(question);
  } catch (error) {
    console.error('Error updating question:', error);
    res.status(500).json({ error: 'Failed to update question' });
  }
};


export const deleteQuestion = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.interviewQuestion.delete({
      where: { id: parseInt(id) },
    });

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting question:', error);
    res.status(500).json({ error: 'Failed to delete question' });
  }
};