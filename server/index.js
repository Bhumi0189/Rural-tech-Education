import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { randomUUID } from 'crypto';
import fs from 'fs';
import path from 'path';
import multer from 'multer';
import { fileURLToPath } from 'url';
import User from './models/User.js';
import Video from './models/Video.js';
import Enrollment from './models/Enrollment.js';
import TeacherFollow from './models/TeacherFollow.js';
import Quiz from './models/Quiz.js';
import QuizAttempt from './models/QuizAttempt.js';
import Note from './models/Note.js';

const app = express();
const PORT = Number(process.env.API_PORT || 5000);
const MONGO_URI = process.env.MONGODB_URI;
const JWT_SECRET = process.env.JWT_SECRET || 'dev-insecure-jwt-secret';
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:3000';
let isMongoConnected = false;
let useMemoryStore = false;
const memoryUsers = new Map();
const memoryUsersByEmail = new Map();
const memoryVideos = new Map();
const memoryEnrollments = new Map();
const memoryTeacherFollows = new Map();
const memoryQuizzes = new Map();
const memoryQuizAttempts = new Map();
const memoryNotes = new Map();
let videoIdCounter = 1;
let enrollmentIdCounter = 1;
let teacherFollowIdCounter = 1;
let quizIdCounter = 1;
let quizAttemptIdCounter = 1;
let noteIdCounter = 1;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, 'uploads');
const noteUploadsDir = path.join(uploadsDir, 'notes');

fs.mkdirSync(noteUploadsDir, { recursive: true });

const noteUpload = multer({
  storage: multer.diskStorage({
    destination: (_, __, cb) => cb(null, noteUploadsDir),
    filename: (_, file, cb) => {
      const cleanBaseName = path
        .basename(file.originalname, path.extname(file.originalname))
        .replace(/[^a-zA-Z0-9_-]/g, '-')
        .slice(0, 60) || 'note';
      cb(null, `${Date.now()}-${cleanBaseName}.pdf`);
    },
  }),
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
  fileFilter: (_, file, cb) => {
    const isPdfMime = file.mimetype === 'application/pdf';
    const isPdfName = /\.pdf$/i.test(file.originalname || '');

    if (isPdfMime || isPdfName) {
      cb(null, true);
      return;
    }

    cb(new Error('Only PDF files are allowed.'));
  },
});

const DEMO_TEACHERS = [
  { fullName: 'Meera Sharma', email: 'meera.teacher@demo.local' },
  { fullName: 'Arjun Patel', email: 'arjun.teacher@demo.local' },
  { fullName: 'Lakshmi Rao', email: 'lakshmi.teacher@demo.local' },
  { fullName: 'Kabir Das', email: 'kabir.teacher@demo.local' },
];

const DEMO_VIDEOS = [
  {
    teacherEmail: 'meera.teacher@demo.local',
    title: 'Photosynthesis Made Easy',
    description: 'Understand chlorophyll, sunlight, and how plants prepare food in simple steps.',
    subject: 'SCIENCE',
    class: 'Class 10',
    duration: '14:30',
    videoUrl: 'https://www.youtube.com/watch?v=sQK3Yr4Sc_k',
  },
  {
    teacherEmail: 'arjun.teacher@demo.local',
    title: 'Linear Equations in Real Life',
    description: 'Solve daily-life word problems using linear equations and quick elimination tricks.',
    subject: 'MATHEMATICS',
    class: 'Class 10',
    duration: '17:10',
    videoUrl: 'https://www.youtube.com/watch?v=QVKj3LADCnA',
  },
  {
    teacherEmail: 'lakshmi.teacher@demo.local',
    title: 'The Revolt of 1857 Explained',
    description: 'Causes, events, and outcomes of the 1857 uprising in easy timeline format.',
    subject: 'HISTORY',
    class: 'Class 10',
    duration: '16:25',
    videoUrl: 'https://www.youtube.com/watch?v=VQfD7xj6N8s',
  },
  {
    teacherEmail: 'kabir.teacher@demo.local',
    title: 'Grammar Basics: Tenses',
    description: 'Learn present, past, and future tense with village-life examples.',
    subject: 'LANGUAGE',
    class: 'Class 10',
    duration: '12:40',
    videoUrl: 'https://www.youtube.com/watch?v=P6FORpg0KVo',
  },
  {
    teacherEmail: 'arjun.teacher@demo.local',
    title: 'Soil Health and Crop Rotation',
    description: 'Practical agriculture methods to improve yield while preserving soil nutrients.',
    subject: 'AGRICULTURE',
    class: 'Class 10',
    duration: '20:05',
    videoUrl: 'https://www.youtube.com/watch?v=6A9M9JQ2x2w',
  },
  {
    teacherEmail: 'meera.teacher@demo.local',
    title: 'Digital Safety for Students',
    description: 'Strong passwords, phishing awareness, and safe browsing habits for beginners.',
    subject: 'TECH',
    class: 'Class 10',
    duration: '11:35',
    videoUrl: 'https://www.youtube.com/watch?v=3Q8d7W7R9wM',
  },
  {
    teacherEmail: 'lakshmi.teacher@demo.local',
    title: 'Electricity: Current and Circuits',
    description: 'Series and parallel circuits explained with battery, bulb, and switch examples.',
    subject: 'SCIENCE',
    class: 'Class 9',
    duration: '18:00',
    videoUrl: 'https://www.youtube.com/watch?v=mc979OhitAg',
  },
  {
    teacherEmail: 'kabir.teacher@demo.local',
    title: 'Mensuration Quick Revision',
    description: 'Fast revision of area and volume formulas with solved exam-style questions.',
    subject: 'MATHEMATICS',
    class: 'Class 9',
    duration: '15:20',
    videoUrl: 'https://www.youtube.com/watch?v=Tdrf7R1QwNQ',
  },
];

const DEMO_NOTES = [
  {
    teacherEmail: 'meera.teacher@demo.local',
    title: 'Plant Biology Revision Notes',
    description: 'Class 10 quick revision for photosynthesis, stomata, and plant tissues.',
    subject: 'SCIENCE',
    class: 'Class 10',
    fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
  },
  {
    teacherEmail: 'arjun.teacher@demo.local',
    title: 'Linear Equations Formula Sheet',
    description: 'Key formulas and solved examples for chapter-wise practice.',
    subject: 'MATHEMATICS',
    class: 'Class 10',
    fileUrl: 'https://www.africau.edu/images/default/sample.pdf',
  },
  {
    teacherEmail: 'lakshmi.teacher@demo.local',
    title: '1857 Revolt Timeline Notes',
    description: 'Chronological events and leaders for easy exam preparation.',
    subject: 'HISTORY',
    class: 'Class 10',
    fileUrl: 'https://www.orimi.com/pdf-test.pdf',
  },
];

