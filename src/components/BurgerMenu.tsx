import { X, Home, BarChart3, Wallet, CalendarDays, MessageCircle } from 'lucide-react';
import type { Role } from '@/types';
import { SENSEI_WHATSAPP, APP_NAME } from '@/data/appData';
import Logo from '@/components/Logo';

export type MenuView = 'dashboard' | 'data-progres' | 'keuangan' | 'jadwal' | 'tagihan-saya';

interface BurgerMenuProps {
  open: boolean;
  onClose: () => void;
  onNavigate: (view: MenuView) => void;
  current: MenuView;
  role: Role;
}

export default function BurgerMenu({ open, onClose, onNavigate, current, role }: BurgerMenuProps) {
  const teacherItems: { id: MenuView; label: string; icon: React.ComponentType<{ className?: string }>; desc: string }[] = [
    { id: 'dashboard', label: 'Beranda', icon: Home, desc: 'Dashboard utama' },
    { id: 'data-progres', label: 'Data Progres Belajar', icon: BarChart3, desc: 'Progres siswa N3 & N4' },
    { id: 'keuangan', label: 'Informasi Keuangan & Tagihan', icon: Wallet, desc: 'Tagihan dan pembayaran' },
  ];

  const studentItems: { id: MenuView; label: string; icon: React.ComponentType<{ className?: string }>; desc: string }[] = [
    { id: 'dashboard', label: 'Beranda', icon: Home, desc: 'Dashboard utama' },
    { id: 'jadwal', label: 'Jadwal Belajar', icon: CalendarDays, desc: 'Jadwal pelajaran per bulan' },
    { id: 'tagihan-saya', label: 'Status Tagihan Saya', icon: Wallet, desc: 'Tagihan September - November' },
  ];

  const items = role === 'teacher' ? teacherItems : studentItems;

  function openSenseiWhatsApp() {
    const message = `Halo Sensei, saya ingin bertanya mengenai pelajaran di ${APP_NAME}.`;
    const url = `https://wa.me/${SENSEI_WHATSAPP}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  }

  return (
    <>
      <div className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${open ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={onClose} />
      <aside className={`fixed top-0 left-0 z-50 h-full w-72 bg-slate-900 border-r border-slate-800 shadow-2xl shadow-black/50 transition-transform duration-300 ease-out flex flex-col ${open ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <Logo size={36} />
            <div>
              <p className="font-bold text-white text-sm leading-tight">{role === 'teacher' ? 'Menu Sensei' : 'Menu Siswa'}</p>
              <p className="text-xs text-slate-400">{role === 'teacher' ? 'Panel Pengajar' : 'Panel Siswa'}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-800 hover:text-white transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="p-4 space-y-1.5 flex-1">
          {items.map((item) => {
            const Icon = item.icon;
            const active = current === item.id;
            return (
              <button key={item.id} onClick={() => { onNavigate(item.id); onClose(); }}
                className={`w-full flex items-start gap-3 p-3 rounded-xl text-left transition group ${active ? 'bg-red-600/15 border border-red-500/40' : 'hover:bg-slate-800/60 border border-transparent'}`}>
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition ${active ? 'bg-red-600 text-white' : 'bg-slate-800 text-slate-400 group-hover:bg-slate-700 group-hover:text-white'}`}>
                  <Icon className="w-4.5 h-4.5" />
                </div>
                <div className="min-w-0">
                  <p className={`text-sm font-semibold ${active ? 'text-red-400' : 'text-slate-200'}`}>{item.label}</p>
                  <p className="text-xs text-slate-500 truncate">{item.desc}</p>
                </div>
              </button>
            );
          })}
        </nav>

        <div className="p-5 border-t border-slate-800">
          <button onClick={openSenseiWhatsApp} className="w-full flex items-center gap-3 p-3 rounded-xl bg-green-600/10 hover:bg-green-600/20 border border-green-600/30 transition group">
            <div className="w-9 h-9 rounded-lg bg-green-600 flex items-center justify-center shrink-0">
              <MessageCircle className="w-5 h-5 text-white" />
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold text-green-400">Hubungi Sensei</p>
              <p className="text-xs text-green-500/70">via WhatsApp</p>
            </div>
          </button>
          <p className="text-xs text-slate-500 text-center mt-3">{APP_NAME}</p>
        </div>
      </aside>
    </>
  );
}
