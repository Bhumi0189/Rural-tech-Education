import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Home, BookOpen, LayoutDashboard, UserCircle, LogOut, ChevronDown, Check, Sparkles, ShieldCheck, Settings2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { Language, getTranslation } from '../lib/translations';

interface LayoutProps {
  children: React.ReactNode;
  role: 'student' | 'teacher';
  setRole: (role: 'student' | 'teacher') => void;
  fullName: string;
  onLogout: () => void;
  onOpenProfile?: () => void;
  onBackToHome?: () => void;
  language: Language;
  onLanguageChange: (language: Language) => void;
}

export default function Layout({ children, role, setRole, fullName, onLogout, onOpenProfile, onBackToHome, language, onLanguageChange }: LayoutProps) {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDocumentClick = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener('mousedown', onDocumentClick);
    return () => document.removeEventListener('mousedown', onDocumentClick);
  }, []);

  const displayName = fullName || (role === 'student' ? 'Student Profile' : 'Teacher Profile');
  const profileLabel = role === 'student' ? 'Student' : 'Teacher';
  const profileRole = role === 'student' ? 'Learner Account' : 'Instructor Account';
  const initials = useMemo(() => {
    const parts = displayName.trim().split(/\s+/).filter(Boolean);
    return parts.length > 0
      ? parts.slice(0, 2).map((part) => part[0]?.toUpperCase()).join('')
      : role === 'student'
        ? 'ST'
        : 'TE';
  }, [displayName, role]);

  return (
    <div className="min-h-screen pb-24 md:pb-0">
      {/* Top App Bar */}
      <nav className="sticky top-0 z-50 w-full border-b border-white/20 bg-emerald-950/95 shadow-[0_10px_30px_rgba(0,0,0,0.14)] backdrop-blur-xl dark:border-stone-800 dark:bg-stone-950/95">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          {/* Left: Logo & App Name */}
          <div className="flex items-center gap-3 md:gap-4">
            <button 
              onClick={onBackToHome}
              className="flex-shrink-0 rounded-full border border-white/10 p-2 text-emerald-200 transition-all hover:border-white/20 hover:bg-white/10 active:scale-95"
              title={getTranslation(language, 'backToHome')}
            >
              <Home className="h-5 w-5" />
            </button>
            <span className="hidden font-headline text-lg font-bold tracking-tight text-emerald-100 sm:inline dark:text-emerald-100">
              {getTranslation(language, 'appName')}
            </span>
          </div>

          {/* Right: Language + Profile */}
          <div className="flex items-center gap-2 md:gap-4">
            {/* Language Toggle - Desktop */}
            <div className="hidden items-center rounded-full border border-white/10 bg-white/10 p-1 lg:flex">
              <button 
                onClick={() => onLanguageChange('en')}
                className={cn(
                  "rounded-full px-3 py-1 font-headline text-xs font-bold transition-all",
                  language === 'en'
                    ? "bg-primary text-on-primary shadow-sm"
                    : "text-on-surface-variant hover:bg-surface-container"
                )}
              >
                EN
              </button>
              <button 
                onClick={() => onLanguageChange('hi')}
                className={cn(
                  "rounded-full px-3 py-1 font-headline text-xs font-bold transition-all",
                  language === 'hi'
                    ? "bg-primary text-on-primary shadow-sm"
                    : "text-on-surface-variant hover:bg-surface-container"
                )}
              >
                HI
              </button>
            </div>

            {/* Profile Button */}
            <div ref={popoverRef} className="relative">
              <button
                onClick={() => setIsProfileOpen((current) => !current)}
                className="flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-2 py-1.5 transition-all hover:bg-white/15 active:scale-[0.98]"
              >
                <div className={cn(
                  "flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold text-white shadow-md",
                  role === 'student' ? "bg-gradient-to-br from-emerald-600 to-emerald-800" : "bg-gradient-to-br from-stone-700 to-stone-900"
                )}>
                  {initials}
                </div>
                <div className="hidden min-w-0 text-left sm:block">
                  <p className="truncate font-headline text-xs font-bold text-emerald-100">{displayName}</p>
                  <p className="text-[9px] font-semibold uppercase tracking-widest text-emerald-300">{profileLabel}</p>
                </div>
                <ChevronDown className={cn("h-4 w-4 flex-shrink-0 text-emerald-300 transition-transform", isProfileOpen && "rotate-180")} />
              </button>

              {isProfileOpen && (
                <div className="absolute right-0 top-[calc(100%+0.75rem)] w-80 overflow-hidden rounded-[1.5rem] border border-white/50 bg-white/95 shadow-[0_20px_60px_rgba(0,0,0,0.18)] backdrop-blur-xl dark:border-stone-700/60 dark:bg-stone-950/95">
                  <div className={cn(
                    "relative overflow-hidden px-5 py-5 text-white",
                    role === 'student'
                      ? "bg-gradient-to-br from-green-600 via-green-700 to-emerald-900"
                      : "bg-gradient-to-br from-green-600 via-green-700 to-emerald-900"
                  )}>
                    <div className="absolute inset-0 opacity-30">
                      <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-white/20 blur-2xl"></div>
                      <div className="absolute bottom-0 left-0 h-20 w-20 rounded-full bg-lime-300/20 blur-2xl"></div>
                    </div>
                    <div className="relative flex items-center gap-4">
                      <div className="flex h-16 w-16 items-center justify-center rounded-3xl border border-white/20 bg-white/15 text-xl font-extrabold text-white shadow-lg backdrop-blur-md">
                        {initials}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-headline text-xl font-extrabold tracking-tight">{displayName}</p>
                        <p className="mt-1 text-sm text-white/80">{profileRole}</p>
                        <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-white/95">
                          <ShieldCheck className="h-3.5 w-3.5" />
                          {getTranslation(language, 'verifiedAccount')}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 p-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-2xl bg-surface-container-low px-4 py-3">
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant">{getTranslation(language, 'role')}</p>
                        <p className="mt-1 font-headline text-sm font-bold text-on-surface">{getTranslation(language, role === 'student' ? 'student' : 'teacher')}</p>
                      </div>
                      <div className="rounded-2xl bg-surface-container-low px-4 py-3">
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant">{getTranslation(language, 'status')}</p>
                        <p className={cn(
                          "mt-1 inline-flex items-center gap-1.5 font-headline text-sm font-bold",
                          role === 'student' ? "text-emerald-700" : "text-stone-800"
                        )}>
                          <Check className="h-4 w-4" />
                          {getTranslation(language, 'active')}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setIsProfileOpen(false);
                        onOpenProfile?.();
                      }}
                      className={cn(
                        "flex w-full items-center justify-between rounded-2xl border px-4 py-3.5 text-left transition-all hover:-translate-y-0.5 hover:shadow-md",
                        role === 'student'
                          ? "border-emerald-100 bg-emerald-50/80 hover:bg-emerald-50"
                          : "border-stone-200 bg-stone-50/90 hover:bg-stone-100"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "flex h-10 w-10 items-center justify-center rounded-xl",
                          role === 'student' ? "bg-emerald-700 text-white" : "bg-stone-900 text-white"
                        )}>
                          <UserCircle className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-headline text-sm font-bold text-on-surface">{getTranslation(language, 'openProfile')}</p>
                          <p className="text-xs text-on-surface-variant">{getTranslation(language, 'viewAccountDetails')}</p>
                        </div>
                      </div>
                      <Sparkles className={cn("h-4 w-4", role === 'student' ? "text-emerald-700" : "text-stone-700")} />
                    </button>

                    <button
                      onClick={onLogout}
                      className="flex w-full items-center justify-between rounded-2xl border border-red-100 bg-red-50/80 px-4 py-3.5 text-left text-red-700 transition-all hover:-translate-y-0.5 hover:bg-red-100 hover:shadow-md"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-600 text-white">
                          <LogOut className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-headline text-sm font-bold">{getTranslation(language, 'logout')}</p>
                          <p className="text-xs text-red-600/80">{getTranslation(language, 'endThisSession')}</p>
                        </div>
                      </div>
                      <Settings2 className="h-4 w-4 text-red-400" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 pb-12 pt-6 sm:px-6 lg:pt-8">
        {children}
      </main>

      {/* Bottom Navigation (Mobile) */}
      <nav className="fixed bottom-0 left-0 z-50 flex w-full items-center justify-around rounded-t-[1.75rem] border-t border-white/30 bg-white/90 pb-5 pt-3 shadow-[0_-10px_30px_rgba(0,0,0,0.08)] backdrop-blur-xl md:hidden dark:bg-stone-100/90">
        <NavItem icon={<Home className="h-5 w-5" />} label="Home" active={false} />
        <NavItem icon={<BookOpen className="h-5 w-5" />} label="Courses" active={false} />
        <NavItem icon={<LayoutDashboard className="h-5 w-5" />} label="Dashboard" active={true} />
        <NavItem icon={<UserCircle className="h-5 w-5" />} label="Profile" active={false} />
      </nav>
    </div>
  );
}

function NavItem({ icon, label, active }: { icon: React.ReactNode; label: string; active: boolean }) {
  return (
    <button
      className={cn(
        "flex flex-col items-center justify-center px-5 py-2 transition-all duration-300",
        active 
          ? "rounded-2xl bg-emerald-100 text-emerald-900 dark:bg-emerald-900/40 dark:text-emerald-100" 
          : "text-stone-500 hover:text-emerald-600 dark:text-stone-400 dark:hover:text-emerald-300"
      )}
    >
      {icon}
      <span className="mt-1 font-headline text-[10px] font-medium tracking-wide">{label}</span>
    </button>
  );
}
