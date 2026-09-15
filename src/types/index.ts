export type Role = 'student' | 'teacher';

export type ModuleId = 'moji' | 'goi' | 'bunpou' | 'dokkai' | 'choukai';
export type ReviewPondasiId = 'partikel' | 'kata-kerja' | 'kosakata' | 'bunpou-review' | 'kaiwa';

export const quizAxes = ['Moji', 'Goi', 'Bunpou', 'Dokkai', 'Choukai'] as const;
export type QuizAxis = (typeof quizAxes)[number];

export const reviewPondasiAxes = ['Partikel', 'Perubahan', 'Pengelompokkan', 'Tata Bahasa', 'Percakapan'] as const;
export type ReviewPondasiAxis = (typeof reviewPondasiAxes)[number];

export interface QuizOption {
  id: string;
  label: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: QuizOption[];
  correctOptionId: string;
  audioUrl?: string;
  imageUrl?: string;
  mondaiId?: string;
}

export interface MondaiConfig {
  id: string;
  label: string;
  range: [number, number];
  scroll?: boolean;
}

export interface LearningModule {
  id: ModuleId;
  title: string;
  titleJp: string;
  description: string;
  icon: string;
  totalQuestions: number;
  passingScore: number;
  mondai: MondaiConfig[];
}

export interface QuizPartConfig {
  id: string;
  label: string;
  week: number;
  part: number;
}

export interface ReviewPartConfig {
  id: string;
  label: string;
  questionCount: number;
}

export interface ReviewPondasiModule {
  id: ReviewPondasiId;
  title: string;
  titleJp: string;
  description: string;
  icon: string;
  parts: ReviewPartConfig[];
}

export interface Student {
  id: string;
  name: string;
  email: string;
  className: string;
  classLevel: 'N3' | 'N4';
  role: Role;
  hafalanKosakata: number;
  mogiShikenTotal: number;
  whatsapp?: string;
}

export interface ProgressRecord {
  id: string;
  userId?: string;
  mode: 'review' | 'quiz';
  categoryId: string;
  partId: string;
  score: number;
  correctCount: number;
  totalQuestions: number;
  passed: boolean;
  completedAt: string;
}

export interface BillingRecord {
  id: string;
  studentId: string;
  studentName: string;
  classLevel: 'N3' | 'N4';
  className: string | null;
  period: string;
  amount: number;
  status: 'lunas' | 'belum';
  whatsapp: string | null;
}

export interface ScheduleSession {
  id: string;
  month: string;
  dayName: string;
  dateNumber: number;
  time: string;
  subject: string;
  driveLink: string | null;
  classCategory: string | null;
}

export interface TimerConfig {
  durationSeconds: number;
  label: string;
}

export const REVIEW_TIMER: TimerConfig = {
  durationSeconds: 7 * 60,
  label: '7 menit',
};

export const QUIZ_TIMERS: Record<'N3' | 'N4', Record<ModuleId, TimerConfig>> = {
  N4: {
    moji: { durationSeconds: 10 * 60, label: '10 menit' },
    goi: { durationSeconds: 20 * 60, label: '20 menit' },
    bunpou: { durationSeconds: 25 * 60, label: '25 menit' },
    dokkai: { durationSeconds: 45 * 60, label: '45 menit' },
    choukai: { durationSeconds: 35 * 60, label: '35 menit' },
  },
  N3: {
    moji: { durationSeconds: 10 * 60, label: '10 menit' },
    goi: { durationSeconds: 25 * 60, label: '25 menit' },
    bunpou: { durationSeconds: 25 * 60, label: '25 menit' },
    dokkai: { durationSeconds: 45 * 60, label: '45 menit' },
    choukai: { durationSeconds: 35 * 60, label: '35 menit' },
  },
};
