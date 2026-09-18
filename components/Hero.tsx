'use client'

import { useEffect, useState } from 'react'

/* ── Node types ── */
type NodeVariant = 'default' | 'network' | 'serving' | 'compute'

function Node({
  label,
  sub,
  variant = 'default',
  glow = false,
}: {
  label: string
  sub?: string
  variant?: NodeVariant
  glow?: boolean
}) {
  const styles: Record<NodeVariant, string> = {
    default:  'border-black/[0.08] dark:border-white/10  bg-white/70 dark:bg-white/[0.03]',
    network:  'border-blue-300/50  dark:border-blue-400/30 bg-blue-50/80 dark:bg-blue-950/20',
    serving:  'border-cyan-300/60  dark:border-cyan-400/50  bg-cyan-50/80  dark:bg-cyan-950/30',
    compute:  'border-cyan-300/60  dark:border-cyan-400/50  bg-cyan-50/80  dark:bg-cyan-950/30',
  }
  const labelStyles: Record<NodeVariant, string> = {
    default:  'text-slate-700 dark:text-slate-300',
    network:  'text-blue-700  dark:text-blue-300',
    serving:  'text-cyan-700  dark:text-cyan-300',
    compute:  'text-cyan-700  dark:text-cyan-300',
  }

  return (
    <div
      className={`flex flex-col items-center justify-center px-3 py-2 rounded-lg border text-center w-full ${styles[variant]}`}
      style={glow ? { animation: 'pulseGlow 2.5s ease-in-out infinite' } : undefined}
    >
      <span className={`text-[10px] font-mono font-semibold leading-snug ${labelStyles[variant]}`}>
        {label}
      </span>
      {sub && (
        <span className="text-[9px] font-mono text-slate-400 dark:text-slate-600 mt-0.5">{sub}</span>
      )}
    </div>
  )
}

/* ── Vertical edge with flowing dots ── */
function VEdge({ delay = 0, color = 'cyan' }: { delay?: number; color?: 'cyan' | 'blue' }) {
  const dotColor = color === 'blue' ? '#60a5fa' : '#22d3ee'
  const dotGlow  = color === 'blue'
    ? 'rgba(96,165,250,0.9)'
    : 'rgba(34,211,238,0.9)'

  return (
    <div className="relative flex justify-center items-center w-full" style={{ height: 28 }}>
      <div className="absolute w-px h-full bg-black/[0.07] dark:bg-white/10" />
      {[0, 0.75, 1.5].map((d, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: '50%',
            transform: 'translateX(-50%)',
            width: 4,
            height: 4,
            borderRadius: '50%',
            background: dotColor,
            boxShadow: `0 0 7px ${dotGlow}`,
            animation: 'flowDotV 2.1s linear infinite',
            animationDelay: `${delay + d}s`,
          }}
        />
      ))}
      <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2"
        style={{
          width: 0, height: 0,
          borderLeft: '3px solid transparent',
          borderRight: '3px solid transparent',
          borderTop: '4px solid rgba(100,116,139,0.3)',
        }}
      />
    </div>
  )
}

/* ── Layer label ── */
function LayerBadge({ label, color }: { label: string; color: string }) {
  return (
    <div className={`absolute -left-2 top-1/2 -translate-y-1/2 -translate-x-full pr-2 hidden lg:block`}>
      <span className={`font-mono text-[9px] ${color} whitespace-nowrap opacity-60`}>{label}</span>
    </div>
  )
}

