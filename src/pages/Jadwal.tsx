import { useState, useEffect } from 'react';
import { ArrowLeft, CalendarDays, Clock, CheckCircle2, ExternalLink, BookOpen, Plus, X } from 'lucide-react';
import { fetchSchedule, subscribeToTable } from '@/lib/dataAccess';
import { APP_NAME, SCHEDULE_CATEGORIES_ALL, getScheduleCategories } from '@/data/appData';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabaseClient';
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
  const { student } = useAuth();
  const isTeacher = student?.role === 'teacher';
  const classLevel = student?.classLevel ?? 'N3';
  const [sessions, setSessions] = useState<ScheduleSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const categories = isTeacher ? SCHEDULE_CATEGORIES_ALL : getScheduleCategories(classLevel);

  useEffect(() => {
    function load() {
      fetchSchedule(isTeacher ? undefined : categories).then(setSessions).catch(() => {}).finally(() => setLoading(false));
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
          {isTeacher && (
            <button onClick={() => setShowForm(true)} className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-semibold transition">
              <Plus className="w-3.5 h-3.5" /> Tambah Jadwal
            </button>
          )}
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <p className="text-sm text-slate-400 mb-2">Kelas dilaksanakan dua kali seminggu di {APP_NAME}.</p>
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
                          {item.classCategory && (
                            <span className="inline-block text-xs font-medium text-slate-400 bg-slate-800/60 border border-slate-700 px-2 py-0.5 rounded-md mb-2">{item.classCategory}</span>
                          )}
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

      {showForm && isTeacher && (
        <ScheduleForm onClose={() => setShowForm(false)} />
      )}
    </div>
  );
}

function ScheduleForm({ onClose }: { onClose: () => void }) {
  const [month, setMonth] = useState('September');
  const [dayName, setDayName] = useState('Selasa');
  const [dateNumber, setDateNumber] = useState(1);
  const [time, setTime] = useState('16:00 - 17:30');
  const [subject, setSubject] = useState('');
  const [classCategory, setClassCategory] = useState(SCHEDULE_CATEGORIES_ALL[0]);
  const [driveLink, setDriveLink] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const { error: insertError } = await supabase.from('schedule_sessions').insert({
      month,
      day_name: dayName,
      date_number: dateNumber,
      time,
      subject,
      class_category: classCategory,
      drive_link: driveLink || null,
    });
    setSaving(false);
    if (insertError) {
      setError(insertError.message);
      return;
    }
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-slate-900 rounded-2xl border border-slate-800 shadow-2xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
          <h2 className="font-bold text-white">Tambah Jadwal Baru</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-800 hover:text-white transition">
            <X className="w-4 h-4" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-red-950/60 border border-red-800 text-red-300 text-sm">{error}</div>
          )}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Bulan</label>
              <select value={month} onChange={(e) => setMonth(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-slate-700 bg-slate-800 text-sm text-white">
                <option>September</option>
                <option>Oktober</option>
                <option>November</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Hari</label>
              <select value={dayName} onChange={(e) => setDayName(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-slate-700 bg-slate-800 text-sm text-white">
                <option>Selasa</option>
                <option>Kamis</option>
                <option>Minggu</option>
                <option>Senin</option>
                <option>Rabu</option>
                <option>Jumat</option>
                <option>Sabtu</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Tanggal</label>
              <input type="number" min={1} max={31} value={dateNumber} onChange={(e) => setDateNumber(Number(e.target.value))} className="w-full px-3 py-2 rounded-lg border border-slate-700 bg-slate-800 text-sm text-white" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Waktu</label>
              <input type="text" value={time} onChange={(e) => setTime(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-slate-700 bg-slate-800 text-sm text-white" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Kategori Kelas</label>
            <select value={classCategory} onChange={(e) => setClassCategory(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-slate-700 bg-slate-800 text-sm text-white">
              {SCHEDULE_CATEGORIES_ALL.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Mata Pelajaran</label>
            <input type="text" value={subject} onChange={(e) => setSubject(e.target.value)} required placeholder="contoh: Moji & Goi" className="w-full px-3 py-2 rounded-lg border border-slate-700 bg-slate-800 text-sm text-white" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Link Google Drive (opsional)</label>
            <input type="text" value={driveLink} onChange={(e) => setDriveLink(e.target.value)} placeholder="https://drive.google.com/..." className="w-full px-3 py-2 rounded-lg border border-slate-700 bg-slate-800 text-sm text-white" />
          </div>
          <button type="submit" disabled={saving} className="w-full py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-sm font-semibold transition disabled:opacity-60">
            {saving ? 'Menyimpan...' : 'Simpan Jadwal'}
          </button>
        </form>
      </div>
    </div>
  );
}
