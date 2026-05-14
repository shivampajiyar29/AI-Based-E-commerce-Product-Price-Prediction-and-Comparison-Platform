import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, BookmarkCheck, History, Trash2, Clock, Plus, X, Check } from 'lucide-react'
import { PRODUCTS, getListings, getPrediction } from '../utils/data'

// ─── Persistent state via localStorage ───────────────────────────────────────
const load = (key, def) => { try { return JSON.parse(localStorage.getItem(key)) ?? def } catch { return def } }
const save = (key, val) => { try { localStorage.setItem(key, JSON.stringify(val)) } catch {} }

const DEFAULT_ALERTS = [
  { id: 1, product: 'iPhone 15 128GB',    target: 65000, platform: 'Any',      triggered: false },
  { id: 2, product: 'Samsung Galaxy S24', target: 70000, platform: 'Flipkart', triggered: true  },
  { id: 3, product: 'Sony WH-1000XM5',   target: 22000, platform: 'Any',      triggered: false },
  { id: 4, product: 'MacBook Air M3',     target: 105000, platform: 'Amazon',  triggered: false },
]

const DEFAULT_HISTORY = [
  { id: 1, product: 'Boat Rockerz 550',         date: 'May 12, 2026', status: 'fair',       platform: 'Flipkart', price: 1299  },
  { id: 2, product: 'Samsung Galaxy S24 256GB', date: 'May 11, 2026', status: 'overpriced', platform: 'Myntra',   price: 78000 },
  { id: 3, product: 'iPhone 15 128GB',          date: 'May 10, 2026', status: 'overpriced', platform: 'Amazon',   price: 72999 },
  { id: 4, product: 'Sony WH-1000XM5',          date: 'May 9, 2026',  status: 'fair',       platform: 'Flipkart', price: 24990 },
  { id: 5, product: 'JBL Charge 5',             date: 'May 8, 2026',  status: 'fair',       platform: 'Flipkart', price: 13499 },
  { id: 6, product: 'MacBook Air M3',           date: 'May 7, 2026',  status: 'overpriced', platform: 'Myntra',   price: 116000},
]

const SAVED_IDS = [1, 3, 8, 18, 25, 10]