if (!process.env.JWT_SECRET) {
  console.warn('JWT_SECRET is missing. Using a temporary development secret.');
}

app.use(
  cors({
    origin: CLIENT_ORIGIN,
    credentials: true,
  }),
);
app.use(express.json());
app.use('/uploads', express.static(uploadsDir));

const ensureAuthReady = (res) => {
  if (!MONGO_URI && !useMemoryStore) {
    res.status(503).json({
      message: 'Server is not configured. Set MONGODB_URI in .env and restart API.',
    });
    return false;
  }

  return true;
};

const escapeRegex = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const normalizeClassName = (value) => {
  const raw = String(value || '').trim();

  if (!raw) {
    return 'Class 10';
  }

  const match = raw.match(/class\s*(\d+)/i);
  if (match?.[1]) {
    return `Class ${match[1]}`;
  }

  return raw;
};

const toPublicUser = (user) => ({
  id: String(user._id || user.id),
  fullName: user.fullName,
  email: user.email,
  role: user.role,
  studentClass: user.studentClass || 'Class 10',
  walletBalance: Number(user.walletBalance || 0),
});

const findUserByEmail = async (email) => {
  if (useMemoryStore) {
    return memoryUsersByEmail.get(email) || null;
  }

  return User.findOne({ email });
};

const findUserById = async (userId) => {
  if (useMemoryStore) {
    return memoryUsers.get(userId) || null;
  }

  return User.findById(userId).select('-passwordHash');
};

const createUser = async ({ fullName, email, passwordHash, role, studentClass }) => {
  if (useMemoryStore) {
    const user = {
      id: randomUUID(),
      fullName,
      email,
      passwordHash,
      role,
      studentClass: studentClass || 'Class 10',
      walletBalance: 0,
    };

    memoryUsers.set(user.id, user);
    memoryUsersByEmail.set(email, user);
    return user;
  }

  return User.create({
    fullName,
    email,
    passwordHash,
    role,
    studentClass: studentClass || 'Class 10',
    walletBalance: 0,
  });
};

