'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useTheme } from './ThemeProvider'

export type Station = {
  id: string
  name: string
  part: string
  detail: string
  spec: string[]
  contains?: string[]
}

type Pt = readonly [number, number]

/** One drawing from the anatomy kit, in the shape every generated module emits. */
export type FigureData = {
  svg: string
  viewBox: { readonly width: number; readonly height: number }
  title: string
  fig: string
  blurb: string
  readout: { readonly base: number; readonly spread: number; readonly unit: string }
  stations: readonly Station[]
  routes: {
    readonly shared: readonly Pt[]
    readonly branches: readonly { readonly share: number; readonly points: readonly Pt[] }[]
  }
}

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

/** Pixels a second. Slow enough to follow, quick enough not to drag. */
const SPEED = 190

/** How far the focused part rides out of the machine. Straight up is the
    isometric vertical, so it reads as lifted rather than slid. */
const LIFT = 'translate(0px, -34px) scale(1.1)'

/** Matches the CSS transition, so a part is back in its painted slot by the
    time it has finished dropping. */
const DROP_MS = 320

/* The readout ticks several times a second. It lives in its own component so
   re-rendering it never touches the injected SVG below. */
function Readout({ base, spread, unit }: FigureData['readout']) {
  const [value, setValue] = useState<number>(base)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    let cur = base
    let target = base
    const id = setInterval(() => {
      if (Math.random() < 0.3) target = base - spread / 2 + Math.random() * spread
      cur += (target - cur) * 0.2
      setValue(Math.round(cur))
    }, 260)
    return () => clearInterval(id)
  }, [base, spread])

  return <>{value.toLocaleString('en-US')} {unit}</>
}

/**
 * A figure built by the anatomy kit (anatomy/<name>/build.mjs), rendered here
 * as static markup with a request walking through it.
 *
 * Pointer handling is delegated from the host rather than bound to the
 * injected nodes: React owns that subtree's innerHTML, so anything attached
 * directly to the groups is lost the moment it re-renders.
 */
