"use client";
import React, { useState } from "react";
import { Play } from "lucide-react";

interface Video {
  id: string;
  title: string;
  url: string;
  description?: string | null;
}

function getEmbedUrl(url: string): string | null {
  try {
    // YouTube watch
    const ytWatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/);
    if (ytWatch) return `https://www.youtube.com/embed/${ytWatch[1]}?rel=0&modestbranding=1`;
    // YouTube embed already
    if (url.includes("youtube.com/embed/")) return url;
    // TikTok
    const ttMatch = url.match(/tiktok\.com\/@[^/]+\/video\/(\d+)/);
    if (ttMatch) return `https://www.tiktok.com/embed/v2/${ttMatch[1]}`;
    // Instagram Reel
    const igMatch = url.match(/instagram\.com\/(?:reel|p)\/([\w-]+)/);
    if (igMatch) return `https://www.instagram.com/p/${igMatch[1]}/embed`;
    // Facebook video
    if (url.includes("facebook.com")) {
      return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(url)}&width=500&show_text=false`;
    }
    return null;
  } catch { return null; }
}

function getThumbnail(url: string): string | null {
  const ytWatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/);
  if (ytWatch) return `https://img.youtube.com/vi/${ytWatch[1]}/hqdefault.jpg`;
  return null;
}

function VideoCard({ video }: { video: Video }) {
  const [playing, setPlaying] = useState(false);
  const embedUrl = getEmbedUrl(video.url);
  const thumb = getThumbnail(video.url);

  return (
    <div className="bg-white rounded-3xl overflow-hidden shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
      {/* Video Player */}
      <div className="relative aspect-video bg-gray-900">
        {playing && embedUrl ? (
          <iframe
            src={embedUrl + "&autoplay=1"}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <>
            {/* Thumbnail */}
            {thumb ? (
              <img src={thumb} alt={video.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-secondary to-secondary/80 flex items-center justify-center">
                <Play size={48} className="text-white/40" />
              </div>
            )}
            {/* Play Button */}
            <button
              onClick={() => embedUrl ? setPlaying(true) : window.open(video.url, "_blank")}
              className="absolute inset-0 flex items-center justify-center group"
              aria-label="تشغيل الفيديو"
            >
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white/90 hover:bg-white backdrop-blur-sm rounded-full flex items-center justify-center shadow-2xl transition-all group-hover:scale-110">
                <Play size={28} className="text-primary mr-[-3px]" fill="currentColor" />
              </div>
            </button>
            {/* Overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
          </>
        )}
      </div>
      {/* Info */}
      {(video.title || video.description) && (
        <div className="p-4">
          {video.title && <h4 className="font-bold text-gray-900 text-sm sm:text-base">{video.title}</h4>}
          {video.description && <p className="text-gray-500 text-xs sm:text-sm mt-1 leading-relaxed">{video.description}</p>}
        </div>
      )}
    </div>
  );
}

export default function VideoSection({
  videos,
  title,
  subtitle,
}: {
  videos: Video[];
  title?: string | null;
  subtitle?: string | null;
}) {
  if (!videos || videos.length === 0) return null;
  return (
    <section className="py-10 sm:py-16 bg-gray-50" id="videos">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-8 sm:mb-10">
          <span className="inline-block bg-orange-100 text-orange-600 font-bold text-xs sm:text-sm px-4 py-1.5 rounded-full mb-3">🎬 شاهد بنفسك</span>
          <h2 className="text-xl sm:text-3xl lg:text-4xl font-black text-secondary leading-tight">
            {title || "ماذا يقول الناس عن المنتج؟"}
          </h2>
          {subtitle && (
            <p className="text-gray-500 text-sm sm:text-base mt-2 max-w-xl mx-auto">{subtitle}</p>
          )}
        </div>
        <div className={`grid gap-6 ${
          videos.length === 1 ? "grid-cols-1 max-w-xl mx-auto" :
          videos.length === 2 ? "grid-cols-1 sm:grid-cols-2 max-w-3xl mx-auto" :
          "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
        }`}>
          {videos.map(v => <VideoCard key={v.id} video={v} />)}
        </div>
      </div>
    </section>
  );
}
