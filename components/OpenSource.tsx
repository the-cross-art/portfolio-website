const contributions = [
  {
    org: 'huggingface',
    repo: 'huggingface/transformers',
    what: 'Decoder attention masking fix',
    pr: '#49135',
    status: 'merged' as const,
    url: 'https://github.com/huggingface/transformers/pull/49135',
    avatar: '/oss/huggingface.png',
  },
  {
    org: 'OpenNMT',
    repo: 'OpenNMT/CTranslate2',
    what: 'Model architecture support in the runtime',
    pr: '#2103',
    status: 'in review' as const,
    url: 'https://github.com/OpenNMT/CTranslate2/pull/2103',
    avatar: '/oss/OpenNMT.png',
  },
]

const statusStyle = {
  merged:
    'bg-violet-50 dark:bg-violet-400/10 border-violet-200 dark:border-violet-400/30 text-violet-700 dark:text-violet-300',
  'in review':
    'bg-amber-50 dark:bg-amber-400/10 border-amber-200 dark:border-amber-400/30 text-amber-700 dark:text-amber-300',
}

export default function OpenSource() {
  return (
    <section id="open-source" className="py-24 px-6">
      <div className="max-w-5xl mx-auto">

        <div className="flex items-center gap-4 mb-4">
          <span className="font-mono text-cyan-600 dark:text-cyan-400 text-sm">04.</span>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">open source</h2>
          <div className="flex-1 h-px bg-black/[0.06] dark:bg-white/[0.05]" />
        </div>
        <p className="font-mono text-sm text-slate-400 dark:text-slate-600 mb-10">
          Contributing upstream to the libraries I serve models with
        </p>

        <div className="grid sm:grid-cols-2 gap-4">
          {contributions.map((c, i) => (
            <a
              key={c.url}
              href={c.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{ ['--tilt' as string]: i % 2 === 0 ? '0.5deg' : '-0.5deg' }}
              className="group card-tilt flex min-w-0 items-center gap-4 border border-black/[0.07] dark:border-white/[0.07] rounded-2xl p-5 bg-white dark:bg-white/[0.02] hover:border-black/[0.12] dark:hover:border-white/[0.14] hover:shadow-xl dark:hover:shadow-none"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={c.avatar}
                alt=""
                className="w-10 h-10 rounded-xl shrink-0 border border-black/[0.06] dark:border-white/[0.08]"
              />

              <div className="min-w-0 flex-1">
                <div className="font-mono text-[13px] text-slate-800 dark:text-slate-200 truncate group-hover:text-cyan-700 dark:group-hover:text-cyan-300 transition-colors">
                  {c.repo}
                </div>
                <div className="text-[13px] text-slate-600 dark:text-slate-400 mt-0.5 truncate">
                  {c.what}
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <span className="font-mono text-[10px] text-slate-400 dark:text-slate-600">{c.pr}</span>
                  <span className={`px-2 py-0.5 rounded border font-mono text-[10px] ${statusStyle[c.status]}`}>
                    {c.status}
                  </span>
                </div>
              </div>

              <span className="text-slate-300 dark:text-slate-700 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors shrink-0">
                ↗
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}
