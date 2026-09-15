import { supabase } from '@/lib/supabaseClient';
import type { QuizQuestion, ProgressRecord, BillingRecord, ScheduleSession, Student, ModuleId } from '@/types';

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

interface RawQuizRow {
  id: string;
  module_id: string;
  mondai_id: string;
  question_number: number;
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_option: string;
  audio_url: string | null;
  image_url: string | null;
}

interface RawReviewRow {
  id: string;
  category_id: string;
  part_number: number;
  question_number: number;
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_option: string;
}

function rowToQuestion(row: RawQuizRow, shuffleOpts = true): QuizQuestion {
  const rawOpts = [
    { id: 'a', label: row.option_a },
    { id: 'b', label: row.option_b },
    { id: 'c', label: row.option_c },
    { id: 'd', label: row.option_d },
  ];
  const opts = shuffleOpts ? shuffle(rawOpts) : rawOpts;
  const correctLabel = row[`option_${row.correct_option}` as keyof RawQuizRow] as string;
  const correctOpt = opts.find((o) => o.label === correctLabel) ?? opts[0];
  return {
    id: row.id,
    question: row.question,
    options: opts,
    correctOptionId: correctOpt.id,
    audioUrl: row.audio_url ?? undefined,
    imageUrl: row.image_url ?? undefined,
    mondaiId: row.mondai_id,
  };
}

function reviewRowToQuestion(row: RawReviewRow): QuizQuestion {
  const opts = shuffle([
    { id: 'a', label: row.option_a },
    { id: 'b', label: row.option_b },
    { id: 'c', label: row.option_c },
    { id: 'd', label: row.option_d },
  ]);
  const correctLabel = row[`option_${row.correct_option}` as keyof RawReviewRow] as string;
  const correctOpt = opts.find((o) => o.label === correctLabel) ?? opts[0];
  return {
    id: row.id,
    question: row.question,
    options: opts,
    correctOptionId: correctOpt.id,
  };
}

const QUIZ_FETCH_LIMIT: Record<ModuleId, number> = {
  moji: 14,
  goi: 21,
  bunpou: 23,
  dokkai: 16,
  choukai: 28,
};

const GOI_MONDAI_LIMITS = [11, 5, 5];
const BUNPOU_MONDAI_LIMITS = [13, 5, 5];
const DOKKAI_MONDAI_LIMITS = [4, 3, 3, 4, 2];
const CHOUKAI_MONDAI_LIMITS = [6, 6, 3, 4, 9];
const CHOUKAI_NO_SHUFFLE_OPTS = [true, true, true, true, true];

