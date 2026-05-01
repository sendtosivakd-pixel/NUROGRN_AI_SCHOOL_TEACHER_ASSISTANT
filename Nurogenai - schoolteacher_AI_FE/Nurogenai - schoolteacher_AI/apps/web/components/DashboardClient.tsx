"use client";

import type {
  AnalyticsOverviewResponse,
  AnalyticsPrioritiesResponse,
  AnalyticsSubjectsResponse,
  AnalyticsTrendsResponse,
  ExamRecord,
  ReportResponse,
} from "@nuro/contracts";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Loader2, Sparkles, PlusCircle, FileUp, FileText } from "lucide-react";

import { SubjectBarChart, StrengthDonut, TrendLineChart } from "@/components/Charts";
import { MetricCard } from "@/components/MetricCard";
import { SectionCard } from "@/components/SectionCard";
import { api } from "@/lib/api";
import { useProtectedRoute } from "@/lib/auth";
import { formatDate, formatExamType, formatPercentage, titleizeTrend, trendTone } from "@/lib/format";

interface DashboardState {
  overview: AnalyticsOverviewResponse | null;
  trends: AnalyticsTrendsResponse | null;
  subjects: AnalyticsSubjectsResponse | null;
  priorities: AnalyticsPrioritiesResponse | null;
  exams: ExamRecord[];
  report: ReportResponse | null;
}

