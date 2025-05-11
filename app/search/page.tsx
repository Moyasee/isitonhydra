'use client'

import { searchGames, parseFileSize, GameData } from '../lib/searchGames'
import SearchBar from '@/components/SearchBar'
import GameResult from '@/app/components/GameResult'
import { ArrowLeft, Calendar, AlertTriangle } from 'lucide-react'
import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import SourceFilter from '@/components/SourceFilter'
import LoadingSpinner from '@/components/LoadingSpinner'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { useLanguage } from '../context/LanguageContext'

function SearchContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [results, setResults] = useState<GameData[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [selectedSources, setSelectedSources] = useLocalStorage<string[]>('selectedSources', [])
  const { t } = useLanguage()
  
  useEffect(() => {
    const query = searchParams.get('q')
    if (query) {
      setIsSearching(true)
      setResults([])
      
      const searchTimeout = setTimeout(() => {
        searchGames(query, selectedSources)
          .then((searchResults) => {
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

            setResults(sortedResults);
          })
          .finally(() => {
            setIsSearching(false)
          })
      }, 200)

      return () => clearTimeout(searchTimeout)
    }
  }, [searchParams, selectedSources])

  const handleSearch = (query: string) => {
    if (query.trim()) {
      setIsSearching(true)
      router.push(`/search?q=${encodeURIComponent(query)}`)
    }
  }

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8 bg-[#0A0A0A] relative">
      {/* Background Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-emerald-900/10 rounded-full blur-3xl transform -translate-y-1/2" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-emerald-900/10 rounded-full blur-3xl transform translate-y-1/2" />
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-900/5 via-transparent to-emerald-900/5" />
      </div>

      {/* Content */}
      <div className="relative">
        {/* Centered Search Header */}
        <div className="max-w-4xl mx-auto flex flex-col gap-6 mb-8">
          {/* Search Bar Container */}
          <div className="flex items-center gap-4 bg-zinc-900/50 rounded-xl p-2">
            <Link
              href="/"
              className="p-2 text-zinc-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex-1">
              <SearchBar 
                onSearch={handleSearch}
                isMobileSearch 
                className="bg-transparent focus:outline-none w-full text-white placeholder-zinc-400"
              />
            </div>
            <div className="flex-shrink-0">
              <SourceFilter
                selectedSources={selectedSources}
                onChange={setSelectedSources}
                isMainPage={false}
              />
            </div>
          </div>
          {/* Warning message */}
          <div className="flex items-center gap-2 text-sm text-amber-500/80">
            <AlertTriangle className="w-4 h-4" />
            <span>Games that share a single word in their title (e.g., "Red Alert" and "Red Dead") may appear as false positive results.</span>
          </div>
        </div>

        {/* Results Section with Loading State */}
        <div className="w-full mx-auto">
          {isSearching ? (
            <div className="relative">
              <div className="animate-fadeIn">
                <LoadingSpinner />
              </div>
            </div>
          ) : results.length > 0 ? (
            <div className="animate-fadeIn">
              <h1 className="text-xl text-zinc-400 mb-6">
                {t('search.resultsFound').replace('{count}', results.length.toString())}{' '}
                "{searchParams.get('q')}"
              </h1>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr">
                {results.map((game, index) => (
                  <GameResult
                    key={index}
                    name={game.name}
                    image={game.image}
                    sources={game.sources}
                    genres={game.genres}
                  />
                ))}
              </div>
            </div>
          ) : searchParams.get('q') ? (
            <div className="flex flex-col items-center justify-center py-12 gap-4 animate-fadeIn">
              <AlertTriangle className="w-8 h-8 text-zinc-400" />
              <div className="text-zinc-400">
                {t('search.noResults')} "{searchParams.get('q')}"
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense>
      <SearchContent />
    </Suspense>
  )
}

