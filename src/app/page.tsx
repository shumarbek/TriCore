"use client";

import { Button } from "@/components/ui/Button";
import { subjects } from "@/lib/data/navigation";
import { motion } from "framer-motion";
import { Atom, ArrowRight, Bot, Medal, Sparkles, Zap } from "lucide-react";
import Link from "next/link";

const features = [
  { icon: Sparkles, title: "AI Education System", desc: "Personalized tutoring & mistake detection" },
  { icon: Medal, title: "Global Rankings", desc: "Compete with learners worldwide" },
  { icon: Bot, title: "Scientific Assistant", desc: "Equations, formulas & concept explanations" },
  { icon: Zap, title: "Gamified Learning", desc: "XP, badges, streaks & achievements" },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="absolute inset-0 grid-scientific opacity-50" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/20 rounded-full blur-[120px]" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[300px] bg-accent/15 rounded-full blur-[100px]" />

      <nav className="relative z-10 flex items-center justify-between px-6 py-5 max-w-7xl mx-auto">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <Atom className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold gradient-text">TriCore</span>
        </Link>
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-sm text-text-muted hover:text-text px-4 py-2">
            Sign In
          </Link>
          <Link href="/register">
            <Button variant="primary" size="md">
              Get Started
            </Button>
          </Link>
        </div>
      </nav>

      <section className="relative z-10 max-w-7xl mx-auto px-6 pt-16 pb-24 text-center">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass text-xs text-accent mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            AI-Powered STEM Learning Ecosystem
          </span>
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight max-w-4xl mx-auto">
            Master{" "}
            <span className="gradient-text">Math</span>,{" "}
            <span className="gradient-text">Physics</span> &{" "}
            <span className="gradient-text">Chemistry</span>
          </h1>
          <p className="text-text-muted text-lg sm:text-xl max-w-2xl mx-auto mt-6">
            From zero to professional level. Structured roadmaps, AI assistance,
            competitive rankings — your scientific learning operating system.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10">
            <Link href="/register">
              <Button variant="primary" size="lg" className="min-w-[200px]">
                Start Learning Free
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button variant="outline" size="lg" className="min-w-[200px]">
                View Demo Dashboard
              </Button>
            </Link>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="grid sm:grid-cols-3 gap-4 mt-20 max-w-4xl mx-auto"
        >
          {subjects.map((s, i) => (
            <div
              key={s.id}
              className="glass-card rounded-2xl p-6 text-left hover:scale-[1.02] transition-transform"
            >
              <span className="text-3xl">{s.icon}</span>
              <h3 className="font-semibold mt-3">{s.name}</h3>
              <p className="text-xs text-text-muted mt-1">
                {s.sections.length} sections · Roadmap learning
              </p>
            </div>
          ))}
        </motion.div>
      </section>

      <section className="relative z-10 max-w-7xl mx-auto px-6 py-20">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="glass-card rounded-2xl p-6"
            >
              <f.icon className="w-8 h-8 text-primary mb-4" />
              <h3 className="font-semibold">{f.title}</h3>
              <p className="text-sm text-text-muted mt-2">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <footer className="relative z-10 border-t border-border py-8 text-center text-sm text-text-muted">
        © 2026 TriCore — Scientific Learning Operating System
      </footer>
    </div>
  );
}
