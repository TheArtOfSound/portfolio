import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useInView } from 'react-intersection-observer'

// ── PARTICLE BACKGROUND ──────────────────────────────────────
function Particles() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    let animId: number
    const particles: { x: number; y: number; vx: number; vy: number; r: number; a: number }[] = []
    const N = 60

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    for (let i = 0; i < N; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        r: Math.random() * 1.5 + 0.5,
        a: Math.random() * 0.3 + 0.1,
      })
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      for (const p of particles) {
        p.x += p.vx
        p.y += p.vy
        if (p.x < 0) p.x = canvas.width
        if (p.x > canvas.width) p.x = 0
        if (p.y < 0) p.y = canvas.height
        if (p.y > canvas.height) p.y = 0

        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(37, 99, 235, ${p.a})`
        ctx.fill()
      }

      // Draw connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x
          const dy = particles[i].y - particles[j].y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < 150) {
            ctx.beginPath()
            ctx.moveTo(particles[i].x, particles[i].y)
            ctx.lineTo(particles[j].x, particles[j].y)
            ctx.strokeStyle = `rgba(37, 99, 235, ${0.05 * (1 - dist / 150)})`
            ctx.stroke()
          }
        }
      }

      animId = requestAnimationFrame(draw)
    }
    draw()

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return <canvas ref={canvasRef} className="fixed inset-0 z-0 pointer-events-none" />
}

// ── FADE IN COMPONENT ────────────────────────────────────────
function FadeIn({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.15 })
  return (
    <motion.div ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, delay, ease: [0.25, 0.1, 0.25, 1] }}
      className={className}>
      {children}
    </motion.div>
  )
}

// ── LIVE PARTICIPANT COUNT ───────────────────────────────────
function useParticipantCount() {
  const [count, setCount] = useState<number | null>(null)
  useEffect(() => {
    // Pull only the count from Supabase — nothing else
    const url = import.meta.env.VITE_SUPABASE_URL
    const key = import.meta.env.VITE_SUPABASE_KEY
    if (url && key) {
      fetch(`${url}/rest/v1/egc_responses?select=count&is_excluded=eq.false`, {
        headers: { apikey: key, Authorization: `Bearer ${key}`, Prefer: 'count=exact' },
        method: 'HEAD',
      }).then(r => {
        const ct = r.headers.get('content-range')
        if (ct) setCount(parseInt(ct.split('/')[1]))
      }).catch(() => setCount(40))
    } else {
      setCount(40)
    }
  }, [])
  return count
}

// ── ACT 1 — THE GATE ────────────────────────────────────────
function Act1() {
  const [showSecond, setShowSecond] = useState(false)
  const [showScroll, setShowScroll] = useState(false)

  useEffect(() => {
    const t1 = setTimeout(() => setShowSecond(true), 3000)
    const t2 = setTimeout(() => setShowScroll(true), 5000)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [])

  return (
    <section className="min-h-screen flex flex-col items-center justify-center px-6 relative z-10">
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2, delay: 0.5 }}
        className="font-display text-xl md:text-3xl lg:text-4xl text-center max-w-3xl leading-relaxed text-[#f5f0e8]/90"
      >
        Have you ever known exactly what you wanted to say —<br />
        <span className="text-[#f5f0e8]/60">but under pressure, a simpler version came out?</span>
      </motion.p>

      <AnimatePresence>
        {showSecond && (
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.5 }}
            className="font-display text-lg md:text-2xl text-[#c8a84b] mt-12 text-center"
          >
            That gap has a name now.
          </motion.p>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showScroll && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            transition={{ duration: 1 }}
            className="absolute bottom-12 text-center"
          >
            <div className="text-xs tracking-[0.3em] uppercase text-[#f5f0e8]/30">Scroll</div>
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="mt-2 text-[#f5f0e8]/20"
            >
              <svg width="16" height="24" viewBox="0 0 16 24" fill="none" stroke="currentColor" strokeWidth="1">
                <path d="M8 4v16M2 14l6 6 6-6" />
              </svg>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}

// ── ACT 2 — THE RESEARCHER ───────────────────────────────────
function Act2() {
  const cards = [
    {
      title: 'A framework for why people know more than they can say.',
      desc: 'Expression-Gated Consciousness',
      color: '#2563eb',
    },
    {
      title: 'A language model built from scratch.',
      desc: 'LOLM',
      color: '#c8a84b',
    },
    {
      title: 'A coding AI that sees your codebase as a network.',
      desc: 'Codey',
      color: '#10b981',
    },
    {
      title: 'An AI-powered app to learn Eastern Armenian from zero.',
      desc: 'Armo',
      color: '#e44d26',
    },
    {
      title: '9.3 billion tokens visualized in 3D.',
      desc: 'Claude Usage Dashboard',
      color: '#a855f7',
    },
  ]

  return (
    <section className="min-h-screen flex flex-col items-center justify-center px-6 py-32 relative z-10">
      <FadeIn>
        <div className="text-xs tracking-[0.4em] uppercase text-[#2563eb] mb-4">Independent Researcher</div>
        <h2 className="font-display text-4xl md:text-6xl font-bold text-center mb-2">Bryan Leonard</h2>
        <p className="text-center text-[#f5f0e8]/40 text-sm mb-20">Phoenix, Arizona</p>
      </FadeIn>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl w-full">
        {cards.map((card, i) => (
          <FadeIn key={i} delay={0.2 * i}>
            <div className="bg-[#0d1220] border border-[#1e2d40] rounded-xl p-8 hover:border-[#2563eb]/50 transition-all duration-500 group cursor-default h-full">
              <div className="w-8 h-0.5 mb-6" style={{ background: card.color }} />
              <p className="font-display text-lg text-[#f5f0e8]/90 mb-4 leading-relaxed">{card.title}</p>
              <p className="text-xs tracking-[0.2em] uppercase text-[#f5f0e8]/30 group-hover:text-[#f5f0e8]/50 transition-colors">{card.desc}</p>
            </div>
          </FadeIn>
        ))}
      </div>
    </section>
  )
}

// ── ACT 3 — THE WORK ────────────────────────────────────────
function Act3() {
  const count = useParticipantCount()

  return (
    <section className="relative z-10 py-32">
      {/* EGC Section */}
      <div className="max-w-4xl mx-auto px-6 mb-40">
        <FadeIn>
          <div className="text-xs tracking-[0.4em] uppercase text-[#2563eb] mb-6">Research</div>
          <h3 className="font-display text-3xl md:text-5xl font-bold mb-8">Expression-Gated Consciousness</h3>
        </FadeIn>

        <FadeIn delay={0.2}>
          <p className="text-lg text-[#f5f0e8]/60 leading-relaxed mb-12 max-w-2xl">
            A mathematical framework for the gap between what you know and what you can say.
            Three types of people. One equation. A live empirical study with real subjects.
          </p>
        </FadeIn>

        {/* The Three Types */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {[
            { type: 'The Compressor', desc: 'Gives the short version in meetings. Says "I\'m fine" when the full answer would take an hour. Their comfort rises as they express more — the gate opens.', color: '#10b981' },
            { type: 'The Expander', desc: 'Comes alive when the stakes rise. The harder the conversation, the more articulate they become. Expression amplifies their experience.', color: '#2563eb' },
            { type: 'The Suppressor', desc: 'Their best ideas emerge in the shower, walking alone, in a journal. Under pressure, the gate closes. The knowledge is there. The expression is not.', color: '#f59e0b' },
          ].map((t, i) => (
            <FadeIn key={i} delay={0.15 * i}>
              <div className="bg-[#0d1220] border border-[#1e2d40] rounded-xl p-6">
                <div className="w-6 h-0.5 mb-4" style={{ background: t.color }} />
                <h4 className="font-display text-lg font-semibold mb-3" style={{ color: t.color }}>{t.type}</h4>
                <p className="text-sm text-[#f5f0e8]/50 leading-relaxed">{t.desc}</p>
              </div>
            </FadeIn>
          ))}
        </div>

        {/* Live Counter + CTA */}
        <FadeIn delay={0.3}>
          <div className="flex flex-col md:flex-row items-center gap-8 bg-[#0d1220] border border-[#1e2d40] rounded-xl p-8">
            <div className="flex-1">
              {count !== null && (
                <div className="text-sm text-[#f5f0e8]/40 mb-2">
                  <span className="text-[#2563eb] font-semibold text-2xl">{count}</span>
                  <span className="ml-2">people have discovered their expression type</span>
                </div>
              )}
              <p className="text-[#f5f0e8]/60 text-sm mt-4">Which one are you? The answer takes ten minutes.</p>
            </div>
            <a href="https://egcstudy.com" target="_blank" rel="noopener noreferrer"
              className="bg-[#2563eb] text-white px-8 py-3 rounded-lg text-sm tracking-wider hover:bg-[#2563eb]/80 transition-colors whitespace-nowrap">
              Take the Study
            </a>
          </div>
        </FadeIn>
      </div>

      {/* LOLM Section */}
      <div className="max-w-4xl mx-auto px-6 mb-40">
        <FadeIn>
          <div className="text-xs tracking-[0.4em] uppercase text-[#c8a84b] mb-6">Machine Learning</div>
          <h3 className="font-display text-3xl md:text-5xl font-bold mb-8">Building Language from the Ground Up</h3>
        </FadeIn>
        <FadeIn delay={0.2}>
          <p className="text-lg text-[#f5f0e8]/60 leading-relaxed max-w-2xl mb-8">
            Standard transformer approaches are not the only way to build intelligence.
            Someone is building the alternative from scratch — on TPU pods, with a custom architecture,
            targeting frontier-class capability at a fraction of the cost.
          </p>
          <div className="text-xs text-[#f5f0e8]/30 tracking-wider">Supported by Google TPU Research Cloud</div>
        </FadeIn>

        {/* Generative visualization placeholder */}
        <FadeIn delay={0.3}>
          <div className="mt-12 h-48 bg-[#0d1220] border border-[#1e2d40] rounded-xl flex items-center justify-center overflow-hidden relative">
            <NeuralViz />
          </div>
        </FadeIn>
      </div>

      {/* Codey Section */}
      <div className="max-w-4xl mx-auto px-6">
        <FadeIn>
          <div className="text-xs tracking-[0.4em] uppercase text-[#10b981] mb-6">Product</div>
          <h3 className="font-display text-3xl md:text-5xl font-bold mb-8">Codey</h3>
        </FadeIn>
        <FadeIn delay={0.2}>
          <p className="text-2xl font-display text-[#f5f0e8]/80 mb-8 leading-relaxed">
            The only coding AI that sees your codebase as a network.
          </p>
          <p className="text-[#f5f0e8]/40 text-sm mb-8 max-w-xl">
            Not just autocomplete. Structural intelligence — understanding how every file, function,
            and dependency connects to everything else.
          </p>
        </FadeIn>

        {/* Dependency graph animation */}
        <FadeIn delay={0.3}>
          <div className="h-48 bg-[#0d1220] border border-[#1e2d40] rounded-xl flex items-center justify-center overflow-hidden relative">
            <GraphViz />
          </div>
        </FadeIn>

        <FadeIn delay={0.4}>
          <div className="mt-8">
            <a href="https://codey.cc" target="_blank" rel="noopener noreferrer"
              className="text-sm text-[#10b981] hover:text-[#10b981]/80 transition-colors tracking-wider">
              codey.cc &rarr;
            </a>
          </div>
        </FadeIn>
      </div>

      {/* Armo Section */}
      <div className="max-w-4xl mx-auto px-6 mt-40">
        <FadeIn>
          <div className="text-xs tracking-[0.4em] uppercase text-[#e44d26] mb-6">EdTech</div>
          <h3 className="font-display text-3xl md:text-5xl font-bold mb-8">Armo</h3>
        </FadeIn>
        <FadeIn delay={0.2}>
          <p className="text-2xl font-display text-[#f5f0e8]/80 mb-8 leading-relaxed">
            A full-stack language learning app for Eastern Armenian — built to take a complete beginner to fluency.
          </p>
          <p className="text-[#f5f0e8]/40 text-sm mb-8 max-w-xl">
            Spaced repetition flashcards, guided lesson paths, alphabet drills, pronunciation training,
            and a local AI tutor powered by Ollama. Six practice modes, adaptive difficulty, and progress
            tracking — designed with real language acquisition research in mind.
          </p>
        </FadeIn>

        <FadeIn delay={0.3}>
          <div className="bg-[#0d1220] border border-[#1e2d40] rounded-xl p-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div>
                <div className="text-2xl font-bold text-[#e44d26]">8+</div>
                <div className="text-xs text-[#f5f0e8]/30 mt-1">Lessons</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-[#e44d26]">6</div>
                <div className="text-xs text-[#f5f0e8]/30 mt-1">Practice Modes</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-[#e44d26]">38</div>
                <div className="text-xs text-[#f5f0e8]/30 mt-1">Letters Drilled</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-[#e44d26]">AI</div>
                <div className="text-xs text-[#f5f0e8]/30 mt-1">Tutor Built In</div>
              </div>
            </div>
          </div>
        </FadeIn>

        <FadeIn delay={0.4}>
          <div className="mt-6 flex flex-wrap gap-3">
            {['Next.js', 'TypeScript', 'Tailwind', 'Ollama', 'Spaced Repetition', 'IndexedDB'].map((t) => (
              <span key={t} className="text-xs text-[#e44d26]/60 border border-[#e44d26]/20 rounded-full px-3 py-1">{t}</span>
            ))}
          </div>
        </FadeIn>
      </div>

      {/* Claude Usage Dashboard Section */}
      <div className="max-w-4xl mx-auto px-6 mt-40">
        <FadeIn>
          <div className="text-xs tracking-[0.4em] uppercase text-[#a855f7] mb-6">Data</div>
          <h3 className="font-display text-3xl md:text-5xl font-bold mb-8">Claude Usage Dashboard</h3>
        </FadeIn>
        <FadeIn delay={0.2}>
          <p className="text-2xl font-display text-[#f5f0e8]/80 mb-8 leading-relaxed">
            9.3 billion tokens. $6,865. 32 days.
          </p>
          <p className="text-[#f5f0e8]/40 text-sm mb-4 max-w-xl">
            A 3D animated, immersive data visualization of real Claude Code token usage and costs.
            Particle globe, burn rate projections, model breakdowns, session explorer — all driven by real data.
          </p>
          <p className="text-[#f5f0e8]/40 text-sm mb-8 max-w-xl">
            32x the Max plan. Top 0.1% of users. This is what building five products simultaneously
            with AI actually looks like.
          </p>
        </FadeIn>

        <FadeIn delay={0.3}>
          <div className="bg-[#0d1220] border border-[#1e2d40] rounded-xl p-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div>
                <div className="text-2xl font-bold text-[#a855f7]">9.3B</div>
                <div className="text-xs text-[#f5f0e8]/30 mt-1">Tokens</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-[#a855f7]">$6,865</div>
                <div className="text-xs text-[#f5f0e8]/30 mt-1">Total Cost</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-[#a855f7]">32x</div>
                <div className="text-xs text-[#f5f0e8]/30 mt-1">vs Max Plan</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-[#a855f7]">$215/day</div>
                <div className="text-xs text-[#f5f0e8]/30 mt-1">Burn Rate</div>
              </div>
            </div>
          </div>
        </FadeIn>

        <FadeIn delay={0.4}>
          <div className="mt-8">
            <a href="https://theartofsound.github.io/claude-usage-dashboard/" target="_blank" rel="noopener noreferrer"
              className="text-sm text-[#a855f7] hover:text-[#a855f7]/80 transition-colors tracking-wider">
              View Live Dashboard &rarr;
            </a>
          </div>
        </FadeIn>
      </div>
    </section>
  )
}

// ── NEURAL NETWORK VISUALIZATION ─────────────────────────────
function NeuralViz() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    let animId: number
    const w = 800, h = 192
    canvas.width = w; canvas.height = h

    const nodes: { x: number; y: number; layer: number }[] = []
    const layers = [4, 6, 8, 6, 4]
    layers.forEach((n, li) => {
      for (let i = 0; i < n; i++) {
        nodes.push({
          x: (li + 1) * (w / (layers.length + 1)),
          y: (i + 1) * (h / (n + 1)),
          layer: li,
        })
      }
    })

    let t = 0
    const draw = () => {
      ctx.clearRect(0, 0, w, h)
      t += 0.005

      // Connections
      for (const n1 of nodes) {
        for (const n2 of nodes) {
          if (n2.layer === n1.layer + 1) {
            const pulse = Math.sin(t * 3 + n1.x * 0.01 + n1.y * 0.01) * 0.5 + 0.5
            ctx.beginPath()
            ctx.moveTo(n1.x, n1.y)
            ctx.lineTo(n2.x, n2.y)
            ctx.strokeStyle = `rgba(200, 168, 75, ${0.03 + pulse * 0.05})`
            ctx.stroke()
          }
        }
      }

      // Nodes
      for (const n of nodes) {
        const pulse = Math.sin(t * 2 + n.x * 0.02 + n.y * 0.03) * 0.5 + 0.5
        ctx.beginPath()
        ctx.arc(n.x, n.y, 2 + pulse * 2, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(200, 168, 75, ${0.3 + pulse * 0.4})`
        ctx.fill()
      }

      animId = requestAnimationFrame(draw)
    }
    draw()
    return () => cancelAnimationFrame(animId)
  }, [])

  return <canvas ref={canvasRef} className="w-full h-full" />
}

