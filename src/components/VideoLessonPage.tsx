import React, { useMemo } from 'react';
import { ArrowLeft, ExternalLink, PlayCircle } from 'lucide-react';
import { cn } from '../lib/utils';

interface VideoLessonPageProps {
  title: string;
  videoUrl: string;
  startSeconds?: number;
  onBack: () => void;
}

const getYouTubeVideoId = (url: string) => {
  try {
    const parsed = new URL(url);

    if (parsed.hostname.includes('youtu.be')) {
      return parsed.pathname.replace('/', '').trim() || null;
    }

    if (parsed.hostname.includes('youtube.com')) {
      const fromQuery = parsed.searchParams.get('v');
      if (fromQuery) {
        return fromQuery;
      }

      const parts = parsed.pathname.split('/').filter(Boolean);
      const embedIndex = parts.findIndex((part) => part === 'embed' || part === 'shorts');
      if (embedIndex >= 0 && parts[embedIndex + 1]) {
        return parts[embedIndex + 1];
      }
    }

    return null;
  } catch {
    return null;
  }
};

export default function VideoLessonPage({ title, videoUrl, startSeconds = 0, onBack }: VideoLessonPageProps) {
  const youtubeId = useMemo(() => getYouTubeVideoId(videoUrl), [videoUrl]);
  const safeStart = Math.max(0, Math.floor(startSeconds));

  const embedUrl = useMemo(() => {
    if (!youtubeId) {
      return '';
    }

    const params = new URLSearchParams({
      autoplay: '1',
      rel: '0',
      modestbranding: '1',
    });

    if (safeStart > 0) {
      params.set('start', String(safeStart));
    }

    return `https://www.youtube.com/embed/${youtubeId}?${params.toString()}`;
  }, [youtubeId, safeStart]);

  const isDirectVideo = /(\.mp4|\.webm|\.ogg)(\?|#|$)/i.test(videoUrl);

  return (
    <div className="min-h-screen bg-stone-950 text-white">
      <header className="border-b border-white/10 bg-black/30 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 rounded-lg border border-white/20 px-3 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
          <a
            href={videoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg border border-emerald-400/40 bg-emerald-500/10 px-3 py-2 text-sm font-semibold text-emerald-300 transition hover:bg-emerald-500/20"
          >
            Open Original
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-6 py-8">
        <h1 className="font-headline text-2xl font-bold tracking-tight md:text-3xl">{title || 'Lesson Video'}</h1>

        <div className="mt-6 overflow-hidden rounded-2xl border border-white/10 bg-black shadow-2xl">
          {youtubeId ? (
            <iframe
              src={embedUrl}
              title={title || 'YouTube lesson'}
              className="aspect-video w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          ) : isDirectVideo ? (
            <video className="aspect-video w-full" controls autoPlay src={videoUrl}>
              Your browser does not support this video.
            </video>
          ) : (
            <div className="flex aspect-video w-full flex-col items-center justify-center gap-4 p-6 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-300">
                <PlayCircle className="h-8 w-8" />
              </div>
              <p className="max-w-lg text-sm text-white/80">
                This provider does not support embedded playback in this player. Use Open Original to watch the lesson.
              </p>
              <a
                href={videoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  'inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition',
                  'bg-emerald-600 text-white hover:bg-emerald-500',
                )}
              >
                Watch In New Tab
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
