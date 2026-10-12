import type { Metadata } from 'next'
import dynamic from 'next/dynamic'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'

/* three.js is heavy, so it loads only when this route is opened —
   the main page bundle is untouched. */
const StackScene = dynamic(() => import('@/components/StackScene'), { ssr: false })

export const metadata: Metadata = {
  title: 'LLM Inference Stack — Imran Nazir',
  description:
    'An interactive isometric model of the production LLM serving stack: edge, gateway, routing, cluster and GPU pools.',
}

export default function StackPage() {
  return (
    <main className="min-h-screen bg-[#f7f8fa] dark:bg-[#0a0a0f]">
      <Nav />

      <section className="px-6 pb-16 pt-28">
        <div className="mx-auto max-w-7xl">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                LLM inference stack
              </h1>
              <p className="mt-2 max-w-xl text-sm text-slate-600 dark:text-slate-500">
                The same topology as the diagram on the home page, as a thing you can
                turn over. The nesting is the point — orbit around and you can see what
                sits inside the cluster, and what sits inside the network but outside it.
              </p>
            </div>
            <a
              href="/#architecture"
              className="font-mono text-xs text-slate-500 transition-colors hover:text-cyan-600 dark:hover:text-cyan-400"
            >
              ← back to the diagram
            </a>
          </div>

          <StackScene />

          <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2">
            {[
              ['#8294b0', 'edge'],
              ['#60a5fa', 'gateway'],
              ['#a78bfa', 'frontier'],
              ['#22d3ee', 'cluster'],
              ['#67e8f9', 'metal'],
            ].map(([c, label]) => (
              <span key={label} className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-sm" style={{ background: c }} />
                <span className="font-mono text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-600">
                  {label}
                </span>
              </span>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
