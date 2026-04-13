/// <reference types="react" />
import { motion } from 'motion/react';
import { RefreshCw, BookOpen, TrendingUp, Clock, Award } from 'lucide-react';
import { cn } from '../lib/utils';

interface ProfilePageProps {
  fullName: string;
  role: 'student' | 'teacher';
  onBack: () => void;
}

export default function ProfilePage({ fullName, role, onBack }: ProfilePageProps) {

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
            Namaste, {fullName}!
          </h2>
          <p className="max-w-md text-on-surface-variant">
            Ready to continue your learning journey today?
          </p>
        </motion.div>
        <button className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary to-primary-container px-6 py-3 font-headline font-semibold text-on-primary shadow-md transition-transform active:scale-95 hover:opacity-90">
          <RefreshCw className="h-4 w-4" />
          Sync Offline Work
        </button>
      </section>

      {/* Main Journey Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="grid gap-6 md:grid-cols-3"
      >
        {/* Your Class Journey - Main Card */}
        <div className="rounded-2xl border border-emerald-100/30 bg-white/50 p-6 backdrop-blur-sm md:col-span-2 dark:border-stone-800/30 dark:bg-stone-900/50">
          <h3 className="mb-6 font-headline text-lg font-bold text-on-surface">Your Class 10 Journey</h3>
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:gap-8">
            {/* Progress Circle */}
            <div className="flex h-40 w-40 flex-shrink-0 items-center justify-center rounded-full border-8 border-emerald-100 bg-gradient-to-br from-emerald-50 to-teal-50 dark:border-emerald-900/30 dark:from-emerald-950 dark:to-teal-950">
              <div className="text-center">
                <p className="font-headline text-4xl font-bold text-emerald-700 dark:text-emerald-400">65%</p>
                <p className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">Complete</p>
              </div>
            </div>
            {/* Progress Details */}
            <div className="flex-1 space-y-4">
              <div>
                <p className="text-sm font-semibold text-on-surface-variant">Progress Overview</p>
                <p className="mt-2 text-base text-on-surface">You've covered 12 out of 18 chapters this term. You are 15% ahead of your weekly goal! Keep the momentum going.</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <div className="flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50/50 px-3 py-1 text-xs font-semibold text-emerald-700 dark:border-emerald-900/30 dark:bg-emerald-950/30 dark:text-emerald-400">
                  <TrendingUp className="h-3 w-3" />
                  12 Day Streak
                </div>
                <div className="flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50/50 px-3 py-1 text-xs font-semibold text-amber-700 dark:border-amber-900/30 dark:bg-amber-950/30 dark:text-amber-400">
                  <Award className="h-3 w-3" />
                  Top 10% this week
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Milestones Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="rounded-2xl border border-emerald-100/30 bg-white/50 p-6 backdrop-blur-sm dark:border-stone-800/30 dark:bg-stone-900/50"
        >
          <div className="mb-6 flex items-center justify-between">
            <h3 className="font-headline text-lg font-bold text-on-surface">Milestones</h3>
            <a href="#" className="text-sm font-semibold text-primary hover:text-primary-container">View All</a>
          </div>
          <div className="space-y-3">
            <div className="flex items-start gap-3 rounded-lg bg-emerald-50/50 p-3 dark:bg-emerald-950/20">
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-emerald-200 dark:bg-emerald-900/40">
                <Award className="h-4 w-4 text-emerald-700 dark:text-emerald-400" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-on-surface">Quiz Master</p>
                <p className="text-xs text-on-surface-variant">Perfect score in Science quiz</p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-lg bg-blue-50/50 p-3 dark:bg-blue-950/20">
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-200 dark:bg-blue-900/40">
                <TrendingUp className="h-4 w-4 text-blue-700 dark:text-blue-400" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-on-surface">Fast Learner</p>
                <p className="text-xs text-on-surface-variant">Completed 3 units in 2 days</p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-lg bg-stone-50/50 p-3 dark:bg-stone-900/30">
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-stone-300 dark:bg-stone-700">
                <Award className="h-4 w-4 text-stone-600 dark:text-stone-300 opacity-40" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-on-surface">Science Wizard</p>
                <p className="text-xs text-on-surface-variant">Locked. Complete Unit 5</p>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.section>

      {/* Weekly Focus */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="rounded-2xl border border-emerald-100/30 bg-white/50 p-6 backdrop-blur-sm dark:border-stone-800/30 dark:bg-stone-900/50"
      >
        <h3 className="mb-4 font-headline text-lg font-bold text-on-surface">Weekly Focus</h3>
        <div className="space-y-3">
          <div className="flex items-start gap-4 rounded-xl border border-emerald-200/50 bg-emerald-50/30 p-4 dark:border-emerald-900/30 dark:bg-emerald-950/20">
            <BookOpen className="h-5 w-5 flex-shrink-0 text-emerald-700 dark:text-emerald-400" />
            <div>
              <p className="font-semibold text-on-surface">Biology Chapter 5: Cell Reproduction</p>
              <p className="mt-1 text-sm text-on-surface-variant">Focus on mitosis and meiosis concepts</p>
            </div>
          </div>
          <div className="flex items-start gap-4 rounded-xl border border-blue-200/50 bg-blue-50/30 p-4 dark:border-blue-900/30 dark:bg-blue-950/20">
            <Clock className="h-5 w-5 flex-shrink-0 text-blue-700 dark:text-blue-400" />
            <div>
              <p className="font-semibold text-on-surface">Quiz Review - 2 more attempts</p>
              <p className="mt-1 text-sm text-on-surface-variant">Improve your scores this week</p>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Current Courses */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="rounded-2xl border border-emerald-100/30 bg-white/50 p-6 backdrop-blur-sm dark:border-stone-800/30 dark:bg-stone-900/50"
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-headline text-lg font-bold text-on-surface">Current Courses</h3>
          <div className="flex gap-2">
            <button className="rounded-full border border-outline-variant p-2 hover:bg-surface-container">←</button>
            <button className="rounded-full border border-outline-variant p-2 hover:bg-surface-container">→</button>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {[
            { subject: 'Biology', progress: 65, color: 'emerald' },
            { subject: 'Chemistry', progress: 45, color: 'blue' },
            { subject: 'Physics', progress: 55, color: 'amber' }
          ].map((course) => (
            <div key={course.subject} className={cn(
              "rounded-xl border p-4 cursor-pointer transition-all hover:shadow-md",
              course.color === 'emerald' && "border-emerald-200/50 bg-emerald-50/30 dark:border-emerald-900/30 dark:bg-emerald-950/20",
              course.color === 'blue' && "border-blue-200/50 bg-blue-50/30 dark:border-blue-900/30 dark:bg-blue-950/20",
              course.color === 'amber' && "border-amber-200/50 bg-amber-50/30 dark:border-amber-900/30 dark:bg-amber-950/20"
            )}>
              <div className="flex items-center justify-between">
                <p className="font-semibold text-on-surface">{course.subject}</p>
                <BookOpen className={cn(
                  "h-5 w-5",
                  course.color === 'emerald' && "text-emerald-700 dark:text-emerald-400",
                  course.color === 'blue' && "text-blue-700 dark:text-blue-400",
                  course.color === 'amber' && "text-amber-700 dark:text-amber-400"
                )} />
              </div>
              <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-surface-container">
                <div 
                  className={cn(
                    "h-full transition-all",
                    course.color === 'emerald' && "bg-emerald-600",
                    course.color === 'blue' && "bg-blue-600",
                    course.color === 'amber' && "bg-amber-600"
                  )}
                  style={{ width: `${course.progress}%` }}
                />
              </div>
              <p className={cn(
                "mt-2 text-xs font-semibold",
                course.color === 'emerald' && "text-emerald-700 dark:text-emerald-400",
                course.color === 'blue' && "text-blue-700 dark:text-blue-400",
                course.color === 'amber' && "text-amber-700 dark:text-amber-400"
              )}>
                {course.progress}% Complete
              </p>
            </div>
          ))}
        </div>
      </motion.section>
    </div>
  );
}
