'use client'

import { useLanguage } from '../app/context/LanguageContext'

export default function LoadingSpinner() {
  const { t } = useLanguage()

  return (
    <div className="flex flex-col items-center justify-center py-16 gap-8">
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-emerald-900/20 rounded-full blur-3xl" />
      </div>

      {/* Animated spinner */}
      <div className="relative w-20 h-20">
        {/* Outer ring */}
        <div className="absolute top-0 left-0 w-full h-full animate-spin duration-1000">
          <div className="w-full h-full border-4 border-emerald-500/20 border-t-emerald-500 rounded-full" />
        </div>
        
        {/* Inner ring */}
        <div className="absolute top-2 left-2 right-2 bottom-2 animate-spin duration-700">
          <div className="w-full h-full border-4 border-emerald-400/20 border-t-emerald-400/80 rounded-full" />
        </div>

        {/* Center dot */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
      </div>

      {/* Loading text */}
      <div className="flex flex-col items-center gap-3 relative">
        <div className="text-xl font-medium text-white">
          {t('search.loading')}
        </div>
        <div className="text-sm text-emerald-400/80 animate-pulse">
          {t('search.loadingSubtext')}
        </div>
      </div>
    </div>
  )
} 