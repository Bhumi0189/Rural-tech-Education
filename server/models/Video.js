import mongoose from 'mongoose';

const videoSchema = new mongoose.Schema(
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
    videoUrl: {
      type: String,
      required: true,
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
    },
    duration: {
      type: String,
      default: '0:00',
    },
    thumbnail: {
      type: String,
      default: null,
    },
    views: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
);

const Video = mongoose.models.Video || mongoose.model('Video', videoSchema);

export default Video;