export function DashboardClient() {
  const { ready } = useProtectedRoute();
  const [state, setState] = useState<DashboardState>({
    overview: null,
    trends: null,
    subjects: null,
    priorities: null,
    exams: [],
    report: null,
  });
  const [loading, setLoading] = useState(true);
  const [refreshingReport, setRefreshingReport] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadDashboard() {
    setLoading(true);
    setError(null);
    try {
      const [overview, trends, subjects, priorities, examList] = await Promise.all([
        api.getOverview(),
        api.getTrends(),
        api.getSubjectsAnalytics(),
        api.getPriorities(),
        api.listExams(),
      ]);

      const exams = examList.exams;
      let report: ReportResponse | null = null;
      const latestExam = exams[0];
      if (latestExam) {
        try {
          report = await api.getLatestReport(latestExam.id);
        } catch {
          report = await api.generateReport(latestExam.id);
        }
      }

      setState({ overview, trends, subjects, priorities, exams, report });
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Unable to load dashboard");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!ready) return;
    void loadDashboard();
  }, [ready]);

  async function regenerateLatestReport() {
    const latestExam = state.exams[0];
    if (!latestExam) return;
    setRefreshingReport(true);
    try {
      const report = await api.generateReport(latestExam.id);
      setState((current) => ({ ...current, report }));
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Unable to generate report");
    } finally {
      setRefreshingReport(false);
    }
  }

  if (!ready || loading) {
    return <div className="shell-panel">Loading the analytics dashboard...</div>;
  }

  if (error) {
    return <div className="notice error">{error}</div>;
  }

  if (!state.exams.length || !state.subjects || !state.overview || !state.trends || !state.priorities) {
    return (
      <div className="hero-card">
        <span className="eyebrow">Welcome aboard</span>
        <h1 className="hero-title">Start with one exam to unlock the full dashboard.</h1>
        <p className="lede">
          The platform is ready. Enter the first exam manually or import CSV history, and the
          analytics engine will turn it into trends, priorities, and an improvement plan.
        </p>
        <div className="button-row">
          <Link className="button button-primary" href="/exams/new">
            Add the first exam
          </Link>
          <Link className="button button-secondary" href="/import">
            Import CSV history
          </Link>
        </div>
      </div>
    );
  }

  const latestExam = state.exams[0];
  const previousExam = state.exams[1] ?? null;
  const subjectRows = [...state.subjects.subjects].sort((a, b) => b.latestPercentage - a.latestPercentage);
  const topPriorities = state.priorities.priorities.slice(0, 4);
  const strongestSubjects = state.overview.strongSubjectsCount;
  const weakSubjects = state.overview.weakSubjectsCount;
  const averageSubjectScore =
    subjectRows.reduce((sum, subject) => sum + subject.averagePercentage, 0) / Math.max(subjectRows.length, 1);
  const examDelta = state.overview.improvementDelta ?? (previousExam ? latestExam.percentage - previousExam.percentage : null);
  const riskSummary = state.overview.riskFlag
    ? state.overview.riskReasons[0] ?? `Immediate intervention recommended for ${state.overview.weakestSubject ?? "the weakest subject"}.`
    : "No immediate risk flag. Maintain consistency and keep strengthening weaker areas.";
  const riskReasons = state.overview.riskReasons.length ? state.overview.riskReasons : state.report?.riskReasons ?? [];

  return (
    <div className="grid grid-cols-12 gap-6">
      {/* Hero Card */}
      <div className="col-span-12 lg:col-span-8 p-10 rounded-[3rem] bg-gradient-to-br from-purple-600 to-pink-600 relative overflow-hidden shadow-2xl shadow-purple-500/20">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-[80px] rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/10 blur-[60px] rounded-full translate-y-1/2 -translate-x-1/2" />
        
        <div className="relative z-10">
          <span className="inline-block px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-widest mb-6">
            Latest exam: {latestExam.examName}
          </span>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-10">
            <div className="md:col-span-3">
              <h2 className="text-4xl font-bold text-white mb-6 leading-tight tracking-tight">
                {formatPercentage(state.overview.overallPercentage)} overall with a{" "}
                {state.overview.trendStatus.replace("_", " ")} trend.
              </h2>
              <p className="text-purple-100 text-lg mb-8 opacity-90 leading-relaxed max-w-xl">
                {state.report?.performanceNarrative ??
                  state.report?.summary ??
                  "The dashboard is ready with live subject analytics, progress trends, and a personalized plan."}
              </p>
              <div className="flex flex-wrap gap-3">
                <button
                  className="px-6 py-3 bg-white text-slate-900 rounded-xl font-bold shadow-lg hover:bg-slate-100 transition-all flex items-center gap-2"
                  disabled={refreshingReport}
                  onClick={() => void regenerateLatestReport()}
                  type="button"
                >
                  {refreshingReport ? <Loader2 className="w-4 h-4 animate-spin text-purple-600" /> : <Sparkles className="w-4 h-4 text-purple-600" />}
                  {refreshingReport ? "Refreshing..." : "Generate report"}
                </button>
                <Link className="px-6 py-3 bg-black/20 backdrop-blur-md border border-white/10 text-white rounded-xl font-bold hover:bg-black/30 transition-all" href={`/exams/${latestExam.id}`}>
                  Edit marks
                </Link>
                <Link className="px-6 py-3 bg-black/20 backdrop-blur-md border border-white/10 text-white rounded-xl font-bold hover:bg-black/30 transition-all" href="/reports">
                  View PDF
                </Link>
              </div>
            </div>
            
            <div className="md:col-span-2">
              <div className="p-6 rounded-3xl bg-black/10 backdrop-blur-md border border-white/10 space-y-4">
                <div className="flex items-center justify-between">
                  <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-widest ${state.overview.riskFlag ? "bg-rose-500/20 text-rose-300" : "bg-emerald-500/20 text-emerald-300"}`}>
                    {state.overview.riskFlag ? "Needs attention" : "Stable profile"}
                  </span>
                  <span className="text-[10px] text-purple-200/60 font-bold">{state.exams.length} exams recorded</span>
                </div>
                
                <div className="space-y-3">
                  {[
                    { label: "Exam Date", value: formatDate(latestExam.examDate) },
                    { label: "Performance", value: state.overview.performanceBand },
                    { label: "Consistency", value: `${state.overview.consistencyScore.toFixed(0)}/100` },
                    { label: "Delta", value: examDelta === null ? "N/A" : `${examDelta >= 0 ? "+" : ""}${examDelta.toFixed(1)} pts` },
                    { label: "Avg subject", value: formatPercentage(averageSubjectScore) },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between border-b border-white/5 pb-2 last:border-0 last:pb-0">
                      <span className="text-[11px] text-purple-100/60">{item.label}</span>
                      <strong className="text-sm text-white">{item.value}</strong>
                    </div>
                  ))}
                </div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/5 text-[10px] text-purple-100 leading-relaxed italic opacity-80">
                  {riskSummary}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="col-span-12 lg:col-span-4 p-8 rounded-[3rem] bg-slate-900/40 backdrop-blur-xl border border-white/10 shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-600/5 blur-[40px] rounded-full group-hover:scale-150 transition-transform duration-700" />
        <div className="relative z-10">
          <span className="text-[10px] font-bold text-purple-400 uppercase tracking-widest mb-4 block">Quick actions</span>
          <h2 className="text-2xl font-bold text-white mb-6 tracking-tight">Run workflow</h2>
          
          <div className="space-y-3">
            {[
              { href: "/exams/new", title: "Add latest exam", desc: "Capture fresh marks immediately.", icon: PlusCircle },
              { href: "/import", title: "Bulk import", desc: "Upload CSV marks history.", icon: FileUp },
              { href: `/exams/${latestExam.id}`, title: "Correct records", desc: "Edit saved exam history.", icon: FileText },
            ].map((action) => {
              const Icon = action.icon;
              return (
                <Link key={action.href} href={action.href} className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.06] hover:border-white/10 transition-all group/item">
                  <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-slate-400 group-hover/item:text-purple-400 transition-colors">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white group-hover/item:text-purple-300 transition-colors">{action.title}</h4>
                    <p className="text-[10px] text-slate-500">{action.desc}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* Metric Grid */}
      <div className="col-span-12 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        <MetricCard
          label="Overall"
          value={formatPercentage(state.overview.overallPercentage)}
          helper={`${state.overview.totalScore}/${state.overview.totalMaxScore} in latest exam`}
          tone="tone-info"
        />
        <MetricCard
          label="Strongest"
          value={state.overview.strongestSubject ?? "N/A"}
          helper="Best current subject"
          tone="tone-success"
        />
        <MetricCard
          label="Weakest"
          value={state.overview.weakestSubject ?? "N/A"}
          helper="Highest coaching need"
          tone="tone-warning"
        />
        <MetricCard
          label="Trend"
          value={titleizeTrend(state.overview.trendStatus)}
          helper={examDelta === null ? "Need 2 exams for comparison" : `${examDelta >= 0 ? "+" : ""}${examDelta.toFixed(1)} pts vs previous`}
          tone={state.overview.riskFlag ? "tone-danger" : trendTone(state.overview.trendStatus)}
        />
        <MetricCard
          label="Previous"
          value={
            state.overview.previousExamPercentage === null
              ? "N/A"
              : formatPercentage(state.overview.previousExamPercentage)
          }
          helper="Comparison point"
          tone="tone-neutral"
        />
        <MetricCard
          label="Strong"
          value={String(strongestSubjects)}
          helper="at or above 75%"
          tone="tone-success"
        />
        <MetricCard
          label="Weak"
          value={String(weakSubjects)}
          helper="below 60%"
          tone={weakSubjects > 0 ? "tone-warning" : "tone-neutral"}
        />
      </div>

      {/* Main Analysis */}
      <div className="col-span-12 lg:col-span-7">
        <SectionCard
          title="Subject performance deep dive"
          description="Current score, average level, and trend by subject."
        >
          <SubjectBarChart subjects={state.subjects.subjects} />
          <div className="dashboard-subject-grid">
            {subjectRows.map((subject) => (
              <div className="list-item dashboard-subject-card" key={subject.subjectId}>
                <div className="inline-row" style={{ justifyContent: "space-between" }}>
                  <strong>{subject.subjectName}</strong>
                  <span className={`status-chip ${trendTone(subject.trendStatus)}`}>
                    {titleizeTrend(subject.trendStatus)}
                  </span>
                </div>
                <div className="dashboard-subject-stats">
                  <div>
                    <span>Latest</span>
                    <strong>{formatPercentage(subject.latestPercentage)}</strong>
                  </div>
                  <div>
                    <span>Average</span>
                    <strong>{formatPercentage(subject.averagePercentage)}</strong>
                  </div>
                  <div>
                    <span>Delta</span>
                    <strong>
                      {subject.deltaPercentage === null
                        ? "N/A"
                        : `${subject.deltaPercentage >= 0 ? "+" : ""}${subject.deltaPercentage.toFixed(1)} pts`}
                    </strong>
                  </div>
                  <div>
                    <span>Risk</span>
                    <strong>{subject.riskLevel}</strong>
                  </div>
                </div>
                <p className="muted" style={{ marginBottom: 0 }}>{subject.actionHint}</p>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      <div className="col-span-12 lg:col-span-5">
        <SectionCard
          title="Attention and intervention"
          description="What needs review before the next study cycle."
        >
          <div className="dashboard-attention-stack">
            <div className="notice info">
              <strong>Current risk read:</strong>
              <p className="muted" style={{ marginBottom: 0 }}>{riskSummary}</p>
              {riskReasons.length ? (
                <ul className="dashboard-risk-list">
                  {riskReasons.slice(0, 3).map((reason) => (
                    <li key={reason}>{reason}</li>
                  ))}
                </ul>
              ) : null}
            </div>
            <div className="list">
              {topPriorities.map((priority) => (
                <div className="list-item dashboard-priority-item" key={priority.subjectId}>
                  <div className="inline-row" style={{ justifyContent: "space-between" }}>
                    <strong>{priority.subjectName}</strong>
                    <span className="status-chip tone-warning">{priority.effortShare}% effort</span>
                  </div>
                  <p className="muted">
                    Current level: {formatPercentage(priority.currentPercentage)} · Average {formatPercentage(priority.averagePercentage)} · Priority score {priority.priorityScore.toFixed(0)}
                  </p>
                  <p className="muted">
                    Trend: {titleizeTrend(priority.trendStatus)} · Delta {priority.deltaPercentage === null ? "N/A" : `${priority.deltaPercentage >= 0 ? "+" : ""}${priority.deltaPercentage.toFixed(1)} pts`} · Risk {priority.riskLevel}
                  </p>
                  <p className="muted" style={{ marginBottom: 0 }}>{priority.reason}</p>
                </div>
              ))}
            </div>
          </div>
        </SectionCard>
      </div>

      <div className="col-span-12 lg:col-span-8">
        <SectionCard title="Progress trend" description="Overall exam performance over time.">
          <TrendLineChart points={state.trends.points} />
        </SectionCard>
      </div>

      <div className="col-span-12 lg:col-span-4">
        <SectionCard
          title="Strength map"
          description="A quick read on where the student is strong versus vulnerable."
        >
          <StrengthDonut subjectSeries={state.subjects.subjects} />
        </SectionCard>
      </div>

      <div className="col-span-12 lg:col-span-6">
        <SectionCard title="AI insights" description="Strengths, weaknesses, and risk narrative translated into plain language.">
          {state.report ? (
            <div className="dashboard-insight-layout">
              <div className="notice info" style={{ marginBottom: 18 }}>
                <strong>Performance narrative</strong>
                <p className="muted" style={{ marginBottom: 0 }}>
                  {state.report.performanceNarrative}
                </p>
              </div>
              <div>
                <div className="dashboard-section-meta">
                  <span className="status-chip tone-success">Strengths</span>
                  <span className="dashboard-report-meta">
                    {state.report.cached ? "Cached report" : "Fresh report"} · {formatDate(state.report.generatedAt)}
                  </span>
                </div>
                <ul className="list">
                  {state.report.strengths.map((item) => (
                    <li className="list-item" key={item}>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <div className="dashboard-section-meta">
                  <span className="status-chip tone-warning">Weaknesses</span>
                </div>
                <ul className="list">
                  {state.report.weaknesses.map((item) => (
                    <li className="list-item" key={item}>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <div className="empty-state">Generate a report to see AI insights.</div>
          )}
        </SectionCard>
      </div>

      <div className="col-span-12 lg:col-span-6">
        <SectionCard title="Improvement plan" description="Actionable weekly structure for the next study cycle.">
          {state.report ? (
            <div className="list">
              {state.report.weeklyPlan.map((item) => (
                <div className="list-item" key={item.title}>
                  <div className="inline-row" style={{ justifyContent: "space-between" }}>
                    <strong>{item.title}</strong>
                    <span className="status-chip tone-info">{item.durationMinutes} min</span>
                  </div>
                  <p className="muted" style={{ marginBottom: 0 }}>
                    {item.cadence} · {item.focus}
                  </p>
                </div>
              ))}
              {state.report.riskReasons.length ? (
                <>
                  <div className="divider" />
                  <div className="list">
                    {state.report.riskReasons.map((item) => (
                      <div className="list-item" key={item}>
                        <strong>Risk reason</strong>
                        <p className="muted" style={{ marginBottom: 0 }}>{item}</p>
                      </div>
                    ))}
                  </div>
                </>
              ) : null}
              <div className="divider" />
              <div className="list">
                {state.report.targetImprovements.map((item) => (
                  <div className="list-item" key={item.subject}>
                    <strong>{item.subject}</strong>
                    <p className="muted">
                      Target {formatPercentage(item.targetPercentage)} from {formatPercentage(item.currentPercentage)}.
                    </p>
                    <p className="muted" style={{ marginBottom: 0 }}>
                      {item.rationale}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="empty-state">Generate a report to populate the weekly plan.</div>
          )}
        </SectionCard>
      </div>

      <div className="col-span-12">
        <SectionCard title="Recommended resources" description="Only vetted catalog resources are suggested in v1.">
          {state.report?.recommendedResources.length ? (
            <div className="grid-3">
              {state.report.recommendedResources.map((resource) => (
                <a
                  className="list-item dashboard-resource-card"
                  href={resource.url}
                  key={resource.id}
                  rel="noreferrer"
                  target="_blank"
                >
                  <div className="inline-row" style={{ justifyContent: "space-between" }}>
                    <strong>{resource.title}</strong>
                    <span className="status-chip tone-neutral">{resource.type}</span>
                  </div>
                  <p className="muted">
                    {resource.subject} · {resource.topic} · {resource.difficulty}
                  </p>
                  <p className="muted" style={{ marginBottom: 0 }}>
                    {resource.reason}
                  </p>
                </a>
              ))}
            </div>
          ) : (
            <div className="empty-state">Resources appear once a report is generated.</div>
          )}
        </SectionCard>
      </div>

      <div className="col-span-12 mb-20">
        <SectionCard title="Marks history" description="Every saved exam contributes to trends and priorities.">
          <div className="table-card" style={{ marginTop: 18 }}>
            <table className="table dashboard-history-table">
              <thead>
                <tr>
                  <th>Exam</th>
                  <th>Type</th>
                  <th>Date</th>
                  <th>Total score</th>
                  <th>Overall</th>
                  <th>Subjects</th>
                  <th>Relative</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {state.exams.map((exam, index) => {
                  const nextExam = state.exams[index + 1];
                  const relative = nextExam ? exam.percentage - nextExam.percentage : null;
                  return (
                    <tr key={exam.id}>
                      <td>{exam.examName}</td>
                      <td>{formatExamType(exam.examType)}</td>
                      <td>{formatDate(exam.examDate)}</td>
                      <td>
                        {exam.totalScore}/{exam.totalMaxScore}
                      </td>
                      <td>{formatPercentage(exam.percentage)}</td>
                      <td>{exam.marks.length}</td>
                      <td>
                        {relative === null ? (
                          <span className="muted">Baseline</span>
                        ) : (
                          <span className={`status-chip ${relative >= 0 ? "tone-success" : "tone-warning"}`}>
                            {relative >= 0 ? "+" : ""}{relative.toFixed(1)} pts
                          </span>
                        )}
                      </td>
                      <td>
                        <Link className="button button-secondary" href={`/exams/${exam.id}`}>
                          Open
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
