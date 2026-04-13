import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Menu, 
  PlayCircle, 
  Star, 
  User, 
  TrendingUp, 
  Grid, 
  Home, 
  BookOpen, 
  Info, 
  LogIn, 
  HelpCircle,
  Search,
  GraduationCap,
  Sparkles,
  Loader2,
  ChevronDown,
  UserCircle,
  LogOut,
  Check,
  ShieldCheck,
  Settings2
} from 'lucide-react';
import { cn } from '../lib/utils';
import { Language, getTranslation } from '../lib/translations';

interface Course {
  id?: string;
  subject: string;
  title: string;
  description: string;
  teacher: string;
  duration: string;
  isNew?: boolean;
  isPopular?: boolean;
  image: string;
  videoUrl?: string;
}

interface WatchHistoryItem {
  videoId: string;
  lastWatchedSeconds: number;
  lastWatchedAt: string | null;
}

interface HomePageProps {
  onSelectRole: (role: 'student' | 'teacher', mode: 'login' | 'signup') => void;
  isAuthenticated?: boolean;
  fullName?: string;
  role?: 'student' | 'teacher';
  onLogout?: () => void;
  onOpenProfile?: () => void;
  language?: Language;
  onLanguageChange?: (language: Language) => void;
  token?: string;
  studentClass?: string;
  onOpenVideoPage?: (video: { title: string; videoUrl: string; startSeconds?: number }) => void;
}

