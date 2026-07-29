import { X } from 'lucide-react';
import RadarChart from '@/components/RadarChart';
import { mogiShikenGrade } from '@/data/appData';
import type { Student, ProgressRecord } from '@/types';

interface StudentDetailModalProps {
  student: Student;
  progress: ProgressRecord[];
  onClose: () => void;
}

export default function StudentDetailModal({ student, progress, onClose }: StudentDetailModalProps) {
  const grade = mogiShikenGrade(student.mogiShikenTotal, student.classLevel);
  const gradeColors: Record<string, string> = {
    red: 'bg-red-950/60 text-red-300 border-red-800',
    amber: 'bg-amber-950/60 text-amber-300 border-amber-800',
    green: 'bg-green-950/60 text-green-300 border-green-800',
  };

  const reviewLabels: Record<string, string> = {
    partikel: 'Partikel', 'kata-kerja': 'Perubahan', kosakata: 'Pengelompokkan',
    'bunpou-review': 'Tata Bahasa', kaiwa: 'Percakapan',
  };
  const quizLabels: Record<string, string> = {
    moji: 'Moji', goi: 'Goi', bunpou: 'Bunpou', dokkai: 'Dokkai', choukai: 'Choukai',
  };

  const studentProgress = progress.filter((p) => p.userId === student.id);
  const reviewScores: Record<string, number> = {};
  const quizScores: Record<string, number> = {};
  for (const p of studentProgress) {
    if (p.mode === 'review') {
      const label = reviewLabels[p.categoryId] ?? p.categoryId;
      reviewScores[label] = Math.max(reviewScores[label] ?? 0, p.score);
    } else {
      const label = quizLabels[p.categoryId] ?? p.categoryId;
      quizScores[label] = Math.max(quizScores[label] ?? 0, p.score);
    }
  }

  Object.values(reviewLabels).forEach((label) => { if (!(label in reviewScores)) reviewScores[label] = 0; });
  Object.values(quizLabels).forEach((label) => { if (!(label in quizScores)) quizScores[label] = 0; });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div className="bg-slate-900 rounded-2xl shadow-2xl shadow-black/50 border border-slate-800 w-full max-w-3xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 bg-slate-900 border-b border-slate-800 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <div>
            <h3 className="text-lg font-bold text-white">{student.name}</h3>
            <p className="text-sm text-slate-400">{student.className}</p>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-800 hover:text-white transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-red-950/40 to-slate-800/40 border border-slate-700 mb-6">
            <div>
              <p className="text-xs text-slate-400 font-medium">Mogi Shiken (Total)</p>
              <p className="text-2xl font-bold text-white">{student.mogiShikenTotal}<span className="text-sm text-slate-500 font-normal">/180</span></p>
            </div>
            <span className={`text-sm font-semibold px-3 py-1.5 rounded-full border ${gradeColors[grade.color]}`}>{grade.label}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
            <div>
              <p className="text-sm font-semibold text-slate-200 mb-3 text-center">Radar Review Pondasi</p>
              <RadarChart scores={reviewScores} label="Review" color="blue" size={220} showMetrics dark />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-200 mb-3 text-center">Radar Quiz Kompetensi</p>
              <RadarChart scores={quizScores} label="Kuis" color="red" size={220} showMetrics dark />
            </div>
          </div>

          <div className="mb-2 p-4 rounded-xl bg-slate-800/40 border border-slate-700">
            <p className="text-xs text-slate-400 font-medium mb-1">Hafalan Kosakata</p>
            <div className="flex items-center gap-3">
              <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
                <div className="h-full rounded-full bg-gradient-to-r from-red-600 to-red-400 transition-all duration-700" style={{ width: `${student.hafalanKosakata}%` }} />
              </div>
              <span className="font-bold text-white text-sm">{student.hafalanKosakata}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
