import { useLayoutEffect, useRef, useState } from 'react'

// Single-series time charts for the admin dashboard. One hue (brand violet), 2px line,
// recessive grid, hover crosshair + tooltip, and a table view for accessibility.

const SERIES = '#6d28d9'
const SERIES_FILL = 'rgba(109, 40, 217, 0.10)'
const GRID = '#e2e8f0'
const AXIS_TEXT = '#64748b'

function useWidth() {
  const ref = useRef(null)
  const [width, setWidth] = useState(600)
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    setWidth(Math.max(240, el.getBoundingClientRect().width))
    const ro = new ResizeObserver(([entry]) => setWidth(Math.max(240, entry.contentRect.width)))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])
  return [ref, width]
}

function niceMax(v) {
  if (v <= 4) return 4
  const pow = 10 ** Math.floor(Math.log10(v))
  const steps = [1, 2, 2.5, 5, 10]
  for (const s of steps) if (s * pow >= v) return s * pow
  return 10 * pow
}

const fmtDay = date => new Date(`${date}T12:00:00`).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })

function Tooltip({ x, y, width, children }) {
  const left = Math.min(Math.max(x - 70, 0), width - 140)
  return (
    <div className="pointer-events-none absolute z-10 w-[140px] rounded-lg border border-ink-200 bg-white px-3 py-2 text-xs shadow-card" style={{ left, top: Math.max(y - 64, 0) }}>
      {children}
    </div>
  )
}

