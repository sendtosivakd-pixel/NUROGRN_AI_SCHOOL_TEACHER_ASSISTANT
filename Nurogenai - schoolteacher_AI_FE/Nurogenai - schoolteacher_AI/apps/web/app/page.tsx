"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { FloatingParticles } from "@/components/premium/FloatingParticles";
import { BookOpen, Sparkles, ArrowRight, CheckCircle2, LayoutDashboard, Database, Brain } from "lucide-react";

const proofItems = [
  { label: "Import-ready", value: "CSV + manual marks" },
  { label: "AI support", value: "Study plans + summaries" },
  { label: "Teacher workflows", value: "Dashboard-first review" },
];

const featureCards = [
  {
    eyebrow: "Marks intelligence",
    title: "See subject patterns instead of isolated scores.",
    body: "Track exam history, compare subject performance, and catch weak areas before they turn into bigger academic problems.",
  },
  {
    eyebrow: "Teacher efficiency",
    title: "Cut down manual reporting and repetitive analysis.",
    body: "Use imports, AI summaries, and cleaner dashboards to reduce the time spent preparing insights for students and parents.",
  },
  {
    eyebrow: "Actionable follow-up",
    title: "Turn performance data into a plan for improvement.",
    body: "Move from marks entry to practical next steps with study focus areas, performance trends, and guided recommendations.",
  },
];

const workflowSteps = [
  {
    step: "01",
    title: "Upload marks fast",
    body: "Add one exam manually or import history in bulk with CSV preview before committing records.",
  },
  {
    step: "02",
    title: "Read the trend clearly",
    body: "Surface top subjects, weak subjects, consistency patterns, and exam-by-exam shifts in one dashboard.",
  },
  {
    step: "03",
    title: "Take action with AI",
    body: "Generate summaries, focus areas, and more structured academic follow-up without doing the analysis manually each time.",
  },
];

