/**
 * Decorative scatter behind the hero — reading notes, books, a paper.
 * Purely atmospheric: aria-hidden, sits behind the text, and only appears
 * on xl+ where there is genuinely room beside a centred column.
 */

function ReadingNote() {
  return (
    <div
      className="absolute left-[2%] top-[15%] w-[230px] select-none"
      style={{ transform: 'rotate(-3.5deg)' }}
    >
      <div className="rounded-2xl border border-black/[0.08] dark:border-white/[0.09] bg-white dark:bg-[#12141a] p-4 shadow-xl dark:shadow-none">
        <div className="font-mono text-[9px] uppercase tracking-wider text-slate-400 dark:text-slate-600">
          Reading note · 001
        </div>
        <div className="mt-2 text-[15px] font-semibold leading-snug text-slate-900 dark:text-slate-100">
          Attention Is All You Need
        </div>
        <p className="mt-2 text-[11px] leading-relaxed text-slate-500 dark:text-slate-500">
          Recurrence gives way to attention, so the path between any two
          positions is constant instead of linear in distance.
        </p>
        <div className="my-3 h-px bg-black/[0.06] dark:bg-white/[0.06]" />
        <p className="text-[11px] leading-relaxed text-slate-400 dark:text-slate-600">
          Revisit: why does the residual stream make depth easier to train?
        </p>
      </div>

      {/* dark tile sitting over the note */}
      <div
        className="absolute -bottom-5 -right-6 flex items-center gap-2.5 rounded-xl bg-[#16181d] px-3 py-2 shadow-2xl ring-1 ring-white/[0.06]"
        style={{ transform: 'rotate(2deg)' }}
      >
        <span className="rounded-md bg-white/[0.08] px-2 py-0.5 font-mono text-[9px] text-slate-300">
          Study checkpoint
        </span>
        <span className="flex gap-[2px]">
          {[1, 1, 1, 1, 0].map((on, i) => (
            <span
              key={i}
              className={`h-3 w-[3px] rounded-sm ${on ? 'bg-cyan-400' : 'bg-white/20'}`}
            />
          ))}
        </span>
        <span className="font-mono text-[10px] text-slate-200">18 / 25</span>
      </div>
    </div>
  )
}

const BOOKS = [
  { title: 'Inference Engineering',   tint: 'from-cyan-900 to-slate-900',    rot: -11, x: 0,   y: 22 },
  { title: 'Programming Massively Parallel Processors', tint: 'from-emerald-900 to-slate-900', rot: -2, x: 62, y: 0  },
  { title: 'Designing Data-Intensive Applications',     tint: 'from-amber-800 to-slate-900',   rot: 7,  x: 124, y: 26 },
]

function BookStack() {
  return (
    <div className="absolute right-[2%] top-[13%] h-[230px] w-[250px] select-none">
      {BOOKS.map(b => (
        <div
          key={b.title}
          className={`absolute h-[158px] w-[112px] rounded-lg bg-gradient-to-br ${b.tint} p-2.5 shadow-2xl ring-1 ring-white/10`}
          style={{ transform: `rotate(${b.rot}deg)`, left: b.x, top: b.y }}
        >
          <div className="h-full w-full border border-white/10 rounded-[3px] p-2">
            <div className="text-[10px] font-semibold leading-tight text-white/85">
              {b.title}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

function PaperCard() {
  return (
    <div
      className="absolute left-[5%] bottom-[10%] w-[235px] select-none opacity-70"
      style={{ transform: 'rotate(-5deg)' }}
    >
      <div className="rounded-2xl border border-black/[0.08] dark:border-white/[0.08] bg-white dark:bg-[#12141a] p-4 shadow-xl dark:shadow-none">
        <span className="inline-block rounded bg-[#b31b1b] px-1.5 py-0.5 font-mono text-[9px] text-white">
          arXiv
        </span>
        <div className="mt-2.5 text-[13px] font-semibold leading-snug text-slate-800 dark:text-slate-200">
          Efficient Memory Management for LLM Serving with PagedAttention
        </div>
        <div className="mt-1.5 font-mono text-[9px] text-slate-400 dark:text-slate-600">
          Kwon et al. · 2023
        </div>
        <div className="mt-3 space-y-1.5">
          <div className="h-1 w-full rounded bg-black/[0.06] dark:bg-white/[0.06]" />
          <div className="h-1 w-[82%] rounded bg-black/[0.06] dark:bg-white/[0.06]" />
          <div className="h-1 w-[64%] rounded bg-black/[0.06] dark:bg-white/[0.06]" />
        </div>
      </div>
    </div>
  )
}

function FadingNote() {
  return (
    <div
      className="absolute right-[6%] bottom-[7%] w-[225px] select-none"
      style={{
        transform: 'rotate(4deg)',
        maskImage: 'linear-gradient(to bottom, black 25%, transparent 100%)',
        WebkitMaskImage: 'linear-gradient(to bottom, black 25%, transparent 100%)',
      }}
    >
      <div className="rounded-2xl border border-black/[0.07] dark:border-white/[0.07] bg-white dark:bg-[#12141a] p-4">
        <div className="font-mono text-[9px] uppercase tracking-wider text-slate-400 dark:text-slate-600">
          Capacity note · 04
        </div>
        <div className="mt-2 text-[14px] font-semibold leading-snug text-slate-800 dark:text-slate-200">
          Find the first saturating resource
        </div>
        <p className="mt-2 text-[11px] leading-relaxed text-slate-500 dark:text-slate-600">
          Throughput stops responding to replicas once KV cache is the binding
          constraint. Measure before scaling out.
        </p>
      </div>
    </div>
  )
}

export default function HeroScatter() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 hidden xl:block">
      <ReadingNote />
      <BookStack />
      <PaperCard />
      <FadingNote />
    </div>
  )
}
