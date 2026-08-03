import { Award, Home, RotateCcw, Trophy, CheckCircle2, XCircle } from 'lucide-react';
import type { ModuleId, QuizQuestion, ReviewPondasiId } from '@/types';
import { modules, reviewPondasiModules } from '@/data/appData';

interface ResultProps {
  mode: 'review' | 'quiz';
  reviewId?: ReviewPondasiId;
  moduleId?: ModuleId;
  partId: string;
  answers: Record<string, string>;
  questions: QuizQuestion[];
  onRetry: () => void;
  onHome: () => void;
}

function getMotivation(score: number): { title: string; message: string; tone: 'harsh' | 'encourage' | 'praise' } {
  if (score < 50) {
    const harsh = [
      'Nyatanya, kalau kamu terus bersantai begini, jangan harap bisa lulus JLPT. Bangun dan perbaiki sikap belajarmu sekarang.',
      'Skor ini menunjukkan kamu belum serius. Jangan mencari alasan — carilah waktu untuk benar-benar belajar.',
      'Realitasnya: tidak ada jalan pintas untuk menguasai bahasa. Kerja kerasmu sejauh ini belum cukup. Ayo, berbenah!',
    ];
    return { title: 'Peringatan Tegas', message: harsh[score % harsh.length], tone: 'harsh' };
  }
  if (score >= 85) {
    const praise = [
      'Luar biasa! Kamu telah berhasil lulus dengan hasil yang membanggakan. すばらしい! Pertahankan kualitas belajarmu ini.',
      'Kerja bagus sekali! Kamu telah membuktikan bahwa usaha keras membuahkan hasil. よくできました! Terus tingkatkan!',
      'Sempurna! Kamu telah menguasai materi ini dengan sangat baik. Selamat, kamu pantas berbangga! おめでとうございます!',
    ];
    return { title: 'Selamat, Kamu Lulus!', message: praise[score % praise.length], tone: 'praise' };
  }
  const brackets: { range: [number, number]; messages: string[] }[] = [
    { range: [51, 60], messages: ['Kamu sudah mulai memahami, tapi masih perlu tekad yang lebih kuat. Teruslah berlatih, jangan menyerah!', 'Lumayan, tapi kamu bisa lebih dari ini. Tingkatkan intensitas belajarmu. がんばって!'] },
    { range: [61, 70], messages: ['Progres yang baik! Kamu di jalur yang benar. Sedikit lagi untuk mencapai target. Pertahankan!', 'Kerja yang cukup baik. Fokuskan belajar pada bagian yang masih sulit, kamu pasti bisa. いける!'] },
    { range: [71, 84], messages: ['Hampir sampai! Sedikit lagi dan kamu akan lulus. Perdalam materi yang belum sempurna. もう少し!', 'Sangat dekat dengan target! Percaya pada kemampuanmu dan tingkatkan sedikit lagi usahamu. ふぁいと!'] },
  ];
  const bracket = brackets.find((b) => score >= b.range[0] && score <= b.range[1]) ?? brackets[0];
  const idx = Math.floor((score - bracket.range[0]) / 10) % bracket.messages.length;
  return { title: 'Terus Semangat!', message: bracket.messages[idx], tone: 'encourage' };
}

export default function Result({ mode, reviewId, moduleId, partId, answers, questions, onRetry, onHome }: ResultProps) {
  const isReview = mode === 'review';
  const reviewMod = isReview ? reviewPondasiModules.find((m) => m.id === reviewId) : null;
  const quizMod = !isReview ? modules.find((m) => m.id === moduleId) : null;
  const passingScore = 85;
  const total = questions.length;
  const correct = questions.filter((q) => answers[q.id] === q.correctOptionId).length;
  const score = Math.round((correct / total) * 100);
  const passed = score >= passingScore;
  const motivation = getMotivation(score);

  const circleSize = 160;
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  const toneStyles = {
    harsh: 'bg-red-950/40 border-red-800 text-red-300',
    encourage: 'bg-amber-950/40 border-amber-800 text-amber-300',
    praise: 'bg-green-950/40 border-green-800 text-green-300',
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="bg-slate-900/80 backdrop-blur-sm rounded-2xl border border-slate-800 shadow-xl shadow-black/40 p-8 text-center">
          <div className="flex justify-center mb-6">
            <div className="relative" style={{ width: circleSize, height: circleSize }}>
              <svg width={circleSize} height={circleSize} className="-rotate-90">
                <circle cx={circleSize / 2} cy={circleSize / 2} r={radius} fill="none" stroke="#1e293b" strokeWidth="12" />
                <circle cx={circleSize / 2} cy={circleSize / 2} r={radius} fill="none" stroke="url(#scoreGradient)" strokeWidth="12" strokeLinecap="round"
                  strokeDasharray={circumference} strokeDashoffset={offset} className="transition-all duration-1000 ease-out" />
                <defs>
                  <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor={passed ? '#22c55e' : '#f87171'} />
                    <stop offset="100%" stopColor={passed ? '#16a34a' : '#ef4444'} />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-bold text-white">{score}%</span>
                <span className="text-xs text-slate-400">{correct}/{total} benar</span>
              </div>
            </div>
          </div>

          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold mb-4 ${passed ? 'bg-green-950/60 text-green-300 border border-green-800' : 'bg-red-950/60 text-red-300 border border-red-800'}`}>
            {passed ? <Trophy className="w-4 h-4" /> : <Award className="w-4 h-4" />}
            {passed ? 'Lulus' : 'Belum Lulus'}
          </div>

          <h2 className="text-xl font-bold text-white mb-1">
            {isReview ? `${reviewMod?.title ?? ''} ${reviewMod?.titleJp ?? ''} · ${partId}` : `${quizMod?.title ?? ''} ${quizMod?.titleJp ?? ''} · ${partId}`}
          </h2>
          <p className="text-sm text-slate-400 mb-4">Nilai kelulusan: {passingScore}%</p>

          <div className={`rounded-xl border p-4 mb-6 ${toneStyles[motivation.tone]}`}>
            <p className="font-semibold mb-1">{motivation.title}</p>
            <p className="text-sm leading-relaxed">{motivation.message}</p>
          </div>

          <div className="text-left bg-slate-800/40 rounded-xl border border-slate-700 p-4 mb-6 max-h-64 overflow-y-auto">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Rincian Jawaban</p>
            <div className="space-y-2">
              {questions.map((q, i) => {
                const isCorrect = answers[q.id] === q.correctOptionId;
                return (
                  <div key={q.id} className={`flex items-center gap-2 text-sm p-2 rounded-lg ${isCorrect ? 'bg-green-950/30' : 'bg-red-950/30'}`}>
                    {isCorrect ? <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" /> : <XCircle className="w-4 h-4 text-red-500 shrink-0" />}
                    <span className="text-slate-300 font-medium">Soal {i + 1}</span>
                    <span className={`font-semibold ${isCorrect ? 'text-green-400' : 'text-red-400'}`}>{isCorrect ? 'Benar' : 'Salah'}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex gap-3">
            <button onClick={onHome} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-slate-700 bg-slate-800/60 text-slate-200 text-sm font-semibold hover:bg-slate-800 transition">
              <Home className="w-4 h-4" /> Beranda
            </button>
            <button onClick={onRetry} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-sm font-semibold shadow-md shadow-red-900/40 transition">
              <RotateCcw className="w-4 h-4" /> Ulangi
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
