"use client";

import { useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { api } from "@/lib/api";
import type { TeacherAssistantRequest, TeacherAssistantResponse, TeacherQueryType } from "@nuro/contracts";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, Brain, BookOpen, Search, Filter, Loader2, Quote, BookMarked, Layers } from "lucide-react";
import { SectionCard } from "@/components/SectionCard";

const queryTypeOptions: { value: TeacherQueryType; label: string; description: string }[] = [
  { value: "qa", label: "Q&A", description: "Ask a direct textbook-grounded question." },
  { value: "lesson_plan", label: "Lesson plan", description: "Generate a structured class plan." },
  { value: "worksheet", label: "Worksheet", description: "Create practice questions from textbook context." },
  { value: "remediation", label: "Remediation", description: "Get help for weaker student understanding." },
  { value: "topic_explain", label: "Topic explain", description: "Explain a concept in simpler classroom language." },
];

const starterPrompts = [
  {
    label: "Explain a topic simply",
    queryType: "topic_explain" as TeacherQueryType,
    text: "Explain photosynthesis for 7th standard students in simple classroom language with a short example.",
  },
  {
    label: "Lesson plan",
    queryType: "lesson_plan" as TeacherQueryType,
    text: "Create a 40-minute lesson plan for 8th standard science on cell division with learning objectives and recap.",
  },
  {
    label: "Worksheet",
    queryType: "worksheet" as TeacherQueryType,
    text: "Create a short worksheet with 5 questions for 6th standard mathematics on fractions.",
  },
  {
    label: "Remediation help",
    queryType: "remediation" as TeacherQueryType,
    text: "Suggest remediation steps for students struggling with 9th standard algebra basics.",
  },
];

