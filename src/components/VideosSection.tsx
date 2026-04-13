import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Play, Loader2, ExternalLink, Clock } from 'lucide-react';
import { cn } from '../lib/utils';
import { Language, getTranslation } from '../lib/translations';

interface Video {
  _id?: string;
  id?: string;
  title: string;
  description?: string;
  videoUrl: string;
  subject: string;
  class: string;
  teacherName: string;
  duration?: string;
  thumbnail?: string;
  views?: number;
  createdAt?: string;
}

interface VideosSectionProps {
  token?: string;
  userClass?: string;
  language?: Language;
  isAuthenticated?: boolean;
}

export default function VideosSection({
  token,
  userClass = 'Class 10',
  language = 'en',
  isAuthenticated = false,
}: VideosSectionProps) {
  const [videos, setVideos] = useState<Video[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const readErrorMessage = async (response: Response) => {
    const contentType = response.headers.get('content-type') || '';

    if (contentType.includes('application/json')) {
      try {
        const data = await response.json();
        return data.message || 'Failed to fetch videos';
      } catch {
        return 'Failed to fetch videos';
      }
    }

    const text = await response.text();
    return text.trim() || 'Failed to fetch videos';
  };

  useEffect(() => {
    if (isAuthenticated && token) {
      fetchVideos();
    }
  }, [isAuthenticated, token, userClass]);

  const fetchVideos = async () => {
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/videos?class=${encodeURIComponent(userClass)}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(await readErrorMessage(response));
      }

      const data = await response.json();
      setVideos(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch videos');
      console.error('Fetch videos error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <section className="my-12 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-headline text-2xl font-bold text-on-surface">
            📹 Class Videos
          </h2>
          <p className="mt-1 text-sm text-on-surface-variant">
            {getTranslation(language, 'appName')} - {userClass}
          </p>
        </div>
        <button
          onClick={fetchVideos}
          disabled={isLoading}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-primary/90 disabled:opacity-50"
        >
          Refresh
        </button>
      </div>

      {isLoading && (
        <div className="flex justify-center py-12">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-on-surface-variant">Loading videos...</p>
          </div>
        </div>
      )}

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-red-700">
          {error}
        </div>
      )}

      {!isLoading && videos.length === 0 && !error && (
        <div className="text-center py-12">
          <p className="text-lg text-on-surface-variant">
            No videos available for {userClass} yet.
          </p>
          <p className="text-sm text-on-surface-variant mt-2">
            Check back soon for new content!
          </p>
        </div>
      )}

      {!isLoading && videos.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {videos.map((video, index) => (
            <motion.a
              key={video._id || video.id || index}
              href={video.videoUrl}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="group relative overflow-hidden rounded-xl border border-emerald-100 bg-white shadow-sm transition-all hover:shadow-md hover:border-emerald-300 dark:border-stone-700 dark:bg-stone-900"
            >
              {/* Thumbnail */}
              <div className="relative aspect-video overflow-hidden bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-stone-800 dark:to-stone-700">
                {video.thumbnail ? (
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full bg-gradient-to-br from-emerald-600 via-teal-600 to-emerald-700">
                    <Play className="h-12 w-12 text-white/60" fill="white" />
                  </div>
                )}

                {/* Play Button Overlay */}
                <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/30 transition-colors">
                  <Play className="h-16 w-16 text-white opacity-70 group-hover:opacity-100 transition-opacity" fill="white" />
                </div>

                {/* Duration Badge */}
                {video.duration && (
                  <div className="absolute bottom-2 right-2 flex items-center gap-1 rounded bg-black/70 px-2 py-1 text-xs font-semibold text-white">
                    <Clock className="h-3 w-3" />
                    {video.duration}
                  </div>
                )}

                {/* Subject Badge */}
                <div className="absolute top-2 left-2">
                  <span className="inline-block rounded-full bg-primary/90 px-3 py-1 text-xs font-bold text-white">
                    {video.subject}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-4">
                <h3 className="font-headline font-bold text-on-surface line-clamp-2 group-hover:text-primary transition-colors">
                  {video.title}
                </h3>

                {video.description && (
                  <p className="mt-2 text-xs text-on-surface-variant line-clamp-2">
                    {video.description}
                  </p>
                )}

                <div className="mt-3 flex items-center justify-between">
                  <span className="text-xs font-semibold text-primary">
                    {video.teacherName}
                  </span>
                  <ExternalLink className="h-4 w-4 text-on-surface-variant group-hover:text-primary transition-colors" />
                </div>

                {video.views !== undefined && (
                  <p className="mt-2 text-[10px] text-on-surface-variant">
                    {video.views} views
                  </p>
                )}
              </div>
            </motion.a>
          ))}
        </div>
      )}
    </section>
  );
}
