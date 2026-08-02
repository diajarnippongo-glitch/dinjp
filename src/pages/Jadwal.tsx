import { useState, useEffect } from 'react';
import { ArrowLeft, CalendarDays, Clock, CheckCircle2, ExternalLink, BookOpen } from 'lucide-react';
import { fetchSchedule, subscribeToTable } from '@/lib/dataAccess';
import { APP_NAME } from '@/data/appData';
import type { ScheduleSession } from '@/types';

interface JadwalProps {
  onBack: () => void;
}

function isSessionPast(session: ScheduleSession): boolean {
  const monthMap: Record<string, number> = { September: 8, Oktober: 9, November: 10 };
  const monthIdx = monthMap[session.month];
  if (!monthIdx) return false;
  const now = new Date();
  const year = now.getFullYear();
  const sessionDate = new Date(year, monthIdx - 1, session.dateNumber, 23, 59, 59);
  return now > sessionDate;
}

const monthOrder = ['September', 'Oktober', 'November'];

export default function Jadwal({ onBack }: JadwalProps) {
  const [sessions, setSessions] = useState<ScheduleSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    function load() {
      fetchSchedule().then(setSessions).catch(() => {}).finally(() => setLoading(false));
    }
    load();
    const unsub = subscribeToTable('schedule_sessions', load);
    return () => { unsub(); };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <header className="bg-slate-900/80 backdrop-blur-md border-b border-slate-800 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-3">
          <button onClick={onBack} className="flex items-center gap-2 text-slate-300 hover:text-white text-sm font-medium transition">
            <ArrowLeft className="w-4 h-4" /> Beranda
          </button>
          <div className="h-5 w-px bg-slate-700" />
          <div className="flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-red-400" />
            <h1 className="font-bold text-white">Jadwal Belajar</h1>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <p className="text-sm text-slate-400 mb-2">Kelas dilaksanakan dua kali seminggu (Selasa & Kamis) di {APP_NAME}.</p>
        <p className="text-xs text-slate-500 mb-8">Sesi yang sudah berlalu otomatis ditandai "Telah Belajar" dan dapat diakses materinya.</p>

        {loading ? (
          <p className="text-slate-400 text-center py-12">Memuat jadwal...</p>
        ) : (
          <div className="space-y-10">
            {monthOrder.map((month) => {
              const monthSessions = sessions.filter((s) => s.month === month);
              if (monthSessions.length === 0) return null;
              return (
                <section key={month}>
                  <div className="flex items-center gap-2 mb-4">
                    <h2 className="text-lg font-bold text-white">{month}</h2>
                    <span className="text-xs text-slate-500">({monthSessions.length} sesi)</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {monthSessions.map((item) => {
                      const past = isSessionPast(item);
                      return (
                        <div key={item.id} className={`rounded-2xl border p-5 transition ${past ? 'bg-green-950/30 border-green-800' : 'bg-slate-900/60 border-slate-800 hover:border-red-500/50 hover:shadow-lg hover:shadow-red-900/20'}`}>
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold px-2.5 py-1 rounded-full bg-red-950/60 text-red-300 border border-red-800">{item.dayName}</span>
                              <span className="text-sm font-semibold text-slate-200">{item.dateNumber} {item.month}</span>
                            </div>
                            {past ? (
                              <span className="flex items-center gap-1 text-xs font-semibold text-green-300 bg-green-950/60 border border-green-800 px-2.5 py-1 rounded-full">
                                <CheckCircle2 className="w-3 h-3" /> Telah Belajar
                              </span>
                            ) : (
                              <CalendarDays className="w-5 h-5 text-slate-600" />
                            )}
                          </div>
                          <h3 className="font-bold text-white mb-2">{item.subject}</h3>
                          <div className="flex items-center gap-2 text-sm text-slate-400 mb-3">
                            <Clock className="w-4 h-4" /><span>{item.time}</span>
                          </div>
                          {past && item.driveLink && (
                            <a href={item.driveLink} target="_blank" rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-green-600 hover:bg-green-500 text-white text-xs font-semibold transition">
                              <ExternalLink className="w-3.5 h-3.5" /> Lihat Rekaman & Materi
                            </a>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </section>
              );
            })}
          </div>
        )}

        <div className="mt-10 p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-start gap-2">
          <BookOpen className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
          <p className="text-xs text-slate-400">Materi dan rekaman setiap sesi tersimpan di Google Drive. Klik "Lihat Rekaman & Materi" pada sesi yang sudah selesai untuk mengaksesnya.</p>
        </div>
      </main>
    </div>
  );
}