const audienceCards = [
  {
    title: "For schools",
    body: "Give teachers a cleaner academic workflow for marks review, subject trends, and student performance visibility.",
  },
  {
    title: "For teachers",
    body: "Spend less time assembling spreadsheets and more time acting on real academic insights.",
  },
  {
    title: "For students",
    body: "Get clearer feedback, realistic study priorities, and a better picture of what to improve next.",
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 selection:bg-purple-500/30 overflow-x-hidden relative">
      <FloatingParticles />
      
      {/* Background Glows */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-600/20 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-cyan-600/20 blur-[120px] rounded-full animate-pulse delay-700" />
      </div>

      {/* Navigation */}
      <nav className="relative z-50 border-b border-white/5 backdrop-blur-md bg-slate-950/50 sticky top-0">
        <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/20">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                School Teacher AI
              </h1>
              <p className="text-[10px] text-purple-400 uppercase tracking-widest font-bold">Performance Intelligence</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <Link href="/login" className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors">
              Log in
            </Link>
            <Link href="/signup" className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl text-sm font-bold shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 hover:scale-105 transition-all">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-20 pb-32 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-bold mb-8"
          >
            <Sparkles className="w-4 h-4" />
            <span>AI-POWERED ACADEMIC OPERATING SYSTEM</span>
          </motion.div>
          
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-7xl font-extrabold mb-8 tracking-tight"
          >
            Turn marks data into <br />
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
              academic clarity.
            </span>
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="max-w-3xl mx-auto text-lg text-slate-400 leading-relaxed mb-12"
          >
            Bring CSV imports, subject trends, AI summaries, and student performance tracking into one 
            place so teachers can move faster and students get clearer direction.
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-wrap items-center justify-center gap-4 mb-20"
          >
            <Link href="/signup" className="group px-8 py-4 bg-white text-slate-950 rounded-2xl font-bold flex items-center gap-2 hover:bg-slate-100 transition-all">
              Create account <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link href="/login" className="px-8 py-4 bg-slate-800/50 backdrop-blur-xl border border-white/10 rounded-2xl font-bold text-white hover:bg-slate-800 transition-all">
              Explore Dashboard
            </Link>
          </motion.div>

          {/* Feature Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            {featureCards.map((card, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + i * 0.1 }}
                className="group relative"
              >
                <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-3xl blur opacity-0 group-hover:opacity-20 transition-opacity" />
                <div className="relative p-8 rounded-3xl bg-slate-900/40 backdrop-blur-xl border border-white/10 hover:border-white/20 transition-all h-full">
                  <div className="w-12 h-12 bg-purple-500/10 rounded-2xl flex items-center justify-center mb-6">
                    {i === 0 ? <LayoutDashboard className="w-6 h-6 text-purple-400" /> : i === 1 ? <Database className="w-6 h-6 text-pink-400" /> : <Brain className="w-6 h-6 text-cyan-400" />}
                  </div>
                  <p className="text-xs font-bold text-purple-400 uppercase tracking-widest mb-2">{card.eyebrow}</p>
                  <h3 className="text-xl font-bold text-white mb-4 leading-snug">{card.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{card.body}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Proof Section */}
      <section className="py-24 border-y border-white/5 bg-slate-900/20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-wrap items-center justify-center gap-12 md:gap-24">
            {proofItems.map((item, i) => (
              <div key={i} className="text-center">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">{item.label}</p>
                <p className="text-2xl font-bold text-white">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Workflow Section */}
      <section className="py-32 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row gap-16 items-start">
            <div className="flex-1">
              <span className="text-xs font-bold text-purple-400 uppercase tracking-widest mb-4 block">HOW IT WORKS</span>
              <h2 className="text-4xl font-bold text-white mb-8">From upload to intervention <br />in three simple steps.</h2>
              
              <div className="space-y-8">
                {workflowSteps.map((step, i) => (
                  <div key={i} className="flex gap-6">
                    <div className="flex-none w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center font-bold text-purple-400 border border-white/5">
                      {step.step}
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-white mb-2">{step.title}</h4>
                      <p className="text-slate-400 text-sm leading-relaxed">{step.body}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="flex-1 w-full">
              <div className="relative p-1 rounded-[2.5rem] bg-gradient-to-br from-white/10 to-transparent border border-white/10 overflow-hidden shadow-2xl shadow-purple-500/10">
                <div className="bg-slate-900/80 backdrop-blur-3xl rounded-[2.2rem] p-8">
                  <div className="flex items-center justify-between mb-8">
                    <span className="status-chip tone-success bg-emerald-500/10 text-emerald-400 text-[10px] px-3 py-1 rounded-full font-bold uppercase tracking-widest">
                      Weekly review snapshot
                    </span>
                    <span className="text-[10px] text-slate-500 font-bold uppercase">AI-ASSISTED</span>
                  </div>
                  
                  <div className="space-y-6">
                    <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/5">
                      <p className="text-purple-400 text-[10px] font-bold uppercase mb-2">THIS WEEK</p>
                      <h4 className="text-xl font-bold text-white mb-2 leading-tight">Mathematics is trending up. Science needs intervention.</h4>
                      <p className="text-slate-400 text-xs">
                        Spot strong subjects, weak performance zones, and suggested academic follow-up without manually 
                        reading through every mark sheet.
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-6 rounded-2xl bg-purple-500/5 border border-purple-500/10">
                        <CheckCircle2 className="w-5 h-5 text-purple-400 mb-4" />
                        <p className="text-white font-bold text-sm mb-1">CSV preview</p>
                        <p className="text-slate-500 text-[10px]">Validate records before commit.</p>
                      </div>
                      <div className="p-6 rounded-2xl bg-pink-500/5 border border-pink-500/10">
                        <Sparkles className="w-5 h-5 text-pink-400 mb-4" />
                        <p className="text-white font-bold text-sm mb-1">AI summaries</p>
                        <p className="text-slate-500 text-[10px]">Generate focused takeaways.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-4 relative">
        <div className="max-w-4xl mx-auto rounded-[3rem] bg-gradient-to-br from-purple-600 to-pink-600 p-12 text-center relative overflow-hidden shadow-2xl shadow-purple-500/40">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-[80px] rounded-full -translate-y-1/2 translate-x-1/2" />
          
          <div className="relative z-10">
            <h2 className="text-4xl font-bold text-white mb-6 tracking-tight">Ready to clarify your academic data?</h2>
            <p className="text-purple-100 text-lg mb-10 opacity-90 max-w-2xl mx-auto">
              Start with account setup for your school or class, then let every exam record add intelligence to the dashboard.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link href="/signup" className="px-10 py-4 bg-white text-slate-900 rounded-2xl font-bold hover:bg-slate-100 transition-all hover:scale-105 active:scale-95 shadow-xl">
                Get Started Now
              </Link>
              <Link href="/login" className="px-10 py-4 bg-purple-700/30 backdrop-blur-md border border-white/20 text-white rounded-2xl font-bold hover:bg-purple-700/40 transition-all">
                Enter Dashboard
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-white/5 text-center">
        <p className="text-slate-500 text-sm">© 2026 School Teacher AI. All rights reserved.</p>
      </footer>
    </main>
  );
}
