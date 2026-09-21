export default function Footer() {
  return (
    <footer className="border-t border-black/[0.05] dark:border-white/[0.05] py-8 px-6">
      <div className="max-w-5xl mx-auto">
        <p className="text-center font-mono text-xs text-slate-400 dark:text-slate-600">
          © {new Date().getFullYear()} Imran Nazir
        </p>
      </div>
    </footer>
  )
}