const INITIAL_COURSES: Course[] = [
  {
    subject: 'SCIENCE',
    title: 'The Wonders of Plant Life',
    description: 'Learn how plants grow from seeds, the process of photosynthesis, and why rural forests are essential for our ecosystem.',
    teacher: 'Mrs. Sharma',
    duration: '12:45',
    isNew: true,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDnpKmg4gbe2_SDHS_1faqilb-ca6gRjNJn8JBkr087W5dnj-epjk2ku9S5i4IY6-yOlQVv_Jr7ASFfQJ609IEcXWhUOAo0iAGsAi0T7900VBrK9WEz4kOfCY0iuFxxlm6AlhAU3WNa-HEXWy7iFaGeIinded4doEhlhFeppupq32Irsom-JBDVEFdI7rdPGemVyFTD_n9OzhzS1AG3mpp9HplVfRy2Xbm7XF-3P4jkPtW6YDPDxvmJnR29wNDUzdlOqp3N05lGaI0'
  },
  {
    subject: 'MATHEMATICS',
    title: 'Practical Geometry in Farms',
    description: 'Understanding shapes and areas through real-life examples of farm field measurements and crop storage designs.',
    teacher: 'Mr. Patel',
    duration: '18:20',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD1NcB_stl-_SL_uqOqciH-KCQPPh_Pha3M46f_YiCrVWPvyHuWWWoPLEyElPe-Nu0KRhcUoawpnuPVTqP_IcF0eCBcQgh9jr3wLkYAvmlN1QreAMxqQQgHr7KTKyVj0v-dgrMa491KnIxELPK6xSCyZpIzd0C-GKT41IXo9tJ65NEaAGLWGy7qZKI_Dv0H8xypfESQ4Ty97K4uZufawduZ6rb1JU5Oi4K4OzIlJn3PDNAuEZ3UosrqoX0l06nUHBp4LSiC_C7Ixfg'
  },
  {
    subject: 'HISTORY',
    title: 'Ancient Village Governance',
    description: 'Exploring the history of Gram Panchayats and how community decision-making has evolved over centuries.',
    teacher: 'Dr. Gupta',
    duration: '15:10',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAChFuGEGsA1i8RBlzS7Wb5BMbsJ05qllSOJdskSz45ZIzvQPY4-B1MVDmJDa0_TLojGqhZA9DJM3D3cGi_bxWIEtTI0fxknFPiB8ci0HfcxeHxr9onHGUQH9ZXRexeUvQ0ueInW6ik2N3WWtH3L6J__RxVNHTvbKvncZg0HcaRQX07bfctTtVdd4PXyJFKPr0sxD_ff24ZsonF874ykeI8ZydVo4MbmiDjtRpKmcMvcVyVhfJNwzAygdLhdYNWiWjNe1lWz3RalsQ'
  },
  {
    subject: 'LANGUAGE',
    title: 'Foundations of Storytelling',
    description: 'Basic English vocabulary through local folktales and narrative techniques to improve your speaking skills.',
    teacher: 'Ms. Khan',
    duration: '22:00',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAUrtENvE1qQZBK10EGlN2hDX4xcR2av0bYLe8nOUfyfFZFy5WPQrHnL4wlKnKymCsf8Il2SVyEFLMnPtTByM1DjNm7mbpsdKweqdqZKe5uMeL2VNyEA7xsj_qHkjt33wUYlzRDfBl6MBWftAOgpHYDAw7LHWc6td6dAq4AWmT52_6HCdjPFhkwaUe1bQlyh-B9_C4eaKxfPjz4InzlI4NPw7jWrDCZdc21mcpNus8ab_ZgWJhevr5HcgEQ3i5zFiTpDzVBEfRKIY4'
  },
  {
    subject: 'AGRICULTURE',
    title: 'Sustainable Farming Basics',
    description: 'Understanding soil health, water conservation, and traditional methods combined with modern technology.',
    teacher: 'Farmer Ram',
    duration: '25:15',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuALm343SQqyz19dZyybJxND5rpyNIqrWIlStNJXm07ZKnOqudm7dsd3F2ctnqMKp4_pPOnQ0tcilcdV0dIcCIJh2gPKB7fd5YO5WOcMEUbQ4W0Tvl-5sznaDR4_l2jna_PsB7athtR5kmGvCx6mu3qhiSkTOKg7Hh-Dry0UGoGh1KP24xePcWBRiO3WLv9CrraYirdd0y39QUvL7_bJnHh-u17RyIZXmUZi_lqVU1eUm9JJtwb0BFmOaMFe1T8PrSAF05jAykqp6m8'
  },
  {
    subject: 'TECH',
    title: 'Intro to Digital Literacy',
    description: 'Getting comfortable with computers, browsing the internet safely, and using educational apps for Class 10.',
    teacher: 'Prof. Verma',
    duration: '10:30',
    isPopular: true,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDp155sL_oQ9gQ0_IpC-qTrl5MrnJw5FU8CmR1D1hXvpt4lsIL4-YzTTn27uxWgeBPICTrIiHE3F_PYX9Mp0OGNo03qU5RRYbcQPh8uNSnCZd2McMsHusKeLKpv0m52USkSmUV10bV6UJMgdDL06KMkyraFU-HZgOFoudTNRdZPWI2IxrpZQ_Zqi8JxV77Mleudki2dSsmMEyFkaW578AJpVpqXl5LtMQtUOlJUp1O-yxXnAh-JedDOeuQsyM5pVnfLO7rWFslNjvY'
  }
];

export default function HomePage({ 
  onSelectRole, 
  isAuthenticated = false, 
  fullName = 'User',
  role = 'student',
  onLogout,
  onOpenProfile,
  language = 'en',
  onLanguageChange,
  token,
  studentClass = 'Class 10',
  onOpenVideoPage,
}: HomePageProps) {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);
  const [selectedClass, setSelectedClass] = useState(studentClass);
  const [interactions, setInteractions] = useState<string[]>([]);
  const [courses, setCourses] = useState<Course[]>(INITIAL_COURSES);
  const [enrolledVideoIds, setEnrolledVideoIds] = useState<string[]>([]);
  const [enrollingVideoId, setEnrollingVideoId] = useState<string>('');
  const [actionError, setActionError] = useState('');
  const [watchHistory, setWatchHistory] = useState<Record<string, WatchHistoryItem>>({});
  const [searchTopic, setSearchTopic] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);

  const classes = ['Class 10', 'Class 9', 'Class 8', 'Class 7', 'Class 6', 'Class 5', 'Class 4', 'Class 3', 'Class 2', 'Class 1'];

  // Popover close handler
  useEffect(() => {
    const onDocumentClick = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener('mousedown', onDocumentClick);
    return () => document.removeEventListener('mousedown', onDocumentClick);
  }, []);

  useEffect(() => {
    if (studentClass) {
      setSelectedClass(studentClass);
    }
  }, [studentClass]);

  // Calculate initials for profile avatar
  const initials = useMemo(() => {
    const parts = fullName.trim().split(/\s+/).filter(Boolean);
    return parts.length > 0
      ? parts.slice(0, 2).map((part) => part[0]?.toUpperCase()).join('')
      : role === 'student'
        ? 'ST'
        : 'TE';
  }, [fullName, role]);

  const getErrorMessage = async (response: Response) => {
    const contentType = response.headers.get('content-type') || '';

    if (contentType.includes('application/json')) {
      try {
        const data = await response.json();
        return data.message || 'Failed to load videos';
      } catch {
        return 'Failed to load videos';
      }
    }

    const text = await response.text();
    return text.trim() || 'Failed to load videos';
  };

  useEffect(() => {
    const fetchClassVideos = async () => {
      setIsAiLoading(true);

      try {
        const params = new URLSearchParams({ class: selectedClass });
        if (searchTopic.trim()) {
          params.set('q', searchTopic.trim());
        }

        let response = await fetch(`/api/videos/public?${params.toString()}`, {
          cache: 'no-store',
        });

        // Fallback for older running server instances that do not yet expose /api/videos/public.
        if (response.status === 404 && token) {
          response = await fetch(`/api/videos?class=${encodeURIComponent(selectedClass)}`, {
            cache: 'no-store',
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
        }

        if (!response.ok) {
          throw new Error(await getErrorMessage(response));
        }

        const data = await response.json();
        const mappedVideos = Array.isArray(data)
          ? data.map((video: any) => ({
              id: String(video.id || video._id || video.videoId || ''),
              subject: video.subject || 'VIDEO',
              title: video.title || 'Untitled Video',
              description: video.description || 'Class video',
              teacher: video.teacherName || 'Teacher',
              duration: video.duration || '0:00',
              image: video.thumbnail || `https://picsum.photos/seed/${video.subject || selectedClass}/800/450`,
              videoUrl: video.videoUrl,
            }))
          : [];

        setCourses(mappedVideos);
      } catch (error) {
        console.error('Video fetch error:', error);
        setCourses([]);
      } finally {
        setIsAiLoading(false);
      }
    };

    fetchClassVideos();
  }, [selectedClass, searchTopic]);

  useEffect(() => {
    const fetchEnrollments = async () => {
      if (!isAuthenticated || role !== 'student' || !token) {
        setEnrolledVideoIds([]);
        return;
      }

      try {
        const response = await fetch('/api/enrollments/student/me', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          return;
        }

        const data = await response.json();
        const ids = Array.isArray(data) ? data.map((enrollment: any) => String(enrollment.videoId)) : [];
        setEnrolledVideoIds(ids);
      } catch (error) {
        console.error('Enrollment fetch error:', error);
      }
    };

    fetchEnrollments();
  }, [isAuthenticated, role, token]);

  useEffect(() => {
    const fetchWatchHistory = async () => {
      if (!isAuthenticated || role !== 'student' || !token) {
        setWatchHistory({});
        return;
      }

      try {
        const response = await fetch('/api/watch-history/student/me', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          return;
        }

        const data = await response.json();
        if (!Array.isArray(data)) {
          return;
        }

        const mapped = data.reduce((acc: Record<string, WatchHistoryItem>, item: any) => {
          const key = String(item.videoId || '');
          if (!key) {
            return acc;
          }
          acc[key] = {
            videoId: key,
            lastWatchedSeconds: Number(item.lastWatchedSeconds || 0),
            lastWatchedAt: item.lastWatchedAt || null,
          };
          return acc;
        }, {});

        setWatchHistory(mapped);
      } catch (error) {
        console.error('Watch history fetch error:', error);
      }
    };

    fetchWatchHistory();
  }, [isAuthenticated, role, token]);

  const saveWatchProgress = async (course: Course, watchedSeconds: number, durationSeconds = 0) => {
    if (!token || !course.id) {
      return;
    }

    try {
      const response = await fetch(`/api/enrollments/${encodeURIComponent(course.id)}/progress`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ watchedSeconds, durationSeconds }),
      });

      if (!response.ok) {
        return;
      }

      const data = await response.json();
      setWatchHistory((current) => ({
        ...current,
        [String(data.videoId || course.id)]: {
          videoId: String(data.videoId || course.id),
          lastWatchedSeconds: Number(data.lastWatchedSeconds || watchedSeconds || 0),
          lastWatchedAt: data.lastWatchedAt || new Date().toISOString(),
        },
      }));
    } catch (error) {
      console.error('Save watch progress error:', error);
    }
  };

  const handleWatchVideo = (course: Course) => {
    if (!course.videoUrl || !course.id) {
      setActionError('Video link is missing for this lesson.');
      return;
    }

    const resumeFrom = watchHistory[course.id]?.lastWatchedSeconds || 0;
    saveWatchProgress(course, resumeFrom);

    if (onOpenVideoPage) {
      onOpenVideoPage({
        title: course.title,
        videoUrl: course.videoUrl,
        startSeconds: resumeFrom,
      });
      return;
    }

    const openedWindow = window.open(course.videoUrl, '_blank', 'noopener,noreferrer');
    if (!openedWindow) {
      window.location.href = course.videoUrl;
    }
  };

  const handleEnroll = async (course: Course) => {
    if (!token || !course.id) {
      setActionError('Please login as student to enroll.');
      return false;
    }

    setActionError('');
    setEnrollingVideoId(course.id);

    try {
      const response = await fetch('/api/enrollments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ videoId: course.id }),
      });

      if (!response.ok) {
        throw new Error(await getErrorMessage(response));
      }

      setEnrolledVideoIds((current) => Array.from(new Set([...current, course.id!])));
      setSelectedClass(course.subject ? selectedClass : selectedClass);
      return true;
    } catch (error) {
      console.error('Enrollment error:', error);
      setActionError(error instanceof Error ? error.message : 'Failed to enroll in this lesson.');
      return false;
    } finally {
      setEnrollingVideoId('');
    }
  };

  const handleCourseClick = (subject: string) => {
    const newInteractions = [...new Set([subject, ...interactions])].slice(0, 5);
    setInteractions(newInteractions);
    // Optionally refresh recommendations on interaction
    // getAIRecommendations(selectedClass, newInteractions);
  };

  const canCurrentUserEnroll = isAuthenticated && role === 'student' && Boolean(token);

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-0">
      {/* Top Bar */}
      <header className="sticky top-0 z-40 border-b border-emerald-900 bg-emerald-950 backdrop-blur-sm shadow-sm dark:border-stone-800 dark:bg-stone-950">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
          {/* Left: Logo & App Name */}
          <div className="flex items-center gap-3">
            <button className="flex-shrink-0 rounded-full p-2 text-emerald-300 transition-colors hover:bg-emerald-900/50 active:scale-95 dark:text-emerald-200 dark:hover:bg-stone-800/50">
              <Menu className="h-5 w-5" />
            </button>
            <h1 className="hidden font-headline text-lg font-bold tracking-tight text-emerald-100 sm:inline dark:text-emerald-100">{getTranslation(language, 'appName')}</h1>
          </div>

          {/* Right: Nav + Language + Profile */}
          <div className="flex items-center gap-2 md:gap-4">
            {/* Navigation Links - Hidden on mobile */}
            <nav className="hidden gap-6 md:flex">
              <a href="#" className="font-headline text-sm text-emerald-200 transition-colors hover:text-emerald-100">Home</a>
              <a href="#about" className="font-headline text-sm text-emerald-200 transition-colors hover:text-emerald-100">About</a>
            </nav>

            {/* Language Toggle - Desktop */}
            <div className="hidden items-center rounded-full bg-surface-container-high p-1 lg:flex">
              <button 
                onClick={() => onLanguageChange?.('en')}
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
                onClick={() => onLanguageChange?.('hi')}
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

            {/* Auth or Profile Section */}
            {isAuthenticated && role ? (
              <div ref={popoverRef} className="relative">
                <button
                  onClick={() => setIsProfileOpen((current) => !current)}
                  className="flex items-center gap-2 rounded-full border border-emerald-700/50 bg-emerald-900/50 px-2 py-1.5 transition-all hover:bg-emerald-900 active:scale-[0.98] dark:border-stone-700/50 dark:bg-stone-800/80 dark:hover:bg-stone-800"
                >
                  <div className={cn(
                    "flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold text-white shadow-md",
                    role === 'student' ? "bg-gradient-to-br from-emerald-600 to-emerald-800" : "bg-gradient-to-br from-stone-700 to-stone-900"
                  )}>
                    {initials}
                  </div>
                  <div className="hidden min-w-0 text-left sm:block">
                    <p className="truncate font-headline text-xs font-bold text-emerald-100">{fullName}</p>
                    <p className="text-[9px] font-semibold uppercase tracking-widest text-emerald-300">{role === 'student' ? 'Student' : 'Teacher'}</p>
                  </div>
                  <ChevronDown className={cn("h-4 w-4 flex-shrink-0 text-emerald-300 transition-transform", isProfileOpen && "rotate-180")} />
                </button>

                {isProfileOpen && (
                  <div className="absolute right-0 top-[calc(100%+0.75rem)] w-80 overflow-hidden rounded-2xl border border-white/50 bg-white/95 shadow-lg backdrop-blur-xl dark:border-stone-700/60 dark:bg-stone-950/95">
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
                          <p className="truncate font-headline text-xl font-extrabold tracking-tight">{fullName}</p>
                          <p className="mt-1 text-sm text-white/80">{role === 'student' ? 'Learner Account' : 'Instructor Account'}</p>
                          <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-white/95">
                            <ShieldCheck className="h-3.5 w-3.5" />
                            {getTranslation(language, 'verifiedAccount')}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3 p-4">
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
            ) : (
              <div className="hidden items-center gap-3 md:flex">
                <button 
                  onClick={() => onSelectRole('student', 'login')}
                  className="rounded-full px-5 py-2 font-headline text-sm font-bold text-primary transition-all hover:bg-primary/5 active:scale-95"
                >
                  {getTranslation(language, 'login')}
                </button>
                <button 
                  onClick={() => onSelectRole('student', 'signup')}
                  className="rounded-full bg-primary px-6 py-2 font-headline text-sm font-bold text-on-primary shadow-md transition-all hover:opacity-90 active:scale-95"
                >
                  {getTranslation(language, 'signup')}
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 md:px-6 md:py-12">
        {/* Hero Section */}
        <section className="mb-12">
          <div className="page-surface relative overflow-hidden bg-gradient-to-br from-primary via-primary-container to-emerald-900 p-8 text-on-primary md:p-12">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.2),_transparent_28%)]"></div>
            <div className="relative z-10 max-w-2xl">
              <span className="mb-4 inline-flex rounded-full border border-white/20 bg-white/10 px-3 py-1 font-headline text-xs font-bold tracking-wider text-white/90 backdrop-blur-sm">
                STUDENT PORTAL
              </span>
              <h2 className="mb-4 font-headline text-3xl font-extrabold leading-tight md:text-5xl">
                Empowering Rural Minds through Digital Learning
              </h2>
              <p className="mb-8 font-body text-lg opacity-90">
                Access high-quality education tailored for your local curriculum. Simple, focused, and always within reach.
              </p>
            </div>
            <div className="absolute top-0 right-0 hidden h-full w-1/3 opacity-20 lg:block">
              <img 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDz2NfbNXetjlYNadfjYUbBT7lKENXkoQhBIDFCQl-c2WqWS8e-JKRcXeAfmx1iWUgpfJ2N_2-AA7GavBcAl0Mx5-UFOM03UAdLIMz9jfDj3sCP_om1Lp5u-xCbRouwBegYSZbOxgTY3HE8S_l-HCAPvzWxpk-Undt2_o6pxnpPY9PJbbgcQ_ynJMAInWS4V2uYUIz7UKpPC6s24XDNDRvc-qrxLTHtI_s2vtsPagBc47RMnfItOTjrQm-rra9qiX8zNj6N0DfFCR8" 
                alt="Hero" 
                className="h-full w-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
        </section>

        {/* Class Selection */}
        <section className="mb-10">
          <div className="flex flex-col gap-4">
            <h3 className="flex items-center gap-2 font-headline text-xl font-bold text-primary">
              <Grid className="h-6 w-6" />
              Select Your Class
            </h3>
            <div className="no-scrollbar -mx-2 flex gap-3 overflow-x-auto px-2 pb-4">
              {classes.map((cls) => (
                <button 
                  key={cls}
                  onClick={() => setSelectedClass(cls)}
                  className={cn(
                    "flex-shrink-0 rounded-xl px-6 py-3 font-headline transition-all active:scale-95",
                    selectedClass === cls 
                      ? "bg-primary font-bold text-on-primary shadow-md" 
                      : "bg-surface-container-high font-medium text-on-surface-variant hover:bg-surface-container-highest"
                  )}
                >
                  {cls}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Course Grid */}
        <section className="relative min-h-[400px]">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="flex items-center gap-2 font-headline text-xl font-bold text-on-surface">
              <Sparkles className="h-5 w-5 text-tertiary" />
              Videos for {selectedClass}
            </h3>
            {isAiLoading && (
              <div className="flex items-center gap-2 text-sm text-on-surface-variant">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading videos...
              </div>
            )}
          </div>

          <div className="soft-card mb-6 p-4">
            <label className="mb-2 block font-headline text-xs font-bold uppercase tracking-[0.16em] text-on-surface-variant">
              Search Topic
            </label>
            <div className="flex items-center gap-3 rounded-xl border border-outline-variant/30 bg-surface-container-low px-3 py-2">
              <Search className="h-4 w-4 text-on-surface-variant" />
              <input
                value={searchTopic}
                onChange={(event) => setSearchTopic(event.target.value)}
                placeholder="Try: science, farming, math, history, teacher name"
                className="w-full bg-transparent text-sm text-on-surface outline-none placeholder:text-on-surface-variant"
              />
            </div>
            <p className="mt-2 text-xs text-on-surface-variant">
              Browse videos uploaded by different teachers before login.
            </p>
            {actionError && (
              <p className="mt-2 text-xs font-semibold text-red-600">{actionError}</p>
            )}
          </div>

          {!isAiLoading && courses.length === 0 && (
            <div className="soft-card border-dashed px-6 py-12 text-center">
              <p className="font-headline text-lg font-bold text-on-surface">No videos uploaded yet for {selectedClass}.</p>
              <p className="mt-2 text-sm text-on-surface-variant">When teachers upload videos for this class, they will appear here.</p>
            </div>
          )}

          <div className={cn(
            "grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3 transition-opacity duration-300",
            isAiLoading ? "opacity-50 pointer-events-none" : "opacity-100"
          )}>
            {courses.map((course, idx) => (
              <motion.div 
                key={`${course.title}-${idx}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="soft-card group flex flex-col overflow-hidden"
              >
                <div className="relative aspect-video w-full bg-stone-200">
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 transition-colors group-hover:bg-black/30">
                    <PlayCircle className="h-16 w-16 text-white drop-shadow-lg" fill="currentColor" />
                  </div>
                  <img 
                    src={course.image} 
                    alt={course.title} 
                    className="h-full w-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute bottom-3 right-3 rounded bg-black/70 px-2 py-1 text-xs text-white">
                    {course.duration}
                  </div>
                </div>
                <div className="flex flex-grow flex-col p-6">
                  <div className="mb-3 flex items-start justify-between">
                    <span className={cn(
                      "font-headline text-xs font-bold tracking-widest uppercase",
                      course.subject === 'SCIENCE' ? 'text-primary' : 
                      course.subject === 'MATHEMATICS' || course.subject === 'MATH' ? 'text-secondary' : 'text-tertiary'
                    )}>
                      {course.subject}
                    </span>
                    {(course.isNew || course.isPopular) && (
                      <div className="flex items-center gap-1 text-tertiary">
                        {course.isNew ? <Star className="h-3 w-3" fill="currentColor" /> : <TrendingUp className="h-3 w-3" />}
                        <span className="text-xs font-bold">{course.isNew ? 'New' : 'Popular'}</span>
                      </div>
                    )}
                  </div>
                  <h4 className="mb-3 font-headline text-xl font-bold text-on-surface">{course.title}</h4>
                  <p className="mb-6 flex-grow font-body text-sm leading-relaxed text-on-surface-variant">
                    {course.description}
                  </p>
                  <div className="mt-auto flex items-center justify-between border-t border-surface-container-high pt-4">
                    <div className="flex items-center gap-2 text-stone-500">
                      <User className="h-4 w-4" />
                      <span className="text-xs font-medium">By {course.teacher}</span>
                    </div>
                    <button 
                      onClick={async () => {
                        handleCourseClick(course.subject);
                        if (!canCurrentUserEnroll) {
                          onSelectRole('student', 'login');
                          return;
                        }

                        if (!course.id) {
                          return;
                        }

                        if (enrolledVideoIds.includes(course.id)) {
                          handleWatchVideo(course);
                          return;
                        }

                        const didEnroll = await handleEnroll(course);
                        if (didEnroll) {
                          handleWatchVideo(course);
                        }
                      }}
                      className="rounded-lg bg-primary px-5 py-2 font-headline text-sm font-bold text-on-primary transition-all hover:opacity-90 active:scale-95"
                    >
                      {!canCurrentUserEnroll
                        ? 'Login to Enroll'
                        : course.id && enrolledVideoIds.includes(course.id)
                          ? 'Watch Full Video'
                          : enrollingVideoId === course.id
                            ? 'Enrolling...'
                            : 'Enroll'}
                    </button>
                  </div>
                  {course.id && watchHistory[course.id]?.lastWatchedSeconds > 0 && (
                    <p className="mt-3 text-xs font-semibold text-emerald-800">
                      Resume from {Math.floor(watchHistory[course.id].lastWatchedSeconds / 60)}:{String(watchHistory[course.id].lastWatchedSeconds % 60).padStart(2, '0')}
                    </p>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </section>



        {/* About Section */}
        <section id="about" className="mt-24 space-y-12">
          <div className="text-center">
            <h2 className="font-headline text-3xl font-extrabold text-on-surface md:text-4xl">About RuralTechEd</h2>
            <p className="mx-auto mt-4 max-w-2xl text-on-surface-variant">
              Bridging the digital divide by bringing high-quality, accessible education to every rural household.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <div className="soft-card p-8">
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <GraduationCap className="h-8 w-8" />
              </div>
              <h3 className="font-headline text-xl font-bold text-on-surface">Our Mission</h3>
              <p className="mt-4 text-sm leading-relaxed text-on-surface-variant">
                To empower rural students with the tools and knowledge they need to thrive in a digital world, regardless of their location or internet connectivity.
              </p>
            </div>

            <div className="soft-card p-8">
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary/10 text-secondary">
                <BookOpen className="h-8 w-8" />
              </div>
              <h3 className="font-headline text-xl font-bold text-on-surface">Local Curriculum</h3>
              <p className="mt-4 text-sm leading-relaxed text-on-surface-variant">
                We work closely with local educators to ensure our content is culturally relevant, language-appropriate, and aligned with regional school standards.
              </p>
            </div>

            <div className="soft-card p-8">
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-tertiary/10 text-tertiary">
                <TrendingUp className="h-8 w-8" />
              </div>
              <h3 className="font-headline text-xl font-bold text-on-surface">Community Impact</h3>
              <p className="mt-4 text-sm leading-relaxed text-on-surface-variant">
                By providing free digital literacy training and educational resources, we're helping build a more equitable future for rural communities across the country.
              </p>
            </div>
          </div>

          <div className="page-surface bg-stone-950 p-8 text-white md:p-12">
            <div className="grid gap-12 md:grid-cols-2 items-center">
              <div>
                <h3 className="font-headline text-2xl font-bold md:text-3xl">Why Digital Homestead?</h3>
                <p className="mt-6 text-stone-400 leading-relaxed">
                  Rural education faces unique challenges—limited connectivity, lack of resources, and geographic isolation. Digital Homestead is designed to overcome these barriers through offline-first technology and community-driven content.
                </p>
                <div className="mt-8 flex flex-wrap gap-4">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-primary"></div>
                    <span className="text-sm font-medium">Offline Access</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-secondary"></div>
                    <span className="text-sm font-medium">Local Languages</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-tertiary"></div>
                    <span className="text-sm font-medium">Free Resources</span>
                  </div>
                </div>
              </div>
              <div className="relative aspect-video overflow-hidden rounded-2xl">
                <img 
                  src="https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&q=80&w=800" 
                  alt="Students learning" 
                  className="h-full w-full object-cover opacity-80"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="flex flex-col items-center space-y-6 border-t border-white/40 bg-white/70 px-8 py-12 text-center backdrop-blur-xl dark:bg-stone-900/90">
        <div className="font-headline text-lg font-bold text-primary">RuralTechEd</div>
        <div className="flex flex-wrap justify-center gap-6">
          <a href="#" className="font-headline text-sm text-stone-500 hover:text-primary underline">Curriculum</a>
          <a href="#" className="font-headline text-sm text-stone-500 hover:text-primary underline">Digital Literacy</a>
          <a href="#" className="font-headline text-sm text-stone-500 hover:text-primary underline">Privacy Policy</a>
          <a href="#" className="font-headline text-sm text-stone-500 hover:text-primary underline">Contact Support</a>
        </div>
        <p className="font-headline text-sm text-stone-600 dark:text-stone-400">
          © 2024 RuralTechEd Homestead. Education for all.
        </p>
      </footer>

      {/* Bottom Nav (Mobile) */}
      <nav className="fixed bottom-0 left-0 z-50 flex w-full items-center justify-around rounded-t-[1.75rem] border-t border-white/30 bg-white/90 px-4 pt-2 pb-4 backdrop-blur-xl shadow-[0px_-12px_30px_rgba(0,0,0,0.08)] md:hidden dark:bg-stone-900/90">
        <NavItem icon={<Home className="h-5 w-5" />} label="Home" />
        <NavItem icon={<GraduationCap className="h-5 w-5" />} label="Students" active />
        <NavItem icon={<BookOpen className="h-5 w-5" />} label="Teachers" />
        <NavItem icon={<Info className="h-5 w-5" />} label="About" href="#about" />
        <button 
          onClick={() => onSelectRole('student', 'login')}
          className="flex flex-col items-center justify-center px-3 py-1 text-stone-500"
        >
          <LogIn className="h-5 w-5" />
          <span className="font-headline text-[11px] tracking-wide">Login</span>
        </button>
      </nav>

      {/* FAB */}
      <button className="fixed bottom-24 right-6 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-tertiary text-on-tertiary shadow-xl transition-transform active:scale-90 md:bottom-8 md:right-8">
        <HelpCircle className="h-6 w-6" />
      </button>
    </div>
  );
}

function NavItem({ icon, label, active, href = "#" }: { icon: React.ReactNode; label: string; active?: boolean; href?: string }) {
  return (
    <a 
      href={href} 
      className={cn(
        "flex flex-col items-center justify-center rounded-xl px-3 py-1 transition-all",
        active 
          ? "bg-primary/10 text-primary" 
          : "text-stone-500 hover:text-primary"
      )}
    >
      {icon}
      <span className="font-headline text-[11px] tracking-wide">{label}</span>
    </a>
  );
}
