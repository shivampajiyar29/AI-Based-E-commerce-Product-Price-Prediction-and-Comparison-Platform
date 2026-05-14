import { Bot, CheckCircle, AlertTriangle, TrendingUp, TrendingDown, Minus, Zap } from 'lucide-react'
import { PLATFORM_META } from '../utils/data'

const PNAME = p => PLATFORM_META[p]?.label || p

const STATUS = {
  overpriced:  { label: 'Price varies significantly — some platforms overcharge', Icon: TrendingUp,   cls: 'text-red-600 bg-red-50 border-red-200' },
  underpriced: { label: 'Great deal — below market price!',                        Icon: TrendingDown, cls: 'text-blue-600 bg-blue-50 border-blue-200' },
  fair:        { label: 'Fair price across platforms',                              Icon: Minus,        cls: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
}

const ModelBar = ({ label, r2, color, active }) => (
  <div>
    <div className="flex justify-between items-center mb-1">
      <span className={`text-xs font-medium ${active ? 'text-slate-800' : 'text-slate-400'}`}>{label}</span>
      <span className={`text-xs mono font-semibold ${active ? 'text-emerald-600' : 'text-slate-400'}`}>{r2.toFixed(3)}</span>
    </div>
    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
      <div className="h-full rounded-full" style={{ width: `${r2 * 100}%`, background: color }} />
    </div>
  </div>
)

export default function PredictionPanel({ prediction, product }) {
  if (!prediction || !product) return null
  const s = STATUS[prediction.status] || STATUS.fair
  const { Icon } = s

  const sortedPlatforms = ['amazon','flipkart','meesho','myntra']
    .map(p => ({ p, price: product[p].price, rating: product[p].rating }))
    .sort((a, b) => a.price - b.price)

  return (
    <div className="card p-6 fade-up-3">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center">
            <Bot size={18} className="text-emerald-700" />
          </div>
          <div>
            <div className="font-bold text-slate-900">AI / ML Price Analysis</div>
            <div className="text-xs text-slate-400">XGBoost · Random Forest · Linear Regression</div>
          </div>
        </div>
        <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl">
          <Zap size={12} className="text-emerald-600" />
          <span className="text-xs font-bold text-emerald-700">{prediction.confidence}% confidence</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Left col — fair price + model bars */}
        <div>
          <div className="text-xs text-slate-400 font-medium mb-1.5">Predicted Fair Market Price</div>
          <div className="text-4xl font-black text-emerald-600 mono mb-3">
            ₹{prediction.fairPrice.toLocaleString('en-IN')}
          </div>
          <div className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border mb-4 ${s.cls}`}>
            <Icon size={12} />{s.label}
          </div>

          <div className="bg-slate-50 rounded-xl p-3.5 space-y-2.5 mb-4">
            <div className="flex justify-between items-center">
              <span className="text-xs text-slate-500">Customer Value Score</span>
              <span className="text-sm font-black text-purple-600 mono">{prediction.customerValueScore} / 35</span>
            </div>
            <div className="flex justify-between items-center border-t border-slate-200 pt-2.5">
              <span className="text-xs text-slate-500">Lowest price</span>
              <span className="text-sm font-bold text-emerald-600 mono">₹{prediction.minPrice.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-slate-500">Highest price</span>
              <span className="text-sm font-bold text-red-500 mono">₹{prediction.maxPrice.toLocaleString('en-IN')}</span>
            </div>
          </div>

          <div className="space-y-2.5">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Model Accuracy (R²)</div>
            <ModelBar label="Linear Regression" r2={0.055} color="#94a3b8" active={false} />
            <ModelBar label="XGBoost"           r2={0.976} color="#60a5fa" active={false} />
            <ModelBar label="Random Forest ✓ Best" r2={0.978} color="#10b981" active={true} />
            <div className="flex justify-between text-xs text-slate-400 pt-1">
              <span>MAE: ₹{prediction.mae.toLocaleString('en-IN')}</span>
              <span>Total R²: {prediction.r2}</span>
            </div>
          </div>
        </div>

        {/* Right cols — recommendation + fake + ranking */}
        <div className="col-span-2 space-y-4">
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
            <div className="flex items-center gap-2 font-bold text-emerald-800 mb-2 text-sm">
              <CheckCircle size={15} />
              Recommendation: Buy on {PNAME(prediction.bestPlatform)}
            </div>
            <p className="text-sm text-emerald-900 leading-relaxed">{prediction.recommendation}</p>
          </div>

          {prediction.fakeDiscount && prediction.fakePlatforms?.map(fp => (
            <div key={fp} className="bg-red-50 border border-red-200 rounded-xl p-4">
              <div className="flex items-center gap-2 font-bold text-red-700 mb-2 text-sm">
                <AlertTriangle size={15} />
                Fake Discount Detected on {PNAME(fp)}
              </div>
              <p className="text-sm text-red-800 leading-relaxed">
                {PNAME(fp)}'s listed MRP is ₹{product[fp].mrp.toLocaleString('en-IN')} — 
                {' '}{Math.round(((product[fp].mrp - prediction.fairPrice) / prediction.fairPrice) * 100)}% above 
                fair market value. Actual price is ₹{product[fp].price.toLocaleString('en-IN')}, 
                making the "discount" misleading. Real savings vs best deal = only ₹{Math.abs(product[fp].price - prediction.minPrice).toLocaleString('en-IN')}.
              </p>
            </div>
          ))}

          <div className="card p-4">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Platform Price Ranking</div>
            <div className="space-y-2">
              {sortedPlatforms.map(({ p, price, rating }, i) => {
                const meta = PLATFORM_META[p]
                const isBest = i === 0
                return (
                  <div key={p} className={`flex items-center justify-between px-3 py-2.5 rounded-xl ${isBest ? 'bg-emerald-50 border border-emerald-200' : 'bg-slate-50'}`}>
                    <div className="flex items-center gap-3">
                      <span className={`text-xs font-black w-5 text-center ${isBest ? 'text-emerald-600' : 'text-slate-400'}`}>#{i+1}</span>
                      <span className="text-sm font-semibold" style={{ color: meta.text }}>{meta.label}</span>
                      <span className="text-xs text-slate-400">★ {rating}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {isBest && <span className="badge-green text-[10px]">BEST</span>}
                      <span className={`text-sm font-bold mono ${isBest ? 'text-emerald-700' : 'text-slate-600'}`}>₹{price.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
