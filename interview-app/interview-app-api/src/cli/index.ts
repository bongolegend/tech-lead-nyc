#!/usr/bin/env node
import { Command } from 'commander';
import prisma from '../db/client';

const program = new Command();

program
  .name('interview-cli')
  .description('CLI tool for managing meetups, interview questions, and rubric templates')
  .version('1.0.0');

// MeetupEvent commands
program
  .command('add-meetup')
  .description('Create a new meetup event')
  .requiredOption('-d, --date <date>', 'Session date (YYYY-MM-DD HH:mm format)')
  .requiredOption('-t, --title <title>', 'Meetup title')
  .option('-desc, --description <description>', 'Meetup description')
  .option('-l, --location <location>', 'Meetup location')
  .action(async (options) => {
    try {
      const meetup = await prisma.meetupEvent.create({
        data: {
          sessionDate: new Date(options.date),
          title: options.title,
          description: options.description || null,
          location: options.location || null,
        },
      });
      console.log('\nMeetup created successfully!');
      console.log(`   ID: ${meetup.id}`);
      console.log(`   Date: ${meetup.sessionDate}`);
      console.log(`   Title: ${meetup.title}`);
      console.log('\nUse this ID to add questions:');
      console.log(`   npm run cli add-question -- -m ${meetup.id} -t "Your question" -c "Category" -o 1\n`);
    } catch (error) {
      console.error('Error creating meetup:', error);
    } finally {
      await prisma.$disconnect();
    }
  });

program
  .command('list-meetups')
  .description('List all meetup events')
  .action(async () => {
    try {
      const meetups = await prisma.meetupEvent.findMany({
        include: {
          questions: true,
          attendanceEvents: true,
          matches: true,
        },
        orderBy: {
          sessionDate: 'asc',
        },
      });

      console.log(`\nFound ${meetups.length} meetup(s):\n`);
      meetups.forEach((m) => {
        console.log(`ID: ${m.id}`);
        console.log(`Date: ${m.sessionDate}`);
        console.log(`Title: ${m.title}`);
        console.log(`Location: ${m.location || 'N/A'}`);
        console.log(`Questions: ${m.questions.length}`);
        console.log(`Attendees: ${m.attendanceEvents.length}`);
        console.log(`Matches: ${m.matches.length}`);
        console.log('---');
      });
    } catch (error) {
      console.error('Error listing meetups:', error);
    } finally {
      await prisma.$disconnect();
    }
  });

program
  .command('delete-meetup')
  .description('Delete a meetup by ID')
  .requiredOption('-i, --id <id>', 'Meetup ID')
  .action(async (options) => {
    try {
      await prisma.meetupEvent.delete({
        where: { id: parseInt(options.id) },
      });
      console.log('Meetup deleted successfully!');
    } catch (error) {
      console.error('Error deleting meetup:', error);
    } finally {
      await prisma.$disconnect();
    }
  });

// Question commands
program
  .command('add-question')
  .description('Add a new interview question to a meetup')
  .requiredOption('-m, --meetup-id <id>', 'Meetup Event ID')
  .requiredOption('-t, --text <text>', 'Question text')
  .option('-c, --category <category>', 'Question category')
  .option('-o, --order <order>', 'Display order index', '0')
  .action(async (options) => {
    try {
      const question = await prisma.interviewQuestion.create({
        data: {
          meetupEventId: parseInt(options.meetupId),
          questionText: options.text,
          category: options.category || null,
          orderIndex: parseInt(options.order),
        },
      });
      console.log('\nQuestion created successfully!');
      console.log(`   ID: ${question.id}`);
      console.log(`   Meetup ID: ${question.meetupEventId}`);
      console.log(`   Text: ${question.questionText}`);
      console.log(`   Category: ${question.category || 'N/A'}`);
      console.log(`   Order: ${question.orderIndex}\n`);
    } catch (error) {
      console.error('Error creating question:', error);
    } finally {
      await prisma.$disconnect();
    }
  });

