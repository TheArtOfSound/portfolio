export default function QiraBanner() {
  return (
    <section className="py-8 px-6 relative z-10" style={{ background: 'linear-gradient(135deg, #0f172a, #1e293b)' }}>
      <a href="https://imagineqira.com" target="_blank" rel="noopener noreferrer" className="block max-w-3xl mx-auto text-center no-underline">
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <span className="text-3xl font-bold text-white tracking-tight">Qira</span>
          <span className="text-sm text-slate-400 max-w-md text-left leading-snug">
            Intelligent systems for complex networks. AI-powered platforms for traffic, cognition, and language.
          </span>
        </div>
        <div className="mt-3 flex gap-3 justify-center flex-wrap">
          <span className="text-xs px-3 py-1 rounded-full font-semibold" style={{ background: 'rgba(34,197,94,0.15)', color: '#22c55e' }}>PTI — Live Traffic Intelligence</span>
          <span className="text-xs px-3 py-1 rounded-full font-semibold" style={{ background: 'rgba(139,92,246,0.15)', color: '#a78bfa' }}>EGC — Cognitive Research</span>
          <span className="text-xs px-3 py-1 rounded-full font-semibold" style={{ background: 'rgba(250,204,21,0.15)', color: '#facc15' }}>LOLM — Language Model</span>
        </div>
        <div className="mt-3 text-xs text-blue-500 font-semibold">imagineqira.com →</div>
      </a>
    </section>
  )
}
