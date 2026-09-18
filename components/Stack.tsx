const groups = [
  {
    label: 'llm serving',
    items: ['vLLM', 'SGLang', 'Triton Inference Server', 'RayServe', 'SageMaker Async', 'Seldon'],
  },
  {
    label: 'orchestration',
    items: ['Kubernetes (EKS)', 'Docker', 'Helm', 'GitHub Actions'],
  },
  {
    label: 'infrastructure',
    items: ['Terraform', 'AWS EC2 · S3 · Lambda · EKS · SageMaker · Glue', 'CloudWatch'],
  },
  {
    label: 'data',
    items: ['Apache Spark (PySpark)', 'Kafka', 'Airflow', 'Snowflake', 'DynamoDB', 'Delta Lake', 'Databricks', 'Delta Live Tables', 'Unity Catalog'],
  },
  {
    label: 'ml & ai',
    items: ['PyTorch', 'Hugging Face', 'LangChain', 'LangGraph', 'MLflow', 'DVC', 'Evidently AI', 'LoRA / QLoRA'],
  },
  {
    label: 'languages',
    items: ['Python', 'SQL', 'TypeScript', 'Bash'],
  },
]

export default function Stack() {
  return (
    <section id="stack" className="py-24 px-6">
      <div className="max-w-5xl mx-auto">

        <div className="flex items-center gap-4 mb-12">
          <span className="font-mono text-cyan-600 dark:text-cyan-400 text-sm">05.</span>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">stack</h2>
          <div className="flex-1 h-px bg-black/[0.06] dark:bg-white/[0.05]" />
        </div>

        <div className="divide-y divide-black/[0.05] dark:divide-white/[0.05]">
          {groups.map(({ label, items }) => (
            <div
              key={label}
              className="py-5 flex flex-col sm:flex-row gap-3 sm:gap-10 sm:items-baseline"
            >
              <span className="font-mono text-xs text-slate-400 dark:text-slate-600 w-28 shrink-0 pt-0.5">
                {label}
              </span>
              <p className="text-sm text-slate-700 dark:text-slate-400 leading-relaxed">
                {items.join(' · ')}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
