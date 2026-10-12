import type { Metadata } from 'next'
import dynamic from 'next/dynamic'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'

/* Each figure is a large block of generated markup, so both load only when
   this route is opened. The landing page is untouched. */
const NodeFigure = dynamic(() => import('@/components/NodeFigure'), { ssr: false })
const GpuFigure = dynamic(() => import('@/components/GpuFigure'), { ssr: false })

export const metadata: Metadata = {
  title: 'Anatomy of a token — Imran Nazir',
  description:
    'One request followed down four scales — network, serving node, accelerator, multiprocessor — and why memory bandwidth, not compute, sets the price of a token.',
}

const HIERARCHY = [
  { level: 'Registers', size: '256 KB per SM', cost: '~1 cycle', note: 'the only storage the cores reach at full speed' },
  { level: 'L1 / shared', size: '256 KB per SM', cost: '~30 cycles', note: 'where a tile of the weight matrix is staged' },
  { level: 'L2', size: 'tens of MB, shared', cost: '~200 cycles', note: 'hot KV-cache pages between steps' },
  { level: 'HBM3e', size: '192 GB', cost: '~500 cycles', note: 'where the weights live, and the whole problem' },
]

const LEVERS = [
  { lever: 'Batching', layer: 'scheduler', buys: 'One weight read serves many tokens at once. The single largest win available, and the reason throughput and latency pull against each other.' },
  { lever: 'Continuous batching', layer: 'scheduler', buys: 'A finished sequence leaves the batch without draining it, so the expensive read is never waiting on the slowest request in a cohort.' },
  { lever: 'Quantisation', layer: 'weights', buys: 'FP8 or FP4 means fewer bytes to move. The ceiling moves in direct proportion — halve the bytes, double the ceiling.' },
  { lever: 'KV-cache-aware routing', layer: 'control plane', buys: 'Send a request to the replica that already holds its prefix. Skips the prefill entirely, which is why placement is a cache question and not a load question.' },
  { lever: 'Paged KV cache', layer: 'memory manager', buys: 'Stops fragmentation from capping how large a batch will fit, which protects the lever above it.' },
  { lever: 'Speculative decoding', layer: 'engine', buys: 'A small model proposes several tokens, the large one verifies them in a single pass — several tokens per weight read instead of one.' },
  { lever: 'Tensor / expert parallelism', layer: 'NVLink', buys: 'Splits the weights across GPUs so each reads less. Trades HBM traffic for link traffic, which is why NVLink bandwidth bounds how far a model can usefully be split.' },
]

function Section({
  n,
  title,
  children,
}: {
  n: string
  title: string
  children: React.ReactNode
}) {
  return (
    <section className="mt-20">
      <div className="mb-6 flex items-center gap-4">
        <span className="font-mono text-sm text-cyan-600 dark:text-cyan-400">{n}</span>
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">{title}</h2>
        <div className="h-px flex-1 bg-black/[0.06] dark:bg-white/[0.05]" />
      </div>
      {children}
    </section>
  )
}

function Prose({ children }: { children: React.ReactNode }) {
  return (
    <div className="max-w-3xl space-y-4 text-[15px] leading-relaxed text-slate-700 dark:text-slate-400">
      {children}
    </div>
  )
}

function Mono({ children }: { children: React.ReactNode }) {
  return <span className="font-mono text-[13px] text-cyan-700 dark:text-cyan-300">{children}</span>
}

