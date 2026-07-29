import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { supabase } from '@/lib/supabaseClient';
import type { Student, Role } from '@/types';
import { SENSEI_EMAIL, SENSEI_WHATSAPP } from '@/data/appData';

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

function defaultClassName(role: Role): string {
  return role === 'teacher' ? 'Pengajar' : 'JLPT N3 - Kelas Pagi';
}

function makeMockStudent(id: string, email: string, name: string, role: Role): Student {
  return {
    id,
    email,
    name,
    className: defaultClassName(role),
    classLevel: role === 'teacher' ? 'N3' : 'N3',
    role,
    hafalanKosakata: role === 'student' ? 78 : 0,
    mogiShikenTotal: role === 'student' ? 142 : 0,
    whatsapp: role === 'student' ? '6281234567001' : SENSEI_WHATSAPP,
  };
}

const STORAGE_KEY = 'din-auth-user';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setStudent(JSON.parse(saved));
      }
    } catch {
      // ignore
    }
    setLoading(false);
  }, []);

  async function signIn(email: string, _password: string) {
    const cleanEmail = email.trim().toLowerCase();
    const role = detectRole(cleanEmail);
    const name = cleanEmail.split('@')[0].replace(/[^a-zA-Z]/g, '') || 'Siswa';
    const displayName = name.charAt(0).toUpperCase() + name.slice(1);
    const id = role === 'teacher'
      ? 'a0000000-0000-0000-0000-000000000001'
      : `v-${cleanEmail.replace(/[^a-z0-9]/g, '')}`;

    const newStudent = makeMockStudent(id, cleanEmail, role === 'teacher' ? 'Sensei' : displayName, role);

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newStudent));
    } catch {
      // ignore
    }
    setStudent(newStudent);
  }

  function signOut() {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
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
