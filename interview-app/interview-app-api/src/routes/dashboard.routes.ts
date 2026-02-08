import { Router } from 'express';
import axios from 'axios';
import { requireJwt } from '../middleware/jwtAuth';
import { isProfileComplete } from '../middleware/auth';
import prisma from '../db/client';

const router = Router();
const API_URL = process.env.API_URL!;
const FRONTEND_URL = process.env.FRONTEND_URL!;

// Onboarding page
router.get('/onboarding', requireJwt, (req, res) => {
  const user = req.user as any;
  if (user.profileCompleted) {
    res.redirect(`${FRONTEND_URL}/dashboard`);
  }
  res.render('onboarding', { title: 'Complete Your Profile', user });
});

// Handle onboarding form submission
router.post('/onboarding', requireJwt, async (req, res) => {
  try {
    const user = req.user as any;
    const { professionalLevel, hasBeenHiringManager } = req.body;

    await axios.put(`${API_URL}/api/users/${user.email}/profile`, {
      professionalLevel,
      hasBeenHiringManager: hasBeenHiringManager === 'true',
    });
    res.redirect(`${FRONTEND_URL}/dashboard`);
  } catch (error) {
    console.error('Error updating profile:', error);
    res.redirect('/dashboard/onboarding');
  }
});

// Same list for all users: all questions from all meetups, ordered by meetup date then order.
router.get("/questions", async (_req, res) => {
  const questions = await prisma.interviewQuestion.findMany({
    include: { meetupEvent: { select: { sessionDate: true } } },
    orderBy: { orderIndex: "asc" },
  });
  const sorted = [...questions].sort(
    (a, b) =>
      a.meetupEvent.sessionDate.getTime() - b.meetupEvent.sessionDate.getTime() ||
      a.orderIndex - b.orderIndex
  );
  res.json(sorted.map(({ meetupEvent: _m, ...q }) => q));
});

// Same question + rubric templates for all users (no user filtering).
router.get("/questions/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) {
      return res.status(400).json({ error: "Invalid question id" });
    }
    const question = await prisma.interviewQuestion.findUnique({
      where: { id },
      include: { rubricTemplates: { orderBy: { orderIndex: "asc" } } },
    });
    if (!question) {
      return res.status(404).json({ error: "Question not found" });
    }
    // If this question has no templates, include global templates (questionId null) so all users see rubrics
    const rubricTemplates =
      question.rubricTemplates.length > 0
        ? question.rubricTemplates
        : await prisma.rubricTemplate.findMany({
            where: { questionId: null },
            orderBy: { orderIndex: "asc" },
          });
    res.json({ ...question, rubricTemplates });
  } catch (e) {
    console.error("Error fetching question:", e);
    res.status(500).json({ error: "Failed to fetch question" });
  }
});


// Dashboard page
router.get('/', requireJwt, isProfileComplete, async (req, res) => {
  try {
    const user = req.user as any;
    const response = await axios.get(`${API_URL}/api/users/${user.email}/dashboard`);
    const { nextMeetup, questions } = response.data;

    res.render('dashboard', {
      title: 'Dashboard',
      user,
      nextMeetup,
      questions,
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    res.render('dashboard', {
      title: 'Dashboard',
      user: req.user,
      nextMeetup: null,
      questions: [],
      error: 'Failed to load dashboard data',
    });
  }
});

export default router;