export async function fetchQuizQuestions(
  moduleId: ModuleId,
  classLevel: 'N3' | 'N4' = 'N3',
  mondaiIds?: string[],
): Promise<QuizQuestion[]> {
  const table = classLevel === 'N4' ? 'quiz_questions_n4' : 'quiz_questions_n3';
  const selectCols = 'id, module_id, mondai_id, question_number, question, option_a, option_b, option_c, option_d, correct_option, audio_url, image_url, created_at';

  if (moduleId === 'goi' && mondaiIds && mondaiIds.length === 3) {
    const results = await Promise.all(
      mondaiIds.map((mid, idx) =>
        supabase
          .from(table)
          .select(selectCols)
          .eq('module_id', moduleId)
          .eq('mondai_id', mid)
          .order('question_number', { ascending: true })
          .then(({ data, error }) => {
            if (error) throw error;
            return (data as RawQuizRow[] ?? []).slice(0, GOI_MONDAI_LIMITS[idx]);
          }),
      ),
    );
    return results.flat().map(rowToQuestion);
  }

  if (moduleId === 'bunpou' && mondaiIds && mondaiIds.length === 3) {
    const results = await Promise.all(
      mondaiIds.map((mid, idx) =>
        supabase
          .from(table)
          .select(selectCols)
          .eq('module_id', moduleId)
          .eq('mondai_id', mid)
          .order('question_number', { ascending: true })
          .then(({ data, error }) => {
            if (error) throw error;
            return (data as RawQuizRow[] ?? []).slice(0, BUNPOU_MONDAI_LIMITS[idx]);
          }),
      ),
    );
    return results.flat().map((r) => rowToQuestion(r));
  }

  if (moduleId === 'dokkai' && mondaiIds && mondaiIds.length === 5) {
    const results = await Promise.all(
      mondaiIds.map((mid, idx) =>
        supabase
          .from(table)
          .select(selectCols)
          .eq('module_id', moduleId)
          .eq('mondai_id', mid)
          .order('question_number', { ascending: true })
          .then(({ data, error }) => {
            if (error) throw error;
            return (data as RawQuizRow[] ?? []).slice(0, DOKKAI_MONDAI_LIMITS[idx]);
          }),
      ),
    );
    return results.flat().map((r) => rowToQuestion(r));
  }

  if (moduleId === 'choukai' && mondaiIds && mondaiIds.length === 5) {
    const results = await Promise.all(
      mondaiIds.map((mid, idx) =>
        supabase
          .from(table)
          .select(selectCols)
          .eq('module_id', moduleId)
          .eq('mondai_id', mid)
          .order('question_number', { ascending: true })
          .then(({ data, error }) => {
            if (error) throw error;
            return (data as RawQuizRow[] ?? []).slice(0, CHOUKAI_MONDAI_LIMITS[idx]);
          }),
      ),
    );
    return results.flat().map((r, idx) => rowToQuestion(r, CHOUKAI_NO_SHUFFLE_OPTS[idx] ? false : true));
  }

  let query = supabase
    .from(table)
    .select(selectCols)
    .eq('module_id', moduleId)
    .order('question_number', { ascending: true });

  if (mondaiIds && mondaiIds.length > 0) {
    query = query.in('mondai_id', mondaiIds);
  }

  const { data, error } = await query;
  if (error) {
    console.error('[fetchQuizQuestions] Supabase error:', error);
    throw error;
  }
  if (!data || data.length === 0) return [];

  const limit = QUIZ_FETCH_LIMIT[moduleId] ?? 14;
  const rows = (data as RawQuizRow[]).slice(0, limit);
  return rows.map(rowToQuestion);
}

export async function fetchReviewQuestions(categoryId: string, partNumber: number, classLevel: 'N3' | 'N4' = 'N3'): Promise<QuizQuestion[]> {
  const table = classLevel === 'N4' ? 'review_question_n4' : 'review_question_n3';
  const { data, error } = await supabase
    .from(table)
    .select('id, category_id, part_number, question_number, question, option_a, option_b, option_c, option_d, correct_option, created_at')
    .eq('category_id', categoryId)
    .eq('part_number', partNumber)
    .order('question_number');
  if (error) throw error;
  if (!data || data.length === 0) return [];
  const shuffled = shuffle(data as RawReviewRow[]);
  return shuffled.map(reviewRowToQuestion);
}

export async function fetchStudentProgress(userId: string): Promise<ProgressRecord[]> {
  if (!userId) {
    console.warn('[fetchStudentProgress] userId is empty, returning []');
    return [];
  }
  const { data, error } = await supabase
    .from('student_progress')
    .select('*')
    .eq('user_id', userId)
    .order('completed_at', { ascending: false });
  if (error) {
    console.error('[fetchStudentProgress] Supabase error for user_id:', userId, error);
    throw error;
  }
  if (!data || data.length === 0) {
    console.log('[fetchStudentProgress] No progress records found for user_id:', userId);
    return [];
  }
  return data.map((p: Record<string, unknown>) => ({
    id: p.id as string,
    userId: p.user_id as string,
    mode: p.mode as 'review' | 'quiz',
    categoryId: p.category_id as string,
    partId: p.part_id as string,
    score: p.score as number,
    correctCount: p.correct_count as number,
    totalQuestions: p.total_questions as number,
    passed: p.passed as boolean,
    completedAt: p.completed_at as string,
  }));
}

