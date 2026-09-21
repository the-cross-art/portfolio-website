const projects = [
  {
    name: 'Rengoku',
    badge: 'Work · Optum',
    tags: ['Kubernetes', 'AWS SQS', 'Python', 'Docker', 'S3', 'SNS', 'SOLID'],
    description:
      'Production-grade Kubernetes sidecar acting as async middleware between AWS SQS and a self-hosted LLM inference container (Qwen 2.5B). Handles the complete async pipeline — SQS polling, inference invocation, S3 result upload, SNS/SQS notifications, and auto pod termination when the queue drains.',
    highlights: [
      '5,000+ pages per batch in production',
      'SOLID principles + dependency injection',
      'Cloud-agnostic via subclassing',
    ],
    repo: null,
  },
  {
    name: 'LLM-Powered RAG System',
    badge: 'Personal',
    tags: ['LangChain', 'LangGraph', 'FastAPI', 'Vector DB', 'Python'],
    description:
      'Production-grade RAG system using LangChain for orchestration and a vector database for semantic retrieval. Implements LangGraph-based stateful multi-step reasoning with tool invocation. Hybrid retrieval (semantic + keyword) deployed as a FastAPI service with request batching and response caching.',
    highlights: [
      '+40% response relevance over baseline',
      'Stateful multi-step reasoning via LangGraph',
      'FastAPI service with batching + caching',
    ],
    repo: 'https://github.com/the-cross-art',
  },
  {
    name: 'Medallion Lakehouse Pipeline',
    badge: 'Personal',
    tags: ['Databricks', 'PySpark', 'Delta Lake', 'Unity Catalog', 'DLT'],
    description:
      'Production-style Medallion Architecture on Databricks — Bronze → Silver → Gold layers with Auto Loader for incremental ingestion, Delta Live Tables for pipeline orchestration, and Unity Catalog for fine-grained governance. Spark execution tuned with AQE, partition pruning, and predicate pushdown.',
    highlights: [
      'AQE + partition pruning optimisations',
      'Delta Live Tables for declarative pipelines',
      'Unity Catalog governance layer',
    ],
    repo: 'https://github.com/the-cross-art',
  },
]

export default function Projects() {
  return (
    <section id="projects" className="py-24 px-6">
      <div className="max-w-5xl mx-auto">

        <div className="flex items-center gap-4 mb-12">
          <span className="font-mono text-cyan-600 dark:text-cyan-400 text-sm">03.</span>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">projects</h2>
          <div className="flex-1 h-px bg-black/[0.06] dark:bg-white/[0.05]" />
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          {projects.map((p) => (
            <div
              key={p.name}
              className="border border-black/[0.07] dark:border-white/[0.07] rounded-2xl p-6 bg-white/70 dark:bg-white/[0.02] hover:bg-white dark:hover:bg-white/[0.04] hover:border-black/[0.10] dark:hover:border-white/[0.11] transition-all flex flex-col"
            >
              <div className="flex items-start justify-between mb-1">
                <h3 className="text-slate-900 dark:text-slate-100 font-semibold text-[15px] leading-snug">{p.name}</h3>
                {p.repo && (
                  <a
                    href={p.repo}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-400 dark:text-slate-600 hover:text-slate-700 dark:hover:text-slate-300 transition-colors ml-2 shrink-0"
                    title="GitHub"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
                    </svg>
                  </a>
                )}
              </div>

              <span className="font-mono text-[10px] text-slate-400 dark:text-slate-600 mb-4">{p.badge}</span>

              <div className="flex flex-wrap gap-1.5 mb-4">
                {p.tags.map((t) => (
                  <span
                    key={t}
                    className="px-2 py-0.5 bg-black/[0.04] dark:bg-white/[0.04] border border-black/[0.07] dark:border-white/[0.07] rounded text-slate-500 dark:text-slate-500 text-[10px] font-mono"
                  >
                    {t}
                  </span>
                ))}
              </div>

              <p className="text-slate-700 dark:text-slate-400 text-sm leading-relaxed mb-5 flex-1">{p.description}</p>

              <ul className="space-y-1.5 border-t border-black/[0.05] dark:border-white/[0.05] pt-4 mt-auto">
                {p.highlights.map((h) => (
                  <li key={h} className="flex gap-2 text-xs text-slate-500 dark:text-slate-500">
                    <span className="text-cyan-500 dark:text-cyan-400 shrink-0">✓</span>
                    {h}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
