'use client'

import { useState, useRef, useEffect } from 'react'
import { Check, ChevronDown, Filter } from 'lucide-react'
import { jsonSources } from '@/app/config/sources'
import { cn } from '@/lib/utils'
import { useLanguage } from '@/app/context/LanguageContext'

interface SourceFilterProps {
  selectedSources: string[]
  onChange: (sources: string[]) => void
  isMainPage?: boolean
}

export default function SourceFilter({ selectedSources, onChange, isMainPage }: SourceFilterProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const { t } = useLanguage()

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const toggleSource = (sourceName: string) => {
    const newSources = selectedSources.includes(sourceName)
      ? selectedSources.filter(s => s !== sourceName)
      : [...selectedSources, sourceName]
    onChange(newSources)
  }

  const selectAll = () => {
    onChange(jsonSources.map(s => s.name))
  }

  const clearAll = () => {
    onChange([])
  }

  return (
    <div className="relative z-50" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex items-center gap-2 px-6 py-4 rounded-2xl text-sm font-medium',
          'transition-all duration-200',
          'border shadow-lg shadow-black/20',
          isMainPage 
            ? 'bg-[#111111] text-zinc-400 hover:text-white border-zinc-800 hover:border-zinc-700'
            : 'bg-[#111111] text-zinc-400 hover:text-white border-zinc-800 hover:border-zinc-700',
          selectedSources.length > 0 && 'text-emerald-400 border-emerald-500/20 hover:border-emerald-500/40'
        )}
      >
        <Filter className="w-4 h-4" />
        {!isMainPage && t('sources')}
        <span className="text-xs">
          {selectedSources.length > 0 && `(${selectedSources.length})`}
        </span>
        <ChevronDown className={cn(
          "w-4 h-4 transition-transform duration-200",
          isOpen && "transform rotate-180"
        )} />
      </button>

      {isOpen && (
        <div className={cn(
          "absolute mt-2 rounded-2xl",
          "bg-[#111111]/95 backdrop-blur-sm",
          "border border-zinc-800",
          "shadow-xl shadow-black/20",
          "transform opacity-100 scale-100",
          "transition-all duration-200",
          isMainPage ? "-right-2" : "-right-2",
          "w-72",
          "animate-fade-in"
        )}>
          <div className="p-3">
            <div className="flex gap-2 mb-3">
              <button
                onClick={selectAll}
                className={cn(
                  "flex-1 px-4 py-2",
                  "text-xs font-medium rounded-xl",
                  "bg-zinc-800/50 text-zinc-400",
                  "hover:bg-emerald-500/10 hover:text-emerald-400",
                  "transition-all duration-200"
                )}
              >
                {t('filter.selectAll')}
              </button>
              <button
                onClick={clearAll}
                className={cn(
                  "flex-1 px-4 py-2",
                  "text-xs font-medium rounded-xl",
                  "bg-zinc-800/50 text-zinc-400",
                  "hover:bg-emerald-500/10 hover:text-emerald-400",
                  "transition-all duration-200"
                )}
              >
                {t('filter.clearAll')}
              </button>
            </div>
            <div 
              className={cn(
                "max-h-[280px] overflow-y-auto pr-1 space-y-1",
                "[&::-webkit-scrollbar]:w-1.5",
                "[&::-webkit-scrollbar-track]:bg-transparent",
                "[&::-webkit-scrollbar-thumb]:bg-white/10",
                "[&::-webkit-scrollbar-thumb]:rounded-full",
                "[&::-webkit-scrollbar-thumb:hover]:bg-white/20",
                "hover:[&::-webkit-scrollbar-thumb]:bg-white/20"
              )}
            >
              {jsonSources.map((source) => (
                <button
                  key={source.name}
                  onClick={() => toggleSource(source.name)}
                  className={cn(
                    "flex items-center gap-3 w-full p-3",
                    "hover:bg-zinc-800/50 rounded-xl",
                    "text-sm text-left",
                    "transition-all duration-200"
                  )}
                >
                  <div className={cn(
                    'w-4 h-4 rounded-md border',
                    'flex items-center justify-center',
                    'transition-all duration-200',
                    selectedSources.includes(source.name)
                      ? 'bg-emerald-500 border-emerald-500'
                      : 'border-zinc-700'
                  )}>
                    {selectedSources.includes(source.name) && (
                      <Check className="w-3 h-3 text-white" />
                    )}
                  </div>
                  <span className={cn(
                    'transition-colors duration-200',
                    selectedSources.includes(source.name)
                      ? 'text-white'
                      : 'text-zinc-400'
                  )}>
                    {source.name}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 