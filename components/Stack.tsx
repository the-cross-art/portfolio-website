import { ICONS } from './stackIcons'

type Item = {
  name: string
  /** simple-icons slug; omit when no real brand mark exists */
  icon?: keyof typeof ICONS
  /** monogram shown when there is no brand mark */
  mono?: string
  href?: string
}

const groups: { label: string; items: Item[] }[] = [
  {
    label: 'llm serving',
    items: [
      { name: 'vLLM',            mono: 'vL',  href: 'https://docs.vllm.ai' },
      { name: 'SGLang',          mono: 'SG',  href: 'https://docs.sglang.ai' },
      { name: 'Triton',          icon: 'nvidia', href: 'https://developer.nvidia.com/triton-inference-server' },
      { name: 'Ray Serve',       icon: 'ray', href: 'https://docs.ray.io/en/latest/serve/index.html' },
      { name: 'SageMaker Async', mono: 'AWS', href: 'https://docs.aws.amazon.com/sagemaker/' },
      { name: 'Seldon',          mono: 'Sd',  href: 'https://www.seldon.io' },
    ],
  },
  {
    label: 'orchestration',
    items: [
      { name: 'Kubernetes',     icon: 'kubernetes',    href: 'https://kubernetes.io/docs/' },
      { name: 'Docker',         icon: 'docker',        href: 'https://docs.docker.com' },
      { name: 'Helm',           icon: 'helm',          href: 'https://helm.sh/docs/' },
      { name: 'GitHub Actions', icon: 'githubactions', href: 'https://docs.github.com/actions' },
    ],
  },
  {
    label: 'infrastructure',
    items: [
      { name: 'Terraform',  icon: 'terraform',  href: 'https://developer.hashicorp.com/terraform/docs' },
      { name: 'AWS',        mono: 'AWS',        href: 'https://docs.aws.amazon.com' },
      { name: 'CloudWatch', mono: 'CW',         href: 'https://docs.aws.amazon.com/cloudwatch/' },
      { name: 'Prometheus', icon: 'prometheus', href: 'https://prometheus.io/docs/' },
      { name: 'Grafana',    icon: 'grafana',    href: 'https://grafana.com/docs/' },
    ],
  },
  {
    label: 'data',
    items: [
      { name: 'Spark',      icon: 'apachespark',   href: 'https://spark.apache.org/docs/latest/' },
      { name: 'Kafka',      icon: 'apachekafka',   href: 'https://kafka.apache.org/documentation/' },
      { name: 'Airflow',    icon: 'apacheairflow', href: 'https://airflow.apache.org/docs/' },
      { name: 'Snowflake',  icon: 'snowflake',     href: 'https://docs.snowflake.com' },
      { name: 'Databricks', icon: 'databricks',    href: 'https://docs.databricks.com' },
      { name: 'Delta Lake', icon: 'delta',         href: 'https://docs.delta.io' },
      { name: 'DynamoDB',   mono: 'DDB',           href: 'https://docs.aws.amazon.com/dynamodb/' },
      { name: 'Unity Catalog', mono: 'UC',         href: 'https://docs.databricks.com/data-governance/unity-catalog/' },
    ],
  },
  {
    label: 'ml & ai',
    items: [
      { name: 'PyTorch',      icon: 'pytorch',     href: 'https://pytorch.org/docs/' },
      { name: 'Hugging Face', icon: 'huggingface', href: 'https://huggingface.co/docs' },
      { name: 'LangChain',    icon: 'langchain',   href: 'https://python.langchain.com/docs/' },
      { name: 'LangGraph',    mono: 'LG',          href: 'https://langchain-ai.github.io/langgraph/' },
      { name: 'MLflow',       icon: 'mlflow',      href: 'https://mlflow.org/docs/latest/' },
      { name: 'DVC',          icon: 'dvc',         href: 'https://dvc.org/doc' },
      { name: 'LoRA / QLoRA', mono: 'LoRA',        href: 'https://huggingface.co/docs/peft' },
      { name: 'Evidently',    mono: 'Ev',          href: 'https://docs.evidentlyai.com' },
    ],
  },
  {
    label: 'languages',
    items: [
      { name: 'Python',     icon: 'python',     href: 'https://docs.python.org/3/' },
      { name: 'SQL',        mono: 'SQL' },
      { name: 'TypeScript', icon: 'typescript', href: 'https://www.typescriptlang.org/docs/' },
      { name: 'Bash',       icon: 'gnubash',    href: 'https://www.gnu.org/software/bash/manual/' },
      { name: 'FastAPI',    icon: 'fastapi',    href: 'https://fastapi.tiangolo.com' },
    ],
  },
]

function Mark({ item }: { item: Item }) {
  if (item.icon) {
    const ic = ICONS[item.icon]
    // Brand colour per theme via CSS vars: no JS, no hydration flash.
    return (
      <svg
        role="img"
        aria-hidden
        viewBox="0 0 24 24"
        fill="currentColor"
        className="h-[15px] w-[15px] shrink-0 text-[color:var(--brand)] dark:text-[color:var(--brand-dark)]"
        style={
          {
            '--brand': ic.lightHex ?? ic.hex,
            '--brand-dark': ic.darkHex ?? ic.hex,
          } as React.CSSProperties
        }
      >
        <path d={ic.path} />
      </svg>
    )
  }
  return (
    <span
      aria-hidden
      className="grid h-[15px] min-w-[15px] shrink-0 place-items-center rounded-[3px] bg-slate-900/[0.07] px-[3px] font-mono text-[8px] font-medium leading-none text-slate-500 dark:bg-white/[0.09] dark:text-slate-400"
    >
      {item.mono}
    </span>
  )
}

function Pill({ item }: { item: Item }) {
  const inner = (
    <>
      <Mark item={item} />
      <span>{item.name}</span>
    </>
  )
  const cls =
    'inline-flex items-center gap-2 rounded-full border border-black/[0.08] bg-white px-3 py-1.5 text-[13px] text-slate-700 transition-all hover:-translate-y-px hover:border-cyan-500/40 hover:text-slate-900 dark:border-white/[0.09] dark:bg-white/[0.03] dark:text-slate-300 dark:hover:border-cyan-400/40 dark:hover:text-slate-100'

  return item.href ? (
    <a href={item.href} target="_blank" rel="noopener noreferrer" className={cls}>
      {inner}
    </a>
  ) : (
    <span className={cls}>{inner}</span>
  )
}

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
            <div key={label} className="py-6 flex flex-col sm:flex-row gap-4 sm:gap-10">
              <span className="font-mono text-xs text-slate-400 dark:text-slate-600 w-28 shrink-0 sm:pt-2">
                {label}
              </span>
              <div className="flex flex-wrap gap-2">
                {items.map(item => (
                  <Pill key={item.name} item={item} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
