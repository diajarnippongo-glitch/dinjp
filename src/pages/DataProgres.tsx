import { useState, useEffect } from 'react';
import { ArrowLeft, GraduationCap, ChevronDown, ChevronUp, CheckCircle2, XCircle, Lock } from 'lucide-react';
import { fetchAllProfiles, fetchAllProgress, subscribeToTable } from '@/lib/dataAccess';
import { mogiShikenGrade } from '@/data/appData';
import type { Student, ProgressRecord } from '@/types';

interface DataProgresProps {
  onBack: () => void;
}

const REVIEW_CATS = [
  { id: 'partikel', label: 'Partikel (助詞)' },
  { id: 'kata-kerja', label: 'Perubahan (動詞変化)' },
  { id: 'kosakata', label: 'Pengelompokkan (単語整理)' },
  { id: 'bunpou-review', label: 'Tata Bahasa (文法)' },
  { id: 'kaiwa', label: 'Percakapan (会話表現)' },
];

const QUIZ_CATS = [
  { id: 'moji', label: 'Moji (文字)' },
  { id: 'goi', label: 'Goi (語彙)' },
  { id: 'bunpou', label: 'Bunpou (文法)' },
  { id: 'dokkai', label: 'Dokkai (読解)' },
  { id: 'choukai', label: 'Choukai (聴解)' },
];

