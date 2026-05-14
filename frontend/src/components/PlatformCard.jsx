import { Star, Truck, ShieldCheck, ShieldAlert, ExternalLink } from 'lucide-react'
import { PLATFORM_META } from '../utils/data'

export default function PlatformCard({ listing, isBest, brand, delay = 0 }) {
  const meta = PLATFORM_META[listing.platform]

  // Genuine deep-discount brands — don't flag as fake
  const genuineBrands = ['Boat', 'Realme', 'Xiaomi']
  const isFake =
    listing.platform === 'meesho' &&
    listing.mrp > listing.price * 1.45 &&
    !genuineBrands.includes(brand)

  const stars = Math.round(listing.rating)

  return (
    <div
      className={`relative bg-white rounded-2xl border-2 flex flex-col p-5 transition-all duration-200 hover:shadow-lg fade-up-${delay} ${
        isBest
          ? 'border-emerald-500 shadow-emerald-100 shadow-md'
          : 'border-slate-100 hover:border-slate-200'
      }`}
    >
      {/* Best value ribbon */}
      {isBest && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-emerald-600 text-white text-[11px] font-bold px-4 py-1 rounded-full shadow-sm whitespace-nowrap tracking-wide">
          ✓ BEST VALUE
        </div>
      )}

      {/* Platform name */}
      <div
        className="text-sm font-bold mb-4 px-2.5 py-1.5 rounded-lg w-fit"
        style={{ color: meta.text, background: meta.bg, border: `1px solid ${meta.border}` }}
      >
        {meta.label}
      </div>

      {/* Price */}
      <div className="mb-1">
        <span className="text-3xl font-bold text-slate-900 mono">
          ₹{listing.price.toLocaleString('en-IN')}
        </span>
      </div>

      {/* MRP */}
      {listing.mrp > listing.price && (
        <div className="text-xs text-slate-400 mb-3">
          MRP <span className="line-through">₹{listing.mrp.toLocaleString('en-IN')}</span>
        </div>
      )}

      {/* Discount badge */}
      {listing.discount > 0 && (
        <div className="mb-4">
          {isFake ? (
            <span className="badge-red">
              <ShieldAlert size={11} />
              ⚠ Fake {listing.discount}% off
            </span>
          ) : (
            <span className="badge-green">
              <ShieldCheck size={11} />
              {listing.discount}% off
            </span>
          )}
        </div>
      )}

      <div className="flex-1" />

      {/* Rating */}
      <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-2">
        <span className="text-amber-400 tracking-tighter text-sm">
          {'★'.repeat(stars)}{'☆'.repeat(5 - stars)}
        </span>
        <span className="font-medium text-slate-600">{listing.rating}</span>
        <span className="text-slate-300">·</span>
        <span>{listing.reviews.toLocaleString('en-IN')} reviews</span>
      </div>

      {/* Delivery */}
      <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-4">
        <Truck size={12} />
        <span>{listing.free ? 'Free delivery' : 'Paid delivery'} · {listing.days} day{listing.days > 1 ? 's' : ''}</span>
      </div>

      {/* CTA */}
      <a
        href={`https://www.${listing.platform === 'myntra' ? 'myntra' : listing.platform}.com`}
        target="_blank"
        rel="noopener noreferrer"
        className={`flex items-center justify-center gap-1.5 text-xs font-semibold py-2.5 rounded-xl border transition-all ${
          isBest
            ? 'bg-emerald-600 text-white border-emerald-600 hover:bg-emerald-700'
            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:border-slate-300'
        }`}
      >
        <ExternalLink size={11} />
        Buy on {meta.label}
      </a>
    </div>
  )
}
