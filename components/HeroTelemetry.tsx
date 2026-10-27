'use client'

import { useEffect, useState } from 'react'
import type { Station } from './AnatomyFigure'

/**
 * The readout for the hero's drawing, sitting in the opposite column.
 *
 * The figure bleeds off the right edge, so its own bottom strip would be
 * clipped — and without it the drawing is just a still picture. At rest this
 * reports what the machine is doing; hover a part of it and it reports that
 * part instead.
 *
 * The numbers are the same ones the figure and /anatomy are built on, kept
 * here as plain constants rather than imported, so the hero does not pull the
 * figure's 165 kB module into its own bundle to read three values.
 */

/** HBM3e on a B200: 8 TB/s ceiling, and decode sits near it. */
const BW_BASE = 7400
const BW_SPREAD = 900

const AT_REST = [
  { value: null, unit: 'GB/s', label: 'HBM read, live' },
  { value: '208', unit: '', label: 'SMs across two dies' },
  { value: '78', unit: '%', label: 'of fetches miss to HBM' },
]

function Bandwidth() {
  const [v, setV] = useState(BW_BASE)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    let cur = BW_BASE
    let target = BW_BASE
    const id = setInterval(() => {
      if (Math.random() < 0.3) target = BW_BASE - BW_SPREAD / 2 + Math.random() * BW_SPREAD
      cur += (target - cur) * 0.2
      setV(Math.round(cur))
    }, 260)
    return () => clearInterval(id)
  }, [])

  return <>{v.toLocaleString('en-US')}</>
}

export default function HeroTelemetry({ focused }: { focused: Station | null }) {
  return (
    <div className="mt-10 hidden min-h-[4.5rem] border-t border-black/[0.08] pt-5 lg:block dark:border-white/[0.07]">
      {focused ? (
        <div>
          <p className="font-mono text-[13px] text-cyan-700 dark:text-cyan-300">
            {focused.name}
            <span className="ml-2 text-slate-400 dark:text-slate-600">{focused.part}</span>
          </p>
          <ul className="mt-2 flex flex-wrap gap-x-5 gap-y-1">
            {focused.spec.map(s => (
              <li key={s} className="font-mono text-[11px] text-slate-500 dark:text-slate-500">
                {s}
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <dl className="flex flex-wrap gap-x-9 gap-y-3">
          {AT_REST.map(({ value, unit, label }) => (
            <div key={label}>
              <dt className="font-mono text-base tabular-nums text-slate-800 dark:text-slate-200">
                {value ?? <Bandwidth />}
                {unit && <span className="ml-1 text-[11px] text-slate-400 dark:text-slate-600">{unit}</span>}
              </dt>
              <dd className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-500">{label}</dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  )
}
