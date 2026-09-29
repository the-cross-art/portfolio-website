'use client'

import { Fragment, useEffect, useState } from 'react'

/* ── Packet traffic ──
 * Uneven arrivals on purpose: two close together, then a gap. A fixed
 * table rather than random, so server and client render identically.
 * [delay(s), duration(s), opacity, length(px), thickness(px)]
 */
const PACKETS: [number, number, number, number, number][] = [
  [0.00, 2.20, 1.00, 11, 2],
  [0.62, 2.95, 0.42,  6, 1],
  [0.91, 2.45, 0.78,  9, 2],
  [2.05, 3.10, 0.38,  6, 1],
]

const TRAIL = {
  cyan: { core: '#22d3ee', glow: 'rgba(34,211,238,0.85)' },
  blue: { core: '#60a5fa', glow: 'rgba(96,165,250,0.85)' },
} as const

type Flow = keyof typeof TRAIL

/* Horizontal run between stages */
function HEdge({ delay = 0, color = 'cyan', w = 34 }: { delay?: number; color?: Flow; w?: number }) {
  const { core, glow } = TRAIL[color]
  return (
    <div
      className="relative flex shrink-0 items-center self-center overflow-hidden"
      style={{ width: w, height: 14 }}
      aria-hidden
    >
      <div className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-black/[0.08] dark:bg-white/10" />
      {PACKETS.map(([d, dur, op, len, th], i) => (
        <span
          key={i}
          style={{
            position: 'absolute',
            left: 0,
            top: '50%',
            width: len,
            height: th,
            borderRadius: th,
            background: `linear-gradient(to right, transparent, ${core})`,
            boxShadow: `0 0 6px ${glow}`,
            ['--p-op' as string]: op,
            ['--p-travel' as string]: `${w + 12}px`,
            animation: `trafficH ${dur}s linear infinite`,
            animationDelay: `${delay + d}s`,
            willChange: 'transform, opacity',
          }}
        />
      ))}
    </div>
  )
}

/* Vertical run, for the drop out of the cluster into the GPU pool */
function VEdge({ delay = 0, color = 'cyan', h = 26 }: { delay?: number; color?: Flow; h?: number }) {
  const { core, glow } = TRAIL[color]
  return (
    <div
      className="relative flex w-full justify-center overflow-hidden"
      style={{ height: h }}
      aria-hidden
    >
      <div className="absolute h-full w-px bg-black/[0.08] dark:bg-white/10" />
      {PACKETS.map(([d, dur, op, len, th], i) => (
        <span
          key={i}
          style={{
            position: 'absolute',
            top: 0,
            left: '50%',
            width: th,
            height: len,
            borderRadius: th,
            background: `linear-gradient(to bottom, transparent, ${core})`,
            boxShadow: `0 0 6px ${glow}`,
            ['--p-op' as string]: op,
            ['--p-travel' as string]: `${h + 10}px`,
            animation: `traffic ${dur}s linear infinite`,
            animationDelay: `${delay + d}s`,
            willChange: 'transform, opacity',
          }}
        />
      ))}
    </div>
  )
}

type Variant = 'default' | 'network' | 'serving' | 'compute'

const boxStyle: Record<Variant, string> = {
  default: 'border-black/[0.08] dark:border-white/10   bg-white/70 dark:bg-white/[0.03]',
  network: 'border-blue-300/50 dark:border-blue-400/30 bg-blue-50/80 dark:bg-blue-950/20',
  serving: 'border-cyan-300/60 dark:border-cyan-400/50 bg-cyan-50/80 dark:bg-cyan-950/30',
  compute: 'border-cyan-300/60 dark:border-cyan-400/50 bg-cyan-50/80 dark:bg-cyan-950/30',
}
const titleStyle: Record<Variant, string> = {
  default: 'text-slate-700 dark:text-slate-300',
  network: 'text-blue-700  dark:text-blue-300',
  serving: 'text-cyan-700  dark:text-cyan-300',
  compute: 'text-cyan-700  dark:text-cyan-300',
}