export default function TeacherAssistantPage() {
  const [query, setQuery] = useState("");
  const [queryType, setQueryType] = useState<TeacherQueryType>("qa");
  const [standard, setStandard] = useState<string>("");
  const [medium, setMedium] = useState<string>("");
  const [subject, setSubject] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<TeacherAssistantResponse | null>(null);

  const currentQueryType = useMemo(
    () => queryTypeOptions.find((item) => item.value === queryType),
    [queryType],
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const payload: TeacherAssistantRequest = {
        query,
        queryType,
        standard: standard ? Number(standard) : undefined,
        medium: medium || undefined,
        subject: subject || undefined,
        limit: 5,
      };

      const response = await api.teacherAssistant(payload);
      setResult(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Request failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppShell>
      <div className="space-y-8 pb-20">
        {/* Hero Section */}
        <div className="p-10 rounded-[3rem] bg-gradient-to-br from-purple-600 to-pink-600 relative overflow-hidden shadow-2xl shadow-purple-500/20">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-[80px] rounded-full -translate-y-1/2 translate-x-1/2" />
          
          <div className="relative z-10">
            <span className="inline-block px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-widest mb-6">
              AI Classroom Assistant
            </span>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h1 className="text-4xl font-bold text-white mb-6 leading-tight tracking-tight">
                  Ask grounded questions for <br />
                  <span className="text-purple-200 underline decoration-purple-300 underline-offset-8">classroom-ready answers.</span>
                </h1>
                <p className="text-purple-100 text-lg opacity-90 max-w-xl leading-relaxed">
                  Use textbook-backed answers, lesson planning help, and remediation ideas
                  with precise filters for standard, medium, and subject.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-6 rounded-3xl bg-black/10 backdrop-blur-md border border-white/10">
                  <Layers className="w-6 h-6 text-purple-300 mb-4" />
                  <div className="text-3xl font-bold text-white mb-1">{queryTypeOptions.length}</div>
                  <p className="text-[10px] text-purple-200/60 font-bold uppercase tracking-widest">Workflows</p>
                </div>
                <div className="p-6 rounded-3xl bg-black/10 backdrop-blur-md border border-white/10">
                  <BookMarked className="w-6 h-6 text-pink-300 mb-4" />
                  <div className="text-3xl font-bold text-white mb-1">Cited</div>
                  <p className="text-[10px] text-purple-200/60 font-bold uppercase tracking-widest">Grounded</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-8">
          {/* Main Input Form */}
          <div className="col-span-12 lg:col-span-8">
            <SectionCard
              title="Ask the assistant"
              description="Choose the task type, add filters if needed, and get a structured answer."
              actions={
                currentQueryType && (
                  <span className="px-3 py-1 rounded-full bg-purple-500/10 text-purple-400 text-[10px] font-bold uppercase tracking-widest border border-purple-500/20">
                    {currentQueryType.label}
                  </span>
                )
              }
            >
              <div className="flex flex-wrap gap-2 mb-8">
                {starterPrompts.map((prompt) => (
                  <button
                    key={prompt.label}
                    onClick={() => {
                      setQuery(prompt.text);
                      setQueryType(prompt.queryType);
                    }}
                    className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-white/[0.03] border border-slate-200 dark:border-white/5 text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/[0.06] hover:text-slate-900 dark:hover:text-white transition-all"
                  >
                    {prompt.label}
                  </button>
                ))}
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                      <Sparkles className="w-3 h-3 text-purple-400" /> Query Type
                    </label>
                    <select
                      value={queryType}
                      onChange={(e) => setQueryType(e.target.value as TeacherQueryType)}
                      className="w-full px-4 py-3 bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-white/5 rounded-xl text-slate-900 dark:text-white text-sm focus:border-purple-500 focus:outline-none focus:ring-4 focus:ring-purple-500/10 transition-all font-medium appearance-none shadow-sm dark:shadow-none"
                    >
                      {queryTypeOptions.map((option) => (
                        <option key={option.value} value={option.value} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                    <Brain className="w-3 h-3 text-purple-400" /> Your Request
                  </label>
                  <textarea
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    rows={5}
                    placeholder="Example: Explain cell division for 8th standard science in simple terms."
                    required
                    className="w-full px-4 py-4 bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-white/5 rounded-2xl text-slate-900 dark:text-white text-sm focus:border-purple-500 focus:outline-none focus:ring-4 focus:ring-purple-500/10 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600 italic shadow-sm dark:shadow-none"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                      Standard
                    </label>
                    <input
                      value={standard}
                      onChange={(e) => setStandard(e.target.value)}
                      placeholder="8"
                      className="w-full px-4 py-3 bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-white/5 rounded-xl text-slate-900 dark:text-white text-sm focus:border-purple-500 focus:outline-none transition-all shadow-sm dark:shadow-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                      Medium
                    </label>
                    <input
                      value={medium}
                      onChange={(e) => setMedium(e.target.value)}
                      placeholder="English"
                      className="w-full px-4 py-3 bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-white/5 rounded-xl text-slate-900 dark:text-white text-sm focus:border-purple-500 focus:outline-none transition-all shadow-sm dark:shadow-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                      Subject
                    </label>
                    <input
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="Science"
                      className="w-full px-4 py-3 bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-white/5 rounded-xl text-slate-900 dark:text-white text-sm focus:border-purple-500 focus:outline-none transition-all shadow-sm dark:shadow-none"
                    />
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-2xl shadow-xl shadow-purple-500/20 hover:shadow-purple-500/40 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Synthesizing Answer...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      Ask AI Assistant
                    </>
                  )}
                </motion.button>
              </form>
            </SectionCard>
          </div>

          {/* Side Help Panel */}
          <div className="col-span-12 lg:col-span-4">
            <SectionCard title="Workflow Guide" description="Available teacher assistance types.">
              <div className="space-y-6 pt-4">
                {queryTypeOptions.map((option) => (
                  <div key={option.value} className="flex gap-4 group">
                    <div className="flex-none p-3 h-fit rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-white/5 group-hover:bg-purple-50 dark:group-hover:bg-purple-500/10 group-hover:border-purple-200 dark:group-hover:border-purple-500/20 transition-all">
                      <Sparkles className="w-4 h-4 text-slate-500 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-purple-700 dark:group-hover:text-purple-300 transition-colors">{option.label}</h4>
                      <p className="text-[10px] text-slate-500 leading-relaxed">{option.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>
          </div>
        </div>

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 rounded-[2rem] bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20"
            >
              <div className="flex items-center gap-3 text-rose-600 dark:text-rose-400">
                <Brain className="w-5 h-5" />
                <p className="font-bold">Assistant Error</p>
              </div>
              <p className="text-sm text-rose-700 dark:text-rose-300/80 mt-2 ml-8">{error}</p>
            </motion.div>
          )}

          {result && (
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              <SectionCard
                title="Assistant Answer"
                description={currentQueryType?.label ?? "Response"}
                actions={
                  <div className="flex gap-2">
                    <span className="px-2 py-0.5 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[9px] font-bold uppercase tracking-widest border border-emerald-200 dark:border-emerald-500/20">
                      {result.citations.length} Citations
                    </span>
                    <span className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-500 text-[9px] font-bold uppercase tracking-widest border border-slate-200 dark:border-white/5">
                      {result.retrievedChunks} Chunks
                    </span>
                  </div>
                }
              >
                <div className="relative p-8 rounded-3xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/5 overflow-hidden group shadow-sm dark:shadow-none">
                  <Quote className="absolute top-4 right-4 w-12 h-12 text-slate-200 dark:text-white/[0.02] group-hover:text-purple-100 dark:group-hover:text-purple-500/10 transition-colors duration-500" />
                  <div className="relative z-10 prose dark:prose-invert max-w-none prose-p:leading-relaxed prose-p:text-slate-700 dark:prose-p:text-slate-300">
                    <p style={{ whiteSpace: "pre-wrap" }}>{result.answer}</p>
                  </div>
                </div>

                <div className="mt-12">
                  <div className="flex items-center gap-3 mb-6">
                    <BookOpen className="w-5 h-5 text-purple-400" />
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">Grounded Citations</h4>
                      <p className="text-[10px] text-slate-500">Textbook sections used to construct this answer.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {result.citations.map((citation, index) => (
                      <motion.div
                        key={`${citation.textbookId}-${index}`}
                        whileHover={{ scale: 1.02 }}
                        className="p-5 rounded-2xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/10 transition-all shadow-sm dark:shadow-none"
                      >
                        <h5 className="text-xs font-bold text-slate-900 dark:text-white mb-2 line-clamp-1">{citation.textbookTitle}</h5>
                        <p className="text-[10px] text-slate-500 leading-relaxed">
                          Std {citation.standard} · {citation.medium} · {citation.subject}
                          {citation.chapterTitle ? ` · ${citation.chapterTitle}` : ""}
                          {citation.sectionTitle ? ` · ${citation.sectionTitle}` : ""}
                          {citation.pageStart ? ` · p.${citation.pageStart}` : ""}
                          {citation.pageEnd && citation.pageEnd !== citation.pageStart ? `-${citation.pageEnd}` : ""}
                        </p>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </SectionCard>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AppShell>
  );
}
