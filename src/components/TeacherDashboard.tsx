import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { RefreshCw, Users, BookOpen, Clock, PlusCircle, ArrowRight, GraduationCap, FileUp, MessageCircle, HelpCircle, Video } from 'lucide-react';
import { cn } from '../lib/utils';
import { Language, getTranslation } from '../lib/translations';

interface TeacherDashboardProps {
  fullName?: string;
  language?: Language;
  onOpenVideoUpload?: () => void;
  onOpenQuizCreate?: () => void;
}

interface Enrollment {
  id: string;
  studentName: string;
  studentClass: string;
  teacherName: string;
  videoTitle: string;
  subject: string;
  status: 'enrolled' | 'started' | 'completed';
  progress: number;
  createdAt?: string;
}

interface Quiz {
  id: string;
  title: string;
  subject: string;
  class: string;
  rewardAmount: number;
  questions: Array<{ question: string; options: string[] }>;
}

interface TeacherQuizAttempt {
  id: string;
  quizTitle: string;
  studentName: string;
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

export default function TeacherDashboard({ fullName = 'Teacher', language = 'en', onOpenVideoUpload, onOpenQuizCreate }: TeacherDashboardProps) {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [isLoadingEnrollments, setIsLoadingEnrollments] = useState(false);
  const [uploadedVideosCount, setUploadedVideosCount] = useState(0);
  const [createdQuizzesCount, setCreatedQuizzesCount] = useState(0);
  const [teacherQuizzes, setTeacherQuizzes] = useState<Quiz[]>([]);
  const [quizAttempts, setQuizAttempts] = useState<TeacherQuizAttempt[]>([]);
  const [teacherNotes, setTeacherNotes] = useState<NoteItem[]>([]);
  const [isQuizListOpen, setIsQuizListOpen] = useState(false);
  const [isScoresOpen, setIsScoresOpen] = useState(false);
  const [isEnrolledListOpen, setIsEnrolledListOpen] = useState(false);
  const [isNoteUploadOpen, setIsNoteUploadOpen] = useState(false);
  const [isSubmittingNote, setIsSubmittingNote] = useState(false);
  const [noteError, setNoteError] = useState('');
  const [noteSuccess, setNoteSuccess] = useState('');
  const [noteFile, setNoteFile] = useState<File | null>(null);
  const [noteForm, setNoteForm] = useState({
    title: '',
    description: '',
    fileUrl: '',
    subject: 'SCIENCE',
    class: 'Class 10',
  });

  const loadEnrollments = async () => {
    const token = localStorage.getItem('authToken');

    if (!token) {
      setEnrollments([]);
      return;
    }

    try {
      setIsLoadingEnrollments(true);
      const response = await fetch('/api/enrollments/teacher/me', {
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
      console.error('Teacher enrollments load error:', error);
    } finally {
      setIsLoadingEnrollments(false);
    }
  };

  const loadUploadedVideosCount = async () => {
    const token = localStorage.getItem('authToken');

    if (!token) {
      setUploadedVideosCount(0);
      return;
    }

    try {
      const meResponse = await fetch('/api/auth/me', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!meResponse.ok) {
        return;
      }

      const meData = await meResponse.json();
      const teacherId = meData?.user?.id;

      if (!teacherId) {
        return;
      }

      const videosResponse = await fetch(`/api/videos/teacher/${encodeURIComponent(String(teacherId))}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!videosResponse.ok) {
        return;
      }

      const videos = await videosResponse.json();
      setUploadedVideosCount(Array.isArray(videos) ? videos.length : 0);
    } catch (error) {
      console.error('Teacher videos load error:', error);
    }
  };

  const loadCreatedQuizzesCount = async () => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      setCreatedQuizzesCount(0);
      return;
    }

    try {
      const response = await fetch('/api/quizzes/teacher/me', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        return;
      }

      const data = await response.json();
      const quizzes = Array.isArray(data) ? data : [];
      setTeacherQuizzes(quizzes);
      setCreatedQuizzesCount(quizzes.length);
    } catch (error) {
      console.error('Teacher quizzes load error:', error);
    }
  };

  const loadQuizAttempts = async () => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      setQuizAttempts([]);
      return;
    }

    try {
      const response = await fetch('/api/quizzes/attempts/teacher/me', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        return;
      }

      const data = await response.json();
      setQuizAttempts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Teacher quiz scores load error:', error);
    }
  };

  const loadTeacherNotes = async () => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      setTeacherNotes([]);
      return;
    }

    try {
      const response = await fetch('/api/notes/teacher/me', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        return;
      }

      const data = await response.json();
      setTeacherNotes(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Teacher notes load error:', error);
    }
  };

  const handleUploadNote = async () => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      setNoteError('Please login as teacher.');
      return;
    }

    if (!noteForm.title.trim() || !noteForm.subject.trim()) {
      setNoteError('Title and subject are required.');
      return;
    }

    if (!noteFile && !noteForm.fileUrl.trim()) {
      setNoteError('Upload a PDF file or provide a PDF URL.');
      return;
    }

    try {
      setIsSubmittingNote(true);
      setNoteError('');
      setNoteSuccess('');

      const payload = new FormData();
      payload.append('title', noteForm.title.trim());
      payload.append('description', noteForm.description.trim());
      payload.append('subject', noteForm.subject.trim());
      payload.append('class', noteForm.class.trim());

      if (noteFile) {
        payload.append('file', noteFile);
      } else {
        payload.append('fileUrl', noteForm.fileUrl.trim());
      }

      const response = await fetch('/api/notes', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: payload,
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data?.message || 'Failed to upload note.');
      }

      setNoteSuccess('PDF note uploaded successfully.');
      setNoteForm({
        title: '',
        description: '',
        fileUrl: '',
        subject: 'SCIENCE',
        class: 'Class 10',
      });
      setNoteFile(null);
      await loadTeacherNotes();
    } catch (error) {
      setNoteError(error instanceof Error ? error.message : 'Failed to upload note.');
    } finally {
      setIsSubmittingNote(false);
    }
  };

  useEffect(() => {
    loadEnrollments();
    loadUploadedVideosCount();
    loadCreatedQuizzesCount();
    loadQuizAttempts();
    loadTeacherNotes();

    const interval = window.setInterval(() => {
      loadEnrollments();
      loadUploadedVideosCount();
      loadCreatedQuizzesCount();
      loadQuizAttempts();
      loadTeacherNotes();
    }, 15000);

    return () => {
      window.clearInterval(interval);
    };
  }, []);

  const formatRelativeTime = (value?: string) => {
    if (!value) {
      return 'Just now';
    }

    const then = new Date(value).getTime();
    if (Number.isNaN(then)) {
      return 'Just now';
    }

    const diffMs = Date.now() - then;
    const minute = 60 * 1000;
    const hour = 60 * minute;
    const day = 24 * hour;

    if (diffMs < minute) {
      return 'Just now';
    }
    if (diffMs < hour) {
      const minutes = Math.floor(diffMs / minute);
      return `${minutes} min ago`;
    }
    if (diffMs < day) {
      const hours = Math.floor(diffMs / hour);
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    }
    if (diffMs < day * 2) {
      return 'Yesterday';
    }

    const days = Math.floor(diffMs / day);
    return `${days} days ago`;
  };

  const getInitials = (name: string) => {
    const parts = String(name || '').trim().split(/\s+/).filter(Boolean);
    return parts.slice(0, 2).map((part) => part[0]?.toUpperCase()).join('') || 'ST';
  };

  const recentSubmissions = [...quizAttempts]
    .sort((a, b) => {
      const aTime = new Date(a.submittedAt || '').getTime() || 0;
      const bTime = new Date(b.submittedAt || '').getTime() || 0;
      return bTime - aTime;
    })
    .slice(0, 5)
    .map((attempt) => ({
      id: attempt.id,
      name: attempt.studentName,
      task: `${attempt.quizTitle} (${attempt.score}/${attempt.totalQuestions})`,
      time: formatRelativeTime(attempt.submittedAt),
      initials: getInitials(attempt.studentName),
    }));

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <section className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-1"
        >
          <p className="font-headline text-sm font-medium tracking-wide text-tertiary uppercase">Welcome back</p>
          <h2 className="font-headline text-3xl font-extrabold tracking-tight text-on-surface md:text-4xl">
            {getTranslation(language, 'namaste')}, {fullName}
          </h2>
          <p className="max-w-md text-on-surface-variant">
            Your classroom is thriving. Here is what's happening at RuralTechEd today.
          </p>
        </motion.div>
        <button
          onClick={loadEnrollments}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary to-primary-container px-6 py-3 font-headline font-semibold text-on-primary shadow-md transition-transform active:scale-95"
        >
          <RefreshCw className="h-4 w-4" />
          {isLoadingEnrollments ? 'Refreshing...' : 'Refresh Students'}
        </button>
      </section>

      {/* Quick Stats */}
      <section className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard icon={<Users className="h-6 w-6" />} value={String(enrollments.length)} label="Total Students" color="primary" />
        <StatCard icon={<BookOpen className="h-6 w-6" />} value={String(uploadedVideosCount)} label="Videos Uploaded" color="secondary" />
        <StatCard icon={<Clock className="h-6 w-6" />} value={String(createdQuizzesCount)} label="Quizzes Created" color="tertiary" />
        <StatCard icon={<PlusCircle className="h-6 w-6" />} value={String(quizAttempts.length)} label="Quiz Submissions" color="primary" />
      </section>

      {/* Action Boxes */}
      <section className="grid gap-6 md:grid-cols-3">
        {/* Enrolled Students Box */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="soft-card flex flex-col items-center justify-center bg-gradient-to-br from-emerald-50 via-emerald-50 to-white p-8 border-emerald-200"
        >
          <Users className="mb-3 h-12 w-12 text-emerald-700" />
          <h3 className="font-headline text-lg font-bold text-emerald-900 text-center">Enrolled Students</h3>
          <p className="mt-2 text-sm text-emerald-700 text-center">{enrollments.length} Students</p>
          <button
            onClick={() => {
              loadEnrollments();
              setIsEnrolledListOpen(true);
            }}
            className="mt-4 rounded-xl bg-emerald-700 px-6 py-2 font-headline font-semibold text-white transition-transform hover:bg-emerald-800 active:scale-95"
          >
            View List
          </button>
        </motion.div>

        {/* View Quiz Box */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="soft-card flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-blue-50 to-white p-8 border-blue-200"
        >
          <HelpCircle className="mb-3 h-12 w-12 text-blue-700" />
          <h3 className="font-headline text-lg font-bold text-blue-900 text-center">View Quiz</h3>
          <p className="mt-2 text-sm text-blue-700 text-center">{createdQuizzesCount} Created</p>
          <button
            onClick={() => setIsQuizListOpen(true)}
            className="mt-4 rounded-xl bg-blue-700 px-6 py-2 font-headline font-semibold text-white transition-transform hover:bg-blue-800 active:scale-95"
          >
            Open Quizzes
          </button>
        </motion.div>

        {/* View Scores Box */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="soft-card flex flex-col items-center justify-center bg-gradient-to-br from-purple-50 via-purple-50 to-white p-8 border-purple-200"
        >
          <BookOpen className="mb-3 h-12 w-12 text-purple-700" />
          <h3 className="font-headline text-lg font-bold text-purple-900 text-center">View Scores</h3>
          <p className="mt-2 text-sm text-purple-700 text-center">{quizAttempts.length} Submissions</p>
          <button
            onClick={() => setIsScoresOpen(true)}
            className="mt-4 rounded-xl bg-purple-700 px-6 py-2 font-headline font-semibold text-white transition-transform hover:bg-purple-800 active:scale-95"
          >
            Open Scores
          </button>
        </motion.div>
      </section>

      {/* Active Classes */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-headline text-xl font-bold text-on-surface">Active Classes</h3>
          <button className="font-headline text-sm font-semibold text-secondary hover:underline">View All</button>
        </div>
        <div className="no-scrollbar flex gap-6 overflow-x-auto pb-4">
          <ClassCard
            title="Science & Ecology"
            grade="STEM • GRADE 10"
            attendance={94}
            image="https://lh3.googleusercontent.com/aida-public/AB6AXuAJBrt2NggyJj2oeaoQ756Gxcj8BtO4oWrSu9cjlEp0xkuBrdx_kIfnuh3-l8LQze7GSX8Roh2DH67EdFJlkXBqH5N2dhy3ULbs2aOOlaYkGETd4U7nZdnwfwOHANec0jnptcC90ty0JmQcW1iKo6gvcDRm7ruCxpFjK2kd0nryY3aTpyuegWQRse6526rq8GGaIOxCcNpsgDlK5iAoAx2zdk6zd4zJlPSnYyYZea3ToecseGSnK-7J6ipLGpR69tYJ8cIXXiFURW8"
          />
          <ClassCard
            title="Modern Agriculture"
            grade="VOCATIONAL • GRADE 9"
            attendance={88}
            image="https://lh3.googleusercontent.com/aida-public/AB6AXuDtpBvBDSarsJurpFq3qiqTCxa_L6sVGXs_uSOZeel0igJmfdJIkD46q00NKPKjjiA0z8Zv8bwaVDinl5OJ4S6y0o4WnLIWEe4Aak_wgOciQRJZlx8JVfCMoFH6gSZzmNqMd2adv7qxrYWG9ac10VXSes7rMn1euiUV3xdQHro92QT3PR6b7XENqs8r-zWSnHjr0uF-unIwaeY5xclGsBjaxaL3flFtJ0vwHICShM2SjsfZJKzYnfQJtVDq8Wpp5l6HoHFaj7ZQayw"
          />
          <ClassCard
            title="Applied Mathematics"
            grade="CORE • GRADE 10"
            attendance={91}
            image="https://lh3.googleusercontent.com/aida-public/AB6AXuC8Y7oGH_YBd5y5RA3TkqbX0jZUVD54naOa2zoidEfTDYcjPhIdjTFtXX7NM-qxsAdOYbbFNu1mCdm4Yt7AGxQiaqR2XWyxJy36F2XdvL1aukjDbhwrL6v2J1wLVQzu9OyJXGNIsxWAF2qE4O91VoWY66tXfCVqt99WJn49ZNsYX0dceazdeoLLqcXKA19LL0X3mtT9FzVVrSLYuPoO3jw_yht3QmgW5QcvcfB2OYZdKdnfTUHpjcxyJzxmaCFIwjaKQJCKzYbQHbQ"
          />
        </div>
      </section>

      {/* Submissions & Tasks */}
      <section className="grid gap-8 md:grid-cols-3">
        {/* Recent Submissions */}
        <div className="soft-card space-y-4 p-6 md:col-span-2 md:p-8">
          <div className="flex items-center justify-between">
            <h3 className="font-headline text-xl font-bold text-on-surface">Recent Submissions</h3>
            <span className="rounded bg-tertiary/10 px-2 py-1 text-[10px] font-bold text-tertiary uppercase">{quizAttempts.length} New</span>
          </div>
          <div className="rounded-2xl bg-surface-container-low p-2">
            <div className="divide-y divide-outline-variant/20">
              {recentSubmissions.length === 0 ? (
                <div className="p-4 text-sm text-on-surface-variant">No recent submissions yet.</div>
              ) : (
                recentSubmissions.map((submission) => (
                  <SubmissionItem
                    key={submission.id}
                    name={submission.name}
                    task={submission.task}
                    time={submission.time}
                    initials={submission.initials}
                    onGrade={() => setIsScoresOpen(true)}
                  />
                ))
              )}
            </div>
          </div>
        </div>

        {/* Quick Tasks */}
        <div className="soft-card space-y-4 p-6 md:p-8">
          <h3 className="font-headline text-xl font-bold text-on-surface">Quick Tasks</h3>
          <div className="grid grid-cols-1 gap-3">
            <TaskButton icon={<Video className="h-5 w-5" />} title="Upload Video" description="Share course videos" color="primary" onClick={onOpenVideoUpload} />
            <TaskButton icon={<HelpCircle className="h-5 w-5" />} title="Create New Quiz" description="Assess student learning" color="secondary" onClick={onOpenQuizCreate} />
            <TaskButton icon={<FileUp className="h-5 w-5" />} title="Upload Note" description="Share PDF notes" color="primary" onClick={() => setIsNoteUploadOpen(true)} />
            <TaskButton icon={<MessageCircle className="h-5 w-5" />} title="Message Students" description="Send a group broadcast" color="tertiary" />
          </div>
        </div>
      </section>

      {isNoteUploadOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-headline text-2xl font-bold text-on-surface">Upload PDF Note</h3>
              <button onClick={() => setIsNoteUploadOpen(false)} className="rounded-lg border border-outline-variant/30 px-3 py-1.5 text-sm font-semibold">Close</button>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <input
                value={noteForm.title}
                onChange={(event) => setNoteForm((current) => ({ ...current, title: event.target.value }))}
                placeholder="Note title"
                className="rounded-xl border border-outline-variant/30 px-3 py-2 text-sm"
              />
              <select
                value={noteForm.subject}
                onChange={(event) => setNoteForm((current) => ({ ...current, subject: event.target.value }))}
                className="rounded-xl border border-outline-variant/30 px-3 py-2 text-sm"
              >
                <option value="SCIENCE">SCIENCE</option>
                <option value="MATHEMATICS">MATHEMATICS</option>
                <option value="HISTORY">HISTORY</option>
                <option value="LANGUAGE">LANGUAGE</option>
                <option value="AGRICULTURE">AGRICULTURE</option>
                <option value="TECH">TECH</option>
              </select>
              <input
                value={noteForm.class}
                onChange={(event) => setNoteForm((current) => ({ ...current, class: event.target.value }))}
                placeholder="Class 10"
                className="rounded-xl border border-outline-variant/30 px-3 py-2 text-sm"
              />
              <input
                type="file"
                accept="application/pdf,.pdf"
                onChange={(event) => setNoteFile(event.target.files?.[0] || null)}
                className="rounded-xl border border-outline-variant/30 px-3 py-2 text-sm"
              />
              <input
                value={noteForm.fileUrl}
                onChange={(event) => setNoteForm((current) => ({ ...current, fileUrl: event.target.value }))}
                placeholder="Or paste PDF URL (optional)"
                className="md:col-span-2 rounded-xl border border-outline-variant/30 px-3 py-2 text-sm"
              />
              <textarea
                value={noteForm.description}
                onChange={(event) => setNoteForm((current) => ({ ...current, description: event.target.value }))}
                placeholder="Description (optional)"
                rows={3}
                className="md:col-span-2 rounded-xl border border-outline-variant/30 px-3 py-2 text-sm"
              />
            </div>

            {noteFile && (
              <p className="mt-2 text-xs font-semibold text-emerald-700">Selected file: {noteFile.name}</p>
            )}

            {noteError && <p className="mt-3 text-sm font-semibold text-red-600">{noteError}</p>}
            {noteSuccess && <p className="mt-3 text-sm font-semibold text-emerald-700">{noteSuccess}</p>}

            <button
              onClick={handleUploadNote}
              disabled={isSubmittingNote}
              className="mt-4 w-full rounded-xl bg-emerald-800 px-4 py-3 text-sm font-bold text-white hover:bg-emerald-700 disabled:opacity-60"
            >
              {isSubmittingNote ? 'Uploading...' : 'Upload PDF Note'}
            </button>

            <div className="mt-6 border-t border-outline-variant/20 pt-4">
              <p className="mb-3 text-xs font-bold uppercase tracking-widest text-on-surface-variant">Your Uploaded Notes</p>
              {teacherNotes.length === 0 ? (
                <p className="text-sm text-on-surface-variant">No notes uploaded yet.</p>
              ) : (
                <div className="space-y-2">
                  {teacherNotes.slice(0, 6).map((note) => (
                    <div key={note.id} className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-3">
                      <p className="font-headline text-sm font-bold text-on-surface">{note.title}</p>
                      <p className="text-xs text-on-surface-variant">{note.subject} • {note.class}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {isQuizListOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-[1.75rem] bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-headline text-2xl font-bold text-on-surface">Your Quizzes</h3>
              <button onClick={() => setIsQuizListOpen(false)} className="rounded-lg border border-outline-variant/30 px-3 py-1.5 text-sm font-semibold">Close</button>
            </div>

            {teacherQuizzes.length === 0 ? (
              <p className="text-sm text-on-surface-variant">No quizzes created yet.</p>
            ) : (
              <div className="space-y-3">
                {teacherQuizzes.map((quiz) => (
                  <div key={quiz.id} className="rounded-2xl border border-emerald-100 bg-surface-container-low p-4">
                    <p className="text-[11px] font-bold uppercase tracking-widest text-emerald-700">{quiz.subject}</p>
                    <p className="mt-1 font-headline text-sm font-bold text-on-surface">{quiz.title}</p>
                    <p className="mt-1 text-xs text-on-surface-variant">{quiz.class} • {quiz.questions?.length || 0} questions</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {isScoresOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-[1.75rem] bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-headline text-2xl font-bold text-on-surface">Student Quiz Scores</h3>
              <button onClick={() => setIsScoresOpen(false)} className="rounded-lg border border-outline-variant/30 px-3 py-1.5 text-sm font-semibold">Close</button>
            </div>

            {quizAttempts.length === 0 ? (
              <p className="text-sm text-on-surface-variant">No student has submitted your quizzes yet.</p>
            ) : (
              <div className="space-y-3">
                {quizAttempts.map((attempt) => (
                  <div key={attempt.id} className="rounded-2xl border border-emerald-100 bg-surface-container-low p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-headline text-sm font-bold text-on-surface">{attempt.studentName}</p>
                        <p className="text-xs text-on-surface-variant">{attempt.quizTitle} • {attempt.subject}</p>
                      </div>
                      <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-bold text-emerald-800">{attempt.score}/{attempt.totalQuestions}</span>
                    </div>
                    <p className="mt-2 text-xs text-on-surface-variant">{attempt.submittedAt ? new Date(attempt.submittedAt).toLocaleString() : 'Just now'}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {isEnrolledListOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-[1.75rem] bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-headline text-2xl font-bold text-on-surface">Enrolled Students</h3>
              <button onClick={() => setIsEnrolledListOpen(false)} className="rounded-lg border border-outline-variant/30 px-3 py-1.5 text-sm font-semibold">Close</button>
            </div>

            {enrollments.length === 0 ? (
              <p className="text-sm text-on-surface-variant">
                No students have enrolled in your uploaded videos yet.
              </p>
            ) : (
              <div className="grid gap-3 md:grid-cols-2">
                {enrollments.map((enrollment) => (
                  <div key={enrollment.id} className="rounded-2xl bg-surface-container-low p-4 border border-emerald-100">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-headline text-sm font-bold text-on-surface">{enrollment.studentName}</p>
                        <p className="text-xs text-on-surface-variant">{enrollment.studentClass} • {enrollment.subject}</p>
                      </div>
                      <span className="rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-emerald-700">
                        {enrollment.status}
                      </span>
                    </div>
                    <p className="mt-3 text-sm text-on-surface-variant">Current course: {enrollment.videoTitle}</p>
                    <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-stone-100">
                      <div className="h-full rounded-full bg-emerald-800" style={{ width: `${enrollment.progress}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Professional Development */}
      <section className="relative overflow-hidden rounded-3xl bg-surface-container-low p-8">
        <div className="absolute right-0 top-0 -mr-20 -mt-20 h-64 w-64 rounded-full bg-primary-container/10 blur-3xl"></div>
        <div className="relative z-10 flex flex-col items-center gap-8 md:flex-row">
          <div className="aspect-video w-full overflow-hidden rounded-2xl shadow-lg md:aspect-square md:w-1/3">
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDjAAW1kgC2FbN-D12I0hncxJH1zf85vBH7qm-ZsqE0a7XtA_83h743ZTtpCbRn546Ec29ByeE0aQck7CLvAms-mhvAx0PrsY6pxHugb1JwGC1JwLmyABt5xcV5OkexBIwWZxpjy5VHb-LXZFgmIBfEH5tzmpRSg07q7f1aHbug1cx5P1UCo6NPcxFsHAY1mzaCFkEvWz3oZjDSqz0WtTw8UV6oS2NfWjKULcz_axmsAQVyP6_HZXgtK-t-cdCSnp7ZubiDMf4nyyA"
              alt="Professional Development"
              className="h-full w-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="flex-1 space-y-4">
            <span className="rounded-full bg-tertiary-container px-3 py-1 text-xs font-bold tracking-widest text-on-tertiary-container uppercase">
              Teacher Growth
            </span>
            <h3 className="font-headline text-2xl font-extrabold text-on-surface md:text-3xl">
              Mastering Hybrid Learning in Rural Spaces
            </h3>
            <p className="text-lg text-on-surface-variant">
              Learn how to effectively manage student syncs and offline-first teaching strategies to ensure no child is left behind.
            </p>
            <div className="flex gap-4 pt-2">
              <button className="rounded-lg bg-primary px-6 py-2 font-headline font-semibold text-on-primary">
                Start Learning
              </button>
              <button className="flex items-center gap-1 font-headline font-semibold text-primary">
                Browse Tips <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function StatCard({ icon, value, label, color }: { icon: React.ReactNode; value: string; label: string; color: 'primary' | 'secondary' | 'tertiary' }) {
  return (
    <div className="group space-y-2 rounded-xl bg-surface-container-lowest p-6 transition-all hover:bg-surface-container">
      <div className={cn(
        "flex h-12 w-12 items-center justify-center rounded-full",
        color === 'primary' ? "bg-primary-container/10 text-primary" :
        color === 'secondary' ? "bg-secondary-container/10 text-secondary" :
        "bg-tertiary-container/10 text-tertiary"
      )}>
        {icon}
      </div>
      <div>
        <h3 className="font-headline text-2xl font-bold text-on-surface">{value}</h3>
        <p className="font-label text-sm tracking-wider text-on-surface-variant uppercase">{label}</p>
      </div>
    </div>
  );
}

function ClassCard({ title, grade, attendance, image }: { title: string; grade: string; attendance: number; image: string }) {
  return (
    <div className="min-w-[280px] snap-start overflow-hidden rounded-2xl bg-surface-container-low shadow-sm">
      <div className="relative h-32">
        <img src={image} alt={title} className="h-full w-full object-cover" referrerPolicy="no-referrer" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-4">
          <span className="font-label text-[10px] tracking-widest text-white/80 uppercase">{grade}</span>
          <h4 className="font-headline text-lg font-bold text-white">{title}</h4>
        </div>
      </div>
      <div className="space-y-4 p-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-on-surface-variant">Attendance</span>
          <span className="font-bold text-primary">{attendance}%</span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-variant">
          <div className="h-full rounded-full bg-primary" style={{ width: `${attendance}%` }}></div>
        </div>
      </div>
    </div>
  );
}

function SubmissionItem({ name, task, time, initials, onGrade }: { name: string; task: string; time: string; initials: string; onGrade?: () => void }) {
  return (
    <div className="group flex items-center justify-between p-4">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-variant font-headline font-bold text-on-surface-variant">
          {initials}
        </div>
        <div>
          <h4 className="font-semibold text-on-surface">{name}</h4>
          <p className="text-xs text-on-surface-variant">
            {task} • <span className="text-secondary">{time}</span>
          </p>
        </div>
      </div>
      <button onClick={onGrade} className="font-headline text-sm font-bold text-primary">Grade</button>
    </div>
  );
}

function TaskButton({ icon, title, description, color, onClick }: { icon: React.ReactNode; title: string; description: string; color: 'primary' | 'secondary' | 'tertiary'; onClick?: () => void }) {
  return (
    <button onClick={onClick} className={cn(
      "group flex items-center gap-4 rounded-xl p-4 text-left transition-colors",
      color === 'primary' ? "bg-surface-container-highest hover:bg-primary-container/20" :
      color === 'secondary' ? "bg-surface-container-highest hover:bg-secondary-container/20" :
      "bg-surface-container-highest hover:bg-tertiary-container/20"
    )}>
      <div className={cn(
        "rounded-lg p-2 text-white",
        color === 'primary' ? "bg-primary" : color === 'secondary' ? "bg-secondary" : "bg-tertiary"
      )}>
        {icon}
      </div>
      <div>
        <p className="font-headline font-bold text-on-surface">{title}</p>
        <p className="text-xs text-on-surface-variant">{description}</p>
      </div>
    </button>
  );
}
