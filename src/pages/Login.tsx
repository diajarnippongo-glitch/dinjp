import { useState } from 'react';
import { Lock, Mail, Loader2, AlertCircle, MessageCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { APP_NAME, SENSEI_WHATSAPP } from '@/data/appData';
import Logo from '@/components/Logo';

export default function Login() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await signIn(email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none opacity-[0.06]" style={{
        backgroundImage: `repeating-linear-gradient(45deg, #ef4444 0, #ef4444 1px, transparent 1px, transparent 24px), repeating-linear-gradient(-45deg, #ef4444 0, #ef4444 1px, transparent 1px, transparent 24px)`,
      }} />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-red-600/20 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        <div className="flex flex-col items-center mb-8">
          <div className="mb-4">
            <Logo size={72} />
          </div>
          <h1 className="text-2xl font-bold text-white text-center">{APP_NAME}</h1>
          <p className="text-sm text-red-400 mt-1 font-medium">Kuis & Pelacak Progres</p>
        </div>

        <div className="bg-slate-900/80 backdrop-blur-sm rounded-2xl shadow-xl shadow-black/40 border border-slate-800 p-8">
          {error && (
            <div className="flex items-center gap-2 mb-4 p-3 rounded-lg bg-red-950/60 border border-red-800 text-red-300 text-sm">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="anda@contoh.com"
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800/60 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Kata Sandi</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800/60 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-sm font-semibold shadow-lg shadow-red-900/40 disabled:opacity-60 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? 'Memproses...' : 'Masuk'}
            </button>
          </form>

          <a
            href={`https://wa.me/${SENSEI_WHATSAPP}?text=Halo%20Sensei%2C%20saya%20lupa%20password%20akun%20saya.%20Mohon%20bantuan%20reset%20password.`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-green-700/50 bg-green-950/40 hover:bg-green-900/40 text-green-300 text-sm font-medium transition group"
          >
            <MessageCircle className="w-4 h-4 group-hover:scale-110 transition" />
            Lupa Password? Hubungi Sensei via WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}