program
  .command('list-questions')
  .description('List all interview questions')
  .option('-m, --meetup-id <id>', 'Filter by meetup ID')
  .option('-c, --category <category>', 'Filter by category')
  .action(async (options) => {
    try {
      const where: any = {};
      if (options.meetupId) where.meetupEventId = parseInt(options.meetupId);
      if (options.category) where.category = options.category;

      const questions = await prisma.interviewQuestion.findMany({
        where,
        include: {
          meetupEvent: true,
        },
        orderBy: [
          { meetupEventId: 'asc' },
          { orderIndex: 'asc' },
        ],
      });

      console.log(`\nFound ${questions.length} question(s):\n`);
      questions.forEach((q) => {
        console.log(`ID: ${q.id}`);
        console.log(`Meetup: ${q.meetupEvent.title} (ID: ${q.meetupEventId})`);
        console.log(`Text: ${q.questionText}`);
        console.log(`Category: ${q.category || 'N/A'}`);
        console.log(`Order: ${q.orderIndex}`);
        console.log('---');
      });
    } catch (error) {
      console.error('Error listing questions:', error);
    } finally {
      await prisma.$disconnect();
    }
  });

program
  .command('delete-question')
  .description('Delete a question by ID')
  .requiredOption('-i, --id <id>', 'Question ID')
  .action(async (options) => {
    try {
      await prisma.interviewQuestion.delete({
        where: { id: parseInt(options.id) },
      });
      console.log('Question deleted successfully!');
    } catch (error) {
      console.error('Error deleting question:', error);
    } finally {
      await prisma.$disconnect();
    }
  });

// Rubric Template commands
program
  .command('add-rubric-template')
  .description('Add a rubric template (used for all sessions)')
  .requiredOption('-c, --criteria <criteria>', 'Rubric criteria')
  .requiredOption('-p, --points <points>', 'Max points for this criteria')
  .requiredOption('--developing <text>', 'Developing example text')
  .requiredOption('--proficient <text>', 'Proficient example text')
  .requiredOption('--exceptional <text>', 'Exceptional example text')
  .option('-d, --description <description>', 'Detailed description')
  .option('-o, --order <order>', 'Display order index', '0')
  .action(async (options) => {
    try {
      const template = await prisma.rubricTemplate.create({
        data: {
          criteria: options.criteria,
          maxPoints: parseInt(options.points, 10),
          developing: options.developing,
          proficient: options.proficient,
          exceptional: options.exceptional,
          description: options.description || null,
          orderIndex: parseInt(options.order, 10),
        },
      });

      console.log('\nRubric template created successfully!');
      console.log(`ID: ${template.id}`);
    } catch (error) {
      console.error('Error creating rubric template:', error);
    } finally {
      await prisma.$disconnect();
    }
  });

program
  .command('list-rubric-templates')
  .description('List all rubric templates')
  .action(async () => {
    try {
      const templates = await prisma.rubricTemplate.findMany({
        orderBy: { orderIndex: 'asc' },
      });

      templates.forEach((t) => {
        console.log(`ID: ${t.id}`);
        console.log(`Criteria: ${t.criteria}`);
        console.log(`Max Points: ${t.maxPoints}`);
        console.log(`Developing: ${t.developing}`);
        console.log(`Proficient: ${t.proficient}`);
        console.log(`Exceptional: ${t.exceptional}`);
        console.log(`Description: ${t.description || 'N/A'}`);
        console.log(`Order: ${t.orderIndex}`);
        console.log('---');
      });
    } catch (error) {
      console.error('Error listing rubric templates:', error);
    } finally {
      await prisma.$disconnect();
    }
  });

program
  .command('delete-rubric-template')
  .description('Delete a rubric template by ID')
  .requiredOption('-i, --id <id>', 'Rubric Template ID')
  .action(async (options) => {
    try {
      await prisma.rubricTemplate.delete({
        where: { id: parseInt(options.id, 10) },
      });
      console.log('Rubric template deleted successfully!');
    } catch (error) {
      console.error('Error deleting rubric template:', error);
    } finally {
      await prisma.$disconnect();
    }
  });

program.parse();
