export type Language = 'en' | 'hi';

export const translations = {
  en: {
    // Navbar
    appName: 'Digital Homestead',
    backToHome: 'Back to Home',
    english: 'ENGLISH',
    hindi: 'हिन्दी',
    
    // Auth
    login: 'Login',
    signup: 'Sign Up',
    fullName: 'Full Name',
    email: 'Email',
    password: 'Password',
    confirmPassword: 'Confirm Password',
    studentPortal: 'Student Portal',
    teacherPortal: 'Teacher Portal',
    selectRole: 'Select Your Role',
    
    // Dashboard
    namaste: 'Namaste',
    readyToContinue: 'Ready to continue your learning journey today?',
    offlineMaterial: 'Offline Material',
    resumeLastLesson: 'Resume Last Lesson',
    yourClassJourney: 'Your Class 10 Journey',
    complete: 'Complete',
    dayStreak: 'Day Streak',
    topThisWeek: 'Top 10% this week',
    milestones: 'Milestones',
    viewAll: 'View All',
    quizMaster: 'Quiz Master',
    perfectScoreInScience: 'Perfect score in Science quiz',
    fastLearner: 'Fast Learner',
    completedUnitsInDays: 'Completed 3 units in 2 days',
    scienceWizard: 'Science Wizard',
    lockedCompleteUnit: 'Locked. Complete Unit 5',
    weeklyFocus: 'Weekly Focus',
    currentCourses: 'Current Courses',
    
    // Profile
    profile: 'Profile',
    accountType: 'Account Type',
    student: 'Student',
    teacher: 'Teacher',
    memberSince: 'Member Since',
    status: 'Status',
    active: 'Active',
    region: 'Region',
    global: 'Global',
    quickStats: 'Quick Stats',
    courses: 'Courses',
    learningPath: 'Learning Path',
    points: 'Points',
    profileSettings: 'Profile Settings',
    moreProfileSettings: 'More profile settings and preferences will be available soon. Customize your learning experience!',
    
    // Popover
    verifiedAccount: 'Verified Account',
    role: 'Role',
    openProfile: 'Open Profile',
    viewAccountDetails: 'View your account details',
    logout: 'Logout',
    endThisSession: 'End this session',
    
    // Home
    empoweringRuralMinds: 'Empowering Rural Minds through Digital Learning',
    accessHighQuality: 'Access high-quality education tailored for your local curriculum. Simple, focused, and always within reach.',
  },
  hi: {
    // Navbar
    appName: 'डिजिटल होमस्टेड',
    backToHome: 'होम पर वापस जाएं',
    english: 'ENGLISH',
    hindi: 'हिन्दी',
    
    // Auth
    login: 'लॉगिन',
    signup: 'साइन अप',
    fullName: 'पूरा नाम',
    email: 'ईमेल',
    password: 'पासवर्ड',
    confirmPassword: 'पासवर्ड की पुष्टि करें',
    studentPortal: 'छात्र पोर्टल',
    teacherPortal: 'शिक्षक पोर्टल',
    selectRole: 'अपनी भूमिका चुनें',
    
    // Dashboard
    namaste: 'नमस्ते',
    readyToContinue: 'आज अपने सीखने की यात्रा जारी रखने के लिए तैयार हैं?',
    offlineMaterial: 'ऑफलाइन सामग्री',
    resumeLastLesson: 'अंतिम पाठ फिर से शुरू करें',
    yourClassJourney: 'आपकी कक्षा 10 की यात्रा',
    complete: 'पूर्ण',
    dayStreak: 'दिन की लकीर',
    topThisWeek: 'इस हफ्ते शीर्ष 10%',
    milestones: 'मील के पत्थर',
    viewAll: 'सभी देखें',
    quizMaster: 'क्विज मास्टर',
    perfectScoreInScience: 'विज्ञान क्विज में पूर्ण स्कोर',
    fastLearner: 'तेज सीखने वाला',
    completedUnitsInDays: '2 दिन में 3 इकाइयां पूरी की गईं',
    scienceWizard: 'विज्ञान जादूगर',
    lockedCompleteUnit: 'लॉक है। इकाई 5 पूरी करें',
    weeklyFocus: 'साप्ताहिक फोकस',
    currentCourses: 'वर्तमान पाठ्यक्रम',
    
    // Profile
    profile: 'प्रोफाइल',
    accountType: 'खात का प्रकार',
    student: 'छात्र',
    teacher: 'शिक्षक',
    memberSince: 'सदस्य के बाद से',
    status: 'स्थिति',
    active: 'सक्रिय',
    region: 'क्षेत्र',
    global: 'वैश्विक',
    quickStats: 'त्वरित सांख्यिकी',
    courses: 'पाठ्यक्रम',
    learningPath: 'सीखने का पथ',
    points: 'अंक',
    profileSettings: 'प्रोफाइल सेटिंग्स',
    moreProfileSettings: 'अधिक प्रोफाइल सेटिंग्स और प्राथमिकताएं जल्द उपलब्ध होंगी। अपने सीखने के अनुभव को अनुकूलित करें!',
    
    // Popover
    verifiedAccount: 'सत्यापित खाता',
    role: 'भूमिका',
    openProfile: 'प्रोफाइल खोलें',
    viewAccountDetails: 'अपने खाता विवरण देखें',
    logout: 'लॉगआउट',
    endThisSession: 'इस सत्र को समाप्त करें',
    
    // Home
    empoweringRuralMinds: 'डिजिटल शिक्षा के माध्यम से ग्रामीण मन को सशक्त बनाना',
    accessHighQuality: 'अपने स्थानीय पाठ्यक्रम के अनुरूप उच्च गुणवत्ता की शिक्षा प्राप्त करें। सरल, केंद्रित, और हमेशा पहुंच में।',
  }
};

export const getTranslation = (language: Language, key: keyof typeof translations.en): string => {
  return translations[language][key] || translations.en[key];
};
