const socials = [
  { label: 'LinkedIn', href: 'https://linkedin.com/in/meimran'       },
  { label: 'GitHub',   href: 'https://github.com/the-cross-art'      },
  { label: 'Medium',   href: 'https://medium.com/@imrannaz326'       },
  { label: 'LeetCode', href: 'https://leetcode.com/u/imrannaz326'    },
]

export default function Contact() {
  return (
    <section id="contact" className="py-24 px-6">
      <div className="max-w-5xl mx-auto">

        <div className="flex items-center gap-4 mb-12">
          <span className="font-mono text-cyan-600 dark:text-cyan-400 text-sm">06.</span>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">contact</h2>
          <div className="flex-1 h-px bg-black/[0.06] dark:bg-white/[0.05]" />
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-start">

          {/* Left */}
          <div>
            <p className="text-slate-900 dark:text-slate-200 text-xl font-medium mb-3">Let&apos;s talk.</p>
            <p className="text-slate-700 dark:text-slate-500 text-sm leading-relaxed mb-7">
              Open to conversations about LLM infrastructure, MLOps architecture, or GPU systems.
              Happy to connect on collaborations, technical writing, or speaking opportunities.
            </p>

            <a
              href="mailto:imrannaz326@gmail.com"
              className="font-mono text-sm text-cyan-600 dark:text-cyan-400 hover:text-cyan-500 dark:hover:text-cyan-300 transition-colors block mb-8"
            >
              imrannaz326@gmail.com ↗
            </a>

            <div className="flex flex-wrap gap-2.5">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 border border-black/[0.08] dark:border-white/[0.08] rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:border-black/[0.15] dark:hover:border-white/[0.18] text-xs font-mono transition-all"
                >
                  {s.label} ↗
                </a>
              ))}
            </div>
          </div>

          {/* Right: form */}
          <form
            name="contact-form"
            method="POST"
            data-netlify="true"
            className="space-y-3"
          >
            <input type="hidden" name="form-name" value="contact-form" />

            <input
              type="text"
              name="name"
              placeholder="Name"
              required
              className="w-full px-4 py-3 bg-white dark:bg-white/[0.04] border border-black/[0.09] dark:border-white/[0.09] rounded-xl text-slate-700 dark:text-slate-300 placeholder-slate-400 dark:placeholder-slate-700 text-sm font-mono focus:outline-none focus:border-cyan-400/50 dark:focus:border-cyan-400/40 transition-all"
            />
            <input
              type="email"
              name="email"
              placeholder="Email"
              required
              className="w-full px-4 py-3 bg-white dark:bg-white/[0.04] border border-black/[0.09] dark:border-white/[0.09] rounded-xl text-slate-700 dark:text-slate-300 placeholder-slate-400 dark:placeholder-slate-700 text-sm font-mono focus:outline-none focus:border-cyan-400/50 dark:focus:border-cyan-400/40 transition-all"
            />
            <textarea
              name="message"
              placeholder="Message"
              rows={5}
              className="w-full px-4 py-3 bg-white dark:bg-white/[0.04] border border-black/[0.09] dark:border-white/[0.09] rounded-xl text-slate-700 dark:text-slate-300 placeholder-slate-400 dark:placeholder-slate-700 text-sm font-mono focus:outline-none focus:border-cyan-400/50 dark:focus:border-cyan-400/40 transition-all resize-none"
            />
            <button
              type="submit"
              className="w-full px-4 py-3 bg-cyan-50 dark:bg-cyan-400/10 border border-cyan-200 dark:border-cyan-400/30 text-cyan-700 dark:text-cyan-300 rounded-xl text-sm font-mono hover:bg-cyan-100 dark:hover:bg-cyan-400/20 hover:border-cyan-300 dark:hover:border-cyan-400/50 transition-all"
            >
              send message →
            </button>
          </form>
        </div>
      </div>
    </section>
  )
}
