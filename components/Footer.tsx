export default function Footer() {
  return (
    <footer className="border-t border-black/[0.05] dark:border-white/[0.05] py-8 px-6">
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
        <p className="font-mono text-slate-400 dark:text-slate-700 text-xs">
          © {new Date().getFullYear()} Imran Nazir
        </p>
        <p className="font-mono text-slate-400 dark:text-slate-700 text-xs">
          Built with Next.js · Deployed on Netlify
        </p>
      </div>
    </footer>
  )
}
