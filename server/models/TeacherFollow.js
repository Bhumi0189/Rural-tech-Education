import mongoose from 'mongoose';

const teacherFollowSchema = new mongoose.Schema(
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
  },
  {
    timestamps: true,
  },
);

teacherFollowSchema.index({ studentId: 1, teacherId: 1 }, { unique: true });

const TeacherFollow = mongoose.models.TeacherFollow || mongoose.model('TeacherFollow', teacherFollowSchema);

export default TeacherFollow;
