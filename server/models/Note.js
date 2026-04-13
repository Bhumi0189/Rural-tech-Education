import mongoose from 'mongoose';

const noteSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    fileUrl: {
      type: String,
      required: true,
      trim: true,
    },
    subject: {
      type: String,
      required: true,
      enum: ['SCIENCE', 'MATHEMATICS', 'HISTORY', 'LANGUAGE', 'AGRICULTURE', 'TECH'],
    },
    class: {
      type: String,
      required: true,
      default: 'Class 10',
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    teacherName: {
      type: String,
      required: true,
      trim: true,
    },
    downloads: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
);

const Note = mongoose.models.Note || mongoose.model('Note', noteSchema);

export default Note;
