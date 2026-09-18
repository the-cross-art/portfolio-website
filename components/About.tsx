export default function About() {
  return (
    <section id="about" className="py-24 px-6">
      <div className="max-w-5xl mx-auto">

        <div className="flex items-center gap-4 mb-12">
          <span className="font-mono text-cyan-600 dark:text-cyan-400 text-sm">01.</span>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">about</h2>
          <div className="flex-1 h-px bg-black/[0.06] dark:bg-white/[0.05]" />
        </div>

        <div className="grid md:grid-cols-3 gap-12 items-start">

          {/* Bio */}
          <div className="md:col-span-2 space-y-5 text-slate-700 dark:text-slate-400 leading-relaxed text-[15px]">
            <p>
              I studied{' '}
              <span className="text-slate-900 dark:text-slate-200">Civil Engineering</span> at BIT Sindri,
              Dhanbad — graduating with an 8.99 CGPA in 2023. While most of my classmates went
              into construction, I was in my dorm room learning to code. No CS degree, no
              bootcamp — just curiosity and an obsession with building things that work.
            </p>
            <p>
              I taught myself software engineering, data engineering, and then ML infrastructure
              from the ground up. That journey took me from a Full-Stack intern to a Data Engineer
              at Episource (acquired by Optum), and eventually to building production ML systems
              at <span className="text-slate-900 dark:text-slate-200">Optum (UnitedHealth Group)</span> for 3+ years —
              where I also managed networking for both dev and prod Kubernetes clusters,
              including firewall security, VPC configuration, and compliance policies.
            </p>
            <p>
              Today I&apos;m an{' '}
              <span className="text-slate-900 dark:text-slate-200">AI Applied Engineer II at QuillBot</span>,
              where I own the LLM serving infrastructure for 50M+ users. I work across the full
              inference stack — from model optimization (LoRA, QLoRA, quantization) to serving
              layers (vLLM, SGLang, Triton) to orchestration on Kubernetes. I shipped{' '}
              <span className="text-slate-900 dark:text-slate-200">Rengoku</span>, a production Kubernetes
              sidecar that handles async LLM inference at 5,000+ pages per batch.
            </p>
            <p>
              I also write. My articles cover GPU inference internals, connection-level overload
              protection on Kubernetes, and capacity-aware LLM serving. I believe in sharing what
              I learn in the open.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 pt-4">
              {[
                { value: '50M+',  label: 'users served'   },
                { value: '5K+',   label: 'pages / batch'  },
                { value: '5 yrs', label: 'in ML systems'  },
              ].map(({ value, label }) => (
                <div
                  key={label}
                  className="border border-black/[0.07] dark:border-white/[0.07] rounded-lg p-4 text-center bg-white/80 dark:bg-white/[0.02]"
                >
                  <p className="text-2xl font-bold text-cyan-600 dark:text-cyan-400 font-mono">{value}</p>
                  <p className="text-xs text-slate-600 dark:text-slate-500 mt-1">{label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Photo + quick facts */}
          <div className="space-y-6">
            <div className="rounded-xl overflow-hidden border border-black/[0.08] dark:border-white/[0.08]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/imran.jpeg"
                alt="Imran Nazir"
                className="w-full object-cover grayscale hover:grayscale-0 transition-all duration-500"
              />
            </div>

            <div className="space-y-2.5">
              {[
                { k: 'location', v: 'Bangalore, India'    },
                { k: 'role',     v: 'AI Applied Eng. II'  },
                { k: 'company',  v: 'QuillBot · Learneo'  },
                { k: 'focus',    v: 'LLM Infra · GPUs'    },
                { k: 'edu',      v: 'Civil Eng → ML Infra'},
              ].map(({ k, v }) => (
                <div key={k} className="flex gap-3">
                  <span className="font-mono text-slate-500 dark:text-slate-600 w-16 shrink-0 text-xs pt-0.5">{k}</span>
                  <span className="text-slate-700 dark:text-slate-400 text-sm">{v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
