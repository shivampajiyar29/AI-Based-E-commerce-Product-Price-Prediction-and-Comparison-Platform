import { Search, Loader2 } from 'lucide-react'

const CHIPS = [
  'iPhone 15', 'Sony WH-1000XM5', 'Samsung S24',
  'MacBook Air M3', 'Boat Airdopes', 'JBL Charge 5',
]

export default function SearchBar({ query, setQuery, onSearch, loading, size = 'md' }) {
  const isLg = size === 'lg'
  return (
    <div className="w-full">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && query.trim() && onSearch(query)}
            placeholder="Search: iPhone 15, Sony WH-1000XM5, Boat headphones..."
            className={`w-full pl-10 pr-4 font-medium bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 placeholder:text-slate-400 transition-all ${
              isLg ? 'py-3.5 text-base' : 'py-2.5 text-sm'
            }`}
          />
        </div>
        <button
          onClick={() => query.trim() && onSearch(query)}
          disabled={loading || !query.trim()}
          className={`btn-primary disabled:opacity-50 disabled:cursor-not-allowed shrink-0 ${isLg ? 'px-6 py-3.5 text-base' : ''}`}
        >
          {loading
            ? <><Loader2 size={15} className="spinner" />Analyzing…</>
            : <><Search size={15} />Analyze</>}
        </button>
      </div>

      <div className="flex gap-2 flex-wrap mt-3 items-center">
        <span className="text-xs text-slate-400 font-medium">Try:</span>
        {CHIPS.map(c => (
          <button
            key={c}
            onClick={() => { setQuery(c); onSearch(c) }}
            className="text-xs bg-white border border-slate-200 px-3 py-1.5 rounded-lg hover:border-emerald-400 hover:text-emerald-700 hover:bg-emerald-50 transition-all font-medium"
          >
            {c}
          </button>
        ))}
      </div>
    </div>
  )
}
