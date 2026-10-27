'use client'

import { useCallback, useState } from 'react'
import HeroFigure from './HeroFigure'
import HeroTelemetry from './HeroTelemetry'
import type { Station } from './AnatomyFigure'

const LINKS = [
  { label: 'view work', href: '#projects', primary: true },
  { label: 'read writing', href: '#writing' },
]

const PROFILES = [
  { label: 'github', href: 'https://github.com/the-cross-art' },
  { label: 'linkedin', href: 'https://linkedin.com/in/meimran' },
]

/**
 * The hero leads with the accelerator rather than a name block.
 *
 * A centred name over a texture is the most replaceable screen on any
 * portfolio; the drawing is the one thing here nobody else has, and it is
 * interactive, so the first thing a visitor can do is hover a part of a B200
 * and be told what it does. The identity sits beside it as a caption, in the
 * drawing's own language.
 *
 * The figure is desktop-only: at phone width its 208 SM tiles are a texture
 * rather than a diagram, so small screens get the text alone.
 */
export default function Hero() {
  const [focused, setFocused] = useState<Station | null>(null)
  // stable, or the figure's effect would fire on every hero render
  const onFocus = useCallback((s: Station | null) => setFocused(s), [])

  return (
    <section
      id="home"
      className="relative flex min-h-screen items-center overflow-hidden px-6 pb-16 pt-28"
    >
      <div className="mx-auto grid w-full max-w-7xl items-center gap-12 lg:grid-cols-[minmax(0,27rem)_minmax(0,1fr)]">

        <div className="relative z-10">
          <p className="font-mono text-sm text-slate-400 dark:text-slate-600">
            <span className="text-cyan-600 dark:text-cyan-500">~</span> $ whoami
          </p>

          <h1 className="mt-6 text-5xl font-bold tracking-tight text-slate-900 md:text-6xl dark:text-slate-100">
            Imran Nazir
          </h1>

          <p className="mt-3 text-base text-cyan-600 md:text-lg dark:text-cyan-400">
            AI Applied Engineer II at QuillBot
          </p>

          <p className="mt-7 text-lg leading-relaxed text-slate-800 dark:text-slate-300">
            I build the infrastructure that LLMs run on{' '}
            <span className="text-cyan-600 dark:text-cyan-400">at scale.</span>
          </p>

          <p className="mt-2 text-base leading-relaxed text-slate-600 dark:text-slate-500">
            Civil Engineering grad, self-taught, now serving 50M+ users.
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-3">
            {LINKS.map(({ label, href, primary }) => (
              <a
                key={label}
                href={href}
                className={[
                  'rounded-xl px-5 py-2.5 text-sm transition-all',
                  primary
                    ? 'border border-cyan-300 bg-cyan-50 text-cyan-700 hover:bg-cyan-100 dark:border-cyan-400/30 dark:bg-cyan-400/10 dark:text-cyan-300 dark:hover:bg-cyan-400/20'
                    : 'border border-black/[0.09] bg-black/[0.04] text-slate-600 hover:bg-black/[0.07] hover:text-slate-900 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-400 dark:hover:bg-white/[0.08] dark:hover:text-slate-200',
                ].join(' ')}
              >
                {label}
              </a>
            ))}
            <span className="ml-1 flex items-center gap-4 text-sm">
              {PROFILES.map(({ label, href }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-500 underline-offset-4 transition-colors hover:text-cyan-600 hover:underline dark:text-slate-500 dark:hover:text-cyan-400"
                >
                  {label}
                </a>
              ))}
            </span>
          </div>

          <HeroTelemetry focused={focused} />
        </div>

        {/* Bleeds past the right edge: the drawing continues off-screen rather
            than sitting in a frame, so it reads as the subject, not an inset. */}
        <div className="hidden lg:block lg:-mr-[11vw] lg:h-[40rem]">
          <HeroFigure onFocus={onFocus} />
        </div>
      </div>

      <a
        href="#architecture"
        className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2 text-[11px] text-slate-400 transition-colors hover:text-cyan-600 dark:text-slate-600 dark:hover:text-cyan-400"
      >
        the stack I run ↓
      </a>
    </section>
  )
}
