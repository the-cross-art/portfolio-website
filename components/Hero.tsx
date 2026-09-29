import HeroScatter from './HeroScatter'

const LINKS = [
  { label: '→ view work',  href: '#projects', primary: true },
  { label: 'read writing', href: '#writing' },
  { label: 'github ↗',     href: 'https://github.com/the-cross-art', external: true },
  { label: 'linkedin ↗',   href: 'https://linkedin.com/in/meimran',  external: true },
]

export default function Hero() {
  return (
    <section
      id="home"
      className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 pb-16 pt-24"
    >
      <HeroScatter />

      <div className="relative z-10 mx-auto max-w-2xl text-center">
        <p className="font-mono text-sm text-slate-400 dark:text-slate-600">
          <span className="text-cyan-600 dark:text-cyan-500">~</span> $ whoami
        </p>

        <h1 className="mt-6 text-5xl md:text-6xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          Imran Nazir
        </h1>

        <p className="mt-3 font-mono text-base md:text-lg text-cyan-600 dark:text-cyan-400">
          AI Applied Engineer II &nbsp;·&nbsp; QuillBot (Learneo)
        </p>

        <p className="mt-7 text-lg leading-relaxed text-slate-800 dark:text-slate-300">
          I build the infrastructure that LLMs run on{' '}
          <span className="font-mono text-cyan-600 dark:text-cyan-400">at scale.</span>
        </p>

        <p className="mt-2 text-base text-slate-600 dark:text-slate-500">
          Civil Engineering grad &rarr; self-taught &rarr; ML systems engineer.
          Serving 50M+ users.
        </p>

        <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
          {LINKS.map(({ label, href, primary, external }) => (
            <a
              key={label}
              href={href}
              {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
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

      {/* cue that the architecture sits below */}
      <a
        href="#architecture"
        className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2 font-mono text-[10px] text-slate-400 transition-colors hover:text-cyan-600 dark:text-slate-600 dark:hover:text-cyan-400"
      >
        the stack I run ↓
      </a>
    </section>
  )
}
