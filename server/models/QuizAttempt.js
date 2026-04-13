import mongoose from 'mongoose';

const quizAttemptSchema = new mongoose.Schema(
  {
    quizId: { type: String, required: true, index: true },
    quizTitle: { type: String, required: true },
    studentId: { type: String, required: true, index: true },
    studentName: { type: String, required: true },
    teacherId: { type: String, required: true, index: true },
    teacherName: { type: String, required: true },
    subject: { type: String, required: true },
    score: { type: Number, required: true, default: 0 },
    totalQuestions: { type: Number, required: true, default: 0 },
    earnedAmount: { type: Number, required: true, default: 0 },
    answers: { type: [Number], default: [] },
    submittedAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

quizAttemptSchema.index({ quizId: 1, studentId: 1 }, { unique: true });

const QuizAttempt = mongoose.models.QuizAttempt || mongoose.model('QuizAttempt', quizAttemptSchema);

export default QuizAttempt;
