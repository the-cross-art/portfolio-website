'use client'

import { useEffect, useRef, useState } from 'react'
import {
  FIGURE_SVG,
  FIGURE_STATIONS,
  FIGURE_VIEWBOX,
  type Station,
} from './generated/stackFigure'
import { useTheme } from './ThemeProvider'

const BASE_RPS = 1240
const RPS_SPREAD = 260

/* The readout ticks several times a second. It lives in its own component so
   re-rendering it never touches the injected SVG below. */
function Readout() {
  const [rps, setRps] = useState(BASE_RPS)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    let cur = BASE_RPS
    let target = BASE_RPS
    const id = setInterval(() => {
      if (Math.random() < 0.3) {
        target = BASE_RPS - RPS_SPREAD / 2 + Math.random() * RPS_SPREAD
      }
      cur += (target - cur) * 0.2
      setRps(Math.round(cur))
    }, 260)
    return () => clearInterval(id)
  }, [])

  return <>{rps.toLocaleString('en-US')} req/s</>
}

/**
 * The serving topology drawn as a bench machine, built by the anatomy kit
 * (anatomy/stack/build.mjs) and rendered here as static markup.
 *
 * Pointer handling is delegated from the host rather than bound to the
 * injected nodes: React owns that subtree's innerHTML, so anything attached
 * directly to the groups is lost the moment it re-renders.
 */
export default function AnatomyFigure() {
  const hostRef = useRef<HTMLDivElement>(null)
  const [hovered, setHovered] = useState<string | null>(null)
  const [held, setHeld] = useState<string | null>(null)
  const { theme } = useTheme()

  const active = held ?? hovered
  const current: Station | null = FIGURE_STATIONS.find(s => s.id === active) ?? null

  /* Dim everything but the focused station. Re-queried each time, so it
     survives the subtree being rebuilt. */
  useEffect(() => {
    const host = hostRef.current
    if (!host) return
    for (const g of Array.from(host.querySelectorAll<SVGGElement>('.st'))) {
      const on = active === null || g.dataset.station === active
      g.style.opacity = on ? '1' : '0.2'
    }
  }, [active])

  const stationAt = (target: EventTarget | null) =>
    ((target as Element | null)?.closest?.('.st') as SVGGElement | null)?.dataset.station ?? null

  return (
    <div
      className="iso relative select-none"
      data-theme={theme === 'dark' ? 'dark' : 'light'}
      onClick={() => setHeld(null)}
    >
      <div
        className="relative overflow-hidden rounded-2xl border border-black/[0.07] dark:border-white/[0.07]"
        style={{ background: 'var(--anatomy-card)' }}
      >
        <div className="pointer-events-none absolute inset-0 z-10 p-5">
          <div className="flex items-start justify-between">
            <span className="font-mono text-[10px] tracking-[0.2em] text-slate-400 dark:text-slate-700">
              FIG 1
            </span>
            <span className="font-mono text-[10px] tracking-[0.2em] text-slate-400 dark:text-slate-600">
              THE REQUEST SORTER
            </span>
          </div>
        </div>

        <div
          ref={hostRef}
          className="w-full [&_.st]:cursor-pointer [&_.st]:transition-opacity [&_.st]:duration-200 [&>svg]:block [&>svg]:h-auto [&>svg]:w-full"
          style={{ aspectRatio: `${FIGURE_VIEWBOX.width} / ${FIGURE_VIEWBOX.height}` }}
          onPointerOver={e => setHovered(stationAt(e.target))}
          onPointerLeave={() => setHovered(null)}
          onClick={e => {
            const id = stationAt(e.target)
            if (!id) return
            e.stopPropagation()
            setHeld(prev => (prev === id ? null : id))
          }}
          dangerouslySetInnerHTML={{ __html: FIGURE_SVG }}
        />

        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 flex items-end justify-between gap-6 p-5">
          <span className="font-mono text-[10px] text-slate-400 dark:text-slate-600">
            {current ? current.spec.join('  ·  ') : 'hover a station · click to hold'}
          </span>
          <span className="shrink-0 font-mono text-[10px] tabular-nums text-slate-400 dark:text-slate-500">
            {current ? `${current.name} · ${current.part}` : <Readout />}
          </span>
        </div>
      </div>

      <div className="mt-3 min-h-[2.75rem]">
        {current ? (
          <p className="max-w-3xl text-[13px] leading-relaxed text-slate-700 dark:text-slate-400">
            <span className="font-mono text-cyan-700 dark:text-cyan-300">{current.name}</span>
            {' — '}
            {current.detail}
          </p>
        ) : (
          <p className="max-w-3xl font-mono text-[11px] leading-relaxed text-slate-400 dark:text-slate-600">
            The topology as a machine: requests drop into the hopper, pass the grate and
            the gauges, and the diverter throws them either out to the hosted providers
            or down the bench into the rack.
          </p>
        )}
      </div>
    </div>
  )
}
