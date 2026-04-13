import mongoose from 'mongoose';

const enrollmentSchema = new mongoose.Schema(
  {
    studentId: {
      type: String,
      required: true,
      index: true,
    },
    studentName: {
      type: String,
      required: true,
    },
    studentClass: {
      type: String,
      required: true,
      default: 'Class 10',
    },
    teacherId: {
      type: String,
      required: true,
      index: true,
    },
    teacherName: {
      type: String,
      required: true,
    },
    videoId: {
      type: String,
      required: true,
      index: true,
    },
    videoTitle: {
      type: String,
      required: true,
    },
    subject: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['enrolled', 'started', 'completed'],
      default: 'enrolled',
    },
    progress: {
      type: Number,
      default: 0,
    },
    lastWatchedSeconds: {
      type: Number,
      default: 0,
    },
    watchCount: {
      type: Number,
      default: 0,
    },
    lastWatchedAt: {
      type: Date,
      default: null,
    },
    startedAt: {
      type: Date,
      default: null,
    },
    completedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

enrollmentSchema.index({ studentId: 1, videoId: 1 }, { unique: true });

const Enrollment = mongoose.models.Enrollment || mongoose.model('Enrollment', enrollmentSchema);

export default Enrollment;