function Stage({
  label,
  lines,
  variant = 'default',
  glow = false,
  className = '',
}: {
  label: string
  lines?: string[]
  variant?: Variant
  glow?: boolean
  className?: string
}) {
  return (
    <div
      className={`rounded-xl border px-3 py-2.5 ${boxStyle[variant]} ${className}`}
      style={glow ? { animation: 'pulseGlow 2.5s ease-in-out infinite' } : undefined}
    >
      <div className={`font-mono text-[10px] font-semibold leading-tight ${titleStyle[variant]}`}>
        {label}
      </div>
      {lines && (
        <div className="mt-1.5 space-y-[2px]">
          {lines.map(l => (
            <div key={l} className="font-mono text-[8px] leading-snug text-slate-500 dark:text-slate-500">
              {l}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/* Labelled boundary — keeps the containment visible */
function Zone({
  label,
  accent = false,
  children,
  className = '',
}: {
  label: string
  accent?: boolean
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={`relative rounded-2xl border border-dashed p-3 pt-5 ${
        accent
          ? 'border-cyan-400/30 bg-cyan-500/[0.03] dark:border-cyan-400/25 dark:bg-cyan-400/[0.03]'
          : 'border-black/[0.13] dark:border-white/[0.13]'
      } ${className}`}
    >
      <span
        className={`absolute -top-[7px] left-4 bg-[#f7f8fa] px-2 font-mono text-[8px] uppercase tracking-wider dark:bg-[#0a0a0f] ${
          accent ? 'text-cyan-600 dark:text-cyan-400' : 'text-slate-500 dark:text-slate-500'
        }`}
      >
        {label}
      </span>
      {children}
    </div>
  )
}

function Throughput() {
  const [rps, setRps] = useState(1240)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    let current = 1240, target = 1240, ticks = 0
    const id = setInterval(() => {
      if (ticks % 7 === 0) target = 1150 + Math.random() * 260
      current += (target - current) * 0.18
      ticks++
      setRps(Math.round(current))
    }, 200)
    return () => clearInterval(id)
  }, [])

  return (
    <span className="font-mono text-[11px] tabular-nums text-cyan-600 dark:text-cyan-400">
      {rps.toLocaleString('en-US')} <span className="text-slate-400 dark:text-slate-600">req/s</span>
    </span>
  )
}


/* ── The cluster chain, defined once ──
 * Rendered left-to-right on wide screens and top-to-bottom on narrow ones,
 * so phones get the real topology instead of a horizontal scrollbar.
 */
type ChainNode =
  | { kind: 'stage'; label: string; lines: string[]; variant: Variant; w: number; glow?: boolean }
  | { kind: 'split'; w: number; options: { label: string; lines: string[] }[] }

const CHAIN: ChainNode[] = [
  { kind: 'stage', label: 'INGRESS', variant: 'network', w: 80, lines: ['ALB / NGINX'] },
  {
    kind: 'stage', label: 'SEMANTIC ROUTER', variant: 'serving', w: 130,
    lines: ['prompt classification', 'model selection', 'cost / latency routing', 'LoRA selection'],
  },
  {
    kind: 'stage', label: 'llm-d CONTROL PLANE', variant: 'serving', w: 136,
    lines: ['request scheduling', 'KV-cache-aware routing', 'multi-cluster dispatch', 'GPU-aware placement'],
  },
  {
    kind: 'split', w: 108,
    options: [
      { label: 'FAST MODELS', lines: ['Qwen · Llama'] },
      { label: 'REASONING',   lines: ['DeepSeek · GPT-OSS'] },
    ],
  },
  {
    kind: 'stage', label: 'INFERENCE ENGINES', variant: 'serving', w: 142,
    lines: ['vLLM · SGLang · Triton', 'prefix cache', 'continuous batching', 'speculative decoding', 'PagedAttention'],
  },
  {
    kind: 'stage', label: 'MODEL OPTIMIZATION', variant: 'serving', w: 112,
    lines: ['LoRA · QLoRA', 'AWQ · GPTQ', 'FP8 · INT4'],
  },
]

const CLIENTS = { label: 'CLIENTS', lines: ['web · mobile', 'API consumers · agents'] }
const EDGE = {
  label: 'EDGE & SECURITY',
  lines: ['CDN · API gateway · WAF', 'rate limiting · auth'],
}
const GPU = {
  label: 'GPU NODE GROUPS',
  lines: ['H100 · H200 · B200 · A100', 'tensor · pipeline · expert parallelism'],
}

function ChainStage({ node, vertical }: { node: ChainNode; vertical: boolean }) {
  const sizing = vertical ? 'w-full' : `shrink-0`
  const style = vertical ? undefined : { width: node.w }

  if (node.kind === 'split') {
    return (
      <div className={`flex flex-col justify-center gap-1.5 ${sizing}`} style={style}>
        {node.options.map(o => (
          <Stage key={o.label} label={o.label} lines={o.lines} variant="serving" />
        ))}
      </div>
    )
  }
  return (
    <div className={sizing} style={style}>
      <Stage label={node.label} lines={node.lines} variant={node.variant} glow={node.glow} />
    </div>
  )
}

export default function Architecture() {
  return (
    <section id="architecture" className="px-6 pb-24 pt-4">
      <div className="mx-auto max-w-7xl">

        <div className="mb-4 flex flex-wrap items-center gap-x-3 gap-y-2">
          <span
            className="h-2 w-2 rounded-full bg-green-500 dark:bg-green-400"
            style={{ boxShadow: '0 0 8px rgba(74,222,128,0.7)' }}
          />
          <h2 className="font-mono text-sm text-slate-600 dark:text-slate-400">
            LLM Inference Stack
          </h2>
          <span className="font-mono text-[11px] text-slate-400 dark:text-slate-600">
            production topology
          </span>
          <span className="ml-auto">
            <Throughput />
          </span>
        </div>

        <div className="rounded-2xl border border-black/[0.07] bg-white/60 p-4 sm:p-5 dark:border-white/[0.07] dark:bg-white/[0.02]">

          {/* ── Wide: left to right ── */}
          <div className="hidden lg:block">
            <div className="flex items-stretch gap-0">
              <div className="flex w-[178px] shrink-0 flex-col justify-center gap-2">
                <Stage label={CLIENTS.label} lines={CLIENTS.lines} />
                <VEdge delay={0} color="blue" h={18} />
                <Stage label={EDGE.label} lines={EDGE.lines} variant="network" />
              </div>
              <HEdge delay={0.3} color="blue" w={36} />

              <Zone label="private network (vpc)" className="flex-1">
                <Zone label="kubernetes cluster" accent>
                  <div className="flex items-stretch gap-0">
                    {CHAIN.map((node, i) => (
                      <Fragment key={node.kind === 'split' ? 'split' : node.label}>
                        {i > 0 && <HEdge delay={0.55 + i * 0.25} w={22} />}
                        <ChainStage node={node} vertical={false} />
                      </Fragment>
                    ))}
                  </div>
                </Zone>

                <VEdge delay={0.2} h={26} />
                <Stage label={GPU.label} lines={GPU.lines} variant="compute" glow />
              </Zone>
            </div>
          </div>

          {/* ── Narrow: top to bottom, same topology ── */}
          <div className="lg:hidden">
            <Stage label={CLIENTS.label} lines={CLIENTS.lines} />
            <VEdge delay={0} color="blue" h={22} />
            <Stage label={EDGE.label} lines={EDGE.lines} variant="network" />
            <VEdge delay={0.3} color="blue" h={22} />

            <Zone label="private network (vpc)">
              <Zone label="kubernetes cluster" accent>
                {CHAIN.map((node, i) => (
                  <Fragment key={node.kind === 'split' ? 'split' : node.label}>
                    {i > 0 && <VEdge delay={0.55 + i * 0.25} h={22} />}
                    <ChainStage node={node} vertical />
                  </Fragment>
                ))}
              </Zone>

              <VEdge delay={0.2} h={22} />
              <Stage label={GPU.label} lines={GPU.lines} variant="compute" glow />
            </Zone>
          </div>

          {/* observability spans every tier rather than sitting in the path */}
          <div className="mt-4 rounded-xl border border-dashed border-black/[0.10] px-4 py-3 dark:border-white/[0.10]">
            <div className="mb-2 flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-green-500 dark:bg-green-400" />
              <span className="font-mono text-[9px] uppercase tracking-wider text-slate-500 dark:text-slate-500">
                Observability
              </span>
              <span className="ml-auto font-mono text-[8px] text-slate-400 dark:text-slate-700">
                instruments every tier above
              </span>
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-4">
              {[
                ['metrics', 'Prometheus'],
                ['dashboards', 'Grafana'],
                ['logs', 'CloudWatch'],
                ['traces', 'OpenTelemetry'],
              ].map(([kind, tool]) => (
                <div key={kind}>
                  <div className="font-mono text-[8px] text-slate-400 dark:text-slate-600">{kind}</div>
                  <div className="font-mono text-[10px] text-slate-600 dark:text-slate-400">{tool}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <p className="mt-3 flex items-center justify-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-cyan-500 dark:bg-cyan-400" />
          <span className="font-mono text-[11px] font-medium text-cyan-600 dark:text-cyan-300">Imran</span>
          <span className="text-slate-300 dark:text-slate-700">·</span>
          <span className="font-mono text-[11px] text-slate-500">designs &amp; operates this stack</span>
        </p>
      </div>
    </section>
  )
}
