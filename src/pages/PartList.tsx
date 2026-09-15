import { ArrowLeft, ChevronRight, Lock, CheckCircle2, BookOpen, Target } from 'lucide-react';
import { reviewPondasiModules, modules, quizParts } from '@/data/appData';
import type { ModuleId, ReviewPondasiId, ProgressRecord } from '@/types';

interface PartListProps {
  mode: 'review' | 'quiz';
  reviewId?: ReviewPondasiId;
  moduleId?: ModuleId;
  onBack: () => void;
  onStart: (partId: string) => void;
  progress: ProgressRecord[];
}

export default function PartList({ mode, reviewId, moduleId, onBack, onStart, progress }: PartListProps) {
  const isReview = mode === 'review';
  const reviewMod = isReview ? reviewPondasiModules.find((m) => m.id === reviewId) : null;
  const quizMod = !isReview ? modules.find((m) => m.id === moduleId) : null;

  const title = isReview ? `${reviewMod?.title ?? ''} ${reviewMod?.titleJp ?? ''}` : `${quizMod?.title ?? ''} ${quizMod?.titleJp ?? ''}`;
  const subtitle = isReview ? `Pilih bagian review ${reviewMod?.title ?? ''}` : `Pilih minggu dan bagian kuis ${quizMod?.title ?? ''}`;

  function isPartPassed(partId: string): boolean {
    return progress.some((p) => p.partId === partId && p.passed);
  }

  function isPartUnlocked(partId: string, allPartIds: string[]): boolean {
    const idx = allPartIds.indexOf(partId);
    if (idx === 0) return true;
    return isPartPassed(allPartIds[idx - 1]);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <header className="bg-slate-900/80 backdrop-blur-md border-b border-slate-800 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-3">
          <button onClick={onBack} className="flex items-center gap-2 text-slate-300 hover:text-white text-sm font-medium transition">
            <ArrowLeft className="w-4 h-4" /> Kategori
          </button>
          <div className="h-5 w-px bg-slate-700" />
          <div className="flex items-center gap-2">
            {isReview ? <BookOpen className="w-5 h-5 text-red-400" /> : <Target className="w-5 h-5 text-red-400" />}
            <h1 className="font-bold text-white">{title}</h1>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <p className="text-sm text-slate-400 mb-6">{subtitle}</p>

        {isReview && reviewMod && (() => {
          const allPartIds = reviewMod.parts.map((p) => p.id);
          return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {reviewMod.parts.map((part, idx) => {
                const isUnlocked = isPartUnlocked(part.id, allPartIds);
                const isPassed = isPartPassed(part.id);
                const isFinal = idx === 8;
                return (
                  <button key={part.id} onClick={() => isUnlocked && onStart(part.id)} disabled={!isUnlocked}
                    className={`p-5 rounded-2xl border text-left transition ${
                      isUnlocked ? 'bg-slate-900/60 border-slate-800 hover:border-red-500/50 hover:shadow-md cursor-pointer' : 'bg-slate-900/30 border-slate-800/50 opacity-50 cursor-not-allowed'
                    }`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${isFinal ? 'bg-amber-950/60 text-amber-300 border border-amber-800' : 'bg-red-950/40 text-red-300 border border-red-800/60'}`}>
                        {isFinal ? 'Review Akhir' : `Bagian ${idx + 1}`}
                      </span>
                      {isPassed ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : isUnlocked ? <span className="text-xs text-red-400 font-medium">Tersedia</span> : <Lock className="w-4 h-4 text-slate-600" />}
                    </div>
                    <h3 className="font-bold text-white text-sm">{part.label}</h3>
                    <p className="text-xs text-slate-400 mt-1">{part.questionCount} soal acak</p>
                    {isUnlocked && !isPassed && (
                      <div className="flex items-center gap-1 mt-3 text-red-400 text-xs font-semibold">Mulai <ChevronRight className="w-3.5 h-3.5" /></div>
                    )}
                    {isPassed && <p className="text-xs text-green-500 font-semibold mt-3">Lulus</p>}
                    {!isUnlocked && <p className="text-xs text-slate-500 mt-3">Lulus bagian sebelumnya (≥85%)</p>}
                  </button>
                );
              })}
            </div>
          );
        })()}

        {!isReview && quizMod && (() => {
          const allPartIds = quizParts.map((p) => p.id);
          return (
            <div className="space-y-6">
              {Array.from({ length: 12 }, (_, weekIdx) => {
                const week = weekIdx + 1;
                const weekParts = quizParts.filter((p) => p.week === week);
                return (
                  <div key={week}>
                    <h3 className="text-sm font-bold text-slate-300 mb-3 px-1">Minggu {week}</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {weekParts.map((part) => {
                        const isUnlocked = isPartUnlocked(part.id, allPartIds);
                        const isPassed = isPartPassed(part.id);
                        return (
                          <button key={part.id} onClick={() => isUnlocked && onStart(part.id)} disabled={!isUnlocked}
                            className={`p-5 rounded-2xl border text-left transition ${
                              isUnlocked ? 'bg-slate-900/60 border-slate-800 hover:border-red-500/50 hover:shadow-md cursor-pointer' : 'bg-slate-900/30 border-slate-800/50 opacity-50 cursor-not-allowed'
                            }`}>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-red-950/40 text-red-300 border border-red-800/60">{part.label}</span>
                              {isPassed ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : isUnlocked ? <span className="text-xs text-red-400 font-medium">Tersedia</span> : <Lock className="w-4 h-4 text-slate-600" />}
                            </div>
                            <p className="text-xs text-slate-400 mt-1">{quizMod.totalQuestions} soal · Nilai lulus {quizMod.passingScore}%</p>
                            {isUnlocked && !isPassed && (
                              <div className="flex items-center gap-1 mt-3 text-red-400 text-xs font-semibold">Mulai <ChevronRight className="w-3.5 h-3.5" /></div>
                            )}
                            {isPassed && <p className="text-xs text-green-500 font-semibold mt-3">Lulus</p>}
                            {!isUnlocked && <p className="text-xs text-slate-500 mt-3">Lulus bagian sebelumnya (≥85%)</p>}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })()}
      </main>
    </div>
  );
}