// ── GRAPH VISUALIZATION ──────────────────────────────────────
function GraphViz() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    let animId: number
    const w = 800, h = 192
    canvas.width = w; canvas.height = h

    const nodes: { x: number; y: number; vx: number; vy: number; r: number }[] = []
    const edges: [number, number][] = []
    const N = 20

    for (let i = 0; i < N; i++) {
      nodes.push({
        x: 100 + Math.random() * (w - 200),
        y: 30 + Math.random() * (h - 60),
        vx: (Math.random() - 0.5) * 0.2,
        vy: (Math.random() - 0.5) * 0.2,
        r: 2 + Math.random() * 3,
      })
    }
    for (let i = 0; i < N; i++) {
      const connections = 1 + Math.floor(Math.random() * 2)
      for (let c = 0; c < connections; c++) {
        const j = Math.floor(Math.random() * N)
        if (j !== i) edges.push([i, j])
      }
    }

    let t = 0
    const draw = () => {
      ctx.clearRect(0, 0, w, h)
      t += 0.003

      for (const n of nodes) {
        n.x += n.vx; n.y += n.vy
        if (n.x < 50 || n.x > w - 50) n.vx *= -1
        if (n.y < 20 || n.y > h - 20) n.vy *= -1
      }

      for (const [i, j] of edges) {
        const pulse = Math.sin(t * 4 + i) * 0.5 + 0.5
        ctx.beginPath()
        ctx.moveTo(nodes[i].x, nodes[i].y)
        ctx.lineTo(nodes[j].x, nodes[j].y)
        ctx.strokeStyle = `rgba(16, 185, 129, ${0.05 + pulse * 0.1})`
        ctx.stroke()
      }

      for (const n of nodes) {
        const pulse = Math.sin(t * 2 + n.x * 0.01) * 0.5 + 0.5
        ctx.beginPath()
        ctx.arc(n.x, n.y, n.r + pulse, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(16, 185, 129, ${0.3 + pulse * 0.4})`
        ctx.fill()
      }

      animId = requestAnimationFrame(draw)
    }
    draw()
    return () => cancelAnimationFrame(animId)
  }, [])

  return <canvas ref={canvasRef} className="w-full h-full" />
}

// ── ACT 4 — THE PHILOSOPHY ───────────────────────────────────
function Act4() {
  const principles = [
    {
      title: 'Real work over real hope.',
      body: 'Do not believe it works until the numbers prove it works. Theory is a compass, not a destination. Build it, test it, let reality be the judge.',
    },
    {
      title: 'Shoot for the stars. Literally.',
      body: 'A consciousness framework and a language model and a coding platform — simultaneously, independently, from scratch. The size of the ambition is the methodology. Small bets produce small outcomes.',
    },
    {
      title: 'The gate opens from the inside.',
      body: 'Between knowing and saying lies the work that matters most. The knowledge exists. The challenge is building the systems — mathematical, computational, personal — that let it through.',
    },
  ]

  return (
    <section className="min-h-screen flex flex-col items-center justify-center px-6 py-32 relative z-10">
      <FadeIn>
        <div className="text-xs tracking-[0.4em] uppercase text-[#c8a84b] mb-16 text-center">Philosophy</div>
      </FadeIn>

      <div className="max-w-2xl space-y-20">
        {principles.map((p, i) => (
          <FadeIn key={i} delay={0.2 * i}>
            <div>
              <h3 className="font-display text-2xl md:text-3xl font-bold text-[#f5f0e8] mb-4">{p.title}</h3>
              <p className="text-[#f5f0e8]/50 leading-relaxed">{p.body}</p>
            </div>
          </FadeIn>
        ))}
      </div>
    </section>
  )
}

// ── ACT 5 — THE CONTACT ─────────────────────────────────────
function Act5() {
  return (
    <section className="min-h-[60vh] flex flex-col items-center justify-center px-6 py-32 relative z-10">
      <FadeIn>
        <p className="font-display text-xl md:text-2xl text-[#f5f0e8]/60 text-center mb-12">
          Collaboration, research, and impossible ideas.
        </p>
      </FadeIn>

      <FadeIn delay={0.2}>
        <div className="flex flex-col items-center gap-4">
          <a href="mailto:bryanleonard@imagineqira.com" className="text-[#2563eb] hover:text-[#60a5fa] transition-colors text-lg tracking-wider">
            bryanleonard@imagineqira.com
          </a>
          <div className="flex gap-6 mt-4">
            <a href="https://github.com/TheArtOfSound" target="_blank" rel="noopener noreferrer"
              className="text-[#f5f0e8]/30 hover:text-[#f5f0e8]/60 transition-colors text-sm tracking-wider">
              GitHub
            </a>
            <a href="https://www.linkedin.com/in/bryan-leonard-54155218a/" target="_blank" rel="noopener noreferrer"
              className="text-[#f5f0e8]/30 hover:text-[#f5f0e8]/60 transition-colors text-sm tracking-wider">
              LinkedIn
            </a>
          </div>
        </div>
      </FadeIn>

      <FadeIn delay={0.4}>
        <div className="mt-12 mb-4"><a href="https://imagineqira.com" target="_blank" rel="noopener noreferrer" className="text-[#2563eb] hover:text-[#60a5fa] transition-colors text-sm tracking-wider">imagineqira.com</a></div>
        <div className="mt-4 text-[10px] tracking-[0.3em] uppercase text-[#f5f0e8]/30">
          Qira LLC
        </div>
      </FadeIn>
    </section>
  )
}

// ── MAIN APP ─────────────────────────────────────────────────
export default function App() {
  return (
    <div className="relative">
      <Particles />
      <Act1 />
      <Act2 />
      <Act3 />
      <Act4 />
      <Act5 />
    </div>
  )
}
