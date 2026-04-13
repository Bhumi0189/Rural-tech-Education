import mongoose from 'mongoose';

const quizQuestionSchema = new mongoose.Schema(
  {
    question: { type: String, required: true },
    options: {
      type: [String],
      required: true,
      validate: {
        validator: (value) => Array.isArray(value) && value.length >= 2,
        message: 'Each question must have at least 2 options.',
      },
    },
    correctIndex: { type: Number, required: true, min: 0 },
  },
  { _id: false },
);

const quizSchema = new mongoose.Schema(
  {
    teacherId: { type: String, required: true, index: true },
    teacherName: { type: String, required: true },
    class: { type: String, required: true, default: 'Class 10', index: true },
    subject: { type: String, required: true },
    title: { type: String, required: true },
    rewardAmount: { type: Number, required: true, default: 10 },
    questions: { type: [quizQuestionSchema], required: true },
  },
  { timestamps: true },
);

const Quiz = mongoose.models.Quiz || mongoose.model('Quiz', quizSchema);

export default Quiz;
