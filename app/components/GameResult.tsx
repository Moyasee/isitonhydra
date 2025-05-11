'use client'

import { useState, useEffect } from 'react'
import { formatDate } from '../lib/utils'
import UrlSelectionPopup from './UrlSelectionPopup'
import { useLanguage } from '../context/LanguageContext'
import { Calendar, Copy, ExternalLink } from 'lucide-react'
import { cn } from '@/lib/utils'
import { jsonSources } from '../config/sources'
import Image from 'next/image'

interface Source {
  name: string
  url: string
  uploadDate: string
  fileSize?: string
  additional_urls?: Array<{
    name: string
    url: string
    description?: string
  }>
}

interface GameResultProps {
  name: string
  image?: string
  sources: Source[]
  genres?: string[]
}

export default function GameResult({ name, image, sources, genres = [] }: GameResultProps) {
  console.log('GameResult Debug:', {
    componentName: 'GameResult',
    props: {
      name,
      genres: {
        value: genres,
        type: typeof genres,
        isArray: Array.isArray(genres),
        length: genres?.length,
        entries: Array.isArray(genres) ? [...genres] : 'not an array'
      }
    }
  });

  const genresList = Array.isArray(genres) ? genres : [];
  
  console.log('GameResult rendering:', {
    name,
    genresProvided: genresList,
    genresLength: genresList.length
  });
  
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)
  const [showUrlPopup, setShowUrlPopup] = useState(false)
  const [selectedSource, setSelectedSource] = useState<Source | null>(null)
  const { t, language } = useLanguage()
  const [imageError, setImageError] = useState(false)
  const [imageUrl, setImageUrl] = useState<string | undefined>(undefined)

  // Try different image formats in sequence
  const tryNextImageFormat = (currentUrl: string) => {
    // Extract the original Steam URL from our proxy URL
    const params = new URLSearchParams(currentUrl.split('?')[1]);
    const originalUrl = params.get('url') || '';
    
    if (originalUrl.includes('header.jpg')) {
      const newUrl = originalUrl.replace('header.jpg', 'capsule_616x353.jpg');
      return `/api/image-proxy?url=${encodeURIComponent(newUrl)}`;
    }
    if (originalUrl.includes('capsule_616x353.jpg')) {
      const newUrl = originalUrl.replace('capsule_616x353.jpg', 'capsule_231x87.jpg');
      return `/api/image-proxy?url=${encodeURIComponent(newUrl)}`;
    }
    if (originalUrl.includes('capsule_231x87.jpg')) {
      const newUrl = originalUrl.replace('capsule_231x87.jpg', 'capsule_184x69.jpg');
      return `/api/image-proxy?url=${encodeURIComponent(newUrl)}`;
    }
    return null;
  };

  useEffect(() => {
    if (!image) return;
    setImageUrl(image);
    setImageError(false);
  }, [image]);

  const isValidImageUrl = image && image.includes('/apps/') && image.endsWith('/header.jpg');

  const getSourceUrl = (sourceName: string) => {
    const sourceConfig = jsonSources.find(s => s.name === sourceName);
    return sourceConfig?.url || '';
  };

  return (
    <>
      <div className={cn(
        "game-card",
        "relative overflow-hidden rounded-2xl",
        "bg-[#111111]",
        "border border-zinc-800",
        "transition-all duration-300",
        "hover:border-emerald-500/20",
        "shadow-lg shadow-black/20 hover:shadow-emerald-900/20",
        "group"
      )}>
        {/* Background Image */}
        {imageUrl && !imageError && (
          <div className="absolute inset-0">
            <Image
              src={imageUrl}
              alt={name}
              fill
              className="object-cover opacity-20 transition-opacity duration-300 group-hover:opacity-30"
              onError={() => {
                const nextUrl = tryNextImageFormat(imageUrl);
                if (nextUrl) {
                  console.log('Trying next image format:', nextUrl);
                  setImageUrl(nextUrl);
                } else {
                  console.error('All image formats failed for:', name);
                  setImageError(true);
                }
              }}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              priority={false}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/90 via-black/80 to-black/70" />
            {/* Hover gradient effect */}
            <div className={cn(
              "absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100",
              "bg-gradient-to-t from-emerald-950/30 to-transparent"
            )} />
          </div>
        )}

        {/* Content */}
        <div className="relative p-6 space-y-4">
          {/* Title and Genres */}
          <div>
            <h3 className="text-xl font-medium text-white mb-3 group-hover:text-emerald-50 transition-colors duration-300">
              {name}
            </h3>
            <div className="flex flex-wrap gap-2">
              {genres.map((genre, index) => (
                <span
                  key={index}
                  className={cn(
                    "px-2.5 py-1 text-xs rounded-lg",
                    "bg-zinc-800/50 text-zinc-400",
                    "group-hover:bg-emerald-900/20 group-hover:text-emerald-300",
                    "transition-all duration-300"
                  )}
                >
                  {genre}
                </span>
              ))}
            </div>
          </div>

          {/* Sources List */}
          <div className="space-y-1.5">
            {sources.map((source, index) => {
              const hasAdditionalUrls = source.additional_urls && source.additional_urls.length > 0;
              const sourceUrl = getSourceUrl(source.name);
              
              return (
                <div
                  key={index}
                  className={cn(
                    "flex items-center gap-3 px-3 sm:px-5 py-3",
                    "transition-all duration-200 group/item rounded-xl",
                    "hover:bg-emerald-900/10"
                  )}
                >
                  <div className="flex-1 min-w-0 flex items-center gap-2 sm:gap-6">
                    <span className="text-white/90 font-medium truncate min-w-[100px] sm:w-[180px] text-sm group-hover/item:text-emerald-50">
                      {source.name}
                    </span>

                    <div className="hidden sm:flex items-center gap-1.5 text-zinc-500 text-xs group-hover/item:text-emerald-500/70 w-[120px]">
                      <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
                      <span className="tabular-nums whitespace-nowrap">
                        {formatDate(source.uploadDate, language)}
                      </span>
                    </div>
                    
                    {/* Mobile date display */}
                    <div className="flex sm:hidden items-center text-zinc-500 text-xs group-hover/item:text-emerald-500/70">
                      <span className="tabular-nums whitespace-nowrap text-[10px]">
                        {formatDate(source.uploadDate, language)}
                      </span>
                    </div>
                  </div>

                  {hasAdditionalUrls ? (
                    <button
                      onClick={() => {
                        setSelectedSource(source);
                        setShowUrlPopup(true);
                      }}
                      className={cn(
                        "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg",
                        "bg-zinc-800/50 text-zinc-400",
                        "opacity-0 group-hover/item:opacity-100",
                        "hover:bg-emerald-500/20 hover:text-emerald-300",
                        "transition-all duration-200",
                        "text-xs font-medium"
                      )}
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>{t('gameResult.select')}</span>
                    </button>
                  ) : (
                    <div className="relative flex-shrink-0 ml-8">
                      <button
                        onClick={async () => {
                          await navigator.clipboard.writeText(sourceUrl);
                          setCopiedIndex(index);
                          setTimeout(() => setCopiedIndex(null), 2000);
                        }}
                        className={cn(
                          "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium",
                          "transition-all duration-200",
                          copiedIndex === index
                            ? "bg-emerald-500/20 text-emerald-300"
                            : cn(
                                "bg-zinc-800/50 text-zinc-400",
                                "opacity-0 group-hover/item:opacity-100",
                                "hover:bg-emerald-500/20 hover:text-emerald-300"
                              )
                        )}
                      >
                        <Copy className="w-3.5 h-3.5" />
                        <span>
                          {copiedIndex === index ? t('gameResult.copied') : t('gameResult.copy')}
                        </span>
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* URL Selection Popup */}
      {showUrlPopup && selectedSource && selectedSource.additional_urls && (
        <UrlSelectionPopup
          source={{
            name: selectedSource.name,
            url: selectedSource.url,
            additional_urls: selectedSource.additional_urls
          }}
          onClose={() => {
            setShowUrlPopup(false);
            setSelectedSource(null);
          }}
        />
      )}
    </>
  );
} 