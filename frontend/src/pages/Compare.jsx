import { useEffect, useState, useCallback } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { Loader2, PackageSearch, RefreshCw } from 'lucide-react'
import SearchBar from '../components/SearchBar'
import PlatformCard from '../components/PlatformCard'
import PredictionPanel from '../components/PredictionPanel'
import PriceTrendChart from '../components/PriceTrendChart'
import { searchProducts, getListings, getPrediction, getTrend } from '../utils/data'

export default function Compare() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const [query,      setQuery]      = useState(searchParams.get('q') || '')
  const [results,    setResults]    = useState([])
  const [product,    setProduct]    = useState(null)
  const [listings,   setListings]   = useState([])
  const [prediction, setPrediction] = useState(null)
  const [trendData,  setTrendData]  = useState([])
  const [loading,    setLoading]    = useState(false)
  const [noResult,   setNoResult]   = useState(false)
  const [searched,   setSearched]   = useState(false)

  const runSearch = useCallback(q => {
    if (!q?.trim()) return
    setLoading(true)
    setNoResult(false)
    setSearched(true)
    setProduct(null)

    // Simulate scraping + ML delay for realism
    setTimeout(() => {
      const searchHits = searchProducts(q)
      if (!searchHits.length) {
        setNoResult(true)
        setResults([]); setProduct(null); setListings([]); setPrediction(null); setTrendData([])
      } else if (searchHits.length === 1) {
        const p = searchHits[0]
        setResults([p])
        setProduct(p)
        setListings(getListings(p))
        setPrediction(getPrediction(p))
        setTrendData(getTrend(p))
      } else {
        setResults(searchHits)
        // Don't auto-set product if multiple found
      }
      setLoading(false)
    }, 900)
  }, [])

  const selectProduct = (p) => {
    setProduct(p)
    setListings(getListings(p))
    setPrediction(getPrediction(p))
    setTrendData(getTrend(p))
  }

  useEffect(() => {
    const q = searchParams.get('q') || ''
    if (q) { setQuery(q); runSearch(q) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams.get('q')])

  const handleSearch = q => {
    setQuery(q)
    navigate(`/compare?q=${encodeURIComponent(q)}`, { replace: true })
    runSearch(q)
  }

  const bestPlatform = listings.length
    ? listings.reduce((a, b) => a.price < b.price ? a : b).platform
    : null

  return (
    <main className="max-w-7xl mx-auto px-6 py-8">
      {/* Search */}
      <div className="mb-8">
        <SearchBar query={query} setQuery={setQuery} onSearch={handleSearch} loading={loading} />
      </div>

      {/* Loading state */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-28 gap-5">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 border-4 border-emerald-100 rounded-full" />
            <div className="absolute inset-0 border-4 border-emerald-600 border-t-transparent rounded-full spinner" />
          </div>
          <div className="text-center">
            <div className="font-bold text-slate-700 text-lg">Analyzing prices…</div>
            <div className="text-sm text-slate-400 mt-1">Scraping platforms · Running ML model · Detecting fake discounts</div>
          </div>
          <div className="flex gap-2 mt-2">
            {['Amazon', 'Flipkart', 'Meesho', 'Myntra'].map((p, i) => (
              <div key={p} className="text-xs bg-white border border-slate-200 px-3 py-1.5 rounded-lg text-slate-500 font-medium" style={{ animationDelay: `${i * 0.15}s` }}>
                {p} ✓
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No result */}
      {!loading && noResult && (
        <div className="flex flex-col items-center justify-center py-28 gap-4 text-slate-400">
          <PackageSearch size={48} className="text-slate-200" />
          <div className="text-center">
            <div className="font-bold text-slate-600 text-lg">No results for "{query}"</div>
            <div className="text-sm mt-1">Try: iPhone 15, Sony WH-1000XM5, Boat headphones, MacBook Air M3, Samsung S24</div>
          </div>
        </div>
      )}

      {/* Multiple Results Selection */}
      {!loading && !product && results.length > 1 && (
        <div className="fade-up">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Search Results for "{query}"</h2>
              <p className="text-sm text-slate-400 mt-1">Found {results.length} matching models. Select one to analyze.</p>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {results.map((p) => (
              <button
                key={p.id}
                onClick={() => selectProduct(p)}
                className="card-hover p-5 text-left group border-2 border-transparent hover:border-emerald-500"
              >
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-3xl">{p.emoji}</span>
                  <div className="min-w-0">
                    <div className="font-bold text-slate-900 text-sm truncate">{p.name}</div>
                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{p.brand} · {p.category}</div>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs font-bold text-emerald-600">View Comparison</span>
                  <RefreshCw size={12} className="text-slate-300 group-hover:text-emerald-500 group-hover:rotate-180 transition-all duration-500" />
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Results */}
      {!loading && product && (
        <div className="space-y-6">
          {/* Header */}
          <div className="fade-up flex items-start justify-between">
            <div className="flex items-center gap-4">
              <span className="text-5xl">{product.emoji}</span>
              <div>
                <h1 className="text-2xl font-black text-slate-900 leading-tight">{product.name}</h1>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="text-xs font-semibold bg-slate-100 text-slate-600 px-2.5 py-1 rounded-lg">{product.brand}</span>
                  <span className="text-xs font-semibold bg-slate-100 text-slate-600 px-2.5 py-1 rounded-lg">{product.category}</span>
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <RefreshCw size={10} /> Updated just now
                  </span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-slate-400 mb-0.5">Lowest price found</div>
              <div className="text-3xl font-black text-emerald-600 mono">
                ₹{prediction?.minPrice?.toLocaleString('en-IN')}
              </div>
              <div className="text-xs text-slate-400 mt-0.5">on {bestPlatform?.charAt(0).toUpperCase() + bestPlatform?.slice(1)}</div>
            </div>
          </div>

          {/* 4 platform cards */}
          <div className="grid grid-cols-4 gap-4 fade-up-1">
            {listings.map((l, i) => (
              <PlatformCard
                key={l.platform}
                listing={l}
                isBest={l.platform === bestPlatform}
                brand={product.brand}
                delay={i + 1}
              />
            ))}
          </div>

          {/* ML Prediction */}
          <PredictionPanel prediction={prediction} product={product} />

          {/* Trend chart */}
          <PriceTrendChart productName={product.name} data={trendData} />
        </div>
      )}

      {/* Default empty state */}
      {!loading && !product && !noResult && !searched && (
        <div className="text-center py-28">
          <div className="text-7xl mb-5">🔍</div>
          <div className="font-bold text-slate-600 text-xl mb-2">Search for any product</div>
          <div className="text-sm text-slate-400">
            Try: iPhone 15, Sony WH-1000XM5, MacBook Air M3, Samsung S24, Boat Airdopes, JBL Charge 5…
          </div>
        </div>
      )}
    </main>
  )
}
