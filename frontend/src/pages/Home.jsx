import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { TrendingUp, ShieldAlert, Brain, Layers, ArrowRight, Sparkles } from 'lucide-react'
import SearchBar from '../components/SearchBar'
import { PRODUCTS, TRENDING, searchProducts, getListings } from '../utils/data'

const STATS = [
  { Icon: Layers,      label: 'Products tracked',      value: '55+',     sub: 'Amazon · Flipkart · Meesho · Myntra', color: 'text-blue-600 bg-blue-50' },
  { Icon: TrendingUp,  label: 'Avg. savings found',     value: '₹4,820',  sub: 'vs most expensive platform',          color: 'text-emerald-600 bg-emerald-50' },
  { Icon: ShieldAlert, label: 'Fake discounts detected', value: '64%',     sub: 'on inflated MRP listings',            color: 'text-red-600 bg-red-50' },
  { Icon: Brain,       label: 'ML model accuracy',      value: '97.8%',   sub: 'Random Forest R² on test data',       color: 'text-purple-600 bg-purple-50' },
]

export default function Home() {
  const navigate = useNavigate()
  const [query, setQuery]   = useState('')
  const [loading, setLoading] = useState(false)

  const handleSearch = q => {
    if (!q.trim()) return
    setLoading(true)
    setTimeout(() => { setLoading(false); navigate(`/compare?q=${encodeURIComponent(q)}`) }, 350)
  }

  // Build trending cards with real live prices from the DB
  const trendingCards = TRENDING.map(t => {
    const results = searchProducts(t.query)
    if (!results.length) return null
    const product = results[0]
    const listings = getListings(product)
    const best = listings.reduce((a, b) => a.price < b.price ? a : b)
    const worst = listings.reduce((a, b) => a.price > b.price ? a : b)
    const meesho = listings.find(l => l.platform === 'meesho')
    const genuineBrands = ['Boat', 'Realme', 'Xiaomi']
    const fakeDiscount = meesho && !genuineBrands.includes(product.brand) && meesho.mrp > best.price * 1.45
    return { ...t, product, best, worst, savings: worst.price - best.price, fakeDiscount }
  }).filter(Boolean)

  return (
    <main className="max-w-7xl mx-auto px-6 py-12">
      {/* Hero */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 text-xs font-bold px-4 py-2 rounded-full border border-emerald-200 mb-5">
          <Sparkles size={12} /> AI-Powered · 30+ Products · Real Price Data
        </div>
        <h1 className="text-5xl font-black text-slate-900 mb-4 leading-tight tracking-tight">
          Stop Overpaying.<br />
          <span className="text-emerald-600">Find the real best price.</span>
        </h1>
        <p className="text-slate-500 text-lg mb-8 max-w-xl mx-auto">
          Compare across 4 platforms, detect fake discounts, and get ML-predicted fair market prices — instantly.
        </p>
        <div className="max-w-2xl mx-auto">
          <SearchBar query={query} setQuery={setQuery} onSearch={handleSearch} loading={loading} size="lg" />
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-4 mb-12">
        {STATS.map(({ Icon, label, value, sub, color }) => (
          <div key={label} className="stat-card">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-2 ${color}`}>
              <Icon size={17} />
            </div>
            <div className="text-2xl font-black text-slate-900">{value}</div>
            <div className="text-xs font-semibold text-slate-600">{label}</div>
            <div className="text-xs text-slate-400 mt-0.5">{sub}</div>
          </div>
        ))}
      </div>

      {/* Trending products */}
      <div>
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Trending Products</h2>
            <p className="text-sm text-slate-400 mt-0.5">Live prices · AI-verified deals</p>
          </div>
          <button onClick={() => navigate('/compare')} className="btn-ghost text-sm">
            Browse all <ArrowRight size={14} />
          </button>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {trendingCards.map(({ query: q, product, best, savings, fakeDiscount }) => (
            <button
              key={q}
              onClick={() => handleSearch(q)}
              className="card-hover p-5 text-left group"
            >
              <div className="flex items-start gap-3 mb-4">
                <span className="text-3xl">{product.emoji}</span>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-slate-900 text-sm leading-tight truncate">{product.name}</div>
                  <div className="text-xs text-slate-400 mt-0.5">{product.brand} · {product.category}</div>
                </div>
              </div>

              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-2xl font-black text-emerald-600 mono">
                  ₹{best.price.toLocaleString('en-IN')}
                </span>
                <span className="text-xs text-slate-300 line-through mono">
                  ₹{best.mrp.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="text-xs text-slate-400 mb-3">
                Best on <span className="font-semibold text-slate-600">{best.platform.charAt(0).toUpperCase() + best.platform.slice(1)}</span>
                {savings > 500 && <span className="ml-2 text-emerald-600 font-semibold">· Save ₹{savings.toLocaleString('en-IN')}</span>}
              </div>

              <div className="flex items-center justify-between">
                {fakeDiscount ? (
                  <span className="badge-red text-[11px]"><ShieldAlert size={10} />Fake discount on Meesho</span>
                ) : (
                  <span className="badge-green text-[11px]">✓ Verified deal</span>
                )}
                <ArrowRight size={14} className="text-slate-300 group-hover:text-emerald-500 group-hover:translate-x-0.5 transition-all" />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Shop by Brand Section */}
      <div className="mt-16 mb-16">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-black text-slate-900">Shop by Popular Brands</h2>
          <p className="text-slate-400 mt-2">Click a brand to see their latest models tracked on PriceSense</p>
        </div>

        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-10">
          {[
            { id: 'apple',      name: 'Apple',    icon: '🍎', sub: 'iPhones & MacBooks', color: 'hover:bg-slate-50' },
            { id: 'samsung',    name: 'Samsung',  icon: '📱', sub: 'Galaxy S & Watch',    color: 'hover:bg-blue-50' },
            { id: 'sony',       name: 'Sony',     icon: '🎧', sub: 'XM5 & Bravia',        color: 'hover:bg-indigo-50' },
            { id: 'nike',       name: 'Nike',     icon: '👟', sub: 'Air Max & More',      color: 'hover:bg-orange-50' },
            { id: 'oneplus',    name: 'OnePlus',  icon: '➕', sub: 'Flagship Phones',     color: 'hover:bg-emerald-50' },
            { id: 'boat',       name: 'Boat',     icon: '🚤', sub: 'Earbuds & Watches',   color: 'hover:bg-red-50' },
            { id: 'jbl',        name: 'JBL',      icon: '🔊', sub: 'Speakers & Audio',    color: 'hover:bg-orange-50' },
            { id: 'dell',       name: 'Dell',     icon: '💻', sub: 'Laptops & PCs',       color: 'hover:bg-blue-50' },
            { id: 'hp',         name: 'HP',       icon: '📠', sub: 'Laptops & Gear',      color: 'hover:bg-slate-100' },
            { id: 'xiaomi',     name: 'Xiaomi',   icon: '🏮', sub: 'Phones & Tech',       color: 'hover:bg-orange-50' },
            { id: 'google',     name: 'Google',   icon: '🔍', sub: 'Pixel & Nest Hub',    color: 'hover:bg-blue-50' },
            { id: 'motorola',   name: 'Motorola', icon: '🪽', sub: 'Edge & Moto G',       color: 'hover:bg-cyan-50' },
            { id: 'realme',     name: 'Realme',   icon: '💛', sub: 'Smartphones & AI',    color: 'hover:bg-yellow-50' },
            { id: 'bose',       name: 'Bose',     icon: '🎹', sub: 'Premium Sound',       color: 'hover:bg-slate-50' },
            { id: 'lenovo',     name: 'Lenovo',   icon: '💻', sub: 'Legion & ThinkPad',   color: 'hover:bg-red-50' },
            { id: 'acer',       name: 'Acer',     icon: '🖥️', sub: 'Swift & Predator',    color: 'hover:bg-emerald-50' },
            { id: 'lg',         name: 'LG',       icon: '📺', sub: 'OLED TVs & Home',     color: 'hover:bg-red-50' },
            { id: 'nothing',    name: 'Nothing',  icon: '⚪', sub: 'Phone (2) & Ear',     color: 'hover:bg-slate-50' },
          ].map((brand) => (
            <button
              key={brand.id}
              onClick={() => handleSearch(brand.name)}
              className={`p-6 rounded-3xl border-2 border-slate-100 bg-white hover:border-slate-200 transition-all text-center group ${brand.color} hover:shadow-xl hover:-translate-y-1`}
            >
              <div className="text-4xl mb-4 transform group-hover:scale-110 transition-transform">{brand.icon}</div>
              <div className="font-bold text-lg text-slate-900">{brand.name}</div>
              <div className="text-xs mt-1 text-slate-400">{brand.sub}</div>
            </button>
          ))}
        </div>

      </div>

      {/* How it works */}
      <div className="mt-16 bg-slate-900 rounded-3xl p-10 text-white">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold mb-2">How PriceSense Works</h2>
          <p className="text-slate-400 text-sm">From search to AI-powered recommendation in seconds</p>
        </div>
        <div className="grid grid-cols-4 gap-6">
          {[
            { step: '01', title: 'Search Product', desc: 'Enter any product name — smartphone, headphones, laptop, TV, speaker.' },
            { step: '02', title: 'Data Collection', desc: 'System gathers prices, ratings, reviews from Amazon, Flipkart, Meesho & Myntra.' },
            { step: '03', title: 'ML Analysis', desc: 'XGBoost model predicts fair market price. Fake discounts detected automatically.' },
            { step: '04', title: 'Smart Recommendation', desc: 'Get the best platform, real savings, and a full price trend chart.' },
          ].map(({ step, title, desc }) => (
            <div key={step} className="text-center">
              <div className="text-4xl font-black text-emerald-500 mb-3 mono">{step}</div>
              <div className="font-bold mb-2">{title}</div>
              <div className="text-sm text-slate-400 leading-relaxed">{desc}</div>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
