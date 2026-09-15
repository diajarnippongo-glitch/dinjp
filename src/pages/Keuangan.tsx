import { useState, useEffect } from 'react';
import { ArrowLeft, Wallet, MessageCircle, CheckCircle2, XCircle } from 'lucide-react';
import { fetchAllBilling, subscribeToTable } from '@/lib/dataAccess';
import type { BillingRecord } from '@/types';

interface KeuanganProps {
  onBack: () => void;
}

export default function Keuangan({ onBack }: KeuanganProps) {
  const [activeClass, setActiveClass] = useState<'N3' | 'N4'>('N3');
  const [billing, setBilling] = useState<BillingRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    function load() {
      fetchAllBilling(activeClass).then(setBilling).catch(() => {}).finally(() => setLoading(false));
    }
    load();
    const unsub = subscribeToTable('billing', load);
    return () => { unsub(); };
  }, [activeClass]);

  const records = billing;
  const lunasCount = records.filter((r) => r.status === 'lunas').length;
  const belumCount = records.filter((r) => r.status === 'belum').length;
  const totalOutstanding = records.filter((r) => r.status === 'belum').reduce((sum, r) => sum + r.amount, 0);

  function openWhatsApp(rec: BillingRecord) {
    const message = `Halo ${rec.studentName}, pembayaran les periode ${rec.period} sebesar Rp${rec.amount.toLocaleString('id-ID')} belum diterima. Mohon segera lakukan pembayaran. Terima kasih.`;
    const url = `https://wa.me/${rec.whatsapp}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
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
            <Wallet className="w-5 h-5 text-red-400" />
            <h1 className="font-bold text-white">Informasi Keuangan & Tagihan</h1>
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

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-slate-900/60 backdrop-blur-sm rounded-2xl border border-slate-800 p-5 flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-green-950/60 flex items-center justify-center border border-green-800"><CheckCircle2 className="w-5 h-5 text-green-400" /></div>
            <div><p className="text-2xl font-bold text-white">{lunasCount}</p><p className="text-xs text-slate-400">Tagihan Lunas</p></div>
          </div>
          <div className="bg-slate-900/60 backdrop-blur-sm rounded-2xl border border-slate-800 p-5 flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-red-950/60 flex items-center justify-center border border-red-800"><XCircle className="w-5 h-5 text-red-400" /></div>
            <div><p className="text-2xl font-bold text-white">{belumCount}</p><p className="text-xs text-slate-400">Belum Lunas</p></div>
          </div>
          <div className="bg-slate-900/60 backdrop-blur-sm rounded-2xl border border-slate-800 p-5 flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-amber-950/60 flex items-center justify-center border border-amber-800"><Wallet className="w-5 h-5 text-amber-400" /></div>
            <div><p className="text-xl font-bold text-white">Rp{totalOutstanding.toLocaleString('id-ID')}</p><p className="text-xs text-slate-400">Total Tertunggak</p></div>
          </div>
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
                {loading ? (
                  <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-500">Memuat data...</td></tr>
                ) : records.length === 0 ? (
                  <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-500">Belum ada tagihan untuk kelas ini.</td></tr>
                ) : (
                  records.map((rec) => (
                    <tr key={rec.id} className="hover:bg-slate-800/40 transition">
                      <td className="px-4 py-3 font-medium text-white">{rec.studentName}</td>
                      <td className="px-4 py-3 text-slate-400 hidden sm:table-cell">{rec.className}</td>
                      <td className="px-4 py-3 text-slate-300">{rec.period}</td>
                      <td className="px-4 py-3 text-right font-semibold text-slate-200">Rp{rec.amount.toLocaleString('id-ID')}</td>
                      <td className="px-4 py-3 text-center">
                        {rec.status === 'lunas' ? (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-green-950/60 text-green-300 border border-green-800"><CheckCircle2 className="w-3.5 h-3.5" /> Lunas</span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-red-950/60 text-red-300 border border-red-800"><XCircle className="w-3.5 h-3.5" /> Belum Lunas</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {rec.status === 'belum' ? (
                          <button onClick={() => openWhatsApp(rec)} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-600 hover:bg-green-500 text-white text-xs font-semibold transition shadow-sm">
                            <MessageCircle className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Ingatkan via</span> WhatsApp
                          </button>
                        ) : (
                          <span className="text-xs text-slate-600">—</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
