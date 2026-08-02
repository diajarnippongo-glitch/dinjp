import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
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

export function AuthProvider({ children }: { children: ReactNode }) {
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      if (data.session?.user) {
        loadProfile(data.session.user.id, data.session.user.email ?? '');
      } else {
        setLoading(false);
      }
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        loadProfile(session.user.id, session.user.email ?? '');
      } else {
        setStudent(null);
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
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
          whatsapp: data.whatsapp ?? undefined,
        };
        setStudent(profile);
      } else {
        const name = email.split('@')[0].replace(/[^a-zA-Z]/g, '') || 'Siswa';
        const displayName = name.charAt(0).toUpperCase() + name.slice(1);
        const fallback: Student = {
          id: userId,
          email,
          name: role === 'teacher' ? 'Sensei' : displayName,
          className: role === 'teacher' ? 'Pengajar' : 'JLPT N3 - Kelas Pagi',
          classLevel: 'N3',
          role,
          hafalanKosakata: 0,
          mogiShikenTotal: 0,
        };
        setStudent(fallback);
      }
    } catch {
      const name = email.split('@')[0].replace(/[^a-zA-Z]/g, '') || 'Siswa';
      const displayName = name.charAt(0).toUpperCase() + name.slice(1);
      const fallback: Student = {
        id: userId,
        email,
        name: role === 'teacher' ? 'Sensei' : displayName,
        className: role === 'teacher' ? 'Pengajar' : 'JLPT N3 - Kelas Pagi',
        classLevel: 'N3',
        role,
        hafalanKosakata: 0,
        mogiShikenTotal: 0,
      };
      setStudent(fallback);
    } finally {
      setLoading(false);
    }
  }

  async function signIn(email: string, password: string) {
    const cleanEmail = email.trim().toLowerCase();
    const { error } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password,
    });
    if (error) {
      throw new Error('Email atau password salah');
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
