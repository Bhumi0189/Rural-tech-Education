import React from 'react';
import { motion } from 'motion/react';
import { 
  ChevronLeft, 
  PlayCircle, 
  FileText, 
  CheckCircle2, 
  Circle, 
  Clock, 
  BookOpen, 
  Download,
  ArrowLeft
} from 'lucide-react';
import { cn } from '../lib/utils';

interface Lesson {
  id: string;
  title: string;
  duration: string;
  completed: boolean;
  type: 'video' | 'reading';
}

interface Module {
  id: string;
  title: string;
  lessons: Lesson[];
}

interface Resource {
  id: string;
  title: string;
  type: string;
  size: string;
}

interface CourseDetailProps {
  course: {
    id: number;
    title: string;
    image: string;
    color: string;
    progress: number;
  };
  onBack: () => void;
}

const MOCK_MODULES: Module[] = [
  {
    id: 'm1',
    title: 'Introduction to the Subject',
    lessons: [
      { id: 'l1', title: 'Basic Concepts and Definitions', duration: '12:00', completed: true, type: 'video' },
      { id: 'l2', title: 'Historical Context', duration: '15:00', completed: true, type: 'reading' },
    ]
  },
  {
    id: 'm2',
    title: 'Core Principles',
    lessons: [
      { id: 'l3', title: 'Fundamental Laws', duration: '20:00', completed: true, type: 'video' },
      { id: 'l4', title: 'Practical Applications', duration: '18:00', completed: false, type: 'video' },
      { id: 'l5', title: 'Case Studies', duration: '25:00', completed: false, type: 'reading' },
    ]
  },
  {
    id: 'm3',
    title: 'Advanced Topics',
    lessons: [
      { id: 'l6', title: 'Complex Theories', duration: '30:00', completed: false, type: 'video' },
      { id: 'l7', title: 'Future Trends', duration: '22:00', completed: false, type: 'video' },
    ]
  }
];

const MOCK_RESOURCES: Resource[] = [
  { id: 'r1', title: 'Course Syllabus', type: 'PDF', size: '1.2 MB' },
  { id: 'r2', title: 'Chapter 1 Notes', type: 'PDF', size: '2.5 MB' },
  { id: 'r3', title: 'Practice Exercises', type: 'DOCX', size: '800 KB' },
];

export default function CourseDetail({ course, onBack }: CourseDetailProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-8"
    >
      {/* Header */}
      <div className="flex items-center gap-4">
        <button 
          onClick={onBack}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-container-high text-on-surface-variant hover:bg-emerald-50 hover:text-emerald-800 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="font-headline text-3xl font-extrabold text-on-surface">{course.title}</h1>
          <p className="text-on-surface-variant">Continue where you left off</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Left Column: Modules & Lessons */}
        <div className="space-y-6 lg:col-span-8">
          <section className="rounded-[2.5rem] bg-white p-8 shadow-sm border border-emerald-50">
            <h2 className="mb-6 font-headline text-xl font-bold text-on-surface">Course Content</h2>
            <div className="space-y-4">
              {MOCK_MODULES.map((module, mIdx) => (
                <div key={module.id} className="overflow-hidden rounded-2xl border border-emerald-50 bg-surface-container-lowest">
                  <div className="flex items-center justify-between bg-emerald-50/30 px-6 py-4">
                    <h3 className="font-headline font-bold text-emerald-900">
                      Module {mIdx + 1}: {module.title}
                    </h3>
                    <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
                      {module.lessons.filter(l => l.completed).length}/{module.lessons.length} Lessons
                    </span>
                  </div>
                  <div className="divide-y divide-emerald-50/50">
                    {module.lessons.map((lesson) => (
                      <div key={lesson.id} className="flex items-center justify-between px-6 py-4 transition-colors hover:bg-emerald-50/10">
                        <div className="flex items-center gap-4">
                          {lesson.completed ? (
                            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                          ) : (
                            <Circle className="h-5 w-5 text-stone-300" />
                          )}
                          <div>
                            <p className={cn(
                              "text-sm font-medium",
                              lesson.completed ? "text-on-surface" : "text-on-surface-variant"
                            )}>
                              {lesson.title}
                            </p>
                            <div className="flex items-center gap-3 mt-1">
                              <span className="flex items-center gap-1 text-[10px] font-bold text-stone-400 uppercase tracking-widest">
                                {lesson.type === 'video' ? <PlayCircle className="h-3 w-3" /> : <FileText className="h-3 w-3" />}
                                {lesson.type}
                              </span>
                              <span className="flex items-center gap-1 text-[10px] font-bold text-stone-400 uppercase tracking-widest">
                                <Clock className="h-3 w-3" />
                                {lesson.duration}
                              </span>
                            </div>
                          </div>
                        </div>
                        <button className={cn(
                          "rounded-full px-4 py-1.5 text-xs font-bold transition-all",
                          lesson.completed 
                            ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100" 
                            : "bg-emerald-800 text-white hover:bg-emerald-700"
                        )}>
                          {lesson.completed ? 'Review' : 'Start'}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Right Column: Progress & Resources */}
        <div className="space-y-6 lg:col-span-4">
          {/* Progress Card */}
          <section className="rounded-[2.5rem] bg-emerald-800 p-8 text-white shadow-lg shadow-emerald-900/20">
            <h3 className="mb-6 font-headline text-xl font-bold">Your Progress</h3>
            <div className="mb-4 flex items-end justify-between">
              <span className="text-4xl font-extrabold">{course.progress}%</span>
              <span className="text-xs font-bold uppercase tracking-widest opacity-70">Overall Completion</span>
            </div>
            <div className="mb-8 h-3 w-full rounded-full bg-white/20">
              <div 
                className="h-full rounded-full bg-white shadow-[0_0_15px_rgba(255,255,255,0.5)] transition-all duration-1000" 
                style={{ width: `${course.progress}%` }}
              ></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-2xl bg-white/10 p-4">
                <p className="text-[10px] font-bold uppercase tracking-widest opacity-70 mb-1">Time Spent</p>
                <p className="font-headline text-lg font-bold">12.5 Hrs</p>
              </div>
              <div className="rounded-2xl bg-white/10 p-4">
                <p className="text-[10px] font-bold uppercase tracking-widest opacity-70 mb-1">Rank</p>
                <p className="font-headline text-lg font-bold">#4 / 45</p>
              </div>
            </div>
          </section>

          {/* Resources Card */}
          <section className="rounded-[2.5rem] bg-surface-container-low p-8">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="font-headline text-xl font-bold text-on-surface">Resources</h3>
              <BookOpen className="h-5 w-5 text-emerald-700" />
            </div>
            <div className="space-y-3">
              {MOCK_RESOURCES.map((resource) => (
                <div key={resource.id} className="flex items-center justify-between rounded-2xl bg-white p-4 shadow-sm transition-all hover:shadow-md">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-on-surface">{resource.title}</p>
                      <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
                        {resource.type} • {resource.size}
                      </p>
                    </div>
                  </div>
                  <button className="text-emerald-700 hover:text-emerald-900 transition-colors">
                    <Download className="h-5 w-5" />
                  </button>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </motion.div>
  );
}
