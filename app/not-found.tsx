import type { Metadata } from 'next'
import AsciiField from '@/components/AsciiField'

export const metadata: Metadata = {
  title: 'Not found — Imran Nazir',
  description: 'That page moved or never existed.',
}

const WAYS_BACK = [
  { label: 'home', href: '/', primary: true },
  { label: 'the stack', href: '/#architecture' },
  { label: 'anatomy of a token', href: '/anatomy' },
  { label: 'writing', href: '/#writing' },
]

/**
 * The 404. Next's stock page is bare Helvetica on white and matches nothing
 * else here, which is a poor thing to hand someone who mistyped a URL or
 * followed a stale link — so this one keeps the terminal voice the hero opens
 * with, and spends its real effort on routes back out.
 */
export default function NotFound() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#f7f8fa] px-6 dark:bg-[#0a0a0f]">
      <AsciiField />

      <div className="relative z-10 mx-auto max-w-xl text-center">
        <p className="font-mono text-sm text-slate-400 dark:text-slate-600">
          <span className="text-cyan-600 dark:text-cyan-500">~</span> $ cat that-page
        </p>

        <h1 className="mt-6 font-mono text-7xl font-bold tracking-tight text-slate-900 sm:text-8xl dark:text-slate-100">
          404
        </h1>

        <p className="mt-5 font-mono text-[13px] text-slate-500 dark:text-slate-500">
          cat: that-page: No such file or directory
        </p>

        <p className="mt-7 text-lg leading-relaxed text-slate-700 dark:text-slate-300">
          Nothing lives here. The page either moved or never existed.
        </p>

        <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
          {WAYS_BACK.map(({ label, href, primary }) => (
            <a
              key={href}
              href={href}
              className={[
                'rounded-xl px-5 py-2.5 font-mono text-sm transition-all',
                primary
                  ? 'border border-cyan-300 bg-cyan-50 text-cyan-700 hover:bg-cyan-100 dark:border-cyan-400/30 dark:bg-cyan-400/10 dark:text-cyan-300 dark:hover:bg-cyan-400/20'
                  : 'border border-black/[0.09] bg-black/[0.04] text-slate-600 hover:bg-black/[0.07] hover:text-slate-900 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-400 dark:hover:bg-white/[0.08] dark:hover:text-slate-200',
              ].join(' ')}
            >
              {label}
            </a>
          ))}
        </div>
      </div>
    </main>
  )
}