export async function fetchAllProgress(classLevel?: 'N3' | 'N4'): Promise<ProgressRecord[]> {
  let query = supabase
    .from('student_progress')
    .select('*, profiles!inner(class_level)');
  if (classLevel) {
    query = query.eq('profiles.class_level', classLevel);
  }
  query = query.order('completed_at', { ascending: false });
  const { data, error } = await query;
  if (error) {
    console.error('[fetchAllProgress] Supabase error:', error);
    throw error;
  }
  return (data ?? []).map((p: Record<string, unknown>) => ({
    id: p.id as string,
    userId: p.user_id as string,
    mode: p.mode as 'review' | 'quiz',
    categoryId: p.category_id as string,
    partId: p.part_id as string,
    score: p.score as number,
    correctCount: p.correct_count as number,
    totalQuestions: p.total_questions as number,
    passed: p.passed as boolean,
    completedAt: p.completed_at as string,
  }));
}

export async function saveProgress(record: Omit<ProgressRecord, 'id' | 'completedAt' | 'userId'>, userId: string): Promise<void> {
  if (!userId) {
    console.error('[saveProgress] userId is empty, cannot save progress');
    throw new Error('User ID is required to save progress');
  }
  const { error } = await supabase.from('student_progress').insert({
    user_id: userId,
    mode: record.mode,
    category_id: record.categoryId,
    part_id: record.partId,
    score: record.score,
    correct_count: record.correctCount,
    total_questions: record.totalQuestions,
    passed: record.passed,
  });
  if (error) {
    console.error('[saveProgress] Supabase error:', error);
    throw error;
  }
}

export async function fetchOwnBilling(studentId: string): Promise<BillingRecord[]> {
  const { data, error } = await supabase
    .from('billing')
    .select('*, profiles!inner(class_level)')
    .eq('student_id', studentId)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return (data ?? []).map(mapBilling);
}

export async function fetchAllBilling(classLevel?: 'N3' | 'N4'): Promise<BillingRecord[]> {
  let query = supabase
    .from('billing')
    .select('*, profiles!inner(class_level, full_name, email)');
  if (classLevel) {
    query = query.eq('profiles.class_level', classLevel);
  }
  query = query.order('student_name', { ascending: true });
  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []).map(mapBilling);
}

function mapBilling(b: Record<string, unknown>): BillingRecord {
  return {
    id: b.id as string,
    studentId: b.student_id as string,
    studentName: b.student_name as string,
    classLevel: b.class_level as 'N3' | 'N4',
    className: (b.class_name as string) ?? null,
    period: b.period as string,
    amount: b.amount as number,
    status: b.status as 'lunas' | 'belum',
    whatsapp: (b.whatsapp as string) ?? null,
  };
}

export async function fetchSchedule(classCategories?: string[]): Promise<ScheduleSession[]> {
  let query = supabase
    .from('schedule_sessions')
    .select('*')
    .order('month', { ascending: true })
    .order('date_number', { ascending: true });

  if (classCategories && classCategories.length > 0) {
    query = query.in('class_category', classCategories);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []).map((s: Record<string, unknown>) => ({
    id: s.id as string,
    month: s.month as string,
    dayName: s.day_name as string,
    dateNumber: s.date_number as number,
    time: s.time as string,
    subject: s.subject as string,
    driveLink: (s.drive_link as string) ?? null,
    classCategory: (s.class_category as string) ?? null,
  }));
}

export async function fetchAllProfiles(): Promise<Student[]> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: true });
  if (error) throw error;
  return (data ?? []).map((p: Record<string, unknown>) => ({
    id: p.id as string,
    name: p.full_name as string,
    email: p.email as string,
    className: (p.class_name as string) ?? '',
    classLevel: (p.class_level as 'N3' | 'N4') ?? 'N3',
    role: (p.role as 'student' | 'teacher') ?? 'student',
    hafalanKosakata: (p.hafalan_kosakata as number) ?? 0,
    mogiShikenTotal: (p.mogi_shiken_total as number) ?? 0,
    whatsapp: (p.whatsapp as string) ?? undefined,
  }));
}

export function subscribeToTable(
  table: 'profiles' | 'quiz_questions_n3' | 'quiz_questions_n4' | 'review_question_n3' | 'review_question_n4' | 'student_progress' | 'billing' | 'schedule_sessions',
  callback: () => void,
): () => void {
  const channel = supabase
    .channel(`realtime-${table}-${Math.random().toString(36).slice(2, 8)}`)
    .on('postgres_changes', { event: '*', schema: 'public', table }, () => callback())
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