export default function DataProgres({ onBack }: DataProgresProps) {
  const [activeClass, setActiveClass] = useState<'N3' | 'N4'>('N3');
  const [profiles, setProfiles] = useState<Student[]>([]);
  const [progress, setProgress] = useState<ProgressRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    function load() {
      Promise.all([fetchAllProfiles(), fetchAllProgress()])
        .then(([p, prog]) => { setProfiles(p); setProgress(prog); })
        .catch(() => {})
        .finally(() => setLoading(false));
    }
    load();
    const unsubProfiles = subscribeToTable('profiles', load);
    const unsubProgress = subscribeToTable('student_progress', load);
    return () => { unsubProfiles(); unsubProgress(); };
  }, []);

  const students = profiles.filter((s) => s.classLevel === activeClass && s.role === 'student');
  const gradeColors: Record<string, string> = { red: 'bg-red-950/60 text-red-300 border-red-800', amber: 'bg-amber-950/60 text-amber-300 border-amber-800', green: 'bg-green-950/60 text-green-300 border-green-800' };

  function getCatScores(userId: string, mode: 'review' | 'quiz', cats: { id: string; label: string }[]) {
    return cats.map((cat) => {
      const records = progress.filter((p) => p.userId === userId && p.mode === mode && p.categoryId === cat.id);
      const best = records.length > 0 ? Math.max(...records.map((r) => r.score)) : null;
      const passed = records.some((r) => r.passed);
      const attempts = records.length;
      return { ...cat, best, passed, attempts };
    });
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <header className="bg-slate-900/80 backdrop-blur-md border-b border-slate-800 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-3">
          <button onClick={onBack} className="flex items-center gap-2 text-slate-300 hover:text-white text-sm font-medium transition">
            <ArrowLeft className="w-4 h-4" /> Beranda
          </button>
          <div className="h-5 w-px bg-slate-700" />
          <div className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-red-400" />
            <h1 className="font-bold text-white">Data Progres Belajar</h1>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex gap-3 mb-6">
          {(['N3', 'N4'] as const).map((level) => (
            <button key={level} onClick={() => setActiveClass(level)}
              className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition ${activeClass === level ? 'bg-red-600 text-white shadow-md shadow-red-900/40' : 'bg-slate-900/60 border border-slate-800 text-slate-300 hover:border-red-500/50 hover:text-red-400'}`}>
              Kelas {level}
            </button>
          ))}
        </div>

        {loading ? (
          <p className="text-center text-slate-400 py-12">Memuat data...</p>
        ) : students.length === 0 ? (
          <p className="text-center text-slate-400 py-12">Belum ada siswa di kelas ini.</p>
        ) : (
          <div className="space-y-4">
            {students.map((s) => {
              const grade = mogiShikenGrade(s.mogiShikenTotal, s.classLevel);
              const isOpen = expanded === s.id;
              const reviewScores = getCatScores(s.id, 'review', REVIEW_CATS);
              const quizScores = getCatScores(s.id, 'quiz', QUIZ_CATS);
              const reviewAvg = reviewScores.filter((r) => r.best !== null).length > 0
                ? Math.round(reviewScores.filter((r) => r.best !== null).reduce((a, b) => a + (b.best ?? 0), 0) / reviewScores.filter((r) => r.best !== null).length)
                : 0;
              const quizAvg = quizScores.filter((r) => r.best !== null).length > 0
                ? Math.round(quizScores.filter((r) => r.best !== null).reduce((a, b) => a + (b.best ?? 0), 0) / quizScores.filter((r) => r.best !== null).length)
                : 0;

              return (
                <div key={s.id} className="bg-slate-900/60 backdrop-blur-sm rounded-2xl border border-slate-800 overflow-hidden">
                  <button onClick={() => setExpanded(isOpen ? null : s.id)} className="w-full flex items-center justify-between px-5 py-4 hover:bg-slate-800/40 transition">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-600 to-red-400 flex items-center justify-center text-white font-bold text-sm">
                        {s.name.charAt(0)}
                      </div>
                      <div className="text-left">
                        <p className="font-semibold text-white">{s.name}</p>
                        <p className="text-xs text-slate-400">{s.className} · Hafalan {s.hafalanKosakata}% · Mogi {s.mogiShikenTotal}/180</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${gradeColors[grade.color]}`}>{grade.label}</span>
                      {isOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                    </div>
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-5 border-t border-slate-800 pt-4 space-y-6">
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="text-sm font-bold text-slate-200">Review Pondasi</h3>
                          <span className="text-xs text-slate-400">Rata-rata: <span className="font-bold text-red-400">{reviewAvg}%</span></span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                          {reviewScores.map((cat) => (
                            <div key={cat.id} className={`rounded-xl border p-3 ${cat.best !== null ? 'border-slate-700 bg-slate-800/40' : 'border-dashed border-slate-700/50 bg-slate-800/20'}`}>
                              <p className="text-xs font-medium text-slate-300 mb-1.5">{cat.label}</p>
                              {cat.best !== null ? (
                                <div className="flex items-center justify-between">
                                  <span className={`text-lg font-bold ${cat.best >= 70 ? 'text-green-400' : cat.best >= 50 ? 'text-amber-400' : 'text-red-400'}`}>{cat.best}%</span>
                                  {cat.passed ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <XCircle className="w-4 h-4 text-red-400" />}
                                </div>
                              ) : (
                                <div className="flex items-center gap-1.5 text-slate-500"><Lock className="w-3.5 h-3.5" /><span className="text-xs">Belum dikerjakan</span></div>
                              )}
                              {cat.attempts > 0 && <p className="text-[10px] text-slate-500 mt-1">{cat.attempts}x percobaan</p>}
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="text-sm font-bold text-slate-200">Quiz Kompetensi <span className="text-xs font-normal text-slate-500">({activeClass})</span></h3>
                          <span className="text-xs text-slate-400">Rata-rata: <span className="font-bold text-red-400">{quizAvg}%</span></span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                          {quizScores.map((cat) => (
                            <div key={cat.id} className={`rounded-xl border p-3 ${cat.best !== null ? 'border-slate-700 bg-slate-800/40' : 'border-dashed border-slate-700/50 bg-slate-800/20'}`}>
                              <p className="text-xs font-medium text-slate-300 mb-1.5">{cat.label}</p>
                              {cat.best !== null ? (
                                <div className="flex items-center justify-between">
                                  <span className={`text-lg font-bold ${cat.best >= 70 ? 'text-green-400' : cat.best >= 50 ? 'text-amber-400' : 'text-red-400'}`}>{cat.best}%</span>
                                  {cat.passed ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <XCircle className="w-4 h-4 text-red-400" />}
                                </div>
                              ) : (
                                <div className="flex items-center gap-1.5 text-slate-500"><Lock className="w-3.5 h-3.5" /><span className="text-xs">Belum dikerjakan</span></div>
                              )}
                              {cat.attempts > 0 && <p className="text-[10px] text-slate-500 mt-1">{cat.attempts}x percobaan</p>}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <p className="text-xs text-slate-500 mt-4">Klik nama siswa untuk melihat rincian skor per kategori. Kelas N4: skor &lt; 90 = Tidak Lulus, 90-180 = Lulus A2.</p>
      </main>
    </div>
  );
}
