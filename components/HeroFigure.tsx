'use client'

import dynamic from 'next/dynamic'
import type { Station } from './AnatomyFigure'
import { useEffect, useState } from 'react'

const GpuFigure = dynamic(() => import('./GpuFigure'), { ssr: false })

/**
 * The hero's drawing, loaded only where it is actually shown.
 *
 * `hidden lg:block` is not enough: it hides the figure visually but still
 * ships its module, mounts the component and runs its animation loop, so a
 * phone was paying ~59 kB and a rAF loop for something it never sees. The
 * media query is checked here instead, and the chunk is only fetched once it
 * is true — at the cost of a short fade-in on desktop, which is the right way
 * round for a drawing this size.
 */
export default function HeroFigure({ onFocus }: { onFocus?: (s: Station | null) => void }) {
  const [wide, setWide] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)')
    const sync = () => setWide(mq.matches)
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])

  if (!wide) return null

  return (
    <div className="relative h-full animate-[fade-in_600ms_ease-out_both]">
      {/* The drawing is built against --anatomy-card: its fills are #131313 and
          its hairlines #2a2a2a, so on the bare #0a0a0f page there is almost no
          contrast left and the whole thing goes thin. This restores that
          surface and dissolves it at the edges, so the figure reads as drawn
          without being put back in a frame. */}
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-y-8 -left-12 -right-24 -z-10 rounded-[3rem]"
        style={{
          background: 'var(--anatomy-card)',
          WebkitMaskImage:
            'radial-gradient(68% 62% at 46% 50%, black 55%, transparent 100%)',
          maskImage: 'radial-gradient(68% 62% at 46% 50%, black 55%, transparent 100%)',
        }}
      />
      <GpuFigure bare onFocus={onFocus} />
    </div>
  )
}