export default function AnatomyPage() {
  return (
    <main className="min-h-screen bg-[#f7f8fa] dark:bg-[#0a0a0f]">
      <Nav />

      <article className="px-6 pb-24 pt-28">
        <div className="mx-auto max-w-7xl">

          <a
            href="/#architecture"
            className="font-mono text-[11px] text-slate-500 transition-colors hover:text-cyan-600 dark:text-slate-500 dark:hover:text-cyan-400"
          >
            ← back to the stack
          </a>

          <header className="mt-6 max-w-3xl">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl dark:text-slate-100">
              Anatomy of a token
            </h1>
            <p className="mt-5 text-[17px] leading-relaxed text-slate-600 dark:text-slate-400">
              A request arrives over HTTPS and, some milliseconds later, a word comes back.
              In between it crosses four scales: a network, a box, a chip, and one
              multiprocessor on that chip. This follows it down — and explains why the last
              few millimetres of the journey set the price of everything above them.
            </p>
            <p className="mt-4 font-mono text-[11px] text-slate-400 dark:text-slate-600">
              figures drawn with the anatomy kit · hover any part · click to hold it
            </p>
          </header>

          <Section n="01." title="Serving a model is not a web service problem">
            <Prose>
              <p>
                It looks like one. Requests arrive, a pool of replicas answers them, you scale
                the pool. That intuition survives until the first time you watch a GPU sit at
                full utilisation and still produce tokens slowly, and none of the usual levers
                move it.
              </p>
              <p>
                The reason is that a generation request is two different workloads wearing one
                name. <Mono>Prefill</Mono> reads the whole prompt and builds the attention
                state for it. Every token attends to every other, the matrices are large, and
                the accelerator does what it was built to do — this part is compute-bound, and
                tensor cores saturate.
              </p>
              <p>
                <Mono>Decode</Mono> then emits one token at a time. Each step reads the entire
                model to produce a single token. The arithmetic per byte moved collapses, and
                from here on the chip is not computing so much as waiting. Almost everything
                that follows is a consequence of that one asymmetry.
              </p>
            </Prose>
          </Section>

          <Section n="02." title="The box">
            <Prose>
              <p>
                A serving node, with its lid and near wall off. Requests land on the front
                panel, cross the fan wall to the host, and the control plane places them on
                one of four accelerator sleds. One cable leaves the chassis entirely — that is
                traffic bound for hosted providers, which never touches this silicon.
              </p>
            </Prose>
            <div className="mt-6 h-[320px] w-full sm:h-[440px] lg:h-[560px]">
              <NodeFigure />
            </div>
            <Prose>
              <p className="mt-6">
                Two things here matter more than they look. The <Mono>host</Mono> barely
                participates: it tokenises, batches and queues, then gets out of the way. And
                the <Mono>control plane</Mono> is not a load balancer. Its job is to decide
                which replica takes a request, and the best answer is almost never the least
                busy one — it is the one that already holds the request&rsquo;s prefix in its
                KV cache. Placement is a cache question. Section 05 is why.
              </p>
            </Prose>
          </Section>

          <Section n="03." title="The chip">
            <Prose>
              <p>
                Inside one sled: a package carrying two dies joined by a die-to-die link fast
                enough that software never learns there are two, eight stacks of HBM around
                them, and 208 streaming multiprocessors — all of them drawn here, one tile
                each. One SM is lifted out of the array on projection lines and opened, because
                at array scale there is no room to show what an SM actually contains.
              </p>
            </Prose>
            <div className="mt-6 h-[320px] w-full sm:h-[440px] lg:h-[560px]">
              <GpuFigure />
            </div>
            <Prose>
              <p className="mt-6">
                Four partitions, each with a warp scheduler that switches on every stall — that
                is how the GPU hides memory latency it cannot avoid. Four tensor cores do the
                actual matrix multiply. Underneath them all sits the L1/shared block, and
                underneath that, a long way down, HBM.
              </p>
            </Prose>
          </Section>

          <Section n="04." title="Where the time actually goes">
            <Prose>
              <p>
                The memory hierarchy is the figure&rsquo;s real subject. Each level is roughly
                an order of magnitude slower than the one above it, and far larger:
              </p>
            </Prose>

            <div className="mt-6 max-w-4xl overflow-hidden rounded-2xl border border-black/[0.07] dark:border-white/[0.07]">
              {HIERARCHY.map((row, i) => (
                <div
                  key={row.level}
                  className={`flex flex-wrap items-baseline gap-x-6 gap-y-1 px-5 py-3.5 ${
                    i % 2 ? 'bg-black/[0.015] dark:bg-white/[0.015]' : ''
                  }`}
                >
                  <span className="w-28 shrink-0 font-mono text-[12px] text-slate-800 dark:text-slate-200">
                    {row.level}
                  </span>
                  <span className="w-40 shrink-0 font-mono text-[11px] text-slate-500">{row.size}</span>
                  <span className="w-24 shrink-0 font-mono text-[11px] text-cyan-700 dark:text-cyan-300">
                    {row.cost}
                  </span>
                  <span className="min-w-0 flex-1 text-[13px] text-slate-600 dark:text-slate-400">
                    {row.note}
                  </span>
                </div>
              ))}
            </div>

            <Prose>
              <p className="mt-6">
                Now put a number on the imbalance. A B200 does on the order of{' '}
                <Mono>20 PFLOPS</Mono> at FP4 while moving <Mono>8 TB/s</Mono> from HBM. To
                keep the arithmetic units busy you therefore need roughly{' '}
                <Mono>2,500 floating-point operations for every byte you read</Mono>.
              </p>
              <p>
                Decode offers about two. One token needs roughly two operations per parameter,
                and at FP8 a parameter is one byte. That is three orders of magnitude short of
                what the hardware wants. Batching multiplies the numerator, so the gap narrows
                with batch size — but KV-cache traffic grows with the batch too, and in
                practice decode stays on the memory side of the line.
              </p>
              <p>
                Which gives a ceiling you can work out on paper. A 70B model at FP8 is about
                70 GB of weights. Every decode step must read all of it:
              </p>
            </Prose>

            <div className="mt-5 max-w-3xl rounded-2xl border border-black/[0.07] bg-white/60 px-5 py-4 font-mono text-[13px] leading-relaxed text-slate-700 dark:border-white/[0.07] dark:bg-white/[0.02] dark:text-slate-300">
              70 GB ÷ 8 TB/s ≈ <span className="text-cyan-700 dark:text-cyan-300">8.75 ms</span> per token
              <span className="text-slate-400 dark:text-slate-600"> → about 114 tokens/s, batch of one</span>
            </div>

            <Prose>
              <p className="mt-5">
                That is an upper bound and a generous one — it ignores attention, KV-cache
                reads, kernel launch overhead and every inefficiency in between, and real
                systems land well under it. But it is the right shape of answer, and notice
                what is absent from it: the number of FLOPS the chip can do never appears.
                For decode, the accelerator is a memory system wearing a compute costume.
              </p>
            </Prose>
          </Section>

          <Section n="05." title="So what do you actually do about it">
            <Prose>
              <p>
                Every serious optimisation in LLM serving is the same move: make one trip to
                HBM do more work, or avoid the trip. What differs is which layer of the stack
                each one acts on.
              </p>
            </Prose>

            <div className="mt-6 max-w-4xl space-y-px overflow-hidden rounded-2xl border border-black/[0.07] dark:border-white/[0.07]">
              {LEVERS.map((row, i) => (
                <div
                  key={row.lever}
                  className={`px-5 py-4 ${i % 2 ? 'bg-black/[0.015] dark:bg-white/[0.015]' : ''}`}
                >
                  <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                    <span className="font-mono text-[13px] text-slate-800 dark:text-slate-200">
                      {row.lever}
                    </span>
                    <span className="rounded border border-black/[0.07] bg-black/[0.03] px-1.5 py-0.5 font-mono text-[10px] text-slate-500 dark:border-white/[0.07] dark:bg-white/[0.04]">
                      {row.layer}
                    </span>
                  </div>
                  <p className="mt-1.5 max-w-2xl text-[13px] leading-relaxed text-slate-600 dark:text-slate-400">
                    {row.buys}
                  </p>
                </div>
              ))}
            </div>
          </Section>

          <Section n="06." title="Why the topology looks the way it does">
            <Prose>
              <p>
                Read the stack diagram again with all of that in hand and its shape stops being
                arbitrary.
              </p>
              <p>
                The <Mono>semantic router</Mono> sits before placement because choosing{' '}
                <em>which model</em> answers is a different question from choosing{' '}
                <em>where it runs</em>, and answering them in that order lets a cheap model
                take the requests that never needed an expensive one — the cheapest weight read
                is the one you skip.
              </p>
              <p>
                The <Mono>control plane</Mono> routes on KV-cache residency rather than load,
                for the reason section 04 gives: a warm prefix skips prefill outright, and that
                is worth more than any amount of even load.
              </p>
              <p>
                The <Mono>frontier branch</Mono> leaves the building. Those calls obey someone
                else&rsquo;s roofline, and the constraint on them is budget and rate limit
                rather than bandwidth — which is exactly why they are drawn as a separate
                branch and not as another replica pool.
              </p>
              <p>
                And observability stays cross-cutting rather than becoming a step, because the
                thing you most need to see — whether you are compute-bound or memory-bound
                right now — is not a property of any single hop.
              </p>
            </Prose>

            <div className="mt-8">
              <a
                href="/#architecture"
                className="inline-flex items-center gap-2 rounded-xl border border-black/[0.08] bg-white/70 px-4 py-2.5 font-mono text-[12px] text-slate-700 transition-colors hover:border-cyan-500/40 hover:text-cyan-700 dark:border-white/[0.08] dark:bg-white/[0.03] dark:text-slate-300 dark:hover:border-cyan-400/40 dark:hover:text-cyan-300"
              >
                ← back to the stack diagram
              </a>
            </div>
          </Section>

        </div>
      </article>

      <Footer />
    </main>
  )
}
