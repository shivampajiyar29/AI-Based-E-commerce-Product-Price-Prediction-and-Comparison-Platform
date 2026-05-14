# PriceSense — Deploy Guide

## ✅ Frontend is 100% self-contained — no backend needed to run or demo

---

## 🚀 Deploy to Vercel (Recommended — FREE, 2 minutes)

### Option A — Vercel CLI (fastest)
```bash
cd frontend
npm install
npm run build        # verify clean build first
npx vercel           # follow prompts → done!
```

### Option B — Vercel Dashboard (no CLI)
1. Push this repo to GitHub
2. Go to https://vercel.com → "New Project"
3. Import your GitHub repo
4. Set **Root Directory** = `frontend`
5. Framework: **Vite**
6. Build Command: `npm run build`
7. Output Directory: `dist`
8. Click **Deploy** → your site is live!

---

## 🌐 Deploy to Netlify (Alternative)
```bash
cd frontend
npm run build
npx netlify deploy --prod --dir=dist
```

Or drag-drop the `dist/` folder at https://app.netlify.com/drop

---

## 💻 Run Locally
```bash
cd frontend
npm install
npm run dev
# → http://localhost:5173
```

---

## 🔮 When Backend is Ready

The frontend is API-ready. In `src/utils/data.js`, replace the mock functions with real API calls:

```js
// Current (mock - works without backend)
export function searchProducts(query) { /* local DB search */ }
export function getPrediction(product) { /* local ML calc */ }

// Future (with backend)
export async function searchProducts(query) {
  const res = await fetch(`/api/products/search?q=${encodeURIComponent(query)}`)
  return res.json()
}
export async function getPrediction(product) {
  const res = await fetch('/api/predict/', { method:'POST', body: JSON.stringify(product), headers:{'Content-Type':'application/json'} })
  return res.json()
}
```

Backend runs on FastAPI:
```bash
cd backend
pip install -r requirements.txt
python -m app.ml.train    # train XGBoost model
uvicorn app.main:app --reload --port 8000
```

---

## 📱 Features Working Without Backend
- ✅ Search 30+ real products
- ✅ Compare prices across Amazon, Flipkart, Meesho, Myntra
- ✅ ML-style fair price prediction (XGBoost algorithm)
- ✅ Fake discount detection
- ✅ 12-month price trend charts
- ✅ Analytics dashboard with real computed stats
- ✅ User dashboard with localStorage persistence
- ✅ All 4 pages fully functional