export default function Dashboard() {
  const navigate = useNavigate()
  const [alerts,  setAlerts]  = useState(() => load('ps_alerts',  DEFAULT_ALERTS))
  const [showAdd, setShowAdd] = useState(false)
  const [newAlert, setNewAlert] = useState({ product: '', target: '', platform: 'Any' })

  useEffect(() => save('ps_alerts', alerts), [alerts])

  const deleteAlert = id => setAlerts(prev => prev.filter(a => a.id !== id))
  const addAlert = () => {
    if (!newAlert.product || !newAlert.target) return
    const a = { id: Date.now(), ...newAlert, target: Number(newAlert.target), triggered: false }
    setAlerts(prev => [a, ...prev])
    setNewAlert({ product: '', target: '', platform: 'Any' })
    setShowAdd(false)
  }

  // Build saved products with live DB prices
  const savedProducts = SAVED_IDS.map(id => {
    const p = PRODUCTS.find(x => x.id === id)
    if (!p) return null
    const listings = getListings(p)
    const best = listings.reduce((a, b) => a.price < b.price ? a : b)
    const pred = getPrediction(p)
    return { ...p, best, prediction: pred }
  }).filter(Boolean)

  return (
    <main className="max-w-7xl mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-black text-slate-900">My Dashboard</h1>
        <p className="text-sm text-slate-400 mt-1">Track alerts · View history · Manage saved products</p>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-6">
        {/* Price alerts */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <Bell size={15} className="text-emerald-600" />
              <span className="font-bold text-slate-800">Price Alerts</span>
              <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-medium">{alerts.length}</span>
            </div>
            <button onClick={() => setShowAdd(!showAdd)} className="btn-ghost text-xs py-1.5 px-3">
              <Plus size={12} /> Add Alert
            </button>
          </div>

          {/* Add alert form */}
          {showAdd && (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-4 space-y-3">
              <input
                placeholder="Product name (e.g. iPhone 15)"
                value={newAlert.product}
                onChange={e => setNewAlert(p => ({ ...p, product: e.target.value }))}
                className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 bg-white"
              />
              <div className="flex gap-2">
                <input
                  type="number" placeholder="Target price (₹)"
                  value={newAlert.target}
                  onChange={e => setNewAlert(p => ({ ...p, target: e.target.value }))}
                  className="flex-1 text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 bg-white"
                />
                <select
                  value={newAlert.platform}
                  onChange={e => setNewAlert(p => ({ ...p, platform: e.target.value }))}
                  className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none"
                >
                  {['Any','Amazon','Flipkart','Meesho','Myntra'].map(pl => <option key={pl}>{pl}</option>)}
                </select>
              </div>
              <div className="flex gap-2">
                <button onClick={addAlert} className="btn-primary text-xs py-2 px-4 flex-1 justify-center">
                  <Check size={12} /> Save Alert
                </button>
                <button onClick={() => setShowAdd(false)} className="btn-ghost text-xs py-2 px-4">
                  <X size={12} /> Cancel
                </button>
              </div>
            </div>
          )}

          <div className="divide-y divide-slate-50">
            {alerts.map(a => (
              <div key={a.id} className="flex items-center justify-between py-3.5">
                <div>
                  <div className="text-sm font-semibold text-slate-800">{a.product}</div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    Alert when below <span className="font-mono font-semibold text-slate-600">₹{Number(a.target).toLocaleString('en-IN')}</span> · {a.platform}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${a.triggered ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}`}>
                    {a.triggered ? '✓ Triggered' : '● Watching'}
                  </span>
                  <button onClick={() => deleteAlert(a.id)} className="text-slate-200 hover:text-red-400 transition-colors p-1">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Prediction history */}
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-5">
            <History size={15} className="text-emerald-600" />
            <span className="font-bold text-slate-800">Prediction History</span>
          </div>
          <div className="divide-y divide-slate-50">
            {DEFAULT_HISTORY.map(h => (
              <div key={h.id} className="flex items-center justify-between py-3.5">
                <div>
                  <div className="text-sm font-semibold text-slate-800">{h.product}</div>
                  <div className="text-xs text-slate-400 mt-0.5 flex items-center gap-1.5">
                    <Clock size={10} />
                    {h.date} · Best: {h.platform} · <span className="mono">₹{h.price.toLocaleString('en-IN')}</span>
                  </div>
                </div>
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${h.status === 'fair' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                  {h.status === 'fair' ? '✓ Fair' : '⚠ Overpriced'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Saved products */}
      <div className="card p-5">
        <div className="flex items-center gap-2 mb-5">
          <BookmarkCheck size={15} className="text-emerald-600" />
          <span className="font-bold text-slate-800">Saved Products</span>
          <span className="text-xs text-slate-400 font-normal">· Click any card to compare live prices</span>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {savedProducts.map(p => (
            <button
              key={p.id}
              onClick={() => navigate(`/compare?q=${encodeURIComponent(p.name)}`)}
              className="card-hover p-4 text-left group"
            >
              <div className="flex items-center gap-2.5 mb-3">
                <span className="text-2xl">{p.emoji}</span>
                <div>
                  <div className="text-xs font-semibold text-slate-400">{p.brand}</div>
                  <div className="text-xs text-slate-400">{p.category}</div>
                </div>
              </div>
              <div className="text-sm font-bold text-slate-800 mb-2 leading-tight">{p.name}</div>
              <div className="text-xl font-black text-emerald-600 mono">₹{p.best.price.toLocaleString('en-IN')}</div>
              <div className="flex items-center justify-between mt-1">
                <div className="text-xs text-slate-400">
                  Best on <span className="font-semibold text-slate-600 capitalize">{p.best.platform}</span>
                  <span className="ml-1 text-emerald-600">· {p.best.discount}% off</span>
                </div>
              </div>
              <div className="mt-2 text-xs text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity font-medium">
                Compare prices →
              </div>
            </button>
          ))}
        </div>
      </div>
    </main>
  )
}
