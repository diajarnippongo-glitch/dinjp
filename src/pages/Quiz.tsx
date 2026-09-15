import { useState, useEffect, useMemo, useRef } from 'react';
import { ArrowLeft, ArrowRight, Headphones, ChevronRight, Clock, Play, Pause, Volume2 } from 'lucide-react';
import type { ModuleId, QuizQuestion, MondaiConfig, ReviewPondasiId, TimerConfig } from '@/types';
import { modules, reviewPondasiModules } from '@/data/appData';
import { parseFurigana } from '@/lib/furigana';

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

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function getMondaiLabel(mondaiId?: string): string {
  if (!mondaiId) return '';
  const match = mondaiId.match(/(\d+)$/);
  const num = match ? parseInt(match[1], 10) : 0;
  return num % 2 === 1 ? '問題1' : '問題2';
}

function getMondaiGroupIndex(mondaiId: string | undefined, moduleId: ModuleId | undefined): number {
  if (!mondaiId) return 0;
  const match = mondaiId.match(/(\d+)$/);
  const num = match ? parseInt(match[1], 10) : 0;
  if (moduleId === 'moji') {
    return num % 2 === 1 ? 0 : 1;
  }
  if (moduleId === 'goi' || moduleId === 'bunpou') {
    return (num - 1) % 3;
  }
  if (moduleId === 'dokkai' || moduleId === 'choukai') {
    return (num - 1) % 5;
  }
  return 0;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function Quiz({ mode, moduleId, reviewId, partId, questions, timerConfig, onFinish, onExit }: QuizProps) {
  const moduleInfo = modules.find((m) => m.id === moduleId);
  const isReview = mode === 'review';
  const isBunpouReview = isReview && reviewId === 'bunpou-review';

  const isBunpouQuiz = !isReview && moduleId === 'bunpou';
  const isDokkaiQuiz = !isReview && moduleId === 'dokkai';

  const processedQuestions = useMemo<QuizQuestion[]>(() => {
    if (isReview || questions.length === 0) return questions;
    const groups: Map<number, QuizQuestion[]> = new Map();
    for (const q of questions) {
      const gi = getMondaiGroupIndex(q.mondaiId, moduleId);
      if (!groups.has(gi)) groups.set(gi, []);
      groups.get(gi)!.push(q);
    }
    const sortedKeys = [...groups.keys()].sort((a, b) => a - b);
    const result: QuizQuestion[] = [];
    for (const k of sortedKeys) {
      const groupQuestions = groups.get(k)!;
      if (isBunpouQuiz && k === 2) {
        result.push(...groupQuestions);
      } else if (isDokkaiQuiz && k >= 1) {
        result.push(...groupQuestions);
      } else {
        result.push(...shuffle(groupQuestions));
      }
    }
    return result;
  }, [isReview, questions, moduleId, isBunpouQuiz, isDokkaiQuiz]);

  const mondaiGroups = useMemo<MondaiGroup[]>(() => {
    if (isReview || !moduleInfo) return [];
    const byMondai = new Map<string, QuizQuestion[]>();
    for (const q of processedQuestions) {
      const mid = q.mondaiId ?? 'default';
      if (!byMondai.has(mid)) byMondai.set(mid, []);
      byMondai.get(mid)!.push(q);
    }
    const groups: MondaiGroup[] = [];
    for (const m of moduleInfo.mondai) {
      const qs = byMondai.get(m.id);
      if (qs) groups.push({ config: m, questions: qs });
    }
    if (groups.length === 0) {
      for (const [mid, qs] of byMondai) {
        groups.push({ config: { id: mid, label: mid, range: [0, 0] }, questions: qs });
      }
    }
    return groups;
  }, [isReview, moduleInfo, processedQuestions]);

  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState(timerConfig.durationSeconds);
  const finishedRef = useRef(false);

  const question = processedQuestions[current];
  const selected = question ? answers[question.id] : undefined;
  const isAnswered = selected !== undefined;
  const isLast = current === processedQuestions.length - 1;
  const currentMondai = mondaiGroups.find((g) => g.questions.some((q) => q.id === question?.id));
  const mondaiLabel = getMondaiLabel(question?.mondaiId);
  const mondaiGroupIdx = getMondaiGroupIndex(question?.mondaiId, moduleId);
  const mondaiGroupLabels = ['問題1', '問題2', '問題3', '問題4', '問題5'];
  const mondaiGroupLabel = !isReview && moduleId && (moduleId === 'moji' || moduleId === 'goi' || moduleId === 'bunpou' || moduleId === 'dokkai' || moduleId === 'choukai') ? (mondaiGroupLabels[mondaiGroupIdx] ?? '') : mondaiLabel;

  useEffect(() => {
    if (timeLeft <= 0) {
      if (!finishedRef.current) { finishedRef.current = true; onFinish(answers, processedQuestions); }
      return;
    }
    const timer = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearTimeout(timer);
  }, [timeLeft, answers, processedQuestions, onFinish]);

  function selectOption(optionId: string, questionId?: string) {
    const qid = questionId ?? question?.id;
    if (!qid) return;
    setAnswers((prev) => ({ ...prev, [qid]: optionId }));
  }

  function goNext() {
    if (isLast) {
      if (!finishedRef.current) { finishedRef.current = true; onFinish(answers, processedQuestions); }
    } else if (currentMondai?.config.scroll) {
      const lastInGroup = current + currentMondai.questions.length - 1;
      const nextIndex = Math.min(lastInGroup + 1, processedQuestions.length - 1);
      setCurrent(nextIndex);
    } else { setCurrent((c) => c + 1); }
  }
  function goPrev() {
    if (current === 0) return;
    const prevMondai = mondaiGroups.find((g) => g.questions.some((q) => q.id === processedQuestions[current - 1]?.id));
    if (prevMondai?.config.scroll) {
      const groupStart = current - 1 - (current - 1 - processedQuestions.findIndex((q) => prevMondai.questions.includes(q)));
      setCurrent(Math.max(0, groupStart));
    } else { setCurrent((c) => c - 1); }
  }

  if (!question) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <p className="text-slate-400">Belum ada soal untuk bagian ini.</p>
      </div>
    );
  }

  const progress = ((current + 1) / processedQuestions.length) * 100;
  const headerTitle = isReview ? `Review · ${partId}` : `Kuis ${moduleInfo?.title ?? ''}`;
  const lowTime = timeLeft <= 60;

  function renderQuestionText(text: string) {
    if (isBunpouReview) {
      return <span className="font-japanese jp-text whitespace-pre-line text-lg leading-loose">{parseFurigana(text)}</span>;
    }
    return <span className="font-japanese jp-text whitespace-pre-line text-lg leading-loose">{text}</span>;
  }

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
              {mondaiGroupLabel ? `${mondaiGroupLabel} - ` : ''}Soal {current + 1} dari {processedQuestions.length}
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
          <ScrollMondai group={currentMondai} answers={answers} onSelect={selectOption} isBunpouReview={isBunpouReview} />
        ) : (
          <div className="bg-slate-900/60 backdrop-blur-sm rounded-2xl border border-slate-800 p-6 sm:p-8">
            {question.audioUrl && (
              <AudioPlayer src={question.audioUrl} />
            )}
            <div className="mb-6">
              <span className="inline-block text-xs font-semibold text-red-400 bg-red-950/40 border border-red-800/60 px-2.5 py-1 rounded-full mb-3">
                {mondaiGroupLabel ? `${mondaiGroupLabel} - ` : ''}Soal {current + 1}
              </span>
              {question.imageUrl && (
                <img src={question.imageUrl} alt="Soal" className="max-w-full h-auto object-contain rounded-md mb-4" />
              )}
              <h2 className="text-lg font-semibold text-white leading-loose">{renderQuestionText(question.question)}</h2>
            </div>
            <div className="space-y-3">
              {question.options.map((opt, idx) => {
                const isSelected = selected === opt.id;
                return (
                  <button key={opt.id} onClick={() => selectOption(opt.id)}
                    className={`w-full flex items-center gap-3 p-4 rounded-xl border text-left transition ${
                      isSelected ? 'border-red-500 bg-red-950/30' : 'border-slate-700 bg-slate-800/40 hover:border-red-500/50 hover:bg-slate-800/60'
                    }`}>
                    <span className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-semibold shrink-0 ${
                      isSelected ? 'bg-red-500 text-white' : 'bg-slate-700 text-slate-300'
                    }`}>{String.fromCharCode(65 + idx)}</span>
                    <span className="text-base text-slate-200 font-medium flex-1 font-japanese jp-text">{opt.label}</span>
                  </button>
                );
              })}
            </div>
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
          <div className="flex items-center justify-between mt-6">
            <button onClick={goPrev} disabled={current === 0}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800/60 text-slate-300 text-sm font-semibold hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition">
              <ArrowLeft className="w-4 h-4" /> Sebelumnya
            </button>
            <button onClick={goNext} disabled={!currentMondai.questions.every((q) => answers[q.id] !== undefined)}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-sm font-semibold shadow-md shadow-red-900/40 disabled:opacity-50 disabled:cursor-not-allowed transition">
              {isLast ? 'Selesai' : 'Berikutnya'} <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

function ScrollMondai({ group, answers, onSelect, isBunpouReview }: {
  group: MondaiGroup;
  answers: Record<string, string>;
  onSelect: (optionId: string, questionId: string) => void;
  isBunpouReview: boolean;
}) {
  return (
    <div className="space-y-6">
      <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4">
        <p className="text-sm font-semibold text-red-300">{group.config.label} — Halaman Gulir Bersama</p>
        <p className="text-xs text-slate-400 mt-1">Jawab semua soal dengan menggulir ke bawah.</p>
      </div>
      {group.questions.map((q, qi) => {
        const selected = answers[q.id];
        return (
          <div key={q.id} className="bg-slate-900/60 backdrop-blur-sm rounded-2xl border border-slate-800 p-6">
            {q.audioUrl && (
              <AudioPlayer src={q.audioUrl} compact />
            )}
            <span className="inline-block text-xs font-semibold text-red-400 bg-red-950/40 border border-red-800/60 px-2.5 py-1 rounded-full mb-3">Soal {qi + 1}</span>
            {q.imageUrl && (
              <img src={q.imageUrl} alt="Soal" className="max-w-full h-auto object-contain rounded-md mb-4" />
            )}
            <h2 className="text-lg font-semibold text-white leading-loose mb-4">
              {isBunpouReview ? <span className="font-japanese jp-text whitespace-pre-line">{parseFurigana(q.question)}</span> : <span className="font-japanese jp-text whitespace-pre-line">{q.question}</span>}
            </h2>
            <div className="space-y-2.5">
              {q.options.map((opt, idx) => {
                const isSelected = selected === opt.id;
                return (
                  <button key={opt.id} onClick={() => onSelect(opt.id, q.id)}
                    className={`w-full flex items-center gap-3 p-3.5 rounded-xl border text-left transition ${
                      isSelected ? 'border-red-500 bg-red-950/30' : 'border-slate-700 bg-slate-800/40 hover:border-red-500/50 hover:bg-slate-800/60'
                    }`}>
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 ${
                      isSelected ? 'bg-red-500 text-white' : 'bg-slate-700 text-slate-300'
                    }`}>{String.fromCharCode(65 + idx)}</span>
                    <span className="text-base text-slate-200 font-medium flex-1 font-japanese jp-text">{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function AudioPlayer({ src, compact }: { src: string; compact?: boolean }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onTime = () => setCurrent(audio.currentTime);
    const onDur = () => setDuration(audio.duration || 0);
    const onEnd = () => { setPlaying(false); setCurrent(0); };
    audio.addEventListener('timeupdate', onTime);
    audio.addEventListener('loadedmetadata', onDur);
    audio.addEventListener('ended', onEnd);
    return () => {
      audio.removeEventListener('timeupdate', onTime);
      audio.removeEventListener('loadedmetadata', onDur);
      audio.removeEventListener('ended', onEnd);
    };
  }, []);

  function toggle() {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) { audio.pause(); setPlaying(false); }
    else { audio.play().then(() => setPlaying(true)).catch(() => {}); }
  }

  function seek(e: React.MouseEvent<HTMLDivElement>) {
    const audio = audioRef.current;
    if (!audio || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    audio.currentTime = pct * duration;
  }

  function fmt(s: number) {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, '0')}`;
  }

  const pct = duration > 0 ? (current / duration) * 100 : 0;

  return (
    <div className={`mb-${compact ? 4 : 6} p-${compact ? 3 : 4} rounded-xl bg-slate-800/60 border border-slate-700`}>
      <div className="flex items-center gap-2 mb-2">
        <Headphones className="w-4 h-4 text-red-400" />
        <span className="text-sm font-semibold text-red-300">Latihan Mendengarkan</span>
      </div>
      <audio ref={audioRef} src={src} preload="metadata" className="hidden" />
      <div className="flex items-center gap-3">
        <button onClick={toggle}
          className="w-10 h-10 rounded-full bg-red-600 hover:bg-red-500 flex items-center justify-center text-white shrink-0 transition shadow-md shadow-red-900/40">
          {playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
        </button>
        <div className="flex-1">
          <div onClick={seek} className="h-2 bg-slate-700 rounded-full cursor-pointer overflow-hidden group">
            <div className="h-full bg-gradient-to-r from-red-600 to-red-400 rounded-full transition-all" style={{ width: `${pct}%` }} />
          </div>
          <div className="flex items-center justify-between mt-1.5">
            <span className="text-xs text-slate-400 tabular-nums">{fmt(current)}</span>
            <Volume2 className="w-3 h-3 text-slate-500" />
            <span className="text-xs text-slate-400 tabular-nums">{fmt(duration)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