/* ── Hero ── */
export default function Hero() {
  const [cursor, setCursor] = useState(true)
  useEffect(() => {
    const t = setInterval(() => setCursor(v => !v), 580)
    return () => clearInterval(t)
  }, [])

  return (
    <section id="home" className="min-h-screen flex items-center px-6 pt-20 pb-12">
      <div className="max-w-5xl mx-auto w-full">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-14 items-center">

          {/* ── Left: intro text ── */}
          <div>
            <p
              className="font-mono text-sm text-slate-400 dark:text-slate-600 mb-6 animate-fade-in-up"
              style={{ animationDelay: '0ms' }}
            >
              <span className="text-cyan-600 dark:text-cyan-500">~</span> $ whoami
            </p>

            <h1
              className="text-5xl md:text-6xl font-bold text-slate-900 dark:text-slate-100 tracking-tight mb-3 animate-fade-in-up"
              style={{ animationDelay: '80ms', opacity: 0 }}
            >
              Imran Nazir
              <span
                className="inline-block w-[3px] h-10 md:h-12 bg-cyan-500 dark:bg-cyan-400 ml-1.5 align-bottom rounded-sm"
                style={{ opacity: cursor ? 1 : 0, transition: 'none' }}
              />
            </h1>

            <p
              className="font-mono text-cyan-600 dark:text-cyan-400 text-base md:text-lg mb-6 animate-fade-in-up"
              style={{ animationDelay: '160ms', opacity: 0 }}
            >
              AI Applied Engineer II &nbsp;·&nbsp; QuillBot (Learneo)
            </p>

            <div
              className="max-w-lg mb-10 space-y-2 animate-fade-in-up"
              style={{ animationDelay: '240ms', opacity: 0 }}
            >
              <p className="text-slate-800 dark:text-slate-300 text-lg leading-relaxed">
                I build the infrastructure that LLMs run on at scale.
              </p>
              <p className="text-slate-600 dark:text-slate-500 text-base">
                Civil Engineering grad &rarr; self-taught &rarr; ML systems engineer.{' '}
                <span className="text-slate-700 dark:text-slate-400">Serving 50M+ users.</span>
              </p>
            </div>

            <div
              className="flex flex-wrap gap-3 animate-fade-in-up"
              style={{ animationDelay: '320ms', opacity: 0 }}
            >
              {[
                { label: '→ view work',  href: '#projects', primary: true  },
                { label: 'read writing', href: '#writing',  primary: false },
                { label: 'github ↗',     href: 'https://github.com/the-cross-art', external: true },
                { label: 'linkedin ↗',   href: 'https://linkedin.com/in/meimran',  external: true },
              ].map(({ label, href, primary, external }) => (
                <a
                  key={label}
                  href={href}
                  {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                  className={[
                    'px-5 py-2.5 rounded-lg text-sm font-mono transition-all',
                    primary
                      ? 'bg-cyan-50 dark:bg-cyan-400/10 border border-cyan-300 dark:border-cyan-400/30 text-cyan-700 dark:text-cyan-300 hover:bg-cyan-100 dark:hover:bg-cyan-400/20'
                      : 'bg-black/[0.04] dark:bg-white/[0.04] border border-black/[0.09] dark:border-white/10 text-slate-600 dark:text-slate-400 hover:bg-black/[0.07] dark:hover:bg-white/[0.08] hover:text-slate-900 dark:hover:text-slate-200',
                  ].join(' ')}
                >
                  {label}
                </a>
              ))}
            </div>
          </div>

          {/* ── Right: vertical inference pipeline ── */}
          <div
            className="animate-fade-in-up"
            style={{ animationDelay: '400ms', opacity: 0 }}
          >
            <div className="border border-black/[0.07] dark:border-white/[0.07] rounded-xl bg-white/60 dark:bg-white/[0.02] p-5">

              {/* Header */}
              <div className="flex items-center gap-2 mb-4">
                <span
                  className="w-2 h-2 rounded-full bg-green-500 dark:bg-green-400"
                  style={{ boxShadow: '0 0 8px rgba(74,222,128,0.7)' }}
                />
                <span className="font-mono text-xs text-slate-500 dark:text-slate-500">
                  LLM Inference Stack
                </span>
              </div>

              {/* Pipeline */}
              <div className="flex flex-col items-center w-full max-w-[200px] mx-auto relative">

                {/* ── Network / DevOps layer ── */}
                <Node label="Client · API Gateway · CDN" sub="edge" />
                <VEdge delay={0} color="blue" />
                <div className="relative w-full">
                  <LayerBadge label="network / devops" color="text-blue-500 dark:text-blue-400" />
                  <Node label="Firewall · VPC" sub="security & compliance" variant="network" />
                </div>
                <VEdge delay={0.2} color="blue" />
                <Node label="EKS Ingress · Load Balancer" sub="Kubernetes cluster" variant="network" />
                <VEdge delay={0.4} color="cyan" />

                {/* ── ML Serving layer ── */}
                <div className="relative w-full">
                  <LayerBadge label="ml serving" color="text-cyan-600 dark:text-cyan-400" />
                  <Node label="vLLM · SGLang · Triton" sub="inference server" variant="serving" />
                </div>
                <VEdge delay={0.6} color="cyan" />
                <Node label="LoRA · QLoRA · Quant." sub="model optimization" variant="serving" />
                <VEdge delay={0.8} color="cyan" />
                <Node label="A100 / H100 GPU" sub="compute cluster" variant="compute" glow />
                <VEdge delay={1.0} color="cyan" />
                <Node label="Response" sub="served" />

                {/* Monitoring annotation */}
                <div className="mt-4 w-full border border-dashed border-black/[0.08] dark:border-white/[0.08] rounded-lg px-3 py-2 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500 dark:bg-green-400 shrink-0" />
                  <span className="font-mono text-[9px] text-slate-500 dark:text-slate-600">
                    CloudWatch · Prometheus · Grafana
                  </span>
                </div>
              </div>

              {/* Badge */}
              <div className="flex items-center justify-center gap-2 mt-4 pt-4 border-t border-black/[0.05] dark:border-white/[0.05]">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 dark:bg-cyan-400 shrink-0" />
                <span className="font-mono text-[11px] text-cyan-600 dark:text-cyan-300 font-medium">Imran</span>
                <span className="text-slate-300 dark:text-slate-700 text-xs">·</span>
                <span className="font-mono text-[11px] text-slate-500 dark:text-slate-500">designs &amp; operates this stack</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
