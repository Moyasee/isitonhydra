'use client'

import SearchBar from '@/components/SearchBar'
import SourceFilter from '../components/SourceFilter'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useLocalStorage } from './hooks/useLocalStorage'
import { Github, MessageSquare, Globe } from 'lucide-react'
import { useLanguage } from './context/LanguageContext'
import GameResult from './components/GameResult'
import { searchGames, GameData } from './lib/searchGames'
import LanguageSwitcher from './components/LanguageSwitcher'
import { cn } from '@/lib/utils'

export default function Home() {
  const router = useRouter()
  const [selectedSources, setSelectedSources] = useLocalStorage<string[]>('selectedSources', [])
  const { t } = useLanguage()
  const [results, setResults] = useState<GameData[]>([])

  const handleSearch = async (query: string) => {
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query)}`)
      const searchResults = await searchGames(query, selectedSources)
      
      // Sort the sources within each game by date
      const sortedResults = searchResults.map(game => ({
        ...game,
        sources: [...game.sources].sort((a, b) => 
          new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime()
        )
      }));

      // Sort games by their most recent source update
      sortedResults.sort((a, b) => {
        const latestDateA = Math.max(...a.sources.map(s => new Date(s.uploadDate).getTime()));
        const latestDateB = Math.max(...b.sources.map(s => new Date(s.uploadDate).getTime()));
        return latestDateB - latestDateA;
      });

      setResults(sortedResults)
    }
  }

  return (
    <main className="min-h-screen bg-[#0A0A0A] text-white relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-emerald-900/20 rounded-full blur-3xl transform -translate-y-1/2" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-emerald-900/20 rounded-full blur-3xl transform translate-y-1/2" />
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-900/10 via-transparent to-emerald-900/10" />
      </div>

      {/* Language Switcher */}
      <div className="absolute top-4 right-4 z-10">
        <LanguageSwitcher />
      </div>

      {/* Main Content */}
      <div className="relative min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="text-center space-y-6 mb-16 max-w-4xl mx-auto">
          <div className="flex justify-center">
            <div className={cn(
              "inline-flex items-center px-4 py-2 rounded-full",
              "bg-emerald-900/20 text-emerald-400 text-sm",
              "relative overflow-hidden group",
              "border border-emerald-500/20",
              "transition-all duration-300",
              "hover:bg-emerald-900/30 hover:border-emerald-500/30"
            )}>
              {/* Shine effect */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <div className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 bg-gradient-to-r from-transparent via-emerald-400/10 to-transparent" />
              </div>
              {/* Glow effect */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="absolute inset-0 rounded-full bg-emerald-500/5 blur-sm" />
              </div>
              {/* Text */}
              <span className="relative">{t('discoverBadge')}</span>
            </div>
          </div>
          
          <h1 className={cn(
            "text-6xl sm:text-7xl font-bold",
            "tracking-tight",
            "bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent",
            "transition-all duration-300"
          )}>
            {t('title')}
          </h1>
          
          <p className={cn(
            "text-xl sm:text-2xl",
            "text-zinc-400",
            "max-w-2xl mx-auto",
            "leading-relaxed",
            "transition-all duration-300"
          )}>
            {t('subtitle')}
          </p>
        </div>

        {/* Search Section */}
        <div className="w-full max-w-2xl mx-auto">
          <div className="flex gap-3">
            <div className="flex-1">
              <SearchBar onSearch={handleSearch} />
            </div>
            <div className="flex-shrink-0">
              <SourceFilter
                selectedSources={selectedSources}
                onChange={setSelectedSources}
                isMainPage={true}
              />
            </div>
          </div>
        </div>

        {/* Game Results */}
        {results.length > 0 && (
          <div className="w-full max-w-[95%] mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 px-8">
              {results.map((game) => (
                <GameResult
                  key={game.name}
                  name={game.name}
                  image={game.image}
                  sources={game.sources}
                  genres={game.genres}
                />
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <footer className="w-full max-w-2xl mx-auto mt-20 pt-8 border-t border-zinc-800/30">
          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center gap-6">
              <a 
                href="https://discord.gg/hydralaunchercommunity" 
                target="_blank"
                rel="noopener noreferrer"
                className="text-zinc-500 hover:text-emerald-400 transition-all duration-300"
                aria-label="Join our Discord"
              >
                <MessageSquare className="w-5 h-5" />
              </a>
              <a 
                href="https://github.com/moyasee/isitonhydra"
                target="_blank"
                rel="noopener noreferrer"
                className="text-zinc-500 hover:text-emerald-400 transition-all duration-300"
                aria-label="View source on GitHub"
              >
                <Github className="w-5 h-5" />
              </a>
              <a 
                href="https://hydralinks.cloud"
                target="_blank"
                rel="noopener noreferrer"
                className="text-zinc-500 hover:text-emerald-400 transition-all duration-300"
                aria-label="Visit Hydra Links"
              >
                <Globe className="w-5 h-5" />
              </a>
            </div>
            <p className="text-sm text-zinc-500 hover:text-zinc-400 transition-colors duration-300">
              {t('credits')}
            </p>
          </div>
        </footer>
      </div>
    </main>
  )
}

