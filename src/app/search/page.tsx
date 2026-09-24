import { Search as SearchIcon } from 'lucide-react';

export default function SearchPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-8 mt-12">
      <h1 className="text-4xl font-serif font-black text-gray-900 tracking-tight text-center">Search Intelligence</h1>
      
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <SearchIcon className="h-6 w-6 text-gray-400" />
        </div>
        <input 
          type="text" 
          placeholder="Search companies, topics, or historical events..." 
          className="block w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-lg text-lg focus:ring-0 focus:border-[#065F46] outline-none transition-colors shadow-sm"
        />
        <button className="absolute inset-y-2 right-2 bg-[#065F46] hover:bg-black text-white px-6 font-semibold rounded-md transition-colors">
          Search
        </button>
      </div>

      <div className="pt-8">
        <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-4">Trending Searches</h3>
        <div className="flex flex-wrap gap-2">
          {['OpenAI', 'Federal Reserve', 'Stripe', 'Anthropic', 'Indian Fintech', 'Semiconductors'].map(term => (
            <button key={term} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-full transition-colors">
              {term}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
