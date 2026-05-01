"use client";

import type { ExamRecord, ExamType, SubjectRecord } from "@nuro/contracts";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { 
  PlusCircle, 
  Trash2, 
  Save, 
  AlertCircle, 
  CheckCircle2, 
  Calendar, 
  BookOpen, 
  FileText,
  BarChart3,
  Loader2,
  ChevronRight
} from "lucide-react";

import { api } from "@/lib/api";
import { useProtectedRoute } from "@/lib/auth";
import { formatDate, formatPercentage } from "@/lib/format";
import { SectionCard } from "./SectionCard";
import { MetricCard } from "./MetricCard";

const examTypes: ExamType[] = [
  "unit_test",
  "monthly_test",
  "midterm",
  "quarterly",
  "half_yearly",
  "annual",
];

interface MarkRow {
  subjectId: string;
  marksObtained: string;
  maxMarks: string;
}

const createEmptyRow = (): MarkRow => ({
  subjectId: "",
  marksObtained: "",
  maxMarks: "",
});

export function ExamForm({ examId }: { examId?: string }) {
  const router = useRouter();
  const { ready } = useProtectedRoute();
  const [subjects, setSubjects] = useState<SubjectRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [examName, setExamName] = useState("");
  const [examType, setExamType] = useState<ExamType>("unit_test");
  const [examDate, setExamDate] = useState("");
  const [rows, setRows] = useState<MarkRow[]>([createEmptyRow()]);

  useEffect(() => {
    if (!ready) return;
    async function loadData() {
      try {
        const subjectList = await api.listSubjects();
        setSubjects(subjectList);
        if (examId) {
          const exam = await api.getExam(examId);
          setExamName(exam.examName);
          setExamType(exam.examType);
          setExamDate(exam.examDate);
          setRows(
            exam.marks.map((mark) => ({
              subjectId: mark.subjectId,
              marksObtained: String(mark.marksObtained),
              maxMarks: String(mark.maxMarks),
            })),
          );
        }
      } catch (nextError) {
        setError(nextError instanceof Error ? nextError.message : "Unable to load exam form");
      } finally {
        setLoading(false);
      }
    }
    void loadData();
  }, [examId, ready]);

  const completedRows = rows.filter((row) => row.subjectId && row.marksObtained && row.maxMarks);
  const totalMarksObtained = completedRows.reduce((sum, row) => sum + Number(row.marksObtained || 0), 0);
  const totalMaxMarks = completedRows.reduce((sum, row) => sum + Number(row.maxMarks || 0), 0);
  const averageScore = totalMaxMarks ? (totalMarksObtained / totalMaxMarks) * 100 : 0;
  const usedSubjectIds = rows.map((row) => row.subjectId).filter(Boolean);

  const rowWarnings = useMemo(
    () =>
      rows.map((row) => {
        if (!row.marksObtained || !row.maxMarks) return null;
        const obtained = Number(row.marksObtained);
        const max = Number(row.maxMarks);
        if (Number.isNaN(obtained) || Number.isNaN(max)) return "Use numeric marks only.";
        if (max <= 0) return "Maximum marks must be greater than zero.";
        if (obtained > max) return "Marks obtained cannot exceed maximum marks.";
        return null;
      }),
    [rows],
  );

  function updateRow(index: number, nextRow: Partial<MarkRow>) {
    setRows((current) =>
      current.map((row, rowIndex) => (rowIndex === index ? { ...row, ...nextRow } : row)),
    );
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    setMessage(null);

    try {
      const payload = {
        examName,
        examType,
        examDate,
        marks: rows.map((row) => ({
          subjectId: row.subjectId,
          marksObtained: Number(row.marksObtained),
          maxMarks: Number(row.maxMarks),
        })),
      };

      let savedExam: ExamRecord;
      if (examId) {
        savedExam = await api.updateExam(examId, payload);
        setMessage("Exam updated successfully.");
      } else {
        savedExam = await api.createExam(payload);
        setMessage("Exam created successfully.");
      }
      setTimeout(() => router.push(`/exams/${savedExam.id}`), 1000);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Unable to save exam");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!examId || !confirm("Are you sure you want to delete this exam record?")) return;
    setSaving(true);
    setError(null);
    try {
      await api.deleteExam(examId);
      router.push("/dashboard");
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Unable to delete exam");
      setSaving(false);
    }
  }

  if (!ready || loading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-purple-500" />
        <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Loading Exam Data...</p>
      </div>
    );
  }

  if (!subjects.length) {
    return (
      <SectionCard title="No subjects yet" description="Add subjects first so marks can be mapped correctly.">
        <div className="p-10 text-center space-y-6">
          <BookOpen className="w-16 h-16 text-slate-800 mx-auto" />
          <p className="text-slate-400 max-w-sm mx-auto">
            Analytics remain meaningful only when mapped to your specific subjects.
          </p>
          <Link 
            className="inline-flex px-8 py-3 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-500 transition-all shadow-lg" 
            href="/settings"
          >
            Open Subject Settings
          </Link>
        </div>
      </SectionCard>
    );
  }

  return (
    <div className="grid grid-cols-12 gap-8">
      <form className="col-span-12 lg:col-span-8 space-y-8" onSubmit={handleSubmit}>
        <SectionCard 
          title={examId ? "Edit Exam Record" : "New Exam Entry"}
          description="Every save becomes a clean analytics checkpoint for your trends."
          actions={
            <span className="px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 text-[10px] font-bold uppercase tracking-widest border border-cyan-500/20">
              {examId ? "Updating" : "Manual Entry"}
            </span>
          }
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                <FileText className="w-3 h-3 text-cyan-400" /> Exam Name
              </label>
              <input
                required
                value={examName}
                onChange={(event) => setExamName(event.target.value)}
                placeholder="March Monthly Test"
                className="w-full px-4 py-3 bg-slate-800/50 border border-white/5 rounded-xl text-white text-sm focus:border-cyan-500 focus:outline-none transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                <PlusCircle className="w-3 h-3 text-purple-400" /> Type
              </label>
              <select
                value={examType}
                onChange={(event) => setExamType(event.target.value as ExamType)}
                className="w-full px-4 py-3 bg-slate-800/50 border border-white/5 rounded-xl text-white text-sm focus:border-purple-500 focus:outline-none transition-all appearance-none"
              >
                {examTypes.map((type) => (
                  <option key={type} value={type} className="bg-slate-900">
                    {type.replaceAll("_", " ")}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                <Calendar className="w-3 h-3 text-pink-400" /> Date
              </label>
              <input
                type="date"
                required
                value={examDate}
                onChange={(event) => setExamDate(event.target.value)}
                className="w-full px-4 py-3 bg-slate-800/50 border border-white/5 rounded-xl text-white text-sm focus:border-cyan-500 focus:outline-none transition-all"
                style={{ colorScheme: 'dark' }}
              />
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest">Subject Marks</h3>
              <button
                className="flex items-center gap-2 px-4 py-2 bg-white/[0.05] border border-white/10 rounded-xl text-xs font-bold text-white hover:bg-white/[0.1] transition-all"
                onClick={() => setRows((current) => [...current, createEmptyRow()])}
                type="button"
              >
                <PlusCircle className="w-4 h-4 text-purple-400" /> Add Subject
              </button>
            </div>

            <AnimatePresence mode="popLayout">
              {rows.map((row, index) => {
                const selectedSubject = subjects.find((s) => s.id === row.subjectId);
                const currentWarning = rowWarnings[index];
                
                return (
                  <motion.div 
                    key={`${row.subjectId}-${index}`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all relative group/row"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                      <div className="md:col-span-1 text-[10px] font-black text-slate-700">#{index + 1}</div>
                      
                      <div className="md:col-span-5 relative">
                        <select
                          value={row.subjectId}
                          onChange={(e) => updateRow(index, { subjectId: e.target.value })}
                          required
                          className="w-full px-4 py-3 bg-slate-900/50 border border-white/5 rounded-xl text-white text-xs focus:border-purple-500 focus:outline-none transition-all appearance-none"
                        >
                          <option value="">Select Subject</option>
                          {subjects.map((s) => {
                            const disabled = usedSubjectIds.includes(s.id) && s.id !== row.subjectId;
                            return <option disabled={disabled} key={s.id} value={s.id} className="bg-slate-900">{s.name}</option>;
                          })}
                        </select>
                      </div>

                      <div className="md:col-span-2">
                        <input
                          placeholder="Obtained"
                          inputMode="decimal"
                          required
                          value={row.marksObtained}
                          onChange={(e) => updateRow(index, { marksObtained: e.target.value })}
                          className="w-full px-4 py-3 bg-slate-900/50 border border-white/5 rounded-xl text-white text-xs text-center focus:border-emerald-500 focus:outline-none transition-all"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <input
                          placeholder="Max"
                          inputMode="decimal"
                          required
                          value={row.maxMarks}
                          onChange={(e) => updateRow(index, { maxMarks: e.target.value })}
                          className="w-full px-4 py-3 bg-slate-900/50 border border-white/5 rounded-xl text-white text-xs text-center focus:border-cyan-500 focus:outline-none transition-all"
                        />
                      </div>

                      <div className="md:col-span-2 flex justify-end">
                        <button
                          className={`p-2 rounded-lg text-rose-500/50 hover:text-rose-500 hover:bg-rose-500/10 transition-all ${rows.length <= 1 ? 'opacity-0 pointer-events-none' : ''}`}
                          onClick={() => setRows((c) => c.filter((_, i) => i !== index))}
                          type="button"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>

                    {row.marksObtained && row.maxMarks && !currentWarning && (
                      <div className="mt-4 flex items-center gap-2 text-[10px] font-bold text-emerald-400/70 uppercase tracking-widest pl-10">
                        <CheckCircle2 className="w-3 h-3" />
                        Row Score: {formatPercentage((Number(row.marksObtained) / Number(row.maxMarks)) * 100)}
                      </div>
                    )}
                    {currentWarning && (
                      <div className="mt-4 flex items-center gap-2 text-[10px] font-bold text-rose-400 uppercase tracking-widest pl-10">
                        <AlertCircle className="w-3 h-3" />
                        {currentWarning}
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          <div className="pt-8 border-t border-white/5 flex flex-wrap items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-10 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-2xl shadow-xl shadow-purple-500/20 hover:shadow-purple-500/40 transition-all flex items-center gap-3 disabled:opacity-50"
                disabled={saving}
                type="submit"
              >
                {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                {saving ? "Saving..." : examId ? "Save Changes" : "Create Exam"}
              </motion.button>

              {examId && (
                <button
                  type="button"
                  onClick={() => void handleDelete()}
                  disabled={saving}
                  className="px-6 py-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 font-bold rounded-2xl hover:bg-rose-500/20 transition-all"
                >
                  Delete
                </button>
              )}
            </div>
            
            <AnimatePresence>
              {(message || error) && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={`px-6 py-3 rounded-xl border text-sm font-bold ${message ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-400'}`}
                >
                  {message || error}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </SectionCard>
      </form>

      <aside className="col-span-12 lg:col-span-4 space-y-8">
        <SectionCard title="Live Summary" description="Calculated values for this entry.">
          <div className="grid grid-cols-2 gap-4 mt-4">
            <MetricCard label="Subjects" value={String(completedRows.length)} helper="Verified rows" tone="tone-info" />
            <MetricCard label="Total" value={String(totalMarksObtained)} helper="Cumulative" tone="tone-success" />
            <MetricCard label="Max" value={String(totalMaxMarks)} helper="Total possible" tone="tone-neutral" />
            <MetricCard label="Avg" value={formatPercentage(averageScore)} helper="Current exam %" tone="tone-warning" />
          </div>
        </SectionCard>

        <SectionCard title="Entry Guide" description="Tips for maintainable data.">
          <div className="space-y-6 pt-4">
            {[
              { t: "Define the exam", d: "Use clear names like 'Unit Test 1' to keep history distinguishable." },
              { t: "One per subject", d: "Each subject is unique; duplicates are automatically disabled." },
              { t: "Verified trends", d: "Every save updates your dashboard analytics immediately." }
            ].map((step, i) => (
              <div key={i} className="flex gap-4">
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-xs font-black text-slate-500 border border-white/5">
                  0{i + 1}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">{step.t}</h4>
                  <p className="text-[10px] text-slate-500 leading-relaxed">{step.d}</p>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      </aside>
    </div>
  );
}
