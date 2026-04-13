import React, { useState } from 'react';
import { X, Upload, Loader2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { Language, getTranslation } from '../lib/translations';

interface VideoUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  token?: string;
  language?: Language;
  onUploadSuccess?: () => void;
}

const SUBJECTS = ['SCIENCE', 'MATHEMATICS', 'HISTORY', 'LANGUAGE', 'AGRICULTURE', 'TECH'];
const CLASSES = ['Class 10'];

export default function VideoUploadModal({
  isOpen,
  onClose,
  token,
  language = 'en',
  onUploadSuccess,
}: VideoUploadModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    videoUrl: '',
    subject: 'SCIENCE',
    class: 'Class 10',
    duration: '0:00',
    thumbnail: '',
  });

  const readErrorMessage = async (response: Response) => {
    const contentType = response.headers.get('content-type') || '';

    if (contentType.includes('application/json')) {
      try {
        const data = await response.json();
        return data.message || 'Failed to upload video';
      } catch {
        return 'Failed to upload video';
      }
    }

    const text = await response.text();
    return text.trim() || 'Failed to upload video';
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!formData.title || !formData.videoUrl || !formData.subject) {
      setError('Please fill in all required fields');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/videos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error(await readErrorMessage(response));
      }

      setSuccess(true);
      setFormData({
        title: '',
        description: '',
        videoUrl: '',
        subject: 'SCIENCE',
        class: 'Class 10',
        duration: '0:00',
        thumbnail: '',
      });

      setTimeout(() => {
        setSuccess(false);
        onUploadSuccess?.();
        onClose();
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload video');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative mx-4 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-xl dark:bg-stone-950">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-headline text-2xl font-bold text-on-surface">Upload Video</h2>
          <button
            onClick={onClose}
            className="rounded-full p-2 transition-colors hover:bg-surface-container"
            disabled={isLoading}
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-semibold text-on-surface mb-1">
              Video Title * {formData.title.length > 0 && <span className="text-xs text-on-surface-variant">({formData.title.length}/100)</span>}
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              maxLength={100}
              placeholder="e.g., The Wonders of Plant Life"
              className="w-full rounded-lg border border-outline bg-surface px-4 py-2 text-on-surface placeholder:text-on-surface-variant focus:border-primary focus:outline-none"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-on-surface mb-1">
              Description {formData.description.length > 0 && <span className="text-xs text-on-surface-variant">({formData.description.length}/500)</span>}
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              maxLength={500}
              placeholder="Describe what this video covers..."
              className="w-full rounded-lg border border-outline bg-surface px-4 py-2 text-on-surface placeholder:text-on-surface-variant focus:border-primary focus:outline-none resize-none h-24"
            />
          </div>

          {/* Video URL */}
          <div>
            <label className="block text-sm font-semibold text-on-surface mb-1">
              Video URL * {formData.videoUrl.length > 0 && <span className="text-xs text-on-surface-variant">(YouTube or direct URL)</span>}
            </label>
            <input
              type="url"
              name="videoUrl"
              value={formData.videoUrl}
              onChange={handleChange}
              placeholder="https://youtube.com/watch?v=... or https://..."
              className="w-full rounded-lg border border-outline bg-surface px-4 py-2 text-on-surface placeholder:text-on-surface-variant focus:border-primary focus:outline-none"
            />
          </div>

          {/* Subject */}
          <div>
            <label className="block text-sm font-semibold text-on-surface mb-1">Subject *</label>
            <select
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              className="w-full rounded-lg border border-outline bg-surface px-4 py-2 text-on-surface focus:border-primary focus:outline-none"
            >
              {SUBJECTS.map(subject => (
                <option key={subject} value={subject}>{subject}</option>
              ))}
            </select>
          </div>

          {/* Class */}
          <div>
            <label className="block text-sm font-semibold text-on-surface mb-1">Class</label>
            <select
              name="class"
              value={formData.class}
              onChange={handleChange}
              className="w-full rounded-lg border border-outline bg-surface px-4 py-2 text-on-surface focus:border-primary focus:outline-none"
            >
              {CLASSES.map(cls => (
                <option key={cls} value={cls}>{cls}</option>
              ))}
            </select>
          </div>

          {/* Duration */}
          <div>
            <label className="block text-sm font-semibold text-on-surface mb-1">Duration (optional)</label>
            <input
              type="text"
              name="duration"
              value={formData.duration}
              onChange={handleChange}
              placeholder="e.g., 12:45"
              className="w-full rounded-lg border border-outline bg-surface px-4 py-2 text-on-surface placeholder:text-on-surface-variant focus:border-primary focus:outline-none"
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="rounded-lg bg-green-50 border border-green-200 p-3 text-green-700 text-sm">
              Video uploaded successfully!
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className={cn(
              "w-full rounded-lg px-4 py-3 font-headline font-bold text-white transition-all flex items-center justify-center gap-2",
              isLoading
                ? "bg-primary/50 cursor-not-allowed"
                : "bg-primary hover:bg-primary/90 active:scale-[0.98]"
            )}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="h-5 w-5" />
                Upload Video
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