const isLikelyPdfUrl = (value) => {
  const url = String(value || '').trim();
  return /\.pdf([?#].*)?$/i.test(url);
};

const toPublicNote = (note) => ({
  id: String(note._id || note.id),
  title: note.title,
  description: note.description || '',
  fileUrl: note.fileUrl,
  subject: note.subject,
  class: normalizeClassName(note.class || 'Class 10'),
  teacherId: String(note.uploadedBy || note.teacherId || ''),
  teacherName: note.teacherName,
  downloads: Number(note.downloads || 0),
  createdAt: note.createdAt || null,
  updatedAt: note.updatedAt || null,
});

const seedMemoryDemoData = async () => {
  const demoPasswordHash = await bcrypt.hash('demo12345', 10);
  const teacherByEmail = new Map();

  for (const teacher of DEMO_TEACHERS) {
    const normalizedEmail = String(teacher.email).toLowerCase().trim();
    let existingTeacher = memoryUsersByEmail.get(normalizedEmail);

    if (!existingTeacher) {
      existingTeacher = {
        id: randomUUID(),
        fullName: teacher.fullName,
        email: normalizedEmail,
        passwordHash: demoPasswordHash,
        role: 'teacher',
        studentClass: 'Class 10',
        walletBalance: 0,
      };

      memoryUsers.set(existingTeacher.id, existingTeacher);
      memoryUsersByEmail.set(normalizedEmail, existingTeacher);
    }

    teacherByEmail.set(normalizedEmail, existingTeacher);
  }

  const existingVideoKeys = new Set(
    Array.from(memoryVideos.values()).map((video) => `${video.teacherName}|${video.title}|${normalizeClassName(video.class)}`),
  );

  let insertedCount = 0;
  for (let idx = 0; idx < DEMO_VIDEOS.length; idx += 1) {
    const demoVideo = DEMO_VIDEOS[idx];
    const teacher = teacherByEmail.get(String(demoVideo.teacherEmail).toLowerCase().trim());

    if (!teacher) {
      continue;
    }

    const normalizedClass = normalizeClassName(demoVideo.class);
    const key = `${teacher.fullName}|${demoVideo.title}|${normalizedClass}`;
    if (existingVideoKeys.has(key)) {
      continue;
    }

    const createdAt = new Date(Date.now() - (DEMO_VIDEOS.length - idx) * 60 * 60 * 1000);
    memoryVideos.set(String(videoIdCounter), {
      id: String(videoIdCounter++),
      title: demoVideo.title,
      description: demoVideo.description,
      videoUrl: demoVideo.videoUrl,
      subject: demoVideo.subject,
      class: normalizedClass,
      uploadedBy: String(teacher.id),
      teacherName: teacher.fullName,
      duration: demoVideo.duration,
      thumbnail: null,
      views: 0,
      createdAt,
    });

    insertedCount += 1;
    existingVideoKeys.add(key);
  }

  if (insertedCount > 0) {
    console.log(`Seeded ${insertedCount} demo videos into memory store.`);
  }

  const existingNoteKeys = new Set(
    Array.from(memoryNotes.values()).map((note) => `${note.teacherName}|${note.title}|${normalizeClassName(note.class)}`),
  );

  let insertedNotesCount = 0;
  for (const demoNote of DEMO_NOTES) {
    const teacher = teacherByEmail.get(String(demoNote.teacherEmail).toLowerCase().trim());
    if (!teacher) {
      continue;
    }

    const normalizedClass = normalizeClassName(demoNote.class);
    const key = `${teacher.fullName}|${demoNote.title}|${normalizedClass}`;
    if (existingNoteKeys.has(key)) {
      continue;
    }

    const note = {
      id: String(noteIdCounter++),
      title: demoNote.title,
      description: demoNote.description,
      fileUrl: demoNote.fileUrl,
      subject: demoNote.subject,
      class: normalizedClass,
      uploadedBy: String(teacher.id),
      teacherName: teacher.fullName,
      downloads: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    memoryNotes.set(note.id, note);
    existingNoteKeys.add(key);
    insertedNotesCount += 1;
  }

  if (insertedNotesCount > 0) {
    console.log(`Seeded ${insertedNotesCount} demo notes into memory store.`);
  }
};

const seedMongoDemoData = async () => {
  const demoPasswordHash = await bcrypt.hash('demo12345', 10);
  const teacherByEmail = new Map();

  for (const teacher of DEMO_TEACHERS) {
    const normalizedEmail = String(teacher.email).toLowerCase().trim();
    let teacherDoc = await User.findOne({ email: normalizedEmail });

    if (!teacherDoc) {
      teacherDoc = await User.create({
        fullName: teacher.fullName,
        email: normalizedEmail,
        passwordHash: demoPasswordHash,
        role: 'teacher',
        studentClass: 'Class 10',
      });
    }

    teacherByEmail.set(normalizedEmail, teacherDoc);
  }

  let insertedCount = 0;
  for (const demoVideo of DEMO_VIDEOS) {
    const teacher = teacherByEmail.get(String(demoVideo.teacherEmail).toLowerCase().trim());
    if (!teacher) {
      continue;
    }

    const normalizedClass = normalizeClassName(demoVideo.class);
    const existingVideo = await Video.findOne({
      title: demoVideo.title,
      teacherName: teacher.fullName,
      class: normalizedClass,
    });

    if (existingVideo) {
      continue;
    }

    await Video.create({
      title: demoVideo.title,
      description: demoVideo.description,
      videoUrl: demoVideo.videoUrl,
      subject: demoVideo.subject,
      class: normalizedClass,
      uploadedBy: teacher._id,
      teacherName: teacher.fullName,
      duration: demoVideo.duration,
      thumbnail: null,
      views: 0,
    });

    insertedCount += 1;
  }

  if (insertedCount > 0) {
    console.log(`Seeded ${insertedCount} demo videos into MongoDB.`);
  }

  let insertedNotesCount = 0;
  for (const demoNote of DEMO_NOTES) {
    const teacher = teacherByEmail.get(String(demoNote.teacherEmail).toLowerCase().trim());
    if (!teacher) {
      continue;
    }

    const normalizedClass = normalizeClassName(demoNote.class);
    const existingNote = await Note.findOne({
      title: demoNote.title,
      teacherName: teacher.fullName,
      class: normalizedClass,
    });

    if (existingNote) {
      continue;
    }

    await Note.create({
      title: demoNote.title,
      description: demoNote.description,
      fileUrl: demoNote.fileUrl,
      subject: demoNote.subject,
      class: normalizedClass,
      uploadedBy: teacher._id,
      teacherName: teacher.fullName,
      downloads: 0,
    });

    insertedNotesCount += 1;
  }

  if (insertedNotesCount > 0) {
    console.log(`Seeded ${insertedNotesCount} demo notes into MongoDB.`);
  }
};

const toPublicQuizForStudent = (quiz, attemptByQuizId = new Map()) => ({
  id: String(quiz._id || quiz.id),
  teacherId: String(quiz.teacherId),
  teacherName: quiz.teacherName,
  class: normalizeClassName(quiz.class),
  subject: quiz.subject,
  title: quiz.title,
  rewardAmount: Number(quiz.rewardAmount || 0),
  questions: (quiz.questions || []).map((question) => ({
    question: question.question,
    options: question.options,
  })),
  attempted: attemptByQuizId.has(String(quiz._id || quiz.id)),
});

const findQuizById = async (quizId) => {
  if (useMemoryStore) {
    return memoryQuizzes.get(String(quizId)) || null;
  }

  return Quiz.findById(String(quizId));
};

const findVideoById = async (videoId) => {
  if (useMemoryStore) {
    return memoryVideos.get(String(videoId)) || null;
  }

  return Video.findById(String(videoId));
};

const toPublicEnrollment = (enrollment) => ({
  id: String(enrollment._id || enrollment.id),
  studentId: String(enrollment.studentId),
  studentName: enrollment.studentName,
  studentClass: enrollment.studentClass,
  teacherId: String(enrollment.teacherId),
  teacherName: enrollment.teacherName,
  videoId: String(enrollment.videoId),
  videoTitle: enrollment.videoTitle,
  subject: enrollment.subject,
  status: enrollment.status || 'enrolled',
  progress: Number(enrollment.progress || 0),
  lastWatchedSeconds: Number(enrollment.lastWatchedSeconds || 0),
  watchCount: Number(enrollment.watchCount || 0),
  lastWatchedAt: enrollment.lastWatchedAt || null,
  startedAt: enrollment.startedAt || null,
  completedAt: enrollment.completedAt || null,
  createdAt: enrollment.createdAt || null,
  updatedAt: enrollment.updatedAt || null,
});

const createEnrollment = async ({
  studentId,
  studentName,
  studentClass,
  teacherId,
  teacherName,
  videoId,
  videoTitle,
  subject,
}) => {
  if (useMemoryStore) {
    const enrollment = {
      id: String(enrollmentIdCounter++),
      studentId: String(studentId),
      studentName,
      studentClass: studentClass || 'Class 10',
      teacherId: String(teacherId),
      teacherName,
      videoId: String(videoId),
      videoTitle,
      subject,
      status: 'enrolled',
      progress: 0,
      lastWatchedSeconds: 0,
      watchCount: 0,
      lastWatchedAt: null,
      startedAt: null,
      completedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    memoryEnrollments.set(enrollment.id, enrollment);
    return enrollment;
  }

  return Enrollment.create({
    studentId: String(studentId),
    studentName,
    studentClass: studentClass || 'Class 10',
    teacherId: String(teacherId),
    teacherName,
    videoId: String(videoId),
    videoTitle,
    subject,
  });
};

app.get('/api/health', (_, res) => {
  res.json({ ok: true });
});

app.post('/api/auth/signup', async (req, res) => {
  try {
    if (!ensureAuthReady(res)) {
      return;
    }

    const { fullName, email, password, role, studentClass } = req.body;

    if (!fullName || !email || !password || !role) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    if (!['student', 'teacher'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters.' });
    }

    const normalizedEmail = String(email).toLowerCase().trim();
    const existingUser = await findUserByEmail(normalizedEmail);

    if (existingUser) {
      return res.status(409).json({ message: 'Email is already registered.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await createUser({
      fullName: String(fullName).trim(),
      email: normalizedEmail,
      passwordHash,
      role,
      studentClass: role === 'student' ? String(studentClass || 'Class 10') : 'Class 10',
    });

    const token = jwt.sign({ userId: String(user._id || user.id), role: user.role }, JWT_SECRET, { expiresIn: '7d' });

    return res.status(201).json({
      token,
      user: toPublicUser(user),
    });
  } catch (error) {
    console.error('Signup error:', error);
    return res.status(500).json({ message: 'Failed to create account.' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    if (!ensureAuthReady(res)) {
      return;
    }

    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const normalizedEmail = String(email).toLowerCase().trim();
    const user = await findUserByEmail(normalizedEmail);

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const passwordDigest = user.passwordHash || user.password;
    if (!passwordDigest) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const isMatch = await bcrypt.compare(password, passwordDigest);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const token = jwt.sign({ userId: String(user._id || user.id), role: user.role }, JWT_SECRET, { expiresIn: '7d' });

    return res.json({
      token,
      user: toPublicUser(user),
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Failed to login.' });
  }
});

app.get('/api/auth/me', async (req, res) => {
  try {
    if (!ensureAuthReady(res)) {
      return;
    }

    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : '';

    if (!token) {
      return res.status(401).json({ message: 'Unauthorized.' });
    }

    const payload = jwt.verify(token, JWT_SECRET);
    const user = await findUserById(payload.userId);

    if (!user) {
      return res.status(401).json({ message: 'Unauthorized.' });
    }

    return res.json({ user: toPublicUser(user) });
  } catch (error) {
    return res.status(401).json({ message: 'Unauthorized.' });
  }
});

// JWT Verification Middleware
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : '';

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized.' });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.userId = payload.userId;
    req.role = payload.role;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Unauthorized.' });
  }
};

// Video Endpoints
app.post('/api/videos', verifyToken, async (req, res) => {
  try {
    if (!ensureAuthReady(res)) {
      return;
    }

    const { title, description, videoUrl, subject, class: videoClass, duration, thumbnail } = req.body;
    const normalizedClass = normalizeClassName(videoClass || 'Class 10');

    if (!title || !videoUrl || !subject) {
      return res.status(400).json({ message: 'Title, video URL, and subject are required.' });
    }

    const user = await findUserById(req.userId);

    if (!user || user.role !== 'teacher') {
      return res.status(403).json({ message: 'Only teachers can upload videos.' });
    }

    if (useMemoryStore) {
      const video = {
        id: String(videoIdCounter++),
        title,
        description,
        videoUrl,
        subject,
        class: normalizedClass,
        uploadedBy: req.userId,
        teacherName: user.fullName,
        duration: duration || '0:00',
        thumbnail: thumbnail || null,
        views: 0,
        createdAt: new Date(),
      };

      memoryVideos.set(video.id, video);
      return res.status(201).json(video);
    }

    const video = await Video.create({
      title,
      description,
      videoUrl,
      subject,
      class: normalizedClass,
      uploadedBy: req.userId,
      teacherName: user.fullName,
      duration: duration || '0:00',
      thumbnail: thumbnail || null,
    });

    return res.status(201).json(video);
  } catch (error) {
    console.error('Video upload error:', error);
    return res.status(500).json({ message: 'Failed to upload video.' });
  }
});

app.get('/api/videos/public', async (req, res) => {
  try {
    if (!ensureAuthReady(res)) {
      return;
    }

    const { class: videoClass, q } = req.query;
    const targetClass = normalizeClassName(videoClass || 'Class 10');
    const topicQuery = String(q || '').trim().toLowerCase();

    if (useMemoryStore) {
      let videos = Array.from(memoryVideos.values()).filter(
        (video) => normalizeClassName(video.class || 'Class 10').toLowerCase() === targetClass.toLowerCase(),
      );

      if (topicQuery) {
        videos = videos.filter((video) => {
          const haystack = `${video.title || ''} ${video.subject || ''} ${video.description || ''} ${video.teacherName || ''}`.toLowerCase();
          return haystack.includes(topicQuery);
        });
      }

      videos.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      return res.json(videos);
    }

    const mongoQuery = { class: { $regex: `^${escapeRegex(targetClass)}$`, $options: 'i' } };

    if (topicQuery) {
      mongoQuery.$or = [
        { title: { $regex: topicQuery, $options: 'i' } },
        { subject: { $regex: topicQuery, $options: 'i' } },
        { description: { $regex: topicQuery, $options: 'i' } },
        { teacherName: { $regex: topicQuery, $options: 'i' } },
      ];
    }

    const videos = await Video.find(mongoQuery).sort({ createdAt: -1 });
    return res.json(videos);
  } catch (error) {
    console.error('Public video fetch error:', error);
    return res.status(500).json({ message: 'Failed to fetch public videos.' });
  }
});

app.get('/api/videos', verifyToken, async (req, res) => {
  try {
    if (!ensureAuthReady(res)) {
      return;
    }

    const { class: videoClass } = req.query;
    const targetClass = normalizeClassName(videoClass || 'Class 10');

    if (useMemoryStore) {
      const videos = Array.from(memoryVideos.values())
        .filter((v) => normalizeClassName(v.class || 'Class 10').toLowerCase() === targetClass.toLowerCase())
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      return res.json(videos);
    }

    const videos = await Video.find({ class: { $regex: `^${escapeRegex(targetClass)}$`, $options: 'i' } })
      .sort({ createdAt: -1 })
      .populate('uploadedBy', 'fullName');

    return res.json(videos);
  } catch (error) {
    console.error('Video fetch error:', error);
    return res.status(500).json({ message: 'Failed to fetch videos.' });
  }
});

app.get('/api/videos/teacher/:teacherId', verifyToken, async (req, res) => {
  try {
    if (!ensureAuthReady(res)) {
      return;
    }

    const user = await findUserById(req.userId);

    if (!user || user.role !== 'teacher') {
      return res.status(403).json({ message: 'Only teachers can view their uploads.' });
    }

    if (useMemoryStore) {
      const videos = Array.from(memoryVideos.values())
        .filter(v => v.uploadedBy === req.params.teacherId)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      return res.json(videos);
    }

    const videos = await Video.find({ uploadedBy: req.params.teacherId })
      .sort({ createdAt: -1 });

    return res.json(videos);
  } catch (error) {
    console.error('Teacher videos fetch error:', error);
    return res.status(500).json({ message: 'Failed to fetch videos.' });
  }
});

app.get('/api/videos/:videoId', verifyToken, async (req, res) => {
  try {
    if (!ensureAuthReady(res)) {
      return;
    }

    const user = await findUserById(req.userId);
    if (!user) {
      return res.status(401).json({ message: 'Unauthorized.' });
    }

    const video = await findVideoById(req.params.videoId);
    if (!video) {
      return res.status(404).json({ message: 'Video not found.' });
    }

    return res.json(video);
  } catch (error) {
    console.error('Video detail fetch error:', error);
    return res.status(500).json({ message: 'Failed to fetch video.' });
  }
});

app.post('/api/notes', verifyToken, noteUpload.single('file'), async (req, res) => {
  try {
    if (!ensureAuthReady(res)) {
      return;
    }

    const user = await findUserById(req.userId);
    if (!user || user.role !== 'teacher') {
      return res.status(403).json({ message: 'Only teachers can upload notes.' });
    }

    const { title, description, fileUrl: bodyFileUrl, subject, class: noteClass } = req.body;
    const normalizedClass = normalizeClassName(noteClass || 'Class 10');
    const uploadedFileUrl = req.file ? `/uploads/notes/${req.file.filename}` : '';
    const resolvedFileUrl = String(uploadedFileUrl || bodyFileUrl || '').trim();

    if (!title || !resolvedFileUrl || !subject) {
      return res.status(400).json({ message: 'Title, subject and a PDF file or PDF URL are required.' });
    }

    if (!req.file && !isLikelyPdfUrl(resolvedFileUrl)) {
      return res.status(400).json({ message: 'Only PDF links are allowed. URL must end with .pdf' });
    }

    if (useMemoryStore) {
      const note = {
        id: String(noteIdCounter++),
        title: String(title).trim(),
        description: String(description || '').trim(),
        fileUrl: resolvedFileUrl,
        subject: String(subject).trim().toUpperCase(),
        class: normalizedClass,
        uploadedBy: String(req.userId),
        teacherName: user.fullName,
        downloads: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      memoryNotes.set(note.id, note);
      return res.status(201).json(toPublicNote(note));
    }

    const note = await Note.create({
      title: String(title).trim(),
      description: String(description || '').trim(),
      fileUrl: resolvedFileUrl,
      subject: String(subject).trim().toUpperCase(),
      class: normalizedClass,
      uploadedBy: String(req.userId),
      teacherName: user.fullName,
      downloads: 0,
    });

    return res.status(201).json(toPublicNote(note));
  } catch (error) {
    if (error instanceof multer.MulterError) {
      if (error.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ message: 'PDF size must be 10MB or less.' });
      }
      return res.status(400).json({ message: error.message || 'Invalid PDF upload.' });
    }

    if (error instanceof Error && error.message === 'Only PDF files are allowed.') {
      return res.status(400).json({ message: error.message });
    }

    console.error('Note upload error:', error);
    return res.status(500).json({ message: 'Failed to upload note.' });
  }
});

app.get('/api/notes/teacher/me', verifyToken, async (req, res) => {
  try {
    if (!ensureAuthReady(res)) {
      return;
    }

    const user = await findUserById(req.userId);
    if (!user || user.role !== 'teacher') {
      return res.status(403).json({ message: 'Only teachers can view their notes.' });
    }

    if (useMemoryStore) {
      const notes = Array.from(memoryNotes.values())
        .filter((note) => String(note.uploadedBy) === String(req.userId))
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      return res.json(notes.map(toPublicNote));
    }

    const notes = await Note.find({ uploadedBy: String(req.userId) }).sort({ createdAt: -1 });
    return res.json(notes.map(toPublicNote));
  } catch (error) {
    console.error('Teacher notes fetch error:', error);
    return res.status(500).json({ message: 'Failed to fetch notes.' });
  }
});

app.get('/api/notes/student/me', verifyToken, async (req, res) => {
  try {
    if (!ensureAuthReady(res)) {
      return;
    }

    const user = await findUserById(req.userId);
    if (!user || user.role !== 'student') {
      return res.status(403).json({ message: 'Only students can view notes.' });
    }

    const targetClass = normalizeClassName(user.studentClass || 'Class 10');

    if (useMemoryStore) {
      const notes = Array.from(memoryNotes.values())
        .filter((note) => normalizeClassName(note.class).toLowerCase() === targetClass.toLowerCase())
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      return res.json(notes.map(toPublicNote));
    }

    const notes = await Note.find({ class: { $regex: `^${escapeRegex(targetClass)}$`, $options: 'i' } }).sort({ createdAt: -1 });
    return res.json(notes.map(toPublicNote));
  } catch (error) {
    console.error('Student notes fetch error:', error);
    return res.status(500).json({ message: 'Failed to fetch notes.' });
  }
});

app.post('/api/enrollments', verifyToken, async (req, res) => {
  try {
    if (!ensureAuthReady(res)) {
      return;
    }

    const { videoId } = req.body;

    if (!videoId) {
      return res.status(400).json({ message: 'Video ID is required.' });
    }

    const user = await findUserById(req.userId);

    if (!user || user.role !== 'student') {
      return res.status(403).json({ message: 'Only students can enroll.' });
    }

    const video = await findVideoById(videoId);

    if (!video) {
      return res.status(404).json({ message: 'Video not found.' });
    }

    if (useMemoryStore) {
      const existingEnrollment = Array.from(memoryEnrollments.values()).find(
        (enrollment) => enrollment.studentId === String(req.userId) && enrollment.videoId === String(videoId),
      );

      if (existingEnrollment) {
        return res.json(toPublicEnrollment(existingEnrollment));
      }
    } else {
      const existingEnrollment = await Enrollment.findOne({ studentId: String(req.userId), videoId: String(videoId) });

      if (existingEnrollment) {
        return res.json(toPublicEnrollment(existingEnrollment));
      }
    }

    const enrollment = await createEnrollment({
      studentId: req.userId,
      studentName: user.fullName,
      studentClass: user.studentClass || 'Class 10',
      teacherId: String(video.uploadedBy || video.teacherId),
      teacherName: video.teacherName,
      videoId: String(video._id || video.id),
      videoTitle: video.title,
      subject: video.subject,
    });

    return res.status(201).json(toPublicEnrollment(enrollment));
  } catch (error) {
    console.error('Enrollment error:', error);
    return res.status(500).json({ message: 'Failed to enroll in course.' });
  }
});

app.get('/api/enrollments/student/me', verifyToken, async (req, res) => {
  try {
    if (!ensureAuthReady(res)) {
      return;
    }

    const user = await findUserById(req.userId);

    if (!user || user.role !== 'student') {
      return res.status(403).json({ message: 'Only students can view their enrollments.' });
    }

    if (useMemoryStore) {
      const enrollments = Array.from(memoryEnrollments.values()).filter((enrollment) => enrollment.studentId === String(req.userId));
      return res.json(enrollments.map(toPublicEnrollment));
    }

    const enrollments = await Enrollment.find({ studentId: String(req.userId) }).sort({ createdAt: -1 });
    return res.json(enrollments.map(toPublicEnrollment));
  } catch (error) {
    console.error('Student enrollments fetch error:', error);
    return res.status(500).json({ message: 'Failed to fetch enrollments.' });
  }
});

app.get('/api/enrollments/teacher/me', verifyToken, async (req, res) => {
  try {
    if (!ensureAuthReady(res)) {
      return;
    }

    const user = await findUserById(req.userId);

    if (!user || user.role !== 'teacher') {
      return res.status(403).json({ message: 'Only teachers can view their enrolled students.' });
    }

    if (useMemoryStore) {
      const enrollments = Array.from(memoryEnrollments.values()).filter((enrollment) => enrollment.teacherId === String(req.userId));
      return res.json(enrollments.map(toPublicEnrollment));
    }

    const enrollments = await Enrollment.find({ teacherId: String(req.userId) }).sort({ createdAt: -1 });
    return res.json(enrollments.map(toPublicEnrollment));
  } catch (error) {
    console.error('Teacher enrollments fetch error:', error);
    return res.status(500).json({ message: 'Failed to fetch teacher enrollments.' });
  }
});

app.post('/api/enrollments/:videoId/progress', verifyToken, async (req, res) => {
  try {
    if (!ensureAuthReady(res)) {
      return;
    }

    const user = await findUserById(req.userId);
    if (!user || user.role !== 'student') {
      return res.status(403).json({ message: 'Only students can update watch progress.' });
    }

    const { videoId } = req.params;
    const watchedSecondsRaw = Number(req.body?.watchedSeconds || 0);
    const durationSecondsRaw = Number(req.body?.durationSeconds || 0);
    const watchedSeconds = Math.max(0, Math.floor(watchedSecondsRaw));
    const durationSeconds = Math.max(0, Math.floor(durationSecondsRaw));

    if (useMemoryStore) {
      const enrollment = Array.from(memoryEnrollments.values()).find(
        (item) => item.studentId === String(req.userId) && item.videoId === String(videoId),
      );

      if (!enrollment) {
        return res.status(404).json({ message: 'Enrollment not found. Enroll first to track progress.' });
      }

      const now = new Date();
      enrollment.lastWatchedSeconds = watchedSeconds;
      enrollment.lastWatchedAt = now;
      enrollment.updatedAt = now;
      enrollment.watchCount = Number(enrollment.watchCount || 0) + 1;

      if (!enrollment.startedAt) {
        enrollment.startedAt = now;
      }
      if (enrollment.status === 'enrolled') {
        enrollment.status = 'started';
      }

      if (durationSeconds > 0) {
        const computedProgress = Math.min(100, Math.round((watchedSeconds / durationSeconds) * 100));
        enrollment.progress = computedProgress;
        if (computedProgress >= 100) {
          enrollment.status = 'completed';
          enrollment.completedAt = now;
        }
      }

      return res.json(toPublicEnrollment(enrollment));
    }

    const enrollment = await Enrollment.findOne({ studentId: String(req.userId), videoId: String(videoId) });
    if (!enrollment) {
      return res.status(404).json({ message: 'Enrollment not found. Enroll first to track progress.' });
    }

    const now = new Date();
    enrollment.lastWatchedSeconds = watchedSeconds;
    enrollment.lastWatchedAt = now;
    enrollment.watchCount = Number(enrollment.watchCount || 0) + 1;

    if (!enrollment.startedAt) {
      enrollment.startedAt = now;
    }
    if (enrollment.status === 'enrolled') {
      enrollment.status = 'started';
    }

    if (durationSeconds > 0) {
      const computedProgress = Math.min(100, Math.round((watchedSeconds / durationSeconds) * 100));
      enrollment.progress = computedProgress;
      if (computedProgress >= 100) {
        enrollment.status = 'completed';
        enrollment.completedAt = now;
      }
    }

    await enrollment.save();
    return res.json(toPublicEnrollment(enrollment));
  } catch (error) {
    console.error('Watch progress update error:', error);
    return res.status(500).json({ message: 'Failed to save watch progress.' });
  }
});

app.get('/api/watch-history/student/me', verifyToken, async (req, res) => {
  try {
    if (!ensureAuthReady(res)) {
      return;
    }

    const user = await findUserById(req.userId);
    if (!user || user.role !== 'student') {
      return res.status(403).json({ message: 'Only students can view watch history.' });
    }

    if (useMemoryStore) {
      const history = Array.from(memoryEnrollments.values())
        .filter((item) => item.studentId === String(req.userId) && item.lastWatchedAt)
        .map((item) => {
          const video = memoryVideos.get(String(item.videoId));
          return {
            ...toPublicEnrollment(item),
            videoUrl: video?.videoUrl || null,
          };
        })
        .sort((a, b) => new Date(b.lastWatchedAt) - new Date(a.lastWatchedAt));

      return res.json(history);
    }

    const enrollments = await Enrollment.find({
      studentId: String(req.userId),
      lastWatchedAt: { $ne: null },
    }).sort({ lastWatchedAt: -1 });

    const videoIds = enrollments.map((item) => String(item.videoId));
    const videos = await Video.find({ _id: { $in: videoIds } }).select('_id videoUrl');
    const videoUrlMap = new Map(videos.map((video) => [String(video._id), video.videoUrl]));

    const history = enrollments.map((item) => ({
      ...toPublicEnrollment(item),
      videoUrl: videoUrlMap.get(String(item.videoId)) || null,
    }));

    return res.json(history);
  } catch (error) {
    console.error('Watch history fetch error:', error);
    return res.status(500).json({ message: 'Failed to fetch watch history.' });
  }
});

app.post('/api/quizzes', verifyToken, async (req, res) => {
  try {
    if (!ensureAuthReady(res)) {
      return;
    }

    const user = await findUserById(req.userId);
    if (!user || user.role !== 'teacher') {
      return res.status(403).json({ message: 'Only teachers can create quizzes.' });
    }

    const { title, subject, class: quizClass, rewardAmount, questions } = req.body;
    const normalizedClass = normalizeClassName(quizClass || 'Class 10');

    if (!title || !subject || !Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ message: 'Title, subject and at least one question are required.' });
    }

    const normalizedQuestions = questions.map((question) => ({
      question: String(question.question || '').trim(),
      options: Array.isArray(question.options) ? question.options.map((option) => String(option || '').trim()).filter(Boolean) : [],
      correctIndex: Number(question.correctIndex),
    }));

    const invalidQuestion = normalizedQuestions.find((question) => {
      if (!question.question) {
        return true;
      }
      if (!Array.isArray(question.options) || question.options.length < 2) {
        return true;
      }
      return !Number.isInteger(question.correctIndex) || question.correctIndex < 0 || question.correctIndex >= question.options.length;
    });

    if (invalidQuestion) {
      return res.status(400).json({ message: 'Each question needs text, valid options, and a correct answer index.' });
    }

    const safeReward = Math.max(0, Number(rewardAmount || 10));

    if (useMemoryStore) {
      const quiz = {
        id: String(quizIdCounter++),
        teacherId: String(req.userId),
        teacherName: user.fullName,
        class: normalizedClass,
        subject: String(subject).trim(),
        title: String(title).trim(),
        rewardAmount: safeReward,
        questions: normalizedQuestions,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      memoryQuizzes.set(quiz.id, quiz);
      return res.status(201).json(quiz);
    }

    const quiz = await Quiz.create({
      teacherId: String(req.userId),
      teacherName: user.fullName,
      class: normalizedClass,
      subject: String(subject).trim(),
      title: String(title).trim(),
      rewardAmount: safeReward,
      questions: normalizedQuestions,
    });

    return res.status(201).json(quiz);
  } catch (error) {
    console.error('Quiz creation error:', error);
    return res.status(500).json({ message: 'Failed to create quiz.' });
  }
});

app.get('/api/quizzes/teacher/me', verifyToken, async (req, res) => {
  try {
    if (!ensureAuthReady(res)) {
      return;
    }

    const user = await findUserById(req.userId);
    if (!user || user.role !== 'teacher') {
      return res.status(403).json({ message: 'Only teachers can view created quizzes.' });
    }

    if (useMemoryStore) {
      const quizzes = Array.from(memoryQuizzes.values())
        .filter((quiz) => quiz.teacherId === String(req.userId))
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      return res.json(quizzes);
    }

    const quizzes = await Quiz.find({ teacherId: String(req.userId) }).sort({ createdAt: -1 });
    return res.json(quizzes);
  } catch (error) {
    console.error('Teacher quiz fetch error:', error);
    return res.status(500).json({ message: 'Failed to fetch teacher quizzes.' });
  }
});

app.get('/api/quizzes/student/me', verifyToken, async (req, res) => {
  try {
    if (!ensureAuthReady(res)) {
      return;
    }

    const user = await findUserById(req.userId);
    if (!user || user.role !== 'student') {
      return res.status(403).json({ message: 'Only students can view quizzes.' });
    }

    const targetClass = normalizeClassName(user.studentClass || 'Class 10');

    if (useMemoryStore) {
      const attempts = Array.from(memoryQuizAttempts.values()).filter((attempt) => attempt.studentId === String(req.userId));
      const attemptByQuizId = new Map(attempts.map((attempt) => [String(attempt.quizId), attempt]));

      const quizzes = Array.from(memoryQuizzes.values())
        .filter((quiz) => normalizeClassName(quiz.class).toLowerCase() === targetClass.toLowerCase())
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .map((quiz) => toPublicQuizForStudent(quiz, attemptByQuizId));

      return res.json(quizzes);
    }

    const [quizzes, attempts] = await Promise.all([
      Quiz.find({ class: { $regex: `^${escapeRegex(targetClass)}$`, $options: 'i' } }).sort({ createdAt: -1 }),
      QuizAttempt.find({ studentId: String(req.userId) }).select('quizId'),
    ]);

    const attemptByQuizId = new Map(attempts.map((attempt) => [String(attempt.quizId), true]));
    return res.json(quizzes.map((quiz) => toPublicQuizForStudent(quiz, attemptByQuizId)));
  } catch (error) {
    console.error('Student quiz fetch error:', error);
    return res.status(500).json({ message: 'Failed to fetch quizzes.' });
  }
});

app.post('/api/quizzes/:quizId/submit', verifyToken, async (req, res) => {
  try {
    if (!ensureAuthReady(res)) {
      return;
    }

    const user = await findUserById(req.userId);
    if (!user || user.role !== 'student') {
      return res.status(403).json({ message: 'Only students can submit quizzes.' });
    }

    const quiz = await findQuizById(req.params.quizId);
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found.' });
    }

    const answers = Array.isArray(req.body?.answers) ? req.body.answers.map((answer) => Number(answer)) : [];
    if (!answers.length) {
      return res.status(400).json({ message: 'Answers are required.' });
    }

    const quizId = String(quiz._id || quiz.id);

    if (useMemoryStore) {
      const existing = Array.from(memoryQuizAttempts.values()).find(
        (attempt) => attempt.quizId === quizId && attempt.studentId === String(req.userId),
      );

      if (existing) {
        return res.json(existing);
      }

      const totalQuestions = (quiz.questions || []).length;
      let score = 0;
      for (let idx = 0; idx < totalQuestions; idx += 1) {
        if (Number(answers[idx]) === Number(quiz.questions[idx]?.correctIndex)) {
          score += 1;
        }
      }

      const earnedAmount = totalQuestions > 0
        ? Number((((score / totalQuestions) * Number(quiz.rewardAmount || 0))).toFixed(2))
        : 0;

      const attempt = {
        id: String(quizAttemptIdCounter++),
        quizId,
        quizTitle: quiz.title,
        studentId: String(req.userId),
        studentName: user.fullName,
        teacherId: String(quiz.teacherId),
        teacherName: quiz.teacherName,
        subject: quiz.subject,
        score,
        totalQuestions,
        earnedAmount,
        answers,
        submittedAt: new Date(),
        createdAt: new Date(),
      };

      memoryQuizAttempts.set(attempt.id, attempt);
      user.walletBalance = Number(user.walletBalance || 0) + earnedAmount;
      memoryUsers.set(String(user.id || user._id), user);

      return res.status(201).json({
        ...attempt,
        walletBalance: Number(user.walletBalance || 0),
      });
    }

    const existing = await QuizAttempt.findOne({ quizId, studentId: String(req.userId) });
    if (existing) {
      return res.json(existing);
    }

    const totalQuestions = (quiz.questions || []).length;
    let score = 0;
    for (let idx = 0; idx < totalQuestions; idx += 1) {
      if (Number(answers[idx]) === Number(quiz.questions[idx]?.correctIndex)) {
        score += 1;
      }
    }

    const earnedAmount = totalQuestions > 0
      ? Number((((score / totalQuestions) * Number(quiz.rewardAmount || 0))).toFixed(2))
      : 0;

    const attempt = await QuizAttempt.create({
      quizId,
      quizTitle: quiz.title,
      studentId: String(req.userId),
      studentName: user.fullName,
      teacherId: String(quiz.teacherId),
      teacherName: quiz.teacherName,
      subject: quiz.subject,
      score,
      totalQuestions,
      earnedAmount,
      answers,
      submittedAt: new Date(),
    });

    await User.updateOne(
      { _id: String(req.userId) },
      { $inc: { walletBalance: earnedAmount } },
    );

    const refreshedUser = await findUserById(req.userId);
    return res.status(201).json({
      ...attempt.toObject(),
      walletBalance: Number(refreshedUser?.walletBalance || 0),
    });
  } catch (error) {
    console.error('Quiz submit error:', error);
    return res.status(500).json({ message: 'Failed to submit quiz.' });
  }
});

app.get('/api/quizzes/attempts/student/me', verifyToken, async (req, res) => {
  try {
    if (!ensureAuthReady(res)) {
      return;
    }

    const user = await findUserById(req.userId);
    if (!user || user.role !== 'student') {
      return res.status(403).json({ message: 'Only students can view quiz attempts.' });
    }

    if (useMemoryStore) {
      const attempts = Array.from(memoryQuizAttempts.values())
        .filter((attempt) => attempt.studentId === String(req.userId))
        .sort((a, b) => new Date(b.submittedAt || b.createdAt) - new Date(a.submittedAt || a.createdAt));
      return res.json(attempts);
    }

    const attempts = await QuizAttempt.find({ studentId: String(req.userId) }).sort({ submittedAt: -1 });
    return res.json(attempts);
  } catch (error) {
    console.error('Quiz attempt history fetch error:', error);
    return res.status(500).json({ message: 'Failed to fetch quiz history.' });
  }
});

app.get('/api/quizzes/attempts/teacher/me', verifyToken, async (req, res) => {
  try {
    if (!ensureAuthReady(res)) {
      return;
    }

    const user = await findUserById(req.userId);
    if (!user || user.role !== 'teacher') {
      return res.status(403).json({ message: 'Only teachers can view student quiz scores.' });
    }

    if (useMemoryStore) {
      const attempts = Array.from(memoryQuizAttempts.values())
        .filter((attempt) => attempt.teacherId === String(req.userId))
        .sort((a, b) => new Date(b.submittedAt || b.createdAt) - new Date(a.submittedAt || a.createdAt));
      return res.json(attempts);
    }

    const attempts = await QuizAttempt.find({ teacherId: String(req.userId) }).sort({ submittedAt: -1 });
    return res.json(attempts);
  } catch (error) {
    console.error('Teacher quiz scores fetch error:', error);
    return res.status(500).json({ message: 'Failed to fetch student quiz scores.' });
  }
});

app.post('/api/teacher-follows', verifyToken, async (req, res) => {
  try {
    if (!ensureAuthReady(res)) {
      return;
    }

    const { teacherId, teacherName } = req.body;

    if (!teacherId || !teacherName) {
      return res.status(400).json({ message: 'Teacher ID and name are required.' });
    }

    const user = await findUserById(req.userId);

    if (!user || user.role !== 'student') {
      return res.status(403).json({ message: 'Only students can follow teachers.' });
    }

    if (useMemoryStore) {
      const existing = Array.from(memoryTeacherFollows.values()).find(
        (follow) => follow.studentId === String(req.userId) && follow.teacherId === String(teacherId),
      );

      if (existing) {
        return res.json(existing);
      }

      const follow = {
        id: String(teacherFollowIdCounter++),
        studentId: String(req.userId),
        studentName: user.fullName,
        studentClass: user.studentClass || 'Class 10',
        teacherId: String(teacherId),
        teacherName: String(teacherName),
        createdAt: new Date(),
      };

      memoryTeacherFollows.set(follow.id, follow);
      return res.status(201).json(follow);
    }

    const existing = await TeacherFollow.findOne({ studentId: String(req.userId), teacherId: String(teacherId) });
    if (existing) {
      return res.json(existing);
    }

    const follow = await TeacherFollow.create({
      studentId: String(req.userId),
      studentName: user.fullName,
      studentClass: user.studentClass || 'Class 10',
      teacherId: String(teacherId),
      teacherName: String(teacherName),
    });

    return res.status(201).json(follow);
  } catch (error) {
    console.error('Teacher follow error:', error);
    return res.status(500).json({ message: 'Failed to follow teacher.' });
  }
});

app.get('/api/teacher-follows/student/me', verifyToken, async (req, res) => {
  try {
    if (!ensureAuthReady(res)) {
      return;
    }

    const user = await findUserById(req.userId);
    if (!user || user.role !== 'student') {
      return res.status(403).json({ message: 'Only students can view followed teachers.' });
    }

    if (useMemoryStore) {
      const follows = Array.from(memoryTeacherFollows.values())
        .filter((follow) => follow.studentId === String(req.userId))
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      return res.json(follows);
    }

    const follows = await TeacherFollow.find({ studentId: String(req.userId) }).sort({ createdAt: -1 });
    return res.json(follows);
  } catch (error) {
    console.error('Teacher follows fetch error:', error);
    return res.status(500).json({ message: 'Failed to fetch followed teachers.' });
  }
});

const start = async () => {
  if (!MONGO_URI) {
    useMemoryStore = true;
    console.warn('MONGODB_URI is missing. Using in-memory auth storage for local development.');
    await seedMemoryDemoData();
    app.listen(PORT, () => {
      console.log(`Auth API running on http://localhost:${PORT}`);
    });
    return;
  }

  try {
    await mongoose.connect(MONGO_URI);
    isMongoConnected = true;
    console.log('Connected to MongoDB');
    await seedMongoDemoData();
    app.listen(PORT, () => {
      console.log(`Auth API running on http://localhost:${PORT}`);
    });
  } catch (error) {
    useMemoryStore = true;
    console.error('✗ MongoDB connection failed:');
    console.error(`  Error: ${error.message}`);
    if (error.message.includes('authentication failed')) {
      console.error('  → Check MONGODB_URI credentials in .env');
    } else if (error.message.includes('ENOTFOUND') || error.message.includes('getaddrinfo')) {
      console.error('  → Check MONGODB_URI hostname and internet connection');
    } else if (error.message.includes('ECONNREFUSED')) {
      console.error('  → MongoDB server is not responding');
    }
    console.warn('  Falling back to in-memory auth storage for local development.');
    await seedMemoryDemoData();
    app.listen(PORT, () => {
      console.log(`Auth API running on http://localhost:${PORT}`);
    });
  }
};

start();