function DataTable({ data, valueKey, label }) {
  return (
    <details className="mt-3 text-sm">
      <summary className="cursor-pointer text-ink-500 hover:text-ink-800">View as table</summary>
      <div className="mt-2 max-h-56 overflow-y-auto rounded-lg border border-ink-200">
        <table className="w-full text-left">
          <thead className="sticky top-0 bg-ink-50 text-ink-600"><tr><th className="px-3 py-1.5 font-medium">Date</th><th className="px-3 py-1.5 text-right font-medium">{label}</th></tr></thead>
          <tbody>
            {data.map(d => (
              <tr key={d.date} className="border-t border-ink-100"><td className="px-3 py-1.5 text-ink-700">{fmtDay(d.date)}</td><td className="px-3 py-1.5 text-right tabular-nums text-ink-900">{d[valueKey]}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </details>
  )
}

const PAD = { top: 12, right: 12, bottom: 26, left: 34 }

function xTicks(data, plotW) {
  const maxTicks = Math.max(2, Math.floor(plotW / 80))
  const every = Math.max(1, Math.ceil(data.length / maxTicks))
  return data.map((d, i) => i).filter(i => i % every === 0)
}

export function AreaChart({ data, valueKey, label, height = 220 }) {
  const [ref, width] = useWidth()
  const [hover, setHover] = useState(null)
  const plotW = width - PAD.left - PAD.right
  const plotH = height - PAD.top - PAD.bottom
  const max = niceMax(Math.max(0, ...data.map(d => d[valueKey])))
  const x = i => PAD.left + (data.length <= 1 ? plotW / 2 : (i / (data.length - 1)) * plotW)
  const y = v => PAD.top + plotH - (v / max) * plotH

  const line = data.map((d, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(d[valueKey]).toFixed(1)}`).join('')
  const area = data.length ? `${line}L${x(data.length - 1)},${y(0)}L${x(0)},${y(0)}Z` : ''
  const gridValues = [0, max / 2, max]

  const onMove = e => {
    const rect = e.currentTarget.getBoundingClientRect()
    const px = e.clientX - rect.left - PAD.left
    const i = Math.round((px / plotW) * (data.length - 1))
    setHover(Math.min(Math.max(i, 0), data.length - 1))
  }

  return (
    <div>
      <div ref={ref} className="relative">
        <svg width={width} height={height} role="img" aria-label={`${label} per day`} onMouseMove={onMove} onMouseLeave={() => setHover(null)} className="block touch-none">
          {gridValues.map(v => (
            <g key={v}>
              <line x1={PAD.left} x2={width - PAD.right} y1={y(v)} y2={y(v)} stroke={GRID} strokeDasharray={v ? '3 4' : undefined} />
              <text x={PAD.left - 8} y={y(v) + 4} textAnchor="end" fontSize="11" fill={AXIS_TEXT}>{Math.round(v)}</text>
            </g>
          ))}
          {xTicks(data, plotW).map(i => (
            <text key={i} x={x(i)} y={height - 6} textAnchor="middle" fontSize="11" fill={AXIS_TEXT}>{fmtDay(data[i].date)}</text>
          ))}
          <path d={area} fill={SERIES_FILL} />
          <path d={line} fill="none" stroke={SERIES} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
          {hover != null && (
            <g>
              <line x1={x(hover)} x2={x(hover)} y1={PAD.top} y2={PAD.top + plotH} stroke="#94a3b8" strokeDasharray="3 3" />
              <circle cx={x(hover)} cy={y(data[hover][valueKey])} r="5" fill={SERIES} stroke="#fff" strokeWidth="2" />
            </g>
          )}
          <rect x={PAD.left} y={PAD.top} width={plotW} height={plotH} fill="transparent" />
        </svg>
        {hover != null && (
          <Tooltip x={x(hover)} y={y(data[hover][valueKey])} width={width}>
            <p className="text-ink-500">{fmtDay(data[hover].date)}</p>
            <p className="mt-0.5 font-semibold text-ink-900"><span className="tabular-nums">{data[hover][valueKey]}</span> {label.toLowerCase()}</p>
          </Tooltip>
        )}
      </div>
      <DataTable data={data} valueKey={valueKey} label={label} />
    </div>
  )
}

export function BarChart({ data, valueKey, label, height = 160 }) {
  const [ref, width] = useWidth()
  const [hover, setHover] = useState(null)
  const plotW = width - PAD.left - PAD.right
  const plotH = height - PAD.top - PAD.bottom
  const max = niceMax(Math.max(0, ...data.map(d => d[valueKey])))
  const slot = plotW / Math.max(1, data.length)
  const barW = Math.max(2, Math.min(28, slot - 2))
  const y = v => PAD.top + plotH - (v / max) * plotH

  return (
    <div>
      <div ref={ref} className="relative">
        <svg width={width} height={height} role="img" aria-label={`${label} per day`} className="block" onMouseLeave={() => setHover(null)}>
          {[0, max / 2, max].map(v => (
            <g key={v}>
              <line x1={PAD.left} x2={width - PAD.right} y1={y(v)} y2={y(v)} stroke={GRID} strokeDasharray={v ? '3 4' : undefined} />
              <text x={PAD.left - 8} y={y(v) + 4} textAnchor="end" fontSize="11" fill={AXIS_TEXT}>{Math.round(v)}</text>
            </g>
          ))}
          {xTicks(data, plotW).map(i => (
            <text key={i} x={PAD.left + slot * i + slot / 2} y={height - 6} textAnchor="middle" fontSize="11" fill={AXIS_TEXT}>{fmtDay(data[i].date)}</text>
          ))}
          {data.map((d, i) => {
            const v = d[valueKey]
            const h = (v / max) * plotH
            const bx = PAD.left + slot * i + (slot - barW) / 2
            const r = Math.min(4, barW / 2, h)
            return (
              <g key={d.date} onMouseEnter={() => setHover(i)}>
                <rect x={PAD.left + slot * i} y={PAD.top} width={slot} height={plotH} fill="transparent" />
                {v > 0 && (
                  <path
                    d={`M${bx},${y(0)}V${y(v) + r}Q${bx},${y(v)} ${bx + r},${y(v)}H${bx + barW - r}Q${bx + barW},${y(v)} ${bx + barW},${y(v) + r}V${y(0)}Z`}
                    fill={SERIES}
                    opacity={hover == null || hover === i ? 1 : 0.55}
                  />
                )}
              </g>
            )
          })}
        </svg>
        {hover != null && (
          <Tooltip x={PAD.left + slot * hover + slot / 2} y={y(data[hover][valueKey])} width={width}>
            <p className="text-ink-500">{fmtDay(data[hover].date)}</p>
            <p className="mt-0.5 font-semibold text-ink-900"><span className="tabular-nums">{data[hover][valueKey]}</span> {data[hover][valueKey] === 1 ? label.toLowerCase().replace(/s$/, '') : label.toLowerCase()}</p>
          </Tooltip>
        )}
      </div>
      <DataTable data={data} valueKey={valueKey} label={label} />
    </div>
  )
}

// Ranked horizontal bars for "top N" breakdowns. Values are in ink, the bar carries magnitude.
export function BarList({ items, emptyText = 'No data yet' }) {
  if (!items?.length) return <p className="py-6 text-center text-sm text-ink-400">{emptyText}</p>
  const max = Math.max(...items.map(i => i.value))
  const total = items.reduce((s, i) => s + i.value, 0)
  return (
    <ul className="space-y-2">
      {items.map(item => (
        <li key={item.label} className="relative flex items-center justify-between gap-3 overflow-hidden rounded-md px-2.5 py-1.5 text-sm" title={`${item.label}: ${item.value}`}>
          <span className="absolute inset-y-0 left-0 rounded-md bg-brand-100" style={{ width: `${(item.value / max) * 100}%` }} aria-hidden="true" />
          <span className="relative truncate text-ink-800">{item.label}</span>
          <span className="relative shrink-0 tabular-nums text-ink-600">
            {item.value} <span className="text-ink-400">· {Math.round((item.value / total) * 100)}%</span>
          </span>
        </li>
      ))}
    </ul>
  )
}
