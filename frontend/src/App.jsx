import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Compare from './pages/Compare'
import Analytics from './pages/Analytics'
import Dashboard from './pages/Dashboard'
import Login from './pages/Login'
import Register from './pages/Register'

export default function App() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <Routes>
        <Route path="/"          element={<Home />} />
        <Route path="/compare"   element={<Compare />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/login"      element={<Login />} />
        <Route path="/register"   element={<Register />} />
        <Route path="*"          element={<Home />} />
      </Routes>
    </div>
  )
}
