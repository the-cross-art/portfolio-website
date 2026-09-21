const experiences = [
  {
    company: 'QuillBot (Learneo)',
    role: 'AI Applied Engineer II',
    period: 'Sep 2026 – Present',
    location: 'Remote · Bangalore',
    current: true,
    highlights: [
      'Building and maintaining LLM serving infrastructure for 50M+ users',
      'Owning model deployment, versioning, monitoring, and rollback pipelines',
      'Stack: vLLM, Kubernetes, Python, MLflow',
    ],
  },
  {
    company: 'Optum (UnitedHealth Group)',
    role: 'MLOps and Data Platform Engineer',
    period: 'Jul 2023 – Sep 2026',
    location: 'Mumbai, India',
    current: false,
    highlights: [
      'Built Rengoku — a production Kubernetes sidecar for async LLM inference (SQS → Qwen 2.5B → S3), achieving 5,000+ pages/batch via SOLID principles and dependency injection',
      'Led migration of model serving to AWS SageMaker Async via Terraform IaC; designed CI/CD pipelines with GitHub Actions',
      'Architected data pipelines with Kafka, DynamoDB, and Snowflake; led MLOps automation testing to improve end-to-end model stability',
    ],
  },
  {
    company: 'Episource → Optum',
    role: 'Data Engineer Intern',
    period: 'Jan 2022 – Jun 2023',
    location: 'Remote',
    current: false,
    highlights: [
      'Optimised memory load in Airflow DAGs for complex multi-step pipeline orchestration',
      'Built Docker microservice architecture with AppWrite; integrated external APIs into No-Code apps',
      'Implemented access control using Casbin and OSO middleware',
    ],
  },
]

export default function Experience() {
  return (
    <section id="work" className="py-24 px-6">
      <div className="max-w-5xl mx-auto">

        <div className="flex items-center gap-4 mb-12">
          <span className="font-mono text-cyan-600 dark:text-cyan-400 text-sm">02.</span>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">work experience</h2>
          <div className="flex-1 h-px bg-black/[0.06] dark:bg-white/[0.05]" />
        </div>

        <div className="relative">
          <div className="absolute left-[5px] top-3 bottom-3 w-px bg-black/[0.06] dark:bg-white/[0.05] hidden md:block" />

          <div className="space-y-6">
            {experiences.map((exp) => (
              <div key={exp.company} className="md:pl-10 relative">
                <div
                  className={[
                    'absolute left-0 top-[22px] w-[11px] h-[11px] rounded-full border hidden md:block',
                    exp.current
                      ? 'bg-cyan-500 dark:bg-cyan-400 border-cyan-500 dark:border-cyan-400'
                      : 'bg-[#f7f8fa] dark:bg-[#0a0a0f] border-slate-300 dark:border-slate-700',
                  ].join(' ')}
                  style={exp.current ? { boxShadow: '0 0 10px rgba(34,211,238,0.7)' } : undefined}
                />

                <div className="border border-black/[0.07] dark:border-white/[0.07] rounded-2xl p-6 bg-white/70 dark:bg-white/[0.02] hover:bg-white dark:hover:bg-white/[0.035] hover:border-black/[0.10] dark:hover:border-white/[0.11] transition-all">
                  <div className="flex flex-wrap items-start justify-between gap-3 mb-5">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-slate-900 dark:text-slate-100 font-semibold">{exp.company}</h3>
                        {exp.current && (
                          <span className="px-2 py-0.5 bg-cyan-50 dark:bg-cyan-400/10 border border-cyan-200 dark:border-cyan-400/25 rounded text-cyan-600 dark:text-cyan-400 text-[10px] font-mono">
                            current
                          </span>
                        )}
                      </div>
                      <p className="font-mono text-cyan-600 dark:text-cyan-400 text-sm">{exp.role}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-mono text-slate-400 dark:text-slate-500 text-xs">{exp.period}</p>
                      <p className="font-mono text-slate-300 dark:text-slate-600 text-xs mt-0.5">{exp.location}</p>
                    </div>
                  </div>

                  <ul className="space-y-2.5">
                    {exp.highlights.map((h, i) => (
                      <li key={i} className="flex gap-3 text-sm text-slate-700 dark:text-slate-400 leading-relaxed">
                        <span className="text-cyan-500 dark:text-cyan-400 mt-0.5 shrink-0 text-xs">›</span>
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>

          {/* Education footnote */}
          <div className="md:pl-10 mt-6">
            <div className="border border-black/[0.05] dark:border-white/[0.05] rounded-2xl px-6 py-4 flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-slate-500 dark:text-slate-500 text-sm">
                  <span className="text-slate-700 dark:text-slate-400">B.Tech Civil Engineering</span>
                  {' '}· BIT Sindri, Dhanbad
                </p>
                <p className="font-mono text-slate-400 dark:text-slate-600 text-xs mt-0.5">CGPA 8.99 &nbsp;·&nbsp; 2019–2023</p>
              </div>
              <span className="font-mono text-[10px] text-slate-400 dark:text-slate-700 border border-black/[0.06] dark:border-white/[0.05] rounded px-2 py-1">
                foundation
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
