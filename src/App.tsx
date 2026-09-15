import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import Login from '@/pages/Login';
import Dashboard from '@/pages/Dashboard';
import Quiz from '@/pages/Quiz';
import Result from '@/pages/Result';
import CategoryList from '@/pages/CategoryList';
import PartList from '@/pages/PartList';
import DataProgres from '@/pages/DataProgres';
import Keuangan from '@/pages/Keuangan';
import Jadwal from '@/pages/Jadwal';
import TagihanSaya from '@/pages/TagihanSaya';
import BurgerMenu, { type MenuView } from '@/components/BurgerMenu';
import type { ModuleId, QuizQuestion, ReviewPondasiId, ProgressRecord, TimerConfig } from '@/types';
import { REVIEW_TIMER, QUIZ_TIMERS } from '@/types';
import { modules, reviewPondasiModules, quizParts, getMondaiIdsForQuizPart } from '@/data/appData';
import { fetchQuizQuestions, fetchReviewQuestions, fetchStudentProgress, saveProgress, subscribeToTable } from '@/lib/dataAccess';

type View =
  | { name: 'dashboard' }
  | { name: 'menu'; view: MenuView }
  | { name: 'categoryList'; mode: 'review' | 'quiz' }
  | { name: 'partList'; mode: 'review' | 'quiz'; reviewId?: ReviewPondasiId; moduleId?: ModuleId }
  | { name: 'quiz'; mode: 'review' | 'quiz'; reviewId?: ReviewPondasiId; moduleId?: ModuleId; partId: string; questions: QuizQuestion[]; timerConfig: TimerConfig }
  | { name: 'result'; mode: 'review' | 'quiz'; reviewId?: ReviewPondasiId; moduleId?: ModuleId; partId: string; answers: Record<string, string>; questions: QuizQuestion[] };

