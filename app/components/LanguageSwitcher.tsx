'use client'

import { useState, useRef, useEffect } from 'react'
import { useLanguage } from '../context/LanguageContext'
import { Globe, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { US, BR, RU } from 'country-flag-icons/react/3x2'

const languages = {
  en: {
    name: 'English',
    flag: US,
    label: 'United States'
  },
  pt: {
    name: 'Português',
    flag: BR,
    label: 'Brasil'
  },
  ru: {
    name: 'Русский',
    flag: RU,
    label: 'Россия'
  }
} as const

export default function LanguageSwitcher() {
  const [isOpen, setIsOpen] = useState(false)
  const { language, setLanguage } = useLanguage()
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const selectedLang = languages[language as keyof typeof languages]
  const Flag = selectedLang.flag

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center gap-2.5 px-4 py-2.5",
          "bg-[#111111]",
          "border border-zinc-800",
          "rounded-2xl",
          "text-zinc-400 hover:text-white",
          "transition-all duration-200",
          "hover:border-zinc-700",
          "shadow-lg shadow-black/20",
          "group"
        )}
      >
        <Flag className="w-5 h-5 rounded-sm shadow-sm opacity-80 group-hover:opacity-100 transition-opacity duration-200" />
        <ChevronDown className={cn(
          "w-4 h-4 text-zinc-500 group-hover:text-zinc-300",
          "transition-transform duration-200",
          isOpen && "rotate-180"
        )} />
      </button>

      {isOpen && (
        <div className={cn(
          "absolute mt-2 right-0",
          "w-52 overflow-hidden rounded-2xl",
          "bg-[#111111]/95 backdrop-blur-sm",
          "border border-zinc-800",
          "shadow-xl shadow-black/20",
          "animate-fade-in"
        )}>
          <div className="p-1">
            {(Object.entries(languages)).map(([code, lang]) => {
              const LangFlag = lang.flag
              return (
                <button
                  key={code}
                  onClick={() => {
                    setLanguage(code as keyof typeof languages)
                    setIsOpen(false)
                  }}
                  className={cn(
                    "w-full px-3 py-2.5 rounded-xl",
                    "text-left text-sm",
                    "flex items-center gap-3",
                    "transition-all duration-200",
                    code === language
                      ? "bg-emerald-500/20 text-emerald-300"
                      : "text-zinc-400 hover:text-white hover:bg-zinc-800/50"
                  )}
                >
                  <LangFlag className="w-5 h-5 rounded-sm shadow-sm" />
                  <div className="flex flex-col">
                    <span className="font-medium">{lang.name}</span>
                    <span className="text-xs opacity-60">
                      {lang.label}
                    </span>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
} 