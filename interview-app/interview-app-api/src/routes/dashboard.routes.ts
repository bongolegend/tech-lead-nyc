import { Router } from 'express';
import axios from 'axios';
import { isAuthenticated, isProfileComplete } from '../middleware/auth';
import prisma from '../db/client';

const router = Router();
// const API_URL = process.env.API_URL || 'http://localhost:3000';
const API_URL = "https://interview-app-client-z6tjwkruwq-ue.a.run.app";

const FRONTEND_URL = process.env.FRONTEND_URL!;

// Onboarding page
router.get('/onboarding', isAuthenticated, (req, res) => {
  const user = req.user as any;
  if (user.profileCompleted) {
    res.redirect(`${FRONTEND_URL}/dashboard`);
  }
  res.render('onboarding', { title: 'Complete Your Profile', user });
});

// Handle onboarding form submission
router.post('/onboarding', isAuthenticated, async (req, res) => {
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


router.get("/questions", async (req, res) => {
  const meetup = await prisma.meetupEvent.findFirst({
    orderBy: { sessionDate: "asc" },
    include: {
      questions: {
        orderBy: { orderIndex: "asc" },
      },
    },
  });

  res.json(meetup?.questions ?? []);
});

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
    res.json(question);
  } catch (e) {
    console.error("Error fetching question:", e);
    res.status(500).json({ error: "Failed to fetch question" });
  }
});


// Dashboard page
router.get('/', isAuthenticated, isProfileComplete, async (req, res) => {
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