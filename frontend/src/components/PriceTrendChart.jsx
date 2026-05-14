import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, ReferenceLine,
} from 'recharts'

const fmt = v => `₹${(v / 1000).toFixed(0)}k`

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-lg p-3 text-xs">
      <div className="font-bold text-slate-700 mb-2">{label}</div>
      {payload.map(p => (
        <div key={p.name} className="flex justify-between gap-4 mb-1">
          <span style={{ color: p.color }} className="font-medium">{p.name}</span>
          <span className="font-bold text-slate-800 mono">₹{p.value?.toLocaleString('en-IN')}</span>
        </div>
      ))}
    </div>
  )
}

export default function PriceTrendChart({ data = [], productName }) {
  return (
    <div className="card p-6 fade-up-4">
      <div className="flex items-center justify-between mb-5">
        <div>
          <div className="section-title mb-0.5">12-Month Price Trend</div>
          {productName && <div className="text-xs text-slate-400">{productName}</div>}
        </div>
        <div className="flex items-center gap-4 text-xs">
          <span className="flex items-center gap-1.5"><span className="w-6 h-0.5 bg-orange-400 inline-block rounded" />Amazon</span>
          <span className="flex items-center gap-1.5"><span className="w-6 h-0.5 bg-blue-500 inline-block rounded" />Flipkart</span>
          <span className="flex items-center gap-1.5 text-emerald-600 font-medium"><span className="w-6 border-t-2 border-dashed border-emerald-500 inline-block" />AI Fair Price</span>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={240}>
        <LineChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
          <YAxis tickFormatter={fmt} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} width={48} />
          <Tooltip content={<CustomTooltip />} />
          <Line type="monotone" dataKey="Amazon"   stroke="#f97316" strokeWidth={2.5} dot={false} />
          <Line type="monotone" dataKey="Flipkart" stroke="#3b82f6" strokeWidth={2.5} dot={false} />
          <Line type="monotone" dataKey="AI Fair"  stroke="#10b981" strokeWidth={2}   dot={false} strokeDasharray="6 4" />
        </LineChart>
      </ResponsiveContainer>
      <p className="text-xs text-slate-400 text-center mt-3">
        Trend shows historical pricing patterns — AI fair price is the ML-predicted market value
      </p>
    </div>
  )
}
