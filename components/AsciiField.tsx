'use client'

import { useEffect, useRef } from 'react'
import { useTheme } from './ThemeProvider'

/**
 * A drifting field of monospace characters behind the hero.
 *
 * Each cell holds a character; what moves is its opacity, taken from a
 * three-octave value-noise field sampled at (column, row, time). The drift
 * through the time axis is what makes the bands look like they are rolling
 * rather than flickering. A click drops a ring into the same field — a
 * gaussian band expanding from the point and fading — so the ripple reads as
 * part of the field rather than an overlay on top of it.
 *
 * Canvas rather than DOM: a full-screen hero is several thousand cells, and
 * that many elements with changing opacity is not something layout survives.
 */

const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
const CELL_W = 11
const CELL_H = 15

/** The drift is slow, so the field does not need 60. */
const FRAME_MS = 1000 / 30

/** Opacity is quantised so the whole field draws in a handful of fill colours
    instead of one state change per character. */
const LEVELS = 7

const RIPPLE_MS = 1900
const RIPPLE_SPEED = 0.45 // px per ms
const RIPPLE_BAND = 44 // px — how thick the expanding ring is

type Ripple = { x: number; y: number; t0: number }

function hash(x: number, y: number, z: number) {
  let h = Math.imul(x, 374761393) + Math.imul(y, 668265263) + Math.imul(z, 1274126177)
  h = Math.imul(h ^ (h >>> 13), 1274126177)
  return ((h ^ (h >>> 16)) >>> 0) / 4294967295
}

const smooth = (t: number) => t * t * (3 - 2 * t)
const lerp = (a: number, b: number, t: number) => a + (b - a) * t

function noise(x: number, y: number, z: number) {
  const xi = Math.floor(x)
  const yi = Math.floor(y)
  const zi = Math.floor(z)
  const u = smooth(x - xi)
  const v = smooth(y - yi)
  const w = smooth(z - zi)
  const c = (dx: number, dy: number, dz: number) => hash(xi + dx, yi + dy, zi + dz)
  const y0 = lerp(lerp(c(0, 0, 0), c(1, 0, 0), u), lerp(c(0, 1, 0), c(1, 1, 0), u), v)
  const y1 = lerp(lerp(c(0, 0, 1), c(1, 0, 1), u), lerp(c(0, 1, 1), c(1, 1, 1), u), v)
  return lerp(y0, y1, w)
}

/** Three octaves: the first gives the broad bands, the rest break up their edges. */
const fbm = (x: number, y: number, z: number) =>
  noise(x, y, z) * 0.62 + noise(x * 2.1, y * 2.1, z * 1.7) * 0.27 + noise(x * 4.3, y * 4.3, z * 2.6) * 0.11

const smoothstep = (lo: number, hi: number, t: number) => {
  const k = Math.min(1, Math.max(0, (t - lo) / (hi - lo)))
  return k * k * (3 - 2 * k)
}

