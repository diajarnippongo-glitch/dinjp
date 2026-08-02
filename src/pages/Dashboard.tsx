import { useState, useEffect } from 'react';
import {
  LogOut, ChevronRight, TrendingUp, Target, Award,
  Menu, Sparkles, Brain, BarChart3, AlertCircle,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import {
  APP_NAME, getDailyMotivation, mogiShikenGrade,
} from '@/data/appData';
import {
  fetchStudentProgress, fetchAllProfiles, fetchAllProgress, fetchAllBilling, subscribeToTable,
} from '@/lib/dataAccess';
import type { ProgressRecord, BillingRecord, Student } from '@/types';
import BurgerMenu, { type MenuView } from '@/components/BurgerMenu';
import SakuraBackground from '@/components/SakuraBackground';
import RadarChart from '@/components/RadarChart';
import StudentDetailModal from '@/components/StudentDetailModal';
import Logo from '@/components/Logo';

interface DashboardProps {
  onOpenReview: () => void;
  onOpenQuiz: () => void;
  onNavigate: (view: MenuView) => void;
}

export default function Dashboard({ onOpenReview, onOpenQuiz, onNavigate }: DashboardProps) {
  const { student, signOut } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const isTeacher = student?.role === 'teacher';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative">
      <SakuraBackground />
      <div className="relative z-10">
        <Header onMenu={() => setMenuOpen(true)} onHome={() => onNavigate('dashboard')} onSignOut={signOut} />
        {isTeacher ? (
          <TeacherDashboard />
        ) : (
          <StudentDashboard
            onOpenReview={onOpenReview}
            onOpenQuiz={onOpenQuiz}
            studentName={student?.name ?? ''}
            className={student?.className ?? ''}
            studentId={student?.id ?? ''}
            hafalan={student?.hafalanKosakata ?? 0}
          />
        )}
      </div>
      <BurgerMenu
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        onNavigate={onNavigate}
        current="dashboard"
        role={student?.role ?? 'student'}
      />
    </div>
  );
}

function Header({ onMenu, onHome, onSignOut }: { onMenu: () => void; onHome: () => void; onSignOut: () => void }) {
  return (
    <header className="bg-slate-900/80 backdrop-blur-md border-b border-slate-800 sticky top-0 z-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={onMenu} className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-300 hover:bg-slate-800 transition" aria-label="Menu">
            <Menu className="w-5 h-5" />
          </button>
          <button onClick={onHome} className="flex items-center gap-3 group">
            <Logo size={40} className="group-hover:scale-105 transition" />
            <div className="text-left">
              <h1 className="font-bold text-white leading-tight text-sm sm:text-base">{APP_NAME}</h1>
              <p className="text-xs text-red-400">Kuis & Pelacak Progres</p>
            </div>
          </button>
        </div>
        <button onClick={onSignOut} className="flex items-center gap-2 px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-800 text-sm font-medium transition">
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">Keluar</span>
        </button>
      </div>
    </header>
  );
}

