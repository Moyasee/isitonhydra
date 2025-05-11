'use client'

import { Search } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useLanguage } from '@/app/context/LanguageContext'
import { useState } from 'react'

interface SearchBarProps {
  onSearch: (query: string) => void
  isMobileSearch?: boolean
  className?: string
}

export default function SearchBar({ onSearch, isMobileSearch, className }: SearchBarProps) {
  const { t } = useLanguage()
  const [isFocused, setIsFocused] = useState(false)

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const query = formData.get('query')?.toString() || ''
    onSearch(query)
  }

  return (
    <form onSubmit={handleSubmit} className="relative w-full">
      <div className={cn(
        "search-input-container",
        "relative group",
        "bg-[#111111]",
        "border transition-all duration-200",
        isFocused 
          ? "border-emerald-500/50 bg-emerald-500/5" 
          : "border-zinc-800 hover:border-zinc-700",
        "rounded-2xl",
        "shadow-lg shadow-black/20"
      )}>
        <div className="relative">
          <Search className={cn(
            "absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5",
            "transition-colors duration-200",
            isFocused ? "text-emerald-400" : "text-zinc-400 group-hover:text-emerald-400"
          )} />
          <input
            type="text"
            name="query"
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={t('searchPlaceholder')}
            className={cn(
              "w-full bg-transparent",
              "pl-12 pr-4 py-4",
              "text-white placeholder-zinc-500",
              "text-base",
              "border-none focus:outline-none focus:ring-0",
              "transition-all duration-200",
              "placeholder:transition-opacity placeholder:duration-200",
              isFocused ? "placeholder-zinc-400" : "placeholder-zinc-600",
              "group-hover:placeholder-zinc-500",
              // WebKit autofill override
              "[&:-webkit-autofill]:bg-transparent",
              "[&:-webkit-autofill]:text-white",
              "[&:-webkit-autofill]:shadow-[0_0_0_30px_#111111_inset]",
              "[&:-webkit-autofill]:[-webkit-text-fill-color:white]",
              className
            )}
            autoComplete="off"
          />
        </div>
      </div>
    </form>
  )
}

