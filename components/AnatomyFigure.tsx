'use client'

import { useEffect, useRef, useState } from 'react'
import {
  FIGURE_SVG,
  FIGURE_STATIONS,
  FIGURE_VIEWBOX,
  FIGURE_ROUTES,
  type Station,
} from './generated/stackFigure'
import { useTheme } from './ThemeProvider'

const BASE_RPS = 1240
const RPS_SPREAD = 260

type Pt = readonly [number, number]

/** Cumulative lengths, so a token moves at a steady speed rather than a
    steady fraction — otherwise it races the short legs and crawls the long ones. */
function measure(points: readonly Pt[]) {
  const runs: number[] = [0]
  let total = 0
  for (let i = 1; i < points.length; i++) {
    total += Math.hypot(points[i][0] - points[i - 1][0], points[i][1] - points[i - 1][1])
    runs.push(total)
  }
  return { runs, total }
}

function walk(points: readonly Pt[], runs: number[], distance: number): Pt {
  if (distance <= 0) return points[0]
  const last = runs[runs.length - 1]
  if (distance >= last) return points[points.length - 1]
  let i = 1
  while (i < runs.length && runs[i] < distance) i++
  const span = runs[i] - runs[i - 1] || 1
  const t = (distance - runs[i - 1]) / span
  const a = points[i - 1]
  const b = points[i]
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]
}

const SHARED = FIGURE_ROUTES.shared as readonly Pt[]
const SELF_HOSTED = FIGURE_ROUTES.selfHosted as readonly Pt[]
const FRONTIER = FIGURE_ROUTES.frontier as readonly Pt[]
const SHARED_M = measure(SHARED)
const SELF_M = measure(SELF_HOSTED)
const FRONTIER_M = measure(FRONTIER)

/** Pixels a second. Slow enough to follow, quick enough not to drag. */
const SPEED = 190

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
  const tokenRef = useRef<SVGCircleElement>(null)
  const trailRef = useRef<SVGCircleElement>(null)
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

  /* A request walks the shared stem, then the diverter throws it down one
     branch or the other, weighted the way the real split is. Attributes are
     written straight onto the node: no re-render per frame. */
  useEffect(() => {
    const dot = tokenRef.current
    const trail = trailRef.current
    if (!dot || !trail) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      // still, but placed somewhere meaningful rather than hidden
      const [x, y] = SHARED[SHARED.length - 1]
      dot.setAttribute('cx', String(x))
      dot.setAttribute('cy', String(y))
      return
    }

    let raf = 0
    let last = performance.now()
    let travelled = 0
    let toSelfHosted = Math.random() < FIGURE_ROUTES.selfHostedShare
    let running = true

    const io = new IntersectionObserver(
      entries => { running = entries[0]?.isIntersecting ?? true },
      { threshold: 0 },
    )
    if (hostRef.current) io.observe(hostRef.current)

    const tick = (now: number) => {
      raf = requestAnimationFrame(tick)
      const dt = Math.min((now - last) / 1000, 0.05)
      last = now
      if (!running) return

      travelled += dt * SPEED
      const branch = toSelfHosted ? SELF_HOSTED : FRONTIER
      const branchM = toSelfHosted ? SELF_M : FRONTIER_M
      const whole = SHARED_M.total + branchM.total

      if (travelled > whole + 60) {
        travelled = 0
        toSelfHosted = Math.random() < FIGURE_ROUTES.selfHostedShare
      }

      const onStem = travelled <= SHARED_M.total
      const [x, y] = onStem
        ? walk(SHARED, SHARED_M.runs, travelled)
        : walk(branch, branchM.runs, travelled - SHARED_M.total)

      const fade = travelled > whole ? Math.max(0, 1 - (travelled - whole) / 60) : 1
      dot.setAttribute('cx', String(x))
      dot.setAttribute('cy', String(y))
      dot.setAttribute('opacity', String(fade))
      trail.setAttribute('cx', String(x))
      trail.setAttribute('cy', String(y))
      trail.setAttribute('opacity', String(fade * 0.35))
    }
    raf = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(raf)
      io.disconnect()
    }
  }, [])

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

        {/* the request in flight, over the art and out of the way of hits */}
        <svg
          aria-hidden
          viewBox={`0 0 ${FIGURE_VIEWBOX.width} ${FIGURE_VIEWBOX.height}`}
          className="pointer-events-none absolute inset-0 h-full w-full"
        >
          <circle ref={trailRef} r="7" fill="var(--anatomy-lit)" opacity="0" />
          <circle ref={tokenRef} r="2.6" fill="var(--anatomy-lit)" opacity="0" />
        </svg>

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
