/**
 * Writing section — Medium articles.
 *
 * To add real screenshots:
 *   1. Take a screenshot of each article (1200×630 recommended)
 *   2. Save as: public/writing/article-1.png ... public/writing/article-5.png
 *   3. Set image: '/writing/article-N.png' in the articles array below.
 *   4. The component will use the real image when `image` is set.
 */

const articles = [
  {
    n: '01',
    title: 'Serving LLMs Through the GPU Drought: Capacity-Aware Inference with Automatic Instance-Type Fallback',
    date: 'Aug 23, 2026',
    url: 'https://medium.com/@imrannaz326/serving-llms-through-the-gpu-drought-capacity-aware-inference-with-automatic-instance-type-c376c104a4fb',
    tags: ['LLM Serving', 'GPU', 'Infrastructure'],
    readTime: '8 min',
    image: '/writing/article-1.jpg',
    gradient: 'from-cyan-950 via-cyan-900 to-slate-900 dark:from-cyan-950 dark:via-[#0c1a1f] dark:to-[#0a0a0f]',
    accentText: 'text-cyan-400 dark:text-cyan-300',
  },
  {
    n: '02',
    title: 'Serving Large Language Models on Kubernetes at Scale: Connection-Level Overload Protection for GPU Inference',
    date: 'Jul 27, 2026',
    url: 'https://medium.com/@imrannaz326/serving-large-language-models-on-kubernetes-at-scale-connection-level-overload-protection-for-gpu-787111226f98',
    tags: ['Kubernetes', 'LLM', 'GPU Inference'],
    readTime: '10 min',
    image: '/writing/article-2.jpg',
    gradient: 'from-blue-950 via-blue-900 to-slate-900 dark:from-blue-950 dark:via-[#0b0f1a] dark:to-[#0a0a0f]',
    accentText: 'text-blue-400 dark:text-blue-300',
  },
  {
    n: '03',
    title: "I Opened the GPU Black Box For LLM Inference. Here's What I Found!",
    date: 'Apr 24, 2026',
    url: 'https://medium.com/@imrannaz326/i-opened-the-gpu-black-box-for-llm-inference-heres-what-i-found-0463f22e11aa',
    tags: ['GPU', 'LLM', 'Deep Dive'],
    readTime: '12 min',
    image: '/writing/article-3.jpg',
    gradient: 'from-violet-950 via-violet-900 to-slate-900 dark:from-violet-950 dark:via-[#10091a] dark:to-[#0a0a0f]',
    accentText: 'text-violet-400 dark:text-violet-300',
  },
  {
    n: '04',
    title: 'How I Built a Smart Semantic Search for Quick Commerce Using LLMs',
    date: 'May 18, 2025',
    url: 'https://medium.com/@imrannaz326/how-i-built-a-smart-semantic-search-for-quick-commerce-using-llms-bca4777f2766',
    tags: ['LLM', 'Semantic Search', 'NLP'],
    readTime: '7 min',
    image: '/writing/article-4.jpg',
    gradient: 'from-emerald-950 via-emerald-900 to-slate-900 dark:from-emerald-950 dark:via-[#071510] dark:to-[#0a0a0f]',
    accentText: 'text-emerald-400 dark:text-emerald-300',
  },
  {
    n: '05',
    title: 'Seamless Integration: Deploying FastAPI ML Inference Code with SageMaker BYOC + Nginx',
    date: 'Jun 26, 2023',
    url: 'https://medium.com/@imrannaz326/seamless-integration-deploying-fastapi-ml-inference-code-with-sagemaker-byoc-nginx-6802103f7a2c',
    tags: ['SageMaker', 'FastAPI', 'MLOps'],
    readTime: '9 min',
    image: '/writing/article-5.jpg',
    gradient: 'from-amber-950 via-amber-900 to-slate-900 dark:from-amber-950 dark:via-[#1a1000] dark:to-[#0a0a0f]',
    accentText: 'text-amber-400 dark:text-amber-300',
  },
]

export default function Writing() {
  return (
    <section id="writing" className="py-24 px-6">
      <div className="max-w-5xl mx-auto">

        <div className="flex items-center gap-4 mb-4">
          <span className="font-mono text-cyan-600 dark:text-cyan-400 text-sm">05.</span>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">writing</h2>
          <div className="flex-1 h-px bg-black/[0.06] dark:bg-white/[0.05]" />
        </div>
        <p className="font-mono text-sm text-slate-400 dark:text-slate-600 mb-10">
          GPU inference internals · LLM serving at scale · Kubernetes · ML systems
        </p>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {articles.map((a, i) => (
            <a
              key={a.url}
              href={a.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{ ["--tilt" as string]: i % 2 === 0 ? "0.5deg" : "-0.5deg" }}
              className="group border border-black/[0.07] dark:border-white/[0.07] rounded-2xl overflow-hidden bg-white dark:bg-white/[0.02] hover:border-black/[0.12] dark:hover:border-white/[0.12] card-tilt hover:shadow-xl dark:hover:shadow-none flex flex-col"
            >
              {/* Image or gradient placeholder */}
              <div className="relative h-32 overflow-hidden shrink-0">
                {a.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={a.image}
                    alt={a.title}
                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-500"
                  />
                ) : (
                  <div className={`w-full h-full bg-gradient-to-br ${a.gradient} flex items-center justify-center relative`}>
                    {/* Large number watermark */}
                    <span className={`text-7xl font-bold font-mono opacity-10 select-none ${a.accentText}`}>
                      {a.n}
                    </span>
                    {/* Medium badge */}
                    <span className="absolute top-3 right-3 font-mono text-[10px] text-white/30 border border-white/10 rounded px-2 py-0.5">
                      Medium
                    </span>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-4 flex flex-col flex-1">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-slate-400 dark:text-slate-600 text-xs">{a.date}</span>
                  <span className="font-mono text-slate-400 dark:text-slate-700 text-[10px]">{a.readTime}</span>
                </div>

                <h3 className="text-slate-800 dark:text-slate-300 group-hover:text-black dark:group-hover:text-slate-100 text-sm font-medium leading-snug mb-3 transition-colors flex-1">
                  {a.title}
                </h3>

                <div className="flex flex-wrap gap-1.5">
                  {a.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 bg-black/[0.04] dark:bg-white/[0.04] border border-black/[0.06] dark:border-white/[0.06] rounded text-slate-500 dark:text-slate-600 text-[10px] font-mono"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="mt-3 pt-3 border-t border-black/[0.05] dark:border-white/[0.05] flex items-center justify-between">
                  <span className="font-mono text-[10px] text-slate-400 dark:text-slate-600">Read on Medium</span>
                  <span className="text-slate-400 dark:text-slate-600 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors text-sm">↗</span>
                </div>
              </div>
            </a>
          ))}
        </div>

        <p className="mt-8 text-center">
          <a
            href="https://medium.com/@imrannaz326"
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-sm text-slate-400 dark:text-slate-600 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors"
          >
            all articles on Medium ↗
          </a>
        </p>
      </div>
    </section>
  )
}
