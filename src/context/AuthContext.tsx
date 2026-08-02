import { createContext, useContext, useState, useEffect, useRef, type ReactNode } from 'react';
import { supabase } from '@/lib/supabaseClient';
import type { Student, Role } from '@/types';
import { SENSEI_EMAIL } from '@/data/appData';

interface AuthContextValue {
  student: Student | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function detectRole(email: string): Role {
  return email.trim().toLowerCase() === SENSEI_EMAIL ? 'teacher' : 'student';
}

function buildFallback(userId: string, email: string, role: Role): Student {
  const name = email.split('@')[0].replace(/[^a-zA-Z]/g, '') || 'Siswa';
  const displayName = name.charAt(0).toUpperCase() + name.slice(1);
  return {
    id: userId,
    email,
    name: role === 'teacher' ? 'Sensei' : displayName,
    className: role === 'teacher' ? 'Pengajar' : 'JLPT N3 - Kelas Pagi',
    classLevel: 'N3',
    role,
    hafalanKosakata: 0,
    mogiShikenTotal: 0,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const mountedRef = useRef(true);
  const isSigningInRef = useRef(false);

  useEffect(() => {
    mountedRef.current = true;

    supabase.auth.getSession().then(({ data, error }) => {
      if (!mountedRef.current) return;
      if (error || !data.session?.user) {
        setLoading(false);
        return;
      }
      loadProfile(data.session.user.id, data.session.user.email ?? '');
    }).catch(() => {
      if (mountedRef.current) setLoading(false);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mountedRef.current) return;
      if (isSigningInRef.current) return;
      if (session?.user) {
        (async () => {
          await loadProfile(session.user.id, session.user.email ?? '');
        })();
      } else {
        setStudent(null);
        setLoading(false);
      }
    });

    return () => {
      mountedRef.current = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  async function loadProfile(userId: string, email: string) {
    const role = detectRole(email);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (!mountedRef.current) return;

      if (error) throw error;

      if (data) {
        const profile: Student = {
          id: data.id,
          email: data.email ?? email,
          name: data.full_name ?? email.split('@')[0],
          className: data.class_name ?? '',
          classLevel: (data.class_level as 'N3' | 'N4') ?? 'N3',
          role: (data.role as Role) ?? role,
          hafalanKosakata: data.hafalan_kosakata ?? 0,
          mogiShikenTotal: data.mogi_shiken_total ?? 0,
          whatsapp: data.whatsapp != null ? String(data.whatsapp) : undefined,
        };
        setStudent(profile);
      } else {
        setStudent(buildFallback(userId, email, role));
      }
    } catch (err) {
      console.error('[loadProfile] Error loading profile for', userId, err);
      if (!mountedRef.current) return;
      setStudent(buildFallback(userId, email, role));
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }

  async function signIn(email: string, password: string) {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !password) {
      throw new Error('Email dan password harus diisi');
    }

    isSigningInRef.current = true;

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });

      if (error || !data.user) {
        throw error ?? new Error('Gagal masuk. Silakan coba lagi.');
      }

      await loadProfile(data.user.id, data.user.email ?? '');
    } finally {
      isSigningInRef.current = false;
    }
  }

  async function signOut() {
    await supabase.auth.signOut();
    setStudent(null);
  }

  return (
    <AuthContext.Provider value={{ student, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
