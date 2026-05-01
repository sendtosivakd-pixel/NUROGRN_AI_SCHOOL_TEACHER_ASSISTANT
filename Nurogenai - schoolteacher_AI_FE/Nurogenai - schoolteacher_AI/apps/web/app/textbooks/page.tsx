"use client";

import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { api } from "@/lib/api";
import type { TextbookSearchRequest, TextbookSearchResponse } from "@nuro/contracts";
import { motion, AnimatePresence } from "motion/react";
import { Search, Filter, BookOpen, Layers, Loader2, Sparkles, FileText, Globe } from "lucide-react";
import { SectionCard } from "@/components/SectionCard";

export default function TextbookSearchPage() {
  const [query, setQuery] = useState("");
  const [standard, setStandard] = useState<string>("");
  const [medium, setMedium] = useState<string>("");
  const [subject, setSubject] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<TextbookSearchResponse | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const payload: TextbookSearchRequest = {
        query,
        standard: standard ? Number(standard) : undefined,
        medium: medium || undefined,
        subject: subject || undefined,
        limit: 10,
      };

      const response = await api.searchTextbooks(payload);
      setResult(response as TextbookSearchResponse);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Search failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppShell>
      <div className="space-y-8 pb-20">
        {/* Hero Section */}
        <div className="p-10 rounded-[3rem] bg-gradient-to-br from-cyan-600 to-purple-600 relative overflow-hidden shadow-2xl shadow-cyan-500/20">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-[80px] rounded-full -translate-y-1/2 translate-x-1/2" />
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div>
              <span className="inline-block px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-widest mb-6">
                Knowledge Discovery
              </span>
              <h1 className="text-4xl font-bold text-white mb-4 leading-tight tracking-tight">
                Search the <br />
                <span className="text-cyan-200">Textbook Corpus.</span>
              </h1>
              <p className="text-cyan-100 text-lg opacity-90 max-w-xl leading-relaxed">
                Find relevant pages and chunks across the Tamil Nadu school textbook dataset using
                semantic query and metadata filters.
              </p>
            </div>
            
            <div className="hidden lg:block">
              <Search className="w-32 h-32 text-white/10" />
            </div>
          </div>
        </div>

        <SectionCard
          title="Search Textbooks"
          description="Enter your query and optional filters to locate specific academic content."
        >
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-cyan-400 transition-colors" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Example: photosynthesis / organic chemistry / set theory"
                required
                className="w-full pl-12 pr-4 py-4 bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-white/5 rounded-2xl text-slate-900 dark:text-white text-lg focus:border-cyan-500 focus:outline-none focus:ring-4 focus:ring-cyan-500/10 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600 shadow-sm dark:shadow-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <Layers className="w-3 h-3" /> Standard
                </label>
                <input
                  value={standard}
                  onChange={(e) => setStandard(e.target.value)}
                  placeholder="e.g. 10"
                  className="w-full px-4 py-3 bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-white/5 rounded-xl text-slate-900 dark:text-white text-sm focus:border-cyan-500 focus:outline-none transition-all shadow-sm dark:shadow-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <Globe className="w-3 h-3" /> Medium
                </label>
                <input
                  value={medium}
                  onChange={(e) => setMedium(e.target.value)}
                  placeholder="e.g. English"
                  className="w-full px-4 py-3 bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-white/5 rounded-xl text-slate-900 dark:text-white text-sm focus:border-cyan-500 focus:outline-none transition-all shadow-sm dark:shadow-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <BookOpen className="w-3 h-3" /> Subject
                </label>
                <input
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. Science"
                  className="w-full px-4 py-3 bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-white/5 rounded-xl text-slate-900 dark:text-white text-sm focus:border-cyan-500 focus:outline-none transition-all shadow-sm dark:shadow-none"
                />
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-cyan-600 to-purple-600 text-white font-bold rounded-2xl shadow-xl shadow-cyan-500/20 hover:shadow-cyan-500/40 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Searching Knowledge...
                </>
              ) : (
                <>
                  <Search className="w-5 h-5" />
                  Execute Search
                </>
              )}
            </motion.button>
          </form>
        </SectionCard>

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 rounded-[2rem] bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-600 dark:text-rose-400 font-medium"
            >
              {error}
            </motion.div>
          )}

          {result && (
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between px-4">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-widest">Search Results</h3>
                <span className="text-[10px] text-slate-500 font-bold uppercase">{result.total} matches found</span>
              </div>

              <div className="grid grid-cols-1 gap-6">
                {result.results.map((item, index) => (
                  <motion.div
                    key={`${item.chunk.id}-${index}`}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className="p-8 rounded-[2.5rem] bg-white/80 dark:bg-slate-900/40 backdrop-blur-xl border border-slate-200 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/10 transition-all group shadow-md dark:shadow-none"
                  >
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-cyan-50 dark:bg-cyan-500/10 flex items-center justify-center text-cyan-600 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-500/20">
                          <BookOpen className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-cyan-300 transition-colors">{item.textbook.title}</h4>
                          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                            Std {item.textbook.standard} · {item.textbook.medium} · {item.textbook.subject}
                            {item.chunk.pageStart ? ` · p.${item.chunk.pageStart}` : ""}
                          </p>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-white/5 text-[9px] text-slate-500 dark:text-slate-400 font-bold border border-slate-200 dark:border-white/5">
                        MATCH {index + 1}
                      </span>
                    </div>

                    <div className="p-6 rounded-2xl bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/5">
                      <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed whitespace-pre-wrap italic">
                        {item.chunk.content}
                      </p>
                    </div>

                    <div className="mt-6 flex items-center gap-4">
                      <div className="flex -space-x-2">
                        <div className="w-6 h-6 rounded-full bg-cyan-500/20 border border-slate-950" />
                        <div className="w-6 h-6 rounded-full bg-purple-500/20 border border-slate-950" />
                      </div>
                      <p className="text-[10px] text-slate-500 italic">Semantic match grounded in official textbooks.</p>
                    </div>
                  </motion.div>
                ))}
              </div>
              
              {result.results.length === 0 && (
                <div className="p-20 text-center rounded-[3rem] bg-slate-50 dark:bg-slate-900/20 border border-dashed border-slate-300 dark:border-white/5">
                  <Search className="w-12 h-12 text-slate-700 mx-auto mb-4" />
                  <p className="text-slate-500 font-medium">No textbook matches found for your query.</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AppShell>
  );
}