export default function AnatomyFigure({ fig }: { fig: FigureData }) {
  const hostRef = useRef<HTMLDivElement>(null)
  const tokenRef = useRef<SVGCircleElement>(null)
  const trailRef = useRef<SVGCircleElement>(null)
  const pendingRef = useRef(false)
  const raisedRef = useRef<string | null>(null)
  const restoreRef = useRef<number>(0)
  const [hovered, setHovered] = useState<string | null>(null)
  const [held, setHeld] = useState<string | null>(null)
  const { theme } = useTheme()

  const active = held ?? hovered
  const current: Station | null = fig.stations.find(s => s.id === active) ?? null

  /** A station plus the stations it contains. */
  const idsOf = useMemo(
    () => (id: string) => [id, ...(fig.stations.find(s => s.id === id)?.contains ?? [])],
    [fig.stations],
  )

  /* Dim everything but the focused station, and lift that one clear of the
     machine the way an exploded view pulls a part out.

     Lifting alone is not enough: the figure is painted back to front, so a
     part low in that order still reads through whatever covers it. The
     focused groups are moved to the end of the drawing while they are up and
     put back once they have settled.

     React owns this subtree's innerHTML and rebuilds it without warning, so
     nothing here may hold a node across renders — an anchor kept from a
     previous render is detached, and insertBefore throws on it. Paint order
     is stamped onto the children instead, and every lookup is a fresh query. */
  useEffect(() => {
    const svg = hostRef.current?.querySelector('svg')
    if (!svg) return
    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const kids = Array.from(svg.children) as SVGElement[]
    if (kids.length && !kids[0].dataset.ord) {
      kids.forEach((el, i) => {
        el.dataset.ord = String(i)
      })
    }

    /* A station lights with whatever it contains, so opening the SM does not
       gut it of the register files and tensor cores that live inside it. */
    const groupsOf = (id: string) => {
      const sel = idsOf(id).map(i => `.st[data-station="${i}"]`).join(',')
      return Array.from(hostRef.current?.querySelectorAll<SVGGElement>(sel) ?? [])
    }

    /* Sort every child back into the painted order, then lift whatever is
       still up. Replacing the whole order is the only sound way to do this:
       picking an anchor relative to one group gets it wrong as soon as more
       than one group is out of place. It runs a drop after the hover changed,
       by which time the transitions it restarts have already finished. */
    const reorder = () => {
      const live = hostRef.current?.querySelector('svg')
      if (!live) return
      const ordered = (Array.from(live.children) as SVGElement[]).sort(
        (a, b) => Number(a.dataset.ord) - Number(b.dataset.ord),
      )
      for (const el of ordered) live.appendChild(el)
      if (raisedRef.current) for (const g of groupsOf(raisedRef.current)) live.appendChild(g)
    }

    window.clearTimeout(restoreRef.current)
    if (pendingRef.current) {
      reorder()
      pendingRef.current = false
    }

    let raf = 0
    let justRaised = false
    if (raisedRef.current !== active) {
      const prev = raisedRef.current
      raisedRef.current = active
      if (prev) {
        pendingRef.current = true
        restoreRef.current = window.setTimeout(() => {
          reorder()
          pendingRef.current = false
        }, DROP_MS)
      }
      if (active && !still) {
        justRaised = true
        const up = groupsOf(active)
        for (const g of up) {
          svg.appendChild(g)
          g.style.transform = ''
        }
        // the move restarts the element, so arm the lift one frame later
        raf = requestAnimationFrame(() => {
          for (const g of up) g.style.transform = LIFT
        })
      }
    }

    const lit = new Set(active ? idsOf(active) : [])
    for (const g of Array.from(svg.querySelectorAll<SVGGElement>('.st'))) {
      const on = active === null || lit.has(g.dataset.station ?? '')
      g.style.opacity = on ? '1' : '0.15'
      if (!on || !active) g.style.transform = ''
      // a rebuild mid-hover drops the lift, so put it back without animating
      else if (!justRaised && !still) g.style.transform = LIFT
    }

    return () => {
      if (raf) cancelAnimationFrame(raf)
    }
  }, [active, idsOf])

  /* A request walks the shared stem, then takes one branch, weighted the way
     the real split is. Every branch runs at the same speed, so a longer one
     simply takes longer to watch — which for the accelerator is the whole
     argument. Attributes are written straight onto the node: no re-render
     per frame. */
  useEffect(() => {
    const dot = tokenRef.current
    const trail = trailRef.current
    if (!dot || !trail) return

    const shared = fig.routes.shared
    const sharedM = measure(shared)
    const branches = fig.routes.branches.map(b => ({
      points: b.points,
      share: b.share,
      m: measure(b.points),
    }))
    const pick = () => {
      let roll = Math.random()
      for (const b of branches) {
        if ((roll -= b.share) <= 0) return b
      }
      return branches[branches.length - 1]
    }

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      // still, but placed somewhere meaningful rather than hidden
      const [x, y] = shared[shared.length - 1]
      dot.setAttribute('cx', String(x))
      dot.setAttribute('cy', String(y))
      return
    }

    let raf = 0
    let last = performance.now()
    let travelled = 0
    let branch = pick()
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
      const whole = sharedM.total + branch.m.total

      if (travelled > whole + 60) {
        travelled = 0
        branch = pick()
      }

      const onStem = travelled <= sharedM.total
      const [x, y] = onStem
        ? walk(shared, sharedM.runs, travelled)
        : walk(branch.points, branch.m.runs, travelled - sharedM.total)

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
  }, [fig.routes])

  const stationAt = (target: EventTarget | null) =>
    ((target as Element | null)?.closest?.('.st') as SVGGElement | null)?.dataset.station ?? null

  return (
    <div
      className="iso relative flex h-full select-none flex-col"
      data-theme={theme === 'dark' ? 'dark' : 'light'}
      onClick={() => setHeld(null)}
    >
      <div
        className="relative min-h-0 flex-1 overflow-hidden rounded-2xl border border-black/[0.07] dark:border-white/[0.07]"
        style={{ background: 'var(--anatomy-card)' }}
      >
        <div className="pointer-events-none absolute inset-0 z-10 p-5">
          <div className="flex items-start justify-between">
            <span className="font-mono text-[10px] tracking-[0.2em] text-slate-400 dark:text-slate-700">
              {fig.fig}
            </span>
            <span className="font-mono text-[10px] tracking-[0.2em] text-slate-400 dark:text-slate-600">
              {fig.title}
            </span>
          </div>
        </div>

        <div
          ref={hostRef}
          className="h-full w-full [&_.st]:cursor-pointer [&_.st]:[transform-box:fill-box] [&_.st]:[transform-origin:center] [&_.st]:transition-[opacity,transform] [&_.st]:duration-300 [&_.st]:ease-out [&>svg]:block [&>svg]:h-full [&>svg]:w-full"
          onPointerOver={e => setHovered(stationAt(e.target))}
          onPointerLeave={() => setHovered(null)}
          onClick={e => {
            const id = stationAt(e.target)
            if (!id) return
            e.stopPropagation()
            setHeld(prev => (prev === id ? null : id))
          }}
          dangerouslySetInnerHTML={{ __html: fig.svg }}
        />

        {/* the request in flight, over the art and out of the way of hits */}
        <svg
          aria-hidden
          viewBox={`0 0 ${fig.viewBox.width} ${fig.viewBox.height}`}
          className="pointer-events-none absolute inset-0 h-full w-full"
        >
          <circle ref={trailRef} r="7" fill="var(--anatomy-lit)" opacity="0" />
          <circle ref={tokenRef} r="2.6" fill="var(--anatomy-lit)" opacity="0" />
        </svg>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 flex items-end justify-between gap-6 p-5">
          <span className="font-mono text-[10px] text-slate-400 dark:text-slate-600">
            {current ? current.spec.join('  ·  ') : 'hover a part · click to hold'}
          </span>
          <span className="shrink-0 font-mono text-[10px] tabular-nums text-slate-400 dark:text-slate-500">
            {current ? `${current.name} · ${current.part}` : <Readout {...fig.readout} />}
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
            {fig.blurb}
          </p>
        )}
      </div>
    </div>
  )
}
