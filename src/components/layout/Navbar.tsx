"use client";

import Link from 'next/link';
import { Search, Bookmark, Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

export function Navbar() {
  const { theme, setTheme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const currentTheme = theme === 'system' ? systemTheme : theme;

  return (
    <header className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 sticky top-0 z-50 transition-colors duration-300">
      {/* Top accent line */}
      <div className="h-1 w-full bg-[#065F46]" />
      
      <div className="max-w-7xl mx-auto px-4 h-[72px] flex items-center justify-between">
        <div className="flex items-center gap-10">
          <Link href="/" className="flex items-center gap-2 group">
            <span className="font-serif font-black text-3xl tracking-tight text-gray-900 dark:text-white group-hover:text-[#065F46] dark:group-hover:text-[#065F46] transition-colors">
              INTEL
            </span>
          </Link>
          <nav className="hidden md:flex items-center gap-7 text-[13px] uppercase tracking-wider font-semibold text-gray-500 dark:text-gray-400">
            <Link href="/category/ai" className="hover:text-[#065F46] dark:hover:text-[#065F46] transition-colors">AI</Link>
            <Link href="/category/fintech" className="hover:text-[#065F46] dark:hover:text-[#065F46] transition-colors">Fintech</Link>
            <Link href="/category/technology" className="hover:text-[#065F46] dark:hover:text-[#065F46] transition-colors">Technology</Link>
            <Link href="/category/finance" className="hover:text-[#065F46] dark:hover:text-[#065F46] transition-colors">Finance</Link>
            <Link href="/category/startups" className="hover:text-[#065F46] dark:hover:text-[#065F46] transition-colors">Startups</Link>
          </nav>
        </div>
        
        <div className="flex items-center gap-3 text-gray-500 dark:text-gray-400">
          <Link href="/search" className="p-2 hover:text-[#065F46] transition-colors" aria-label="Search">
            <Search className="w-5 h-5" />
          </Link>
          <Link href="/saved" className="p-2 hover:text-[#065F46] transition-colors" aria-label="Watchlist">
            <Bookmark className="w-5 h-5" />
          </Link>
          <button 
            onClick={() => setTheme(currentTheme === 'dark' ? 'light' : 'dark')}
            className="p-2 hover:text-[#065F46] transition-colors" 
            aria-label="Toggle Dark Mode"
          >
            {mounted && currentTheme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </header>
  );
}
