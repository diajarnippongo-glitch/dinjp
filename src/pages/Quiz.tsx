import { useState, useEffect, useMemo, useRef } from 'react';
import { ArrowLeft, ArrowRight, CheckCircle2, Headphones, XCircle, ChevronRight, Clock } from 'lucide-react';
import type { ModuleId, QuizQuestion, MondaiConfig, ReviewPondasiId, TimerConfig } from '@/types';
import { modules, reviewPondasiModules } from '@/data/appData';

interface QuizProps {
  mode: 'review' | 'quiz';
  reviewId?: ReviewPondasiId;
  moduleId?: ModuleId;
  partId: string;
  questions: QuizQuestion[];
  timerConfig: TimerConfig;
  onFinish: (answers: Record<string, string>, questions: QuizQuestion[]) => void;
  onExit: () => void;
}

interface MondaiGroup { config: MondaiConfig; questions: QuizQuestion[]; }

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function Quiz({ mode, moduleId, partId, questions, timerConfig, onFinish, onExit }: QuizProps) {
  const moduleInfo = modules.find((m) => m.id === moduleId);
  const isReview = mode === 'review';

  const mondaiGroups = useMemo<MondaiGroup[]>(() => {
    if (isReview || !moduleInfo) return [];
    let offset = 0;
    return moduleInfo.mondai.map((m) => {
      const count = m.range[1] - m.range[0] + 1;
      const slice = questions.slice(offset, offset + count);
      offset += count;
      return { config: m, questions: slice };
    });
  }, [isReview, moduleInfo, questions]);

  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [feedback, setFeedback] = useState<Record<string, boolean>>({});
  const [timeLeft, setTimeLeft] = useState(timerConfig.durationSeconds);
  const finishedRef = useRef(false);

  const question = questions[current];
  const selected = question ? answers[question.id] : undefined;
  const isAnswered = question ? feedback[question.id] !== undefined : false;
  const isCorrect = question ? feedback[question.id] : false;
  const isLast = current === questions.length - 1;
  const currentMondai = mondaiGroups.find((g) => g.questions.some((q) => q.id === question?.id));

  useEffect(() => {
    if (timeLeft <= 0) {
      if (!finishedRef.current) { finishedRef.current = true; onFinish(answers, questions); }
      return;
    }
    const timer = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearTimeout(timer);
  }, [timeLeft, answers, questions, onFinish]);

  function selectOption(optionId: string, questionId?: string) {
    const qid = questionId ?? question?.id;
    if (!qid) return;
    if (feedback[qid] !== undefined) return;
    const q = questions.find((x) => x.id === qid);
    if (!q) return;
    setAnswers((prev) => ({ ...prev, [qid]: optionId }));
    setFeedback((prev) => ({ ...prev, [qid]: optionId === q.correctOptionId }));
  }

  function goNext() {
    if (isLast) {
      if (!finishedRef.current) { finishedRef.current = true; onFinish(answers, questions); }
    } else { setCurrent((c) => c + 1); }
  }
  function goPrev() { if (current > 0) setCurrent((c) => c - 1); }

  if (!question) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <p className="text-slate-400">Belum ada soal untuk bagian ini.</p>
      </div>
    );
  }

  const progress = ((current + 1) / questions.length) * 100;
  const headerTitle = isReview ? `Review · ${partId}` : `Kuis ${moduleInfo?.title ?? ''}`;
  const lowTime = timeLeft <= 60;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <header className="bg-slate-900/80 backdrop-blur-md border-b border-slate-800 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <button onClick={onExit} className="flex items-center gap-2 text-slate-300 hover:text-white text-sm font-medium transition">
            <ArrowLeft className="w-4 h-4" /> Keluar
          </button>
          <div className="text-center">
            <p className="font-semibold text-white text-sm">{headerTitle}</p>
            <p className="text-xs text-slate-400">
              {currentMondai?.config.label ? `${currentMondai.config.label} · ` : ''}Soal {current + 1} dari {questions.length}
            </p>
          </div>
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-bold ${lowTime ? 'bg-red-950/60 text-red-300 border border-red-800' : 'bg-slate-800 text-slate-200'}`}>
            <Clock className="w-4 h-4" />
            {formatTime(timeLeft)}
          </div>
        </div>
        <div className="h-1 bg-slate-800">
          <div className="h-full bg-gradient-to-r from-red-600 to-red-400 transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        {currentMondai?.config.scroll ? (
          <ScrollMondai group={currentMondai} answers={answers} feedback={feedback} onSelect={selectOption} />
        ) : (
          <div className="bg-slate-900/60 backdrop-blur-sm rounded-2xl border border-slate-800 p-6 sm:p-8">
            {question.audioUrl && (
              <div className="mb-6 p-4 rounded-xl bg-slate-800/60 border border-slate-700">
                <div className="flex items-center gap-2 mb-3">
                  <Headphones className="w-4 h-4 text-red-400" />
                  <span className="text-sm font-semibold text-red-300">Latihan Mendengarkan</span>
                </div>
                <audio controls className="w-full" src={question.audioUrl}>Browser tidak mendukung audio.</audio>
              </div>
            )}
            <div className="mb-6">
              <span className="inline-block text-xs font-semibold text-red-400 bg-red-950/40 border border-red-800/60 px-2.5 py-1 rounded-full mb-3">
                {currentMondai?.config.label ? `${currentMondai.config.label} · ` : ''}Soal {current + 1}
              </span>
              <h2 className="text-lg font-semibold text-white leading-relaxed">{question.question}</h2>
            </div>
            <div className="space-y-3">
              {question.options.map((opt, idx) => {
                const isSelected = selected === opt.id;
                return (
                  <button key={opt.id} onClick={() => selectOption(opt.id)} disabled={isAnswered}
                    className={`w-full flex items-center gap-3 p-4 rounded-xl border text-left transition ${
                      isAnswered && isSelected ? (isCorrect ? 'border-green-500 bg-green-950/40' : 'border-red-500 bg-red-950/40')
                      : isSelected ? 'border-red-500 bg-red-950/30' : 'border-slate-700 bg-slate-800/40 hover:border-red-500/50 hover:bg-slate-800/60'
                    }`}>
                    <span className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-semibold shrink-0 ${
                      isAnswered && isSelected ? (isCorrect ? 'bg-green-500 text-white' : 'bg-red-500 text-white')
                      : isSelected ? 'bg-red-500 text-white' : 'bg-slate-700 text-slate-300'
                    }`}>{String.fromCharCode(65 + idx)}</span>
                    <span className="text-sm text-slate-200 font-medium flex-1">{opt.label}</span>
                    {isAnswered && isSelected && isCorrect && <CheckCircle2 className="w-5 h-5 text-green-500" />}
                    {isAnswered && isSelected && !isCorrect && <XCircle className="w-5 h-5 text-red-500" />}
                  </button>
                );
              })}
            </div>
            {isAnswered && (
              <p className={`mt-4 text-sm font-medium ${isCorrect ? 'text-green-400' : 'text-red-400'}`}>
                {isCorrect ? 'Benar! Kerja bagus.' : 'Belum tepat. Lanjutkan ke soal berikutnya.'}
              </p>
            )}
          </div>
        )}

        {!currentMondai?.config.scroll && (
          <div className="flex items-center justify-between mt-6">
            <button onClick={goPrev} disabled={current === 0}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800/60 text-slate-300 text-sm font-semibold hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition">
              <ArrowLeft className="w-4 h-4" /> Sebelumnya
            </button>
            <button onClick={goNext} disabled={!isAnswered}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-sm font-semibold shadow-md shadow-red-900/40 disabled:opacity-50 disabled:cursor-not-allowed transition">
              {isLast ? 'Selesai' : 'Berikutnya'} <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {currentMondai?.config.scroll && (
          <div className="flex justify-end mt-6">
            <button onClick={goNext} disabled={!questions.every((q) => feedback[q.id] !== undefined)}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-sm font-semibold shadow-md shadow-red-900/40 disabled:opacity-50 disabled:cursor-not-allowed transition">
              {isLast ? 'Selesai' : 'Berikutnya'} <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

function ScrollMondai({ group, answers, feedback, onSelect }: {
  group: MondaiGroup;
  answers: Record<string, string>;
  feedback: Record<string, boolean>;
  onSelect: (optionId: string, questionId: string) => void;
}) {
  return (
    <div className="space-y-6">
      <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4">
        <p className="text-sm font-semibold text-red-300">{group.config.label} — Halaman Gulir Bersama</p>
        <p className="text-xs text-slate-400 mt-1">Jawab semua soal dengan menggulir ke bawah.</p>
      </div>
      {group.questions.map((q, qi) => {
        const selected = answers[q.id];
        const isAnswered = feedback[q.id] !== undefined;
        const isCorrect = feedback[q.id];
        return (
          <div key={q.id} className="bg-slate-900/60 backdrop-blur-sm rounded-2xl border border-slate-800 p-6">
            {q.audioUrl && (
              <div className="mb-4 p-3 rounded-xl bg-slate-800/60 border border-slate-700">
                <div className="flex items-center gap-2 mb-2">
                  <Headphones className="w-4 h-4 text-red-400" />
                  <span className="text-sm font-semibold text-red-300">Audio</span>
                </div>
                <audio controls className="w-full" src={q.audioUrl} />
              </div>
            )}
            <span className="inline-block text-xs font-semibold text-red-400 bg-red-950/40 border border-red-800/60 px-2.5 py-1 rounded-full mb-3">Soal {qi + 1}</span>
            <h2 className="text-base font-semibold text-white leading-relaxed mb-4">{q.question}</h2>
            <div className="space-y-2.5">
              {q.options.map((opt, idx) => {
                const isSelected = selected === opt.id;
                return (
                  <button key={opt.id} onClick={() => onSelect(opt.id, q.id)} disabled={isAnswered}
                    className={`w-full flex items-center gap-3 p-3.5 rounded-xl border text-left transition ${
                      isAnswered && isSelected ? (isCorrect ? 'border-green-500 bg-green-950/40' : 'border-red-500 bg-red-950/40')
                      : isSelected ? 'border-red-500 bg-red-950/30' : 'border-slate-700 bg-slate-800/40 hover:border-red-500/50 hover:bg-slate-800/60'
                    }`}>
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 ${
                      isAnswered && isSelected ? (isCorrect ? 'bg-green-500 text-white' : 'bg-red-500 text-white')
                      : isSelected ? 'bg-red-500 text-white' : 'bg-slate-700 text-slate-300'
                    }`}>{String.fromCharCode(65 + idx)}</span>
                    <span className="text-sm text-slate-200 font-medium flex-1">{opt.label}</span>
                    {isAnswered && isSelected && isCorrect && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                    {isAnswered && isSelected && !isCorrect && <XCircle className="w-4 h-4 text-red-500" />}
                  </button>
                );
              })}
            </div>
            {isAnswered && (
              <p className={`mt-3 text-sm font-medium ${isCorrect ? 'text-green-400' : 'text-red-400'}`}>
                {isCorrect ? 'Benar!' : 'Belum tepat.'}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