function AppContent() {
  const { student, loading } = useAuth();
  const [view, setView] = useState<View>({ name: 'dashboard' });
  const [progress, setProgress] = useState<ProgressRecord[]>([]);

  useEffect(() => {
    if (student && student.role === 'student') {
      function load() {
        fetchStudentProgress(student.id).then(setProgress).catch(() => {});
      }
      load();
      const unsub = subscribeToTable('student_progress', load);
      return () => { unsub(); };
    }
  }, [student]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <div className="w-8 h-8 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!student) return <Login />;

  function getTimerConfig(mode: 'review' | 'quiz', moduleId?: ModuleId, partId?: string): TimerConfig {
    if (mode === 'review') {
      if (partId && partId.endsWith('-9')) {
        return { durationSeconds: 30 * 60, label: '30 menit' };
      }
      return REVIEW_TIMER;
    }
    if (moduleId) return QUIZ_TIMERS[student!.classLevel][moduleId];
    return REVIEW_TIMER;
  }

  async function handleFinish(
    mode: 'review' | 'quiz',
    reviewId: ReviewPondasiId | undefined,
    moduleId: ModuleId | undefined,
    partId: string,
    answers: Record<string, string>,
    questions: QuizQuestion[],
  ) {
    const correct = questions.filter((q) => answers[q.id] === q.correctOptionId).length;
    const score = Math.round((correct / Math.max(questions.length, 1)) * 100);
    const passed = score >= 85;
    const categoryId = mode === 'review' ? reviewId! : moduleId!;

    await saveProgress({
      mode,
      categoryId,
      partId,
      score,
      correctCount: correct,
      totalQuestions: questions.length,
      passed,
    }, student?.id ?? 'unknown').catch(() => {});

    if (student) {
      fetchStudentProgress(student.id).then(setProgress).catch(() => {});
    }
  }

  if (view.name === 'categoryList') {
    return (
      <CategoryList
        mode={view.mode}
        onBack={() => setView({ name: 'dashboard' })}
        onSelectReview={(id) => setView({ name: 'partList', mode: 'review', reviewId: id })}
        onSelectQuiz={(id) => setView({ name: 'partList', mode: 'quiz', moduleId: id })}
      />
    );
  }

  if (view.name === 'partList') {
    return (
      <PartList
        mode={view.mode}
        reviewId={view.reviewId}
        moduleId={view.moduleId}
        onBack={() => setView({ name: 'categoryList', mode: view.mode })}
        onStart={async (partId) => {
          let questions: QuizQuestion[] = [];
          if (view.mode === 'review' && view.reviewId) {
            const partNumber = reviewPondasiModules.find((m) => m.id === view.reviewId)?.parts.findIndex((p) => p.id === partId);
            if (partNumber !== undefined && partNumber >= 0) {
              questions = await fetchReviewQuestions(view.reviewId, partNumber + 1, student!.classLevel);
            }
          } else if (view.mode === 'quiz' && view.moduleId) {
            const part = quizParts.find((p) => p.id === partId);
            const mondaiPerPart = (view.moduleId === 'goi' || view.moduleId === 'bunpou') ? 3
              : (view.moduleId === 'dokkai' || view.moduleId === 'choukai') ? 5 : 2;
            const mondaiIds = part ? getMondaiIdsForQuizPart(part.week, part.part, mondaiPerPart) : undefined;
            questions = await fetchQuizQuestions(view.moduleId, student!.classLevel, mondaiIds);
          }
          const timerConfig = getTimerConfig(view.mode, view.moduleId, partId);
          setView({ name: 'quiz', mode: view.mode, reviewId: view.reviewId, moduleId: view.moduleId, partId, questions, timerConfig });
        }}
        progress={progress}
      />
    );
  }

  if (view.name === 'quiz') {
    return (
      <Quiz
        mode={view.mode}
        reviewId={view.reviewId}
        moduleId={view.moduleId}
        partId={view.partId}
        questions={view.questions}
        timerConfig={view.timerConfig}
        onExit={() => setView({ name: 'partList', mode: view.mode, reviewId: view.reviewId, moduleId: view.moduleId })}
        onFinish={(answers, questions) => {
          handleFinish(view.mode, view.reviewId, view.moduleId, view.partId, answers, questions);
          setView({ name: 'result', mode: view.mode, reviewId: view.reviewId, moduleId: view.moduleId, partId: view.partId, answers, questions });
        }}
      />
    );
  }

  if (view.name === 'result') {
    return (
      <Result
        mode={view.mode}
        reviewId={view.reviewId}
        moduleId={view.moduleId}
        partId={view.partId}
        answers={view.answers}
        questions={view.questions}
        onRetry={async () => {
          let questions: QuizQuestion[] = [];
          if (view.mode === 'review' && view.reviewId) {
            const partNumber = reviewPondasiModules.find((m) => m.id === view.reviewId)?.parts.findIndex((p) => p.id === view.partId);
            if (partNumber !== undefined && partNumber >= 0) {
              questions = await fetchReviewQuestions(view.reviewId, partNumber + 1, student!.classLevel);
            }
          } else if (view.mode === 'quiz' && view.moduleId) {
            questions = await fetchQuizQuestions(view.moduleId, student!.classLevel);
          }
          const timerConfig = getTimerConfig(view.mode, view.moduleId, view.partId);
          setView({ name: 'quiz', mode: view.mode, reviewId: view.reviewId, moduleId: view.moduleId, partId: view.partId, questions, timerConfig });
        }}
        onHome={() => setView({ name: 'dashboard' })}
      />
    );
  }

  if (view.name === 'menu') {
    const back = () => setView({ name: 'dashboard' });
    switch (view.view) {
      case 'data-progres':
        return <DataProgres onBack={back} />;
      case 'keuangan':
        return <Keuangan onBack={back} />;
      case 'jadwal':
        return <Jadwal onBack={back} />;
      case 'tagihan-saya':
        return <TagihanSaya onBack={back} />;
      case 'dashboard':
      default:
        setView({ name: 'dashboard' });
        return null;
    }
  }

  return (
    <Dashboard
      onOpenReview={() => setView({ name: 'categoryList', mode: 'review' })}
      onOpenQuiz={() => setView({ name: 'categoryList', mode: 'quiz' })}
      onNavigate={(v) => setView({ name: 'menu', view: v })}
    />
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
