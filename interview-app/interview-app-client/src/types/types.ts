export type Email = string;

export interface User {
    email: Email;
    name?: string | null;
    googleId?: string | null;
    professionalLevel?: 'professional' | 'student' | null;
    hasBeenHiringManager?: boolean | null;
    profileCompleted: boolean;
    attendancePercentage: number;
    createdAt: string;
    updatedAt: string;
  }
  
  export interface MeetupEvent {
    id: number;
    sessionDate: string;
    title?: string | null;
    description?: string | null;
    location?: string | null;
    createdAt: string;
  }

  export interface InterviewQuestion {
    id: number;
    meetupEventId: number;
    questionText: string;
    category?: string | null;
    orderIndex: number;
    createdAt: string;
    rubricTemplates?: RubricTemplate[];
  }

  export interface Match {
    id: number;
    meetupEventId: number;
    user1Email: Email;
    user2Email: Email;
    createdAt: string;
  }

  export interface AttendanceEvent {
    id: number;
    userEmail: Email;
    meetupEventId: number;
    confirmed: boolean;
    attended: boolean;
    createdAt: string;
    updatedAt: string;
  }

  export interface InterviewSession {
    id: number;
    matchId: number;
    user1Email: Email;
    user2Email: Email;
    completed: boolean;
    sessionStarted: boolean;
    createdAt: string;
    completedAt?: string | null;
  }

  export interface RubricTemplate {
    id: number;
    criteria: string;
    maxPoints: number;
    developing: string;
    proficient: string;
    exceptional: string;
    description?: string | null;
    orderIndex: number;
    createdAt: string;
    questionId?: number | null;
    category?: string | null;
  }

  export interface GradingRubric {
    id: number;
    sessionId: number;
    templateId: number;
    interviewerEmail: Email;
    intervieweeEmail: Email;
  
    q1Points?: number | null;
    q2Points?: number | null;
    q1Feedback?: string | null;
    q2Feedback?: string | null;
  
    completed: boolean;
    createdAt: string;
    completedAt?: string | null;
  
    template?: {
      id: number;
      criteria: string;
      maxPoints: number;
      developing: string;
      proficient: string;
      exceptional: string;
      description?: string | null;
      orderIndex: number;
      createdAt: string;
    };
  }
  