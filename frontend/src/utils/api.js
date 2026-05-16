import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  headers: { 'Content-Type': 'application/json' },
})

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// ── Products ──────────────────────────────────────────────────────────────────
export const searchProducts   = (q)          => api.get(`/products/search?q=${encodeURIComponent(q)}`)
export const compareProduct   = (id)         => api.get(`/products/${id}/compare`)
export const priceHistory     = (id, plat)   => api.get(`/products/${id}/history${plat ? `?platform=${plat}` : ''}`)

// ── ML Prediction ─────────────────────────────────────────────────────────────
export const predictPrice     = (payload)    => api.post('/predict/', payload)

// ── Analytics ─────────────────────────────────────────────────────────────────
export const analyticsSummary = ()           => api.get('/analytics/summary')
export const featureImportance = ()          => api.get('/analytics/feature-importance')
export const platformComparison = ()         => api.get('/analytics/platform-comparison')

// ── Auth ──────────────────────────────────────────────────────────────────────
export const register         = (data)       => api.post('/auth/register', data)
export const login = (data) => {
  // If data is FormData, axios will handle it, but we need x-www-form-urlencoded for OAuth2
  if (data instanceof FormData) {
    const params = new URLSearchParams();
    for (const [key, value] of data.entries()) {
      params.append(key, value);
    }
    return api.post('/auth/login', params, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });
  }
  return api.post('/auth/login', data);
}

// ── User ──────────────────────────────────────────────────────────────────────
export const getAlerts        = (uid)        => api.get(`/users/${uid}/alerts`)
export const createAlert      = (uid, data)  => api.post(`/users/${uid}/alerts`, data)
export const deleteAlert      = (uid, aid)   => api.delete(`/users/${uid}/alerts/${aid}`)
export const getSaved         = (uid)        => api.get(`/users/${uid}/saved`)
export const saveProduct      = (uid, pid)   => api.post(`/users/${uid}/saved/${pid}`)
export const getHistory       = (uid)        => api.get(`/users/${uid}/history`)

export default api
