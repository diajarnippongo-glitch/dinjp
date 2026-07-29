import { ArrowLeft, ChevronRight, BookOpen, Target } from 'lucide-react';
import { reviewPondasiModules, modules } from '@/data/appData';
import type { ModuleId, ReviewPondasiId } from '@/types';

interface CategoryListProps {
  mode: 'review' | 'quiz';
  onBack: () => void;
  onSelectReview: (id: ReviewPondasiId) => void;
  onSelectQuiz: (id: ModuleId) => void;
}

export default function CategoryList({ mode, onBack, onSelectReview, onSelectQuiz }: CategoryListProps) {
  const isReview = mode === 'review';
  const title = isReview ? 'Review Pondasi' : 'Quiz Kompetensi';
  const subtitle = isReview ? 'Pilih kategori review dasar' : 'Pilih kategori kuis kompetensi';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <header className="bg-slate-900/80 backdrop-blur-md border-b border-slate-800 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-3">
          <button onClick={onBack} className="flex items-center gap-2 text-slate-300 hover:text-white text-sm font-medium transition">
            <ArrowLeft className="w-4 h-4" /> Beranda
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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {isReview
            ? reviewPondasiModules.map((cat) => (
                <button key={cat.id} onClick={() => onSelectReview(cat.id)}
                  className="flex items-center gap-4 p-5 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-red-500/50 hover:shadow-lg hover:shadow-red-900/20 transition text-left group">
                  <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0">
                    <BookOpen className="w-5 h-5 text-red-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2">
                      <h3 className="font-bold text-white">{cat.title}</h3>
                      <span className="text-sm font-semibold text-red-400">{cat.titleJp}</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">{cat.description}</p>
                    <p className="text-xs text-slate-500 mt-1">9 bagian · Bagian 1-8: 10 soal · Bagian Akhir: 100 soal</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-red-400 transition shrink-0" />
                </button>
              ))
            : modules.map((cat) => (
                <button key={cat.id} onClick={() => onSelectQuiz(cat.id)}
                  className="flex items-center gap-4 p-5 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-red-500/50 hover:shadow-lg hover:shadow-red-900/20 transition text-left group">
                  <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0">
                    <Target className="w-5 h-5 text-red-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2">
                      <h3 className="font-bold text-white">{cat.title}</h3>
                      <span className="text-sm font-semibold text-red-400">{cat.titleJp}</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">{cat.description}</p>
                    <p className="text-xs text-slate-500 mt-1">Minggu 1 Bagian 1 - Minggu 12 Bagian 2</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-red-400 transition shrink-0" />
                </button>
              ))}
        </div>
      </main>
    </div>
  );
}
