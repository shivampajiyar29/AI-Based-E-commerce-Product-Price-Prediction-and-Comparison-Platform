import { Link, useLocation } from 'react-router-dom'
import { Brain, Home, ArrowLeftRight, BarChart2, LayoutDashboard } from 'lucide-react'

const LINKS = [
  { to: '/',          label: 'Home',      Icon: Home },
  { to: '/compare',   label: 'Compare',   Icon: ArrowLeftRight },
  { to: '/analytics', label: 'Analytics', Icon: BarChart2 },
  { to: '/dashboard', label: 'Dashboard', Icon: LayoutDashboard },
]

export default function Navbar() {
  const { pathname } = useLocation()
  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-600 flex items-center justify-center shadow-sm">
            <Brain size={16} className="text-white" />
          </div>
          <span className="font-bold text-slate-900 text-lg tracking-tight">PriceSense</span>
          <span className="text-[10px] font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200">AI</span>
        </Link>

        <nav className="flex items-center gap-1">
          {LINKS.map(({ to, label, Icon }) => {
            const active = pathname === to
            return (
              <Link key={to} to={to} className={`flex items-center gap-1.5 text-sm px-3.5 py-2 rounded-xl font-medium transition-all duration-150 ${
                active
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
              }`}>
                <Icon size={14} />
                {label}
              </Link>
            )
          })}
        </nav>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-1.5 text-xs text-slate-400 bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-lg">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Live Data
          </div>
          
          {localStorage.getItem('token') ? (
            <button 
              onClick={() => { localStorage.removeItem('token'); window.location.href = '/login' }}
              className="text-sm font-medium text-slate-600 hover:text-slate-900 px-3 py-2 rounded-xl transition-colors"
            >
              Logout
            </button>
          ) : (
            <Link 
              to="/login"
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium px-5 py-2 rounded-xl transition-all shadow-sm shadow-emerald-200"
            >
              Login
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