function StudentDashboard({
  onOpenReview, onOpenQuiz, studentName, className, studentId, hafalan,
}: {
  onOpenReview: () => void;
  onOpenQuiz: () => void;
  studentName: string;
  className: string;
  studentId: string;
  hafalan: number;
}) {
  const motivation = getDailyMotivation();
  const [progress, setProgress] = useState<ProgressRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!studentId) {
      console.warn('[StudentDashboard] No studentId, skipping progress fetch');
      setLoading(false);
      return;
    }
    let cancelled = false;
    function load() {
      console.log('[StudentDashboard] Fetching progress for studentId:', studentId);
      fetchStudentProgress(studentId)
        .then((data) => {
          if (cancelled) return;
          console.log('[StudentDashboard] Received', data.length, 'progress records');
          setProgress(data);
          setError(null);
        })
        .catch((err) => {
          if (cancelled) return;
          console.error('[StudentDashboard] Failed to fetch progress:', err);
          setError('Gagal memuat data progres. Coba muat ulang halaman.');
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    }
    load();
    const unsub = subscribeToTable('student_progress', load);
    return () => { cancelled = true; unsub(); };
  }, [studentId]);

  const classLabel = className.includes('N4') ? 'Kelas N4' : 'Kelas N3';

  const reviewScores: Record<string, number> = {};
  const quizScores: Record<string, number> = {};
  for (const p of progress) {
    if (p.mode === 'review') {
      reviewScores[p.categoryId] = Math.max(reviewScores[p.categoryId] ?? 0, p.score);
    } else {
      quizScores[p.categoryId] = Math.max(quizScores[p.categoryId] ?? 0, p.score);
    }
  }

  const reviewLabels: Record<string, string> = {
    partikel: 'Partikel', 'kata-kerja': 'Perubahan', kosakata: 'Pengelompokkan',
    'bunpou-review': 'Tata Bahasa', kaiwa: 'Percakapan',
  };
  const quizLabels: Record<string, string> = {
    moji: 'Moji', goi: 'Goi', bunpou: 'Bunpou', dokkai: 'Dokkai', choukai: 'Choukai',
  };

  const reviewDisplay: Record<string, number> = {};
  Object.entries(reviewLabels).forEach(([k, v]) => { reviewDisplay[v] = reviewScores[k] ?? 0; });
  const quizDisplay: Record<string, number> = {};
  Object.entries(quizLabels).forEach(([k, v]) => { quizDisplay[v] = quizScores[k] ?? 0; });

  const allScores = [...Object.values(reviewScores), ...Object.values(quizScores)].filter((s) => s > 0);
  const overallAccuracy = allScores.length > 0 ? Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length) : 0;
  const totalCompleted = progress.reduce((sum, p) => sum + p.totalQuestions, 0);

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-6 bg-slate-900/60 backdrop-blur-sm rounded-2xl border border-slate-800 p-5">
        <p className="text-sm font-semibold text-red-400">{motivation.greeting}</p>
        <p className="text-xs text-slate-400 mt-0.5">Halo, {studentName.split(' ')[0]}!</p>
        <p className="text-sm text-slate-300 mt-2 italic leading-relaxed">{motivation.quote}</p>
      </div>

      {error && (
        <div className="mb-6 flex items-center gap-2 p-4 rounded-xl bg-red-950/60 border border-red-800 text-red-300 text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 mb-8">
        <button onClick={onOpenReview} className="flex items-center gap-3 p-5 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-red-500/50 hover:shadow-lg hover:shadow-red-900/20 transition text-left group">
          <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-red-400" />
          </div>
          <div>
            <p className="font-bold text-white">Review Pondasi</p>
            <p className="text-xs text-slate-400">5 kategori dasar</p>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-red-400 transition ml-auto" />
        </button>
        <button onClick={onOpenQuiz} className="flex items-center gap-3 p-5 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-red-500/50 hover:shadow-lg hover:shadow-red-900/20 transition text-left group">
          <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center">
            <Target className="w-5 h-5 text-red-400" />
          </div>
          <div>
            <p className="font-bold text-white">Quiz Kompetensi</p>
            <p className="text-xs text-slate-400">{classLabel}</p>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-red-400 transition ml-auto" />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-slate-900/60 backdrop-blur-sm rounded-2xl border border-slate-800 p-6">
          <h3 className="text-base font-semibold text-white mb-1">Grafik Progres Review Pondasi</h3>
          <p className="text-xs text-slate-400 mb-4">5 kategori evaluasi dasar</p>
          <RadarChart scores={reviewDisplay} label="Skor Review" color="blue" size={240} showMetrics dark />
        </div>
        <div className="bg-slate-900/60 backdrop-blur-sm rounded-2xl border border-slate-800 p-6">
          <h3 className="text-base font-semibold text-white mb-1">Grafik Progres Quiz Kompetensi</h3>
          <p className="text-xs text-slate-400 mb-4">5 kategori kuis utama</p>
          <RadarChart scores={quizDisplay} label="Skor Kuis" color="red" size={240} showMetrics dark />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <StatCard icon={<TrendingUp className="w-5 h-5" />} label="Akurasi Keseluruhan" value={loading ? '...' : `${overallAccuracy}%`} color="blue" />
        <StatCard icon={<Target className="w-5 h-5" />} label="Soal Selesai" value={loading ? '...' : `${totalCompleted}`} color="red" />
      </div>

      <section className="mb-10">
        <h3 className="text-lg font-semibold text-white mb-4">Hafalan Kosakata</h3>
        <div className="bg-slate-900/60 backdrop-blur-sm rounded-2xl border border-slate-800 p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-600 to-red-500 flex items-center justify-center text-white shadow-md shadow-red-900/40">
            <Brain className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1.5">
              <p className="text-sm font-semibold text-slate-200">Progres Hafalan</p>
              <p className="text-sm font-bold text-white">{hafalan}%</p>
            </div>
            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full rounded-full bg-gradient-to-r from-red-600 to-red-400 transition-all duration-700" style={{ width: `${hafalan}%` }} />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function TeacherDashboard() {
  const [activeClass, setActiveClass] = useState<'N3' | 'N4'>('N3');
  const [profiles, setProfiles] = useState<Student[]>([]);
  const [progress, setProgress] = useState<ProgressRecord[]>([]);
  const [billing, setBilling] = useState<BillingRecord[]>([]);
  const [selected, setSelected] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    function load() {
      Promise.all([fetchAllProfiles(), fetchAllProgress(), fetchAllBilling()])
        .then(([p, prog, b]) => { setProfiles(p); setProgress(prog); setBilling(b); })
        .catch(() => {})
        .finally(() => setLoading(false));
    }
    load();
    const unsubProfiles = subscribeToTable('profiles', load);
    const unsubProgress = subscribeToTable('student_progress', load);
    const unsubBilling = subscribeToTable('billing', load);
    return () => { unsubProfiles(); unsubProgress(); unsubBilling(); };
  }, []);

  const classStudents = profiles.filter((s) => s.classLevel === activeClass && s.role === 'student');
  const classBilling = billing.filter((b) => b.classLevel === activeClass);

  const reviewLabels: Record<string, string> = {
    partikel: 'Partikel', 'kata-kerja': 'Perubahan', kosakata: 'Pengelompokkan',
    'bunpou-review': 'Tata Bahasa', kaiwa: 'Percakapan',
  };
  const quizLabels: Record<string, string> = {
    moji: 'Moji', goi: 'Goi', bunpou: 'Bunpou', dokkai: 'Dokkai', choukai: 'Choukai',
  };

  const studentIds = classStudents.map((s) => s.id);
  const classReviewScores: Record<string, number> = {};
  const classQuizScores: Record<string, number> = {};
  Object.keys(reviewLabels).forEach((cat) => {
    const scores = progress.filter((p) => p.mode === 'review' && p.categoryId === cat && studentIds.includes(p.userId ?? ''));
    classReviewScores[reviewLabels[cat]] = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b.score, 0) / scores.length) : 0;
  });
  Object.keys(quizLabels).forEach((cat) => {
    const scores = progress.filter((p) => p.mode === 'quiz' && p.categoryId === cat && studentIds.includes(p.userId ?? ''));
    classQuizScores[quizLabels[cat]] = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b.score, 0) / scores.length) : 0;
  });

  const lunasCount = classBilling.filter((b) => b.status === 'lunas').length;
  const belumCount = classBilling.filter((b) => b.status === 'belum').length;
  const totalOutstanding = classBilling.filter((b) => b.status === 'belum').reduce((s, b) => s + b.amount, 0);

  const gradeColors: Record<string, string> = { red: 'bg-red-950/60 text-red-300 border-red-800', amber: 'bg-amber-950/60 text-amber-300 border-amber-800', green: 'bg-green-950/60 text-green-300 border-green-800' };

  function openWhatsApp(rec: BillingRecord) {
    const message = `Halo ${rec.studentName}, pembayaran les periode ${rec.period} sebesar Rp${rec.amount.toLocaleString('id-ID')} belum diterima. Mohon segera lakukan pembayaran. Terima kasih.`;
    const url = `https://wa.me/${rec.whatsapp}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  }

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white">Dashboard <span className="text-red-500">Sensei</span></h2>
        <p className="text-slate-400 mt-1">Pantau perkembangan setiap siswa per kelas</p>
      </div>

      <div className="flex gap-3 mb-6">
        {(['N3', 'N4'] as const).map((level) => (
          <button key={level} onClick={() => setActiveClass(level)}
            className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition ${activeClass === level ? 'bg-red-600 text-white shadow-md shadow-red-900/40' : 'bg-slate-900/60 border border-slate-800 text-slate-300 hover:border-red-500/50 hover:text-red-400'}`}>
            Kelas {level}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-slate-900/60 backdrop-blur-sm rounded-2xl border border-slate-800 p-6">
          <h3 className="text-base font-semibold text-white mb-1">Radar Review Pondasi — Kelas {activeClass}</h3>
          <p className="text-xs text-slate-400 mb-4">Rata-rata kelas per kategori</p>
          <RadarChart scores={classReviewScores} label="Review Pondasi" color="blue" size={240} showMetrics dark />
        </div>
        <div className="bg-slate-900/60 backdrop-blur-sm rounded-2xl border border-slate-800 p-6">
          <h3 className="text-base font-semibold text-white mb-1">Radar Quiz Kompetensi — Kelas {activeClass}</h3>
          <p className="text-xs text-slate-400 mb-4">Rata-rata kelas per kategori</p>
          <RadarChart scores={classQuizScores} label="Quiz Kompetensi" color="red" size={240} showMetrics dark />
        </div>
      </div>

      <div className="bg-slate-900/60 backdrop-blur-sm rounded-2xl border border-slate-800 overflow-hidden mb-8">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-800/50 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="text-left px-4 py-3 font-semibold">Nama Siswa</th>
                <th className="text-center px-4 py-3 font-semibold">Hafalan</th>
                <th className="text-center px-4 py-3 font-semibold">Mogi Shiken</th>
                <th className="text-center px-4 py-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {loading ? (
                <tr><td colSpan={4} className="px-4 py-8 text-center text-slate-500">Memuat data...</td></tr>
              ) : classStudents.length === 0 ? (
                <tr><td colSpan={4} className="px-4 py-8 text-center text-slate-500">Belum ada siswa terdaftar di kelas ini.</td></tr>
              ) : (
                classStudents.map((s) => {
                  const grade = mogiShikenGrade(s.mogiShikenTotal, s.classLevel);
                  return (
                    <tr key={s.id} onClick={() => setSelected(s)} className="hover:bg-slate-800/40 cursor-pointer transition">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-white hover:text-red-400 transition">{s.name}</span>
                          <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
                        </div>
                      </td>
                      <td className="text-center px-4 py-3"><span className="font-bold text-slate-200">{s.hafalanKosakata}%</span></td>
                      <td className="text-center px-4 py-3"><span className="font-bold text-white">{s.mogiShikenTotal}</span><span className="text-xs text-slate-500">/180</span></td>
                      <td className="text-center px-4 py-3"><span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${gradeColors[grade.color]}`}>{grade.label}</span></td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatCard icon={<Award className="w-5 h-5" />} label="Tagihan Lunas" value={`${lunasCount}`} color="green" />
        <StatCard icon={<Target className="w-5 h-5" />} label="Belum Lunas" value={`${belumCount}`} color="red" />
        <StatCard icon={<TrendingUp className="w-5 h-5" />} label="Total Tertunggak" value={`Rp${totalOutstanding.toLocaleString('id-ID')}`} color="blue" />
      </div>

      <div className="bg-slate-900/60 backdrop-blur-sm rounded-2xl border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-800/50 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="text-left px-4 py-3 font-semibold">Nama Siswa</th>
                <th className="text-left px-4 py-3 font-semibold hidden sm:table-cell">Kelas</th>
                <th className="text-left px-4 py-3 font-semibold">Periode</th>
                <th className="text-right px-4 py-3 font-semibold">Jumlah</th>
                <th className="text-center px-4 py-3 font-semibold">Status</th>
                <th className="text-center px-4 py-3 font-semibold">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {classBilling.map((rec) => (
                <tr key={rec.id} className="hover:bg-slate-800/40 transition">
                  <td className="px-4 py-3 font-medium text-white">{rec.studentName}</td>
                  <td className="px-4 py-3 text-slate-400 hidden sm:table-cell">{rec.className}</td>
                  <td className="px-4 py-3 text-slate-300">{rec.period}</td>
                  <td className="px-4 py-3 text-right font-semibold text-slate-200">Rp{rec.amount.toLocaleString('id-ID')}</td>
                  <td className="px-4 py-3 text-center">
                    {rec.status === 'lunas' ? (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-green-950/60 text-green-300 border border-green-800">Lunas</span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-red-950/60 text-red-300 border border-red-800">Belum Lunas</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {rec.status === 'belum' ? (
                      <button onClick={() => openWhatsApp(rec)} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-600 hover:bg-green-500 text-white text-xs font-semibold transition shadow-sm">
                        WhatsApp
                      </button>
                    ) : (
                      <span className="text-xs text-slate-600">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <p className="text-xs text-slate-500 mt-3 flex items-center gap-1.5">
        <BarChart3 className="w-3.5 h-3.5" />
        Klik nama siswa untuk melihat grafik jaring laba-laba detail. Kelas N4: skor &lt; 90 = Tidak Lulus, 90–180 = Lulus A2.
      </p>

      {selected && <StudentDetailModal student={selected} progress={progress} onClose={() => setSelected(null)} />}
    </main>
  );
}

function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string; color: 'blue' | 'red' | 'green' }) {
  const colors = {
    blue: 'from-blue-600 to-blue-500 shadow-blue-900/40',
    red: 'from-red-600 to-red-500 shadow-red-900/40',
    green: 'from-green-600 to-green-500 shadow-green-900/40',
  };
  return (
    <div className="bg-slate-900/60 backdrop-blur-sm rounded-2xl border border-slate-800 p-5 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colors[color]} flex items-center justify-center text-white shadow-md`}>
        {icon}
      </div>
      <div>
        <p className="text-xl font-bold text-white">{value}</p>
        <p className="text-xs text-slate-400">{label}</p>
      </div>
    </div>
  );
}