export default function AsciiField() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { theme } = useTheme()

  useEffect(() => {
    const canvas = canvasRef.current
    const host = canvas?.parentElement
    if (!canvas || !host) return
    const ctx = canvas.getContext('2d', { alpha: true })
    if (!ctx) return

    const dark = theme === 'dark'
    const ink = dark ? '34, 211, 238' : '8, 105, 125'
    const peak = dark ? 0.4 : 0.3

    let cols = 0
    let rows = 0
    let width = 0
    let height = 0
    let chars: Uint8Array = new Uint8Array(0)
    const buckets: number[][] = Array.from({ length: LEVELS }, () => [])
    const ripples: Ripple[] = []

    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const measure = () => {
      const r = host.getBoundingClientRect()
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      width = Math.max(1, Math.round(r.width))
      height = Math.max(1, Math.round(r.height))
      canvas.width = Math.round(width * dpr)
      canvas.height = Math.round(height * dpr)
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.textBaseline = 'top'
      ctx.font = `${CELL_H - 4}px ui-monospace, "SF Mono", Menlo, Consolas, monospace`
      cols = Math.ceil(width / CELL_W)
      rows = Math.ceil(height / CELL_H)
      chars = new Uint8Array(cols * rows)
      for (let i = 0; i < chars.length; i++) chars[i] = (Math.random() * CHARS.length) | 0
    }

    /* Quiet in the middle, where the name and the links are. The field is
       decoration; it does not get to compete with the text. */
    const maskAt = (cx: number, cy: number) => {
      const dx = (cx - width / 2) / (width / 2)
      const dy = (cy - height / 2) / (height / 2)
      const d = Math.sqrt(dx * dx * 0.55 + dy * dy)
      // a phone has far less room around the text, so the quiet core has to
      // take a larger share of it or the field crowds the heading
      const narrow = width < 640
      const core =
        smoothstep(narrow ? 0.46 : 0.26, 0.98, d) * (narrow ? 0.9 : 0.85) + (narrow ? 0.1 : 0.15)

      /* The radial term above is loudest at the frame, which puts the densest
         part of the field exactly where the hero hands off to the section
         below — and the canvas edge then cuts it dead. Fade it out top and
         bottom so it dissolves into the page instead, with the longer ramp at
         the bottom, where something follows it. */
      const t = cy / height
      return core * smoothstep(0, 0.14, t) * smoothstep(0, 0.3, 1 - t)
    }

    const draw = (now: number) => {
      ctx.clearRect(0, 0, width, height)
      const t = now / 1000

      for (const b of buckets) b.length = 0

      for (let row = 0; row < rows; row++) {
        const cy = row * CELL_H
        for (let col = 0; col < cols; col++) {
          let v = fbm(col * 0.055, row * 0.085, t * 0.11)

          // every live ripple adds a band at its current radius
          if (ripples.length) {
            const cx = col * CELL_W
            for (let i = 0; i < ripples.length; i++) {
              const rp = ripples[i]
              const age = now - rp.t0
              const dx = cx - rp.x
              const dy = cy - rp.y
              const d = Math.sqrt(dx * dx + dy * dy)
              const k = (d - age * RIPPLE_SPEED) / RIPPLE_BAND
              if (k > -3 && k < 3) {
                v += Math.exp(-k * k) * 0.72 * (1 - age / RIPPLE_MS)
              }
            }
          }

          const a = smoothstep(0.47, 0.8, v) * maskAt(col * CELL_W, cy)
          if (a < 0.05) continue
          const level = Math.min(LEVELS - 1, (a * LEVELS) | 0)
          buckets[level].push(col, row)
        }
      }

      for (let b = 0; b < LEVELS; b++) {
        const cells = buckets[b]
        if (!cells.length) continue
        ctx.fillStyle = `rgba(${ink}, ${(((b + 1) / LEVELS) * peak).toFixed(3)})`
        for (let i = 0; i < cells.length; i += 2) {
          const col = cells[i]
          const row = cells[i + 1]
          ctx.fillText(CHARS[chars[row * cols + col]], col * CELL_W, row * CELL_H)
        }
      }
    }

    measure()

    if (still) {
      // one frame, no drift and no ripples — but it still has to survive a resize
      draw(0)
      const roStill = new ResizeObserver(() => {
        measure()
        draw(0)
      })
      roStill.observe(host)
      return () => roStill.disconnect()
    }

    let raf = 0
    let last = 0
    let running = true

    const tick = (now: number) => {
      raf = requestAnimationFrame(tick)
      if (!running || now - last < FRAME_MS) return
      last = now

      // a little churn so the glyphs shimmer instead of sitting frozen
      for (let i = 0; i < chars.length * 0.012; i++) {
        chars[(Math.random() * chars.length) | 0] = (Math.random() * CHARS.length) | 0
      }
      for (let i = ripples.length - 1; i >= 0; i--) {
        if (now - ripples[i].t0 > RIPPLE_MS) ripples.splice(i, 1)
      }
      draw(now)
    }
    raf = requestAnimationFrame(tick)

    const io = new IntersectionObserver(e => { running = e[0]?.isIntersecting ?? true }, { threshold: 0 })
    io.observe(host)
    const onVisibility = () => { if (document.hidden) running = false }
    document.addEventListener('visibilitychange', onVisibility)

    /* The canvas takes no pointer events, so the links above it still work;
       the ripple is driven from the section instead. */
    const onDown = (e: PointerEvent) => {
      const r = host.getBoundingClientRect()
      if (ripples.length > 4) ripples.shift()
      ripples.push({ x: e.clientX - r.left, y: e.clientY - r.top, t0: performance.now() })
    }
    host.addEventListener('pointerdown', onDown)

    const ro = new ResizeObserver(() => measure())
    ro.observe(host)

    return () => {
      cancelAnimationFrame(raf)
      io.disconnect()
      ro.disconnect()
      host.removeEventListener('pointerdown', onDown)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [theme])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none absolute inset-0 z-0 h-full w-full"
    />
  )
}
