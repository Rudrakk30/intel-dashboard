import Link from 'next/link';
import { Search, Bookmark, Moon } from 'lucide-react';

export function Navbar() {
  return (
    <header className="border-b border-gray-200 bg-white sticky top-0 z-50">
      {/* Top accent line */}
      <div className="h-1 w-full bg-[#065F46]" />
      
      <div className="max-w-7xl mx-auto px-4 h-[72px] flex items-center justify-between">
        <div className="flex items-center gap-10">
          <Link href="/" className="flex items-center gap-2 group">
            <span className="font-serif font-black text-3xl tracking-tight text-gray-900 group-hover:text-[#065F46] transition-colors">
              INTEL
            </span>
          </Link>
          <nav className="hidden md:flex items-center gap-7 text-[13px] uppercase tracking-wider font-semibold text-gray-500">
            <Link href="/category/ai" className="hover:text-[#065F46] transition-colors">AI</Link>
            <Link href="/category/fintech" className="hover:text-[#065F46] transition-colors">Fintech</Link>
            <Link href="/category/technology" className="hover:text-[#065F46] transition-colors">Technology</Link>
            <Link href="/category/finance" className="hover:text-[#065F46] transition-colors">Finance</Link>
            <Link href="/category/startups" className="hover:text-[#065F46] transition-colors">Startups</Link>
          </nav>
        </div>
        
        <div className="flex items-center gap-3 text-gray-500">
          <Link href="/search" className="p-2 hover:text-[#065F46] transition-colors" aria-label="Search">
            <Search className="w-5 h-5" />
          </Link>
          <button className="p-2 hover:text-[#065F46] transition-colors" aria-label="Watchlist">
            <Bookmark className="w-5 h-5" />
          </button>
          {/* Day/Night Mode Toggle Placeholder */}
          <button className="p-2 hover:text-[#065F46] transition-colors" aria-label="Toggle Dark Mode">
            <Moon className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
}
