import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Mail, Lock, User, ArrowRight, ArrowLeft, GraduationCap, Presentation } from 'lucide-react';
import { cn } from '../lib/utils';

interface AuthPageProps {
  role: 'student' | 'teacher';
  initialMode?: 'login' | 'signup';
  onBack: () => void;
  onAuthSuccess: (role: 'student' | 'teacher', fullName: string, studentClass?: string) => void;
}

interface AuthResponse {
  token: string;
  user: {
    fullName: string;
    role: 'student' | 'teacher';
    studentClass?: string;
  };
}

export default function AuthPage({ role: initialRole, initialMode = 'login', onBack, onAuthSuccess }: AuthPageProps) {
  const [isLogin, setIsLogin] = useState(initialMode === 'login');
  const [role, setRole] = useState<'student' | 'teacher'>(initialRole);
  const [loading, setLoading] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [studentClass, setStudentClass] = useState('Class 10');
  const [error, setError] = useState('');

  const classOptions = ['Class 10', 'Class 9', 'Class 8', 'Class 7', 'Class 6', 'Class 5', 'Class 4', 'Class 3', 'Class 2', 'Class 1'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/signup';
      const payload = isLogin
        ? { email, password }
        : { fullName, email, password, role, studentClass: role === 'student' ? studentClass : 'Class 10' };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = (await response.json()) as AuthResponse | { message?: string };

      if (!response.ok) {
        setError((data as { message?: string }).message || 'Authentication failed.');
        setLoading(false);
        return;
      }

      const authData = data as AuthResponse;
      localStorage.setItem('authToken', authData.token);
      localStorage.setItem('authRole', authData.user.role);
      localStorage.setItem('authName', authData.user.fullName);
      if (authData.user.studentClass) {
        localStorage.setItem('authClass', authData.user.studentClass);
      }
      setLoading(false);
      onAuthSuccess(authData.user.role, authData.user.fullName, authData.user.studentClass);
    } catch {
      setLoading(false);
      setError('Unable to reach server. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 py-12">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md space-y-8"
      >
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors font-headline text-sm font-bold"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Home
        </button>

        <div className="text-center">
          <div className="flex justify-center gap-6 mb-8">
            <button
              onClick={() => setRole('student')}
              className={cn(
                "flex flex-col items-center gap-2 transition-all group",
                role === 'student' ? "text-primary" : "text-on-surface-variant/40 hover:text-on-surface-variant"
              )}
            >
              <div className={cn(
                "flex h-16 w-16 items-center justify-center rounded-2xl transition-all shadow-md",
                role === 'student' ? "bg-primary text-on-primary" : "bg-surface-container-high"
              )}>
                <GraduationCap className="h-8 w-8" />
              </div>
              <span className="font-headline text-xs font-bold tracking-widest uppercase">Student</span>
            </button>
            <button
              onClick={() => setRole('teacher')}
              className={cn(
                "flex flex-col items-center gap-2 transition-all group",
                role === 'teacher' ? "text-secondary" : "text-on-surface-variant/40 hover:text-on-surface-variant"
              )}
            >
              <div className={cn(
                "flex h-16 w-16 items-center justify-center rounded-2xl transition-all shadow-md",
                role === 'teacher' ? "bg-secondary text-on-primary" : "bg-surface-container-high"
              )}>
                <Presentation className="h-8 w-8" />
              </div>
              <span className="font-headline text-xs font-bold tracking-widest uppercase">Teacher</span>
            </button>
          </div>
          <h2 className="font-headline text-3xl font-extrabold tracking-tight text-on-surface">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p className="mt-2 text-on-surface-variant">
            {role === 'student' ? 'Student' : 'Teacher'} Portal • {isLogin ? 'Login to your account' : 'Join the Digital Homestead'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 rounded-3xl bg-surface-container-lowest p-8 shadow-xl border border-outline-variant/10">
          {!isLogin && (
            <div className="space-y-2">
              <label className="text-xs font-bold font-headline text-on-surface-variant uppercase tracking-wider">Full Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-on-surface-variant/50" />
                <input
                  required
                  type="text"
                  placeholder="Rahul Sharma"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full rounded-xl bg-surface-container-low py-3 pl-12 pr-4 font-body transition-all focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/20 outline-none"
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-xs font-bold font-headline text-on-surface-variant uppercase tracking-wider">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-on-surface-variant/50" />
              <input
                required
                type="email"
                placeholder="rahul@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl bg-surface-container-low py-3 pl-12 pr-4 font-body transition-all focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/20 outline-none"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold font-headline text-on-surface-variant uppercase tracking-wider">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-on-surface-variant/50" />
              <input
                required
                type="password"
                placeholder="••••••••"
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl bg-surface-container-low py-3 pl-12 pr-4 font-body transition-all focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/20 outline-none"
              />
            </div>
          </div>

          {!isLogin && role === 'student' && (
            <div className="space-y-2">
              <label className="text-xs font-bold font-headline text-on-surface-variant uppercase tracking-wider">Select Class</label>
              <select
                value={studentClass}
                onChange={(e) => setStudentClass(e.target.value)}
                className="w-full rounded-xl bg-surface-container-low px-4 py-3 font-body transition-all focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/20 outline-none"
              >
                {classOptions.map((cls) => (
                  <option key={cls} value={cls}>{cls}</option>
                ))}
              </select>
            </div>
          )}

          {error && <p className="text-sm font-semibold text-error">{error}</p>}

          <button
            disabled={loading}
            type="submit"
            className={cn(
              "flex w-full items-center justify-center gap-2 rounded-xl py-4 font-headline font-bold text-on-primary transition-all active:scale-95 disabled:opacity-50",
              role === 'student' ? "bg-primary shadow-lg shadow-primary/20" : "bg-secondary shadow-lg shadow-secondary/20"
            )}
          >
            {loading ? 'Processing...' : (isLogin ? 'Login' : 'Sign Up')}
            {!loading && <ArrowRight className="h-4 w-4" />}
          </button>
        </form>

        <div className="text-center">
          <button
            onClick={() => {
              setError('');
              setIsLogin(!isLogin);
            }}
            className="text-sm font-bold text-on-surface-variant hover:text-primary transition-colors font-headline"
          >
            {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Login"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
