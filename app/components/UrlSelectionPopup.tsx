'use client'

import { useLanguage } from '../context/LanguageContext'
import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'

interface UrlSelectionPopupProps {
  source: {
    name: string
    url: string
    additional_urls: Array<{
      name: string
      url: string
      description?: string
    }>
  }
  onClose: () => void
}

export default function UrlSelectionPopup({ source, onClose }: UrlSelectionPopupProps) {
  const { t } = useLanguage()
  const [selectedUrl, setSelectedUrl] = useState<string | null>(null)
  const [showCopied, setShowCopied] = useState(false)

  const handleSelect = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url)
      setSelectedUrl(url)
      setShowCopied(true)
      setTimeout(() => {
        setShowCopied(false)
        onClose()
      }, 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" 
        onClick={onClose}
      />

      {/* Popup Container */}
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md z-50">
        <div 
          className="bg-[#111111]/95 border border-zinc-800 rounded-2xl shadow-xl shadow-black/20 p-6 m-4" 
          onClick={e => e.stopPropagation()}
        >
          {/* Popup Title */}
          <h3 className="text-lg font-medium text-white mb-4">
            {t('gameResult.selectVersion')}
          </h3>

          {/* Version Options */}
          <div className="space-y-2">
            {source.additional_urls.map((option) => (
              <button
                key={option.url}
                onClick={() => handleSelect(option.url)}
                className={cn(
                  "w-full px-4 py-3 rounded-xl text-left transition-all duration-200",
                  "flex items-center justify-between",
                  selectedUrl === option.url
                    ? "bg-emerald-500/20 text-emerald-300"
                    : "text-zinc-300 hover:bg-zinc-800/50"
                )}
              >
                <div className="flex-1">
                  <div className="font-medium">{option.name}</div>
                  {option.description && (
                    <div className="text-xs text-zinc-500 mt-0.5">
                      {option.description}
                    </div>
                  )}
                </div>

                {selectedUrl === option.url && showCopied && (
                  <span className="text-xs text-emerald-400 ml-3">
                    {t('gameResult.copied')} ✓
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Footer with Close button */}
          <div className="mt-6 flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2 text-sm bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl transition-colors"
            >
              {t('common.close')}
            </button>
          </div>
        </div>
      </div>
    </>
  )
} 