import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Download, PlayCircle, Flame, Award, Trophy, Rocket, Lock, ChevronLeft, ChevronRight, Brain, MessageSquare, ArrowRight, TrendingUp, X } from 'lucide-react';
import { BarChart, Bar, XAxis, ResponsiveContainer, Cell } from 'recharts';
import { cn } from '../lib/utils';
import CourseDetail from './CourseDetail';
import { Language, getTranslation } from '../lib/translations';

const weeklyData = [
  { day: 'MON', value: 45 },
  { day: 'TUE', value: 65 },
  { day: 'WED', value: 85 },
  { day: 'THU', value: 30 },
  { day: 'FRI', value: 60 },
  { day: 'SAT', value: 25 },
];

const studentCourses = [
  {
    id: 1,
    title: 'Science',
    module: 'Module 4: Plants',
    progress: 80,
    image: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&q=80&w=800',
    color: 'emerald'
  },
  {
    id: 2,
    title: 'Mathematics',
    module: 'Module 2: Geometry',
    progress: 45,
    image: 'https://images.unsplash.com/photo-1509228468518-180dd48a5791?auto=format&fit=crop&q=80&w=800',
    color: 'blue'
  }
];

interface StudentDashboardProps {
  fullName?: string;
  language?: Language;
  onOpenVideoPage?: (video: { title: string; videoUrl: string; startSeconds?: number }) => void;
}

interface Enrollment {
  id: string;
  videoId: string;
  videoTitle: string;
  videoUrl?: string | null;
  teacherName: string;
  subject: string;
  studentClass: string;
  status: 'enrolled' | 'started' | 'completed';
  progress: number;
  lastWatchedSeconds?: number;
  lastWatchedAt?: string | null;
}

interface QuizQuestion {
  question: string;
  options: string[];
}

interface Quiz {
  id: string;
  title: string;
  subject: string;
  teacherName: string;
  rewardAmount: number;
  questions: QuizQuestion[];
  attempted?: boolean;
}

interface QuizAttempt {
  id: string;
  quizTitle: string;
  subject: string;
  score: number;
  totalQuestions: number;
  earnedAmount: number;
  submittedAt?: string;
}

interface NoteItem {
  id: string;
  title: string;
  description?: string;
  fileUrl: string;
  subject: string;
  class: string;
  teacherName: string;
  createdAt?: string;
}

export default function StudentDashboard({ fullName = 'Student', language = 'en', onOpenVideoPage }: StudentDashboardProps) {
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [watchHistory, setWatchHistory] = useState<Enrollment[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [quizAttempts, setQuizAttempts] = useState<QuizAttempt[]>([]);
  const [notes, setNotes] = useState<NoteItem[]>([]);
  const [isNotesOpen, setIsNotesOpen] = useState(false);
  const [walletBalance, setWalletBalance] = useState(0);
  const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [isSubmittingQuiz, setIsSubmittingQuiz] = useState(false);
  const [resumeError, setResumeError] = useState('');
  const historySectionRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const loadEnrollments = async () => {
      const token = localStorage.getItem('authToken');

      if (!token) {
        setEnrollments([]);
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
        setEnrollments(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Student enrollments load error:', error);
      }
    };

    loadEnrollments();
  }, []);

  useEffect(() => {
    const loadWatchHistory = async () => {
      const token = localStorage.getItem('authToken');

      if (!token) {
        setWatchHistory([]);
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
        setWatchHistory(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Watch history load error:', error);
      }
    };

    loadWatchHistory();
  }, []);

  const loadQuizAndEarnings = async () => {
    const token = localStorage.getItem('authToken');

    if (!token) {
      setQuizzes([]);
      setQuizAttempts([]);
      setWalletBalance(0);
      return;
    }

    try {
      const [quizResponse, attemptResponse, meResponse] = await Promise.all([
        fetch('/api/quizzes/student/me', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/quizzes/attempts/student/me', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/auth/me', { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      if (quizResponse.ok) {
        const quizData = await quizResponse.json();
        setQuizzes(Array.isArray(quizData) ? quizData : []);
      }

      if (attemptResponse.ok) {
        const attemptData = await attemptResponse.json();
        setQuizAttempts(Array.isArray(attemptData) ? attemptData : []);
      }

      if (meResponse.ok) {
        const meData = await meResponse.json();
        setWalletBalance(Number(meData?.user?.walletBalance || 0));
      }
    } catch (error) {
      console.error('Quiz/earning load error:', error);
    }
  };

  const loadStudentNotes = async () => {
    const token = localStorage.getItem('authToken');

    if (!token) {
      setNotes([]);
      return;
    }

    try {
      const response = await fetch('/api/notes/student/me', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        return;
      }

      const data = await response.json();
      setNotes(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Student notes load error:', error);
    }
  };

  useEffect(() => {
    loadQuizAndEarnings();
  }, []);

  useEffect(() => {
    loadStudentNotes();
  }, []);

  const openQuiz = (quiz: Quiz) => {
    setResumeError('');
    setActiveQuiz(quiz);
    setSelectedAnswers(Array.from({ length: quiz.questions.length }, () => -1));
  };

  const submitQuiz = async () => {
    if (!activeQuiz) {
      return;
    }

    if (selectedAnswers.some((answer) => answer < 0)) {
      setResumeError('Please answer all questions before submitting the quiz.');
      return;
    }

    const token = localStorage.getItem('authToken');
    if (!token) {
      setResumeError('Please login as student.');
      return;
    }

    try {
      setIsSubmittingQuiz(true);
      setResumeError('');

      const response = await fetch(`/api/quizzes/${encodeURIComponent(activeQuiz.id)}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ answers: selectedAnswers }),
      });

      if (!response.ok) {
        const contentType = response.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
          const data = await response.json();
          throw new Error(data.message || 'Failed to submit quiz.');
        }
        throw new Error(await response.text());
      }

      const data = await response.json();
      setWalletBalance(Number(data.walletBalance || walletBalance));
      setActiveQuiz(null);
      await loadQuizAndEarnings();
    } catch (error) {
      setResumeError(error instanceof Error ? error.message : 'Failed to submit quiz.');
    } finally {
      setIsSubmittingQuiz(false);
    }
  };

  const formatSeconds = (seconds = 0) => {
    const total = Math.max(0, Math.floor(seconds));
    const mins = Math.floor(total / 60);
    const secs = total % 60;
    return `${mins}:${String(secs).padStart(2, '0')}`;
  };

  const toResumeUrl = (url: string, seconds = 0) => {
    if (!seconds) {
      return url;
    }

    if (url.includes('youtube.com/watch') || url.includes('youtu.be/')) {
      try {
        const parsed = new URL(url);
        parsed.searchParams.set('t', `${Math.max(0, Math.floor(seconds))}s`);
        return parsed.toString();
      } catch {
        return url;
      }
    }

    return `${url}${url.includes('#') ? '&' : '#'}t=${Math.max(0, Math.floor(seconds))}`;
  };

  const selectedCourse = studentCourses.find(c => c.id === selectedCourseId);
  const currentEnrollment = enrollments.find((enrollment) => enrollment.status !== 'completed') || enrollments[0];
  const latestHistory = watchHistory[0];

  const openLesson = (url: string, seconds = 0) => {
    if (onOpenVideoPage) {
      onOpenVideoPage({
        title: currentEnrollment?.videoTitle || latestHistory?.videoTitle || 'Lesson Video',
        videoUrl: url,
        startSeconds: seconds,
      });
      return;
    }

    const target = toResumeUrl(url, seconds);
    const opened = window.open(target, '_blank', 'noopener,noreferrer');
    if (!opened) {
      window.location.href = target;
    }
  };

  const openEnrollmentVideoById = async (enrollment: Enrollment) => {
    const token = localStorage.getItem('authToken');
    if (!token || !enrollment?.videoId) {
      return false;
    }

    try {
      const response = await fetch(`/api/videos/${encodeURIComponent(enrollment.videoId)}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        return false;
      }

      const data = await response.json();
      const videoUrl = data?.videoUrl;
      if (!videoUrl) {
        return false;
      }

      openLesson(videoUrl, enrollment.lastWatchedSeconds || 0);
      return true;
    } catch (error) {
      console.error('Open enrollment video error:', error);
      return false;
    }
  };

  const handleResumeLastLesson = () => {
    historySectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setResumeError('');

    if (latestHistory?.videoUrl) {
      openLesson(latestHistory.videoUrl, latestHistory.lastWatchedSeconds || 0);
      return;
    }

    if (!currentEnrollment) {
      setResumeError('No enrolled lesson found to resume.');
      return;
    }

    if (currentEnrollment.videoUrl) {
      openLesson(currentEnrollment.videoUrl, currentEnrollment.lastWatchedSeconds || 0);
      return;
    }

    openEnrollmentVideoById(currentEnrollment).then((opened) => {
      if (!opened) {
        setResumeError('Could not open lesson yet. Please watch from Home once and try again.');
      }
    });
  };

  if (selectedCourseId && selectedCourse) {
    return (
      <CourseDetail 
        course={selectedCourse} 
        onBack={() => setSelectedCourseId(null)} 
      />
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-8 pb-12">
      {/* Welcome Header */}
      <header className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex-1"
        >
          <h1 className="font-headline text-3xl font-extrabold tracking-tight text-on-surface md:text-4xl">
            {getTranslation(language, 'namaste')}, {fullName}!
          </h1>
          <p className="mt-2 text-on-surface-variant">
            {getTranslation(language, 'readyToContinue')}
          </p>
        </motion.div>
        <div className="flex w-full gap-4 md:w-auto">
          <button
            onClick={() => {
              loadStudentNotes();
              setIsNotesOpen(true);
            }}
            className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-surface-container-high px-6 py-4 font-headline text-sm font-bold text-emerald-900 transition-all hover:bg-emerald-100/50 active:scale-95 md:flex-none"
          >
            <Download className="h-5 w-5" />
            Offline Material
          </button>
          <button
            onClick={handleResumeLastLesson}
            className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-emerald-800 px-8 py-4 font-headline text-sm font-bold text-white shadow-lg shadow-emerald-900/20 transition-all hover:bg-emerald-700 active:scale-95 md:flex-none"
          >
            <PlayCircle className="h-5 w-5" />
            Resume Last Lesson
          </button>
        </div>
      </header>

      {resumeError && (
        <p className="-mt-3 text-sm font-semibold text-red-600">{resumeError}</p>
      )}

      {currentEnrollment && (
        <section className="rounded-[2rem] border border-emerald-100 bg-gradient-to-br from-emerald-50 to-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-emerald-700">Current Course</p>
              <h2 className="mt-2 font-headline text-2xl font-bold text-on-surface">{currentEnrollment.videoTitle}</h2>
              <p className="mt-1 text-sm text-on-surface-variant">
                {currentEnrollment.subject} • {currentEnrollment.teacherName} • {currentEnrollment.studentClass}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-white px-4 py-3 shadow-sm">
                <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Status</p>
                <p className="font-headline text-sm font-bold text-emerald-800">{currentEnrollment.status}</p>
              </div>
              <div className="rounded-2xl bg-white px-4 py-3 shadow-sm">
                <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Progress</p>
                <p className="font-headline text-sm font-bold text-emerald-800">{currentEnrollment.progress}%</p>
              </div>
            </div>
          </div>
        </section>
      )}

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Progress Card */}
        <section className="page-surface relative overflow-hidden p-8 lg:col-span-8">
          <div className="absolute right-0 top-0 -mr-12 -mt-12 h-48 w-48 rounded-full bg-emerald-50/50"></div>
          <div className="relative flex flex-col items-center gap-8 md:flex-row md:text-left">
            <div className="relative h-40 w-40 flex-shrink-0 md:h-48 md:w-48">
              <svg className="h-full w-full -rotate-90 transform">
                <circle
                  className="text-emerald-50"
                  cx="50%"
                  cy="50%"
                  fill="transparent"
                  r="42%"
                  stroke="currentColor"
                  strokeWidth="12%"
                />
                <circle
                  className="text-emerald-800"
                  cx="50%"
                  cy="50%"
                  fill="transparent"
                  r="42%"
                  stroke="currentColor"
                  strokeDasharray="264%"
                  strokeDashoffset={264 * (1 - 0.65) + "%"}
                  strokeWidth="12%"
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-headline text-3xl font-extrabold text-on-surface md:text-4xl">65%</span>
                <span className="font-headline text-[10px] font-bold tracking-widest text-on-surface-variant uppercase">
                  COMPLETE
                </span>
              </div>
            </div>
            
            <div className="flex-1 text-center md:text-left">
              <h2 className="font-headline text-2xl font-bold text-on-surface mb-3">Your Class 10 Journey</h2>
              <p className="max-w-md leading-relaxed text-on-surface-variant mb-8">
                You've covered 12 out of 18 chapters this term. You are 15% ahead of your weekly goal! Keep the momentum going.
              </p>
              
              <div className="flex flex-wrap justify-center gap-3 md:justify-start">
                <div className="flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 border border-emerald-100">
                  <Flame className="h-4 w-4 text-emerald-700" fill="currentColor" />
                  <span className="font-headline text-xs font-bold text-emerald-800">12 Day Streak</span>
                </div>
                <div className="flex items-center gap-2 rounded-full bg-amber-50 px-4 py-2 border border-amber-100">
                  <Award className="h-4 w-4 text-amber-700" fill="currentColor" />
                  <span className="font-headline text-xs font-bold text-amber-800">Top 10% this week</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Milestones */}
        <section className="page-surface p-8 lg:col-span-4">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="font-headline text-xl font-bold text-on-surface">Milestones</h3>
            <button className="font-headline text-sm font-bold text-emerald-700 hover:underline">View All</button>
          </div>
          <div className="space-y-3">
            <MilestoneItem
              icon={<Brain className="h-6 w-6" />}
              title="Quiz Master"
              description="Perfect score in Science quiz"
              color="amber"
            />
            <MilestoneItem
              icon={<Rocket className="h-6 w-6" />}
              title="Fast Learner"
              description="Completed 3 units in 2 days"
              color="emerald"
            />
            <MilestoneItem
              icon={<Trophy className="h-6 w-6" />}
              title="Science Wizard"
              description="Locked: Complete Unit 5"
              locked
            />
          </div>
        </section>

        {/* Weekly Focus */}
        <section className="page-surface p-8 lg:col-span-4">
          <h3 className="mb-8 font-headline text-xl font-bold text-on-surface">Weekly Focus</h3>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData}>
                <XAxis 
                  dataKey="day" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 11, fontWeight: 700, fill: '#1a1c1a', opacity: 0.4 }}
                  dy={10}
                />
                <Bar dataKey="value" radius={[6, 6, 6, 6]} barSize={40}>
                  {weeklyData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.day === 'WED' ? '#064e3b' : '#064e3b'} 
                      fillOpacity={entry.day === 'WED' ? 1 : 0.25}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-10 flex items-center justify-between border-t border-on-surface/5 pt-8">
            <div>
              <p className="text-[11px] font-bold tracking-widest text-on-surface-variant uppercase mb-1">Today's Goal</p>
              <p className="font-headline text-2xl font-extrabold text-on-surface">
                3.5 / 4.0 <span className="text-sm font-normal text-on-surface-variant">Hrs</span>
              </p>
            </div>
            <div className="rounded-2xl bg-emerald-50 p-3">
              <TrendingUp className="h-7 w-7 text-emerald-800" />
            </div>
          </div>
        </section>

        {/* Current Courses */}
        <section className="page-surface p-8 lg:col-span-8">
          <div className="mb-8 flex items-center justify-between">
            <h3 className="font-headline text-xl font-bold text-on-surface">Current Courses</h3>
            <div className="flex gap-3">
              <button className="flex h-10 w-10 items-center justify-center rounded-full border border-outline-variant text-on-surface-variant hover:bg-emerald-50 hover:text-emerald-800 transition-colors">
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button className="flex h-10 w-10 items-center justify-center rounded-full border border-outline-variant text-on-surface-variant hover:bg-emerald-50 hover:text-emerald-800 transition-colors">
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
          
          <div className="space-y-6">
            {studentCourses.map((course) => (
              <div 
                key={course.id} 
                onClick={() => setSelectedCourseId(course.id)}
                className="cursor-pointer overflow-hidden rounded-3xl bg-surface-container-lowest border border-emerald-50 transition-all hover:shadow-md hover:border-emerald-200 group"
              >
                <div className="flex flex-col md:flex-row">
                  <div className="relative h-40 w-full md:h-auto md:w-1/3 overflow-hidden">
                    <img 
                      src={course.image} 
                      alt={course.title} 
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" 
                      referrerPolicy="no-referrer" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                    <h4 className="absolute bottom-4 left-6 font-headline text-xl font-bold text-white">{course.title}</h4>
                  </div>
                  <div className="flex-1 p-6">
                    <div className="mb-3 flex justify-between items-center">
                      <span className="font-headline text-sm font-bold text-on-surface">{course.module}</span>
                      <span className={cn(
                        "font-headline text-sm font-bold",
                        course.color === 'emerald' ? "text-emerald-800" : "text-blue-700"
                      )}>{course.progress}%</span>
                    </div>
                    <div className="mb-6 h-2 w-full rounded-full bg-stone-100">
                      <div 
                        className={cn(
                          "h-full rounded-full transition-all duration-1000",
                          course.color === 'emerald' ? "bg-emerald-800" : "bg-blue-700"
                        )} 
                        style={{ width: `${course.progress}%` }}
                      ></div>
                    </div>
                    <button className={cn(
                      "w-full rounded-2xl border-2 py-3 font-headline text-sm font-bold transition-all active:scale-95",
                      course.color === 'emerald' 
                        ? "border-emerald-800/20 text-emerald-900 hover:bg-emerald-800 hover:text-white" 
                        : "border-blue-700/20 text-blue-900 hover:bg-blue-700 hover:text-white"
                    )}>
                      Continue Lesson
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section ref={historySectionRef} className="rounded-[2.5rem] bg-white p-8 shadow-sm border border-emerald-50 lg:col-span-8">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="font-headline text-xl font-bold text-on-surface">Resume Lessons</h3>
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-on-surface-variant">Watch History</p>
          </div>

          {currentEnrollment && (
            <div className="mb-4 rounded-2xl border border-emerald-100 bg-emerald-50/40 p-4">
              <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-emerald-800">Current Course</p>
              <p className="mt-1 font-headline text-base font-bold text-on-surface">{currentEnrollment.videoTitle}</p>
              <p className="text-sm text-on-surface-variant">{currentEnrollment.subject} • {currentEnrollment.teacherName}</p>
            </div>
          )}

          {watchHistory.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-outline-variant/30 bg-surface-container-lowest px-5 py-8 text-center">
              <p className="font-headline text-base font-bold text-on-surface">No watch history yet</p>
              <p className="mt-1 text-sm text-on-surface-variant">Start watching enrolled lessons and your resume timeline will show here.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {watchHistory.slice(0, 6).map((entry) => (
                <div key={entry.id} className="flex flex-col gap-3 rounded-2xl border border-emerald-100 bg-emerald-50/40 p-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="font-headline text-base font-bold text-on-surface">{entry.videoTitle}</p>
                    <p className="text-sm text-on-surface-variant">{entry.subject} • {entry.teacherName}</p>
                    <p className="mt-1 text-xs font-semibold text-emerald-800">
                      Last position: {formatSeconds(entry.lastWatchedSeconds || 0)}
                      {entry.lastWatchedAt ? ` • ${new Date(entry.lastWatchedAt).toLocaleString()}` : ''}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      if (!entry.videoUrl) {
                        return;
                      }
                      if (onOpenVideoPage) {
                        onOpenVideoPage({
                          title: entry.videoTitle,
                          videoUrl: entry.videoUrl,
                          startSeconds: entry.lastWatchedSeconds || 0,
                        });
                        return;
                      }

                      window.open(toResumeUrl(entry.videoUrl, entry.lastWatchedSeconds || 0), '_blank', 'noopener,noreferrer');
                    }}
                    disabled={!entry.videoUrl}
                    className="rounded-xl bg-emerald-800 px-4 py-2 text-sm font-bold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-emerald-300"
                  >
                    Resume Lesson
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="page-surface p-8 lg:col-span-8">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="font-headline text-xl font-bold text-on-surface">Quizzes & Rewards</h3>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {quizzes.length === 0 && (
              <div className="rounded-2xl border border-dashed border-outline-variant/30 bg-surface-container-lowest p-5 text-sm text-on-surface-variant">
                No quiz available for your class yet.
              </div>
            )}

            {quizzes.map((quiz) => (
              <div key={quiz.id} className="rounded-2xl border border-emerald-100 bg-emerald-50/40 p-4">
                <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-emerald-800">{quiz.subject}</p>
                <h4 className="mt-1 font-headline text-base font-bold text-on-surface">{quiz.title}</h4>
                <p className="mt-1 text-sm text-on-surface-variant">By {quiz.teacherName} • {quiz.questions.length} questions</p>
                <button
                  onClick={() => openQuiz(quiz)}
                  disabled={Boolean(quiz.attempted)}
                  className="mt-3 rounded-xl bg-emerald-800 px-4 py-2 text-sm font-bold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-emerald-300"
                >
                  {quiz.attempted ? 'Already Attempted' : 'Take Quiz'}
                </button>
              </div>
            ))}
          </div>

          <div className="mt-6">
            <p className="mb-3 text-xs font-bold uppercase tracking-widest text-on-surface-variant">Quiz History</p>
            {quizAttempts.length === 0 ? (
              <p className="text-sm text-on-surface-variant">No attempts yet. Take your first quiz to earn money.</p>
            ) : (
              <div className="space-y-3">
                {quizAttempts.slice(0, 5).map((attempt) => (
                  <div key={attempt.id} className="rounded-2xl border border-emerald-100 bg-white p-4">
                    <p className="font-headline text-sm font-bold text-on-surface">{attempt.quizTitle}</p>
                    <p className="text-xs text-on-surface-variant">
                      Score: {attempt.score}/{attempt.totalQuestions}
                      {attempt.submittedAt ? ` • ${new Date(attempt.submittedAt).toLocaleString()}` : ''}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Support & Help */}
        <section className="page-surface col-span-full space-y-6 p-8">
          <h3 className="font-headline text-xl font-bold text-on-surface">Support & Help</h3>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <SupportCard
              icon={<Brain className="h-8 w-8" />}
              title="Ask a Mentor"
              description="Connect with our expert teachers"
              color="emerald"
            />
            <SupportCard
              icon={<MessageSquare className="h-8 w-8" />}
              title="Community Forum"
              description="Discuss topics with fellow students"
              color="blue"
            />
          </div>
        </section>
      </div>

      <AnimatePresence>
        {isNotesOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
          >
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl"
            >
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-emerald-700">Offline Material</p>
                  <h4 className="font-headline text-xl font-bold text-on-surface">PDF Notes for Your Class</h4>
                </div>
                <button onClick={() => setIsNotesOpen(false)} className="rounded-full p-2 hover:bg-surface-container-low">
                  <X className="h-5 w-5" />
                </button>
              </div>

              {notes.length === 0 ? (
                <div className="rounded-xl border border-dashed border-outline-variant/30 bg-surface-container-low p-4 text-sm text-on-surface-variant">
                  No notes available yet. Your teacher can upload PDF notes from the Teacher Dashboard.
                </div>
              ) : (
                <div className="space-y-3">
                  {notes.map((note) => (
                    <div key={note.id} className="rounded-xl border border-emerald-100 bg-emerald-50/40 p-4">
                      <p className="font-headline text-base font-bold text-on-surface">{note.title}</p>
                      <p className="mt-1 text-xs text-on-surface-variant">{note.subject} • {note.class} • {note.teacherName}</p>
                      {note.description && <p className="mt-2 text-sm text-on-surface-variant">{note.description}</p>}
                      <a
                        href={note.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-3 inline-flex items-center gap-2 rounded-lg bg-emerald-800 px-3 py-2 text-xs font-bold text-white hover:bg-emerald-700"
                      >
                        <Download className="h-4 w-4" />
                        Open PDF
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}

        {activeQuiz && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
          >
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl"
            >
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-emerald-700">Quiz</p>
                  <h4 className="font-headline text-xl font-bold text-on-surface">{activeQuiz.title}</h4>
                </div>
                <button onClick={() => setActiveQuiz(null)} className="rounded-full p-2 hover:bg-surface-container-low">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4">
                {activeQuiz.questions.map((question, questionIndex) => (
                  <div key={questionIndex} className="rounded-xl border border-outline-variant/30 bg-surface-container-low p-4">
                    <p className="font-headline text-sm font-bold text-on-surface">Q{questionIndex + 1}. {question.question}</p>
                    <div className="mt-2 space-y-2">
                      {question.options.map((option, optionIndex) => (
                        <label key={optionIndex} className="flex items-center gap-2 text-sm text-on-surface">
                          <input
                            type="radio"
                            checked={selectedAnswers[questionIndex] === optionIndex}
                            onChange={() => {
                              setSelectedAnswers((current) => {
                                const next = [...current];
                                next[questionIndex] = optionIndex;
                                return next;
                              });
                            }}
                          />
                          {option}
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={submitQuiz}
                disabled={isSubmittingQuiz}
                className="mt-4 w-full rounded-xl bg-emerald-800 px-4 py-3 text-sm font-bold text-white hover:bg-emerald-700 disabled:opacity-50"
              >
                {isSubmittingQuiz ? 'Submitting...' : 'Submit Quiz'}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function MilestoneItem({ icon, title, description, color, locked }: { icon: React.ReactNode; title: string; description: string; color?: string; locked?: boolean }) {
  return (
    <div className={cn("flex items-center gap-4 rounded-2xl bg-white p-4 shadow-sm", locked && "opacity-60 grayscale")}>
      <div className={cn(
        "flex h-12 w-12 items-center justify-center rounded-xl",
        color === 'amber' ? "bg-amber-50 text-amber-700" : 
        color === 'emerald' ? "bg-emerald-50 text-emerald-700" : 
        "bg-surface-container-high text-on-surface-variant"
      )}>
        {icon}
      </div>
      <div>
        <p className="text-sm font-bold text-on-surface">{title}</p>
        <p className="text-xs text-on-surface-variant">{description}</p>
      </div>
    </div>
  );
}

function CourseCard({ title, module, progress, image }: { title: string; module: string; progress: number; image: string }) {
  return (
    <div className="group min-w-[280px] overflow-hidden rounded-2xl bg-surface-container-low transition-all duration-300 hover:shadow-xl">
      <div className="relative h-32 w-full">
        <img src={image} alt={title} className="h-full w-full object-cover" referrerPolicy="no-referrer" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
        <span className="absolute bottom-3 left-4 font-headline font-bold text-white">{title}</span>
      </div>
      <div className="p-5">
        <div className="mb-3 flex justify-between items-center text-xs font-bold text-on-surface-variant">
          <span>{module}</span>
          <span>{progress}%</span>
        </div>
        <div className="mb-5 h-2 w-full rounded-full bg-surface-container-highest">
          <div className="h-full rounded-full bg-primary" style={{ width: `${progress}%` }}></div>
        </div>
        <button className="w-full rounded-xl border border-primary py-2.5 font-headline text-sm font-bold text-primary transition-all hover:bg-primary hover:text-white">
          Continue
        </button>
      </div>
    </div>
  );
}

function SupportCard({ icon, title, description, color }: { icon: React.ReactNode; title: string; description: string; color: 'emerald' | 'blue' }) {
  return (
    <div className={cn(
      "group flex cursor-pointer items-center justify-between rounded-[2rem] p-6 transition-all hover:shadow-md",
      color === 'emerald' ? "bg-emerald-50" : "bg-blue-50"
    )}>
      <div className="flex items-center gap-5">
        <div className={cn(
          "flex h-14 w-14 items-center justify-center rounded-2xl text-white",
          color === 'emerald' ? "bg-emerald-800" : "bg-blue-700"
        )}>
          {icon}
        </div>
        <div>
          <p className={cn("font-headline text-lg font-bold", color === 'emerald' ? "text-emerald-900" : "text-blue-900")}>
            {title}
          </p>
          <p className="text-sm text-on-surface-variant">{description}</p>
        </div>
      </div>
      <ArrowRight className={cn(
        "transition-transform group-hover:translate-x-1",
        color === 'emerald' ? "text-emerald-800" : "text-blue-700"
      )} />
    </div>
  );
}
