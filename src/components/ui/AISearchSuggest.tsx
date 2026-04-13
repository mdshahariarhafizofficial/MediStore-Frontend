import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Sparkles, X, ChevronRight, Loader2, Pill } from 'lucide-react';
import axios from 'axios';

interface SuggestionResult {
  exactMatches: Array<{ id: string; name: string; manufacturer: string }>;
  aiSuggestions: string[];
}

export default function AISearchSuggest({ 
  placeholder = "Search medicines, symptoms... (AI powered)",
  className = ""
}: { 
  placeholder?: string,
  className?: string
}) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<SuggestionResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    // Click outside handler
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (query.trim().length < 2) {
        setSuggestions(null);
        setIsOpen(false);
        return;
      }

      setIsLoading(true);
      try {
        setIsOpen(true);
        const { data } = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/ai/suggest`, { query });
        if (data.success) {
          setSuggestions(data.data);
        }
      } catch (error) {
        console.error("AI Suggestion error", error);
      } finally {
        setIsLoading(false);
      }
    };

    const debounceTimer = setTimeout(fetchSuggestions, 400); // 400ms debounce
    return () => clearTimeout(debounceTimer);
  }, [query]);

  const handleSearch = (searchQuery: string) => {
    setIsOpen(false);
    if (!searchQuery.trim()) return;
    router.push(`/shop?search=${encodeURIComponent(searchQuery)}`);
  };

  return (
    <div className={`relative w-full ${className}`} ref={wrapperRef}>
      <div className="relative group flex items-center">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch(query)}
          className="w-full px-5 py-3.5 sm:py-4 pl-12 pr-12 rounded-2xl text-gray-900 dark:text-white bg-white dark:bg-gray-800 border-2 border-transparent focus:outline-none focus:border-primary-500/50 focus:ring-4 focus:ring-primary-500/20 shadow-xl transition-all placeholder-gray-500 dark:placeholder-gray-400"
          placeholder={placeholder}
        />
        <Search className="absolute left-4 h-6 w-6 text-gray-400 dark:text-gray-500 transition-colors group-focus-within:text-primary-500" />
        
        <div className="absolute right-4 flex items-center gap-2">
          {query && (
            <button 
              onClick={() => { setQuery(''); setSuggestions(null); setIsOpen(false); }}
              className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center animate-pulse-slow shadow-md hover:scale-110 transition-transform cursor-pointer" onClick={() => handleSearch(query)}>
            <Sparkles className="h-4 w-4 text-white" />
          </div>
        </div>
      </div>

      {isOpen && (query.length >= 2) && (
        <div className="absolute z-50 w-full mt-2 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden animate-fade-in origin-top">
           {isLoading ? (
             <div className="p-6 flex flex-col items-center justify-center text-gray-500 dark:text-gray-400 space-y-3">
                <Loader2 className="h-6 w-6 animate-spin text-primary-500" />
                <span className="text-sm font-medium animate-pulse">AI is thinking...</span>
             </div>
           ) : (suggestions?.exactMatches?.length || suggestions?.aiSuggestions?.length) ? (
             <div className="flex flex-col">
                {/* Exact Matches */}
                {suggestions?.exactMatches && suggestions.exactMatches.length > 0 && (
                  <div className="p-2 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30">
                    <h4 className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest px-3 pt-2 mb-2">Direct Matches</h4>
                    {suggestions.exactMatches.map((match) => (
                      <button
                        key={match.id}
                        onClick={() => {
                          setIsOpen(false);
                          router.push(`/shop/${match.id}`);
                        }}
                        className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-white dark:hover:bg-gray-800 transition-colors group"
                      >
                         <div className="flex items-center">
                           <div className="w-8 h-8 rounded-lg bg-primary-100 dark:bg-primary-900/50 flex items-center justify-center mr-3">
                             <Pill className="h-4 w-4 text-primary-600 dark:text-primary-400" />
                           </div>
                           <div className="text-left">
                             <p className="text-sm font-bold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">{match.name}</p>
                             <p className="text-xs text-gray-500 dark:text-gray-400 truncate w-32 sm:w-48">{match.manufacturer}</p>
                           </div>
                         </div>
                         <ChevronRight className="h-4 w-4 text-gray-300 dark:text-gray-600 group-hover:text-primary-500 transition-colors" />
                      </button>
                    ))}
                  </div>
                )}
                
                {/* AI Semantic Suggestions */}
                {suggestions?.aiSuggestions && suggestions.aiSuggestions.length > 0 && (
                  <div className="p-2 bg-gradient-to-b from-transparent to-purple-50/30 dark:to-purple-900/10">
                    <h4 className="text-[10px] font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600 dark:from-purple-400 dark:to-indigo-400 uppercase tracking-widest px-3 pt-2 mb-2 flex items-center">
                      <Sparkles className="h-3 w-3 mr-1" />
                      AI Suggestions
                    </h4>
                    {suggestions.aiSuggestions.map((sug, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSearch(sug)}
                        className="w-full flex items-center p-3 rounded-xl hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors group text-left"
                      >
                         <Search className="h-4 w-4 text-gray-400 dark:text-gray-500 mr-3 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors" />
                         <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-purple-700 dark:group-hover:text-purple-300 transition-colors">{sug}</span>
                      </button>
                    ))}
                  </div>
                )}
             </div>
           ) : (
             <div className="p-6 text-center text-gray-500 dark:text-gray-400 text-sm font-medium">
               No suggestions found for "{query}". Try pressing Enter to search.
             </div>
           )}
        </div>
      )}
    </div>
  );
}
