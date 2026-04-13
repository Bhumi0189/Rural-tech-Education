import { useEffect, useState } from 'react';
import Layout from './components/Layout';
import StudentDashboard from './components/StudentDashboard';
import TeacherDashboard from './components/TeacherDashboard';
import HomePage from './components/HomePage';
import AuthPage from './components/AuthPage';
import VideoUploadModal from './components/VideoUploadModal';
import VideoLessonPage from './components/VideoLessonPage';
import QuizCreateModal from './components/QuizCreateModal';
import { Language } from './lib/translations';

type View = 'home' | 'auth' | 'dashboard' | 'profile' | 'video';

interface ActiveVideo {
  title: string;
  videoUrl: string;
  startSeconds?: number;
}

export default function App() {
  const [view, setView] = useState<View>('home');
  const [role, setRole] = useState<'student' | 'teacher'>('student');
  const [fullName, setFullName] = useState('');
  const [studentClass, setStudentClass] = useState(() => localStorage.getItem('authClass') || 'Class 10');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [initialAuthMode, setInitialAuthMode] = useState<'login' | 'signup'>('login');
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('language') as Language | null;
    return saved || 'en';
  });
  const [isVideoUploadModalOpen, setIsVideoUploadModalOpen] = useState(false);
  const [isQuizCreateModalOpen, setIsQuizCreateModalOpen] = useState(false);
  const [token, setToken] = useState<string>('');
  const [activeVideo, setActiveVideo] = useState<ActiveVideo | null>(null);
  const [videoBackView, setVideoBackView] = useState<View>('dashboard');

  useEffect(() => {
    const savedToken = localStorage.getItem('authToken');
    const savedRole = localStorage.getItem('authRole');
    const savedName = localStorage.getItem('authName');
    const savedClass = localStorage.getItem('authClass');

    if (savedToken && (savedRole === 'student' || savedRole === 'teacher')) {
      setRole(savedRole);
      setFullName(savedName || '');
      setStudentClass(savedClass || 'Class 10');
      setIsAuthenticated(true);
      setToken(savedToken);
      setView('dashboard');
    }
  }, []);

  const handleSelectRole = (selectedRole: 'student' | 'teacher', mode: 'login' | 'signup' = 'login') => {
    setRole(selectedRole);
    setInitialAuthMode(mode);
    setView('auth');
  };

  const handleAuthSuccess = (finalRole: 'student' | 'teacher', authFullName: string, authClass?: string) => {
    setRole(finalRole);
    setFullName(authFullName);
    setStudentClass(authClass || 'Class 10');
    setIsAuthenticated(true);
    const savedToken = localStorage.getItem('authToken');
    if (savedToken) {
      setToken(savedToken);
    }
    setView('dashboard');
  };

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('language', lang);
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('authRole');
    localStorage.removeItem('authName');
    localStorage.removeItem('authClass');
    setFullName('');
    setStudentClass('Class 10');
    setIsAuthenticated(false);
    setToken('');
    setView('home');
  };

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const handleLanguageChange = (newLang: Language) => {
    handleSetLanguage(newLang);
  };

  const handleOpenVideoPage = (video: ActiveVideo) => {
    setActiveVideo(video);
    setVideoBackView(view === 'video' ? 'dashboard' : view);
    setView('video');
  };

  const handleCloseVideoPage = () => {
    setView(videoBackView);
  };

  if (view === 'video' && activeVideo) {
    return (
      <VideoLessonPage
        title={activeVideo.title}
        videoUrl={activeVideo.videoUrl}
        startSeconds={activeVideo.startSeconds || 0}
        onBack={handleCloseVideoPage}
      />
    );
  }

  if (view === 'home') {
    return (
      <HomePage 
        onSelectRole={handleSelectRole}
        isAuthenticated={isAuthenticated}
        fullName={fullName}
        role={role}
        onLogout={handleLogout}
        onOpenProfile={() => setView('profile')}
        language={language}
        onLanguageChange={handleLanguageChange}
        token={token}
        studentClass={studentClass}
        onOpenVideoPage={handleOpenVideoPage}
      />
    );
  }

  if (view === 'auth') {
    return (
      <AuthPage 
        role={role} 
        initialMode={initialAuthMode}
        onBack={() => setView('home')} 
        onAuthSuccess={(finalRole, authFullName, authClass) => handleAuthSuccess(finalRole, authFullName, authClass)} 
      />
    );
  }

  if (view === 'profile' && isAuthenticated) {
    return (
      <Layout role={role} setRole={setRole} fullName={fullName} onLogout={handleLogout} onOpenProfile={() => {}} onBackToHome={() => setView('home')} language={language} onLanguageChange={handleLanguageChange}>
        {role === 'student' ? <StudentDashboard fullName={fullName} language={language} onOpenVideoPage={handleOpenVideoPage} /> : <TeacherDashboard fullName={fullName} language={language} onOpenVideoUpload={() => setIsVideoUploadModalOpen(true)} onOpenQuizCreate={() => setIsQuizCreateModalOpen(true)} />}
        <VideoUploadModal isOpen={isVideoUploadModalOpen} onClose={() => setIsVideoUploadModalOpen(false)} token={token} language={language} onUploadSuccess={() => {}} />
        <QuizCreateModal isOpen={isQuizCreateModalOpen} onClose={() => setIsQuizCreateModalOpen(false)} onCreated={() => {}} />
      </Layout>
    );
  }

  if (view === 'dashboard' && !isAuthenticated) {
    return (
      <HomePage 
        onSelectRole={handleSelectRole}
        isAuthenticated={isAuthenticated}
        fullName={fullName}
        role={role}
        onLogout={handleLogout}
        onOpenProfile={() => setView('profile')}
        language={language}
        onLanguageChange={handleLanguageChange}
        token={token}
        studentClass={studentClass}
        onOpenVideoPage={handleOpenVideoPage}
      />
    );
  }

  return (
    <Layout role={role} setRole={setRole} fullName={fullName} onLogout={handleLogout} onOpenProfile={() => setView('profile')} onBackToHome={() => setView('home')} language={language} onLanguageChange={handleLanguageChange}>
      {role === 'student' ? (
        <div className="space-y-8">
          <StudentDashboard fullName={fullName} language={language} onOpenVideoPage={handleOpenVideoPage} />
        </div>
      ) : (
        <TeacherDashboard fullName={fullName} language={language} onOpenVideoUpload={() => setIsVideoUploadModalOpen(true)} onOpenQuizCreate={() => setIsQuizCreateModalOpen(true)} />
      )}
      <VideoUploadModal isOpen={isVideoUploadModalOpen} onClose={() => setIsVideoUploadModalOpen(false)} token={token} language={language} onUploadSuccess={() => {}} />
      <QuizCreateModal isOpen={isQuizCreateModalOpen} onClose={() => setIsQuizCreateModalOpen(false)} onCreated={() => {}} />
    </Layout>
  );
}
