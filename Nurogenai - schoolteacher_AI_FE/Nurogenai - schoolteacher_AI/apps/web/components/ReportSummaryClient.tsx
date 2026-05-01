"use client";

import type {
  AnalyticsOverviewResponse,
  AnalyticsPrioritiesResponse,
  AnalyticsSubjectsResponse,
  AnalyticsTrendsResponse,
  ExamRecord,
  ReportResponse,
  StudentProfile,
} from "@nuro/contracts";
import Link from "next/link";
import { useEffect, useState } from "react";

import { api } from "@/lib/api";
import { useProtectedRoute } from "@/lib/auth";
import { formatDate, formatExamType, formatPercentage, titleizeTrend, trendTone } from "@/lib/format";

interface ReportSummaryState {
  profile: StudentProfile | null;
  exams: ExamRecord[];
  overview: AnalyticsOverviewResponse | null;
  trends: AnalyticsTrendsResponse | null;
  subjects: AnalyticsSubjectsResponse | null;
  priorities: AnalyticsPrioritiesResponse | null;
  report: ReportResponse | null;
}

export function ReportSummaryClient() {
  const { ready } = useProtectedRoute();
  const [state, setState] = useState<ReportSummaryState>({
    profile: null,
    exams: [],
    overview: null,
    trends: null,
    subjects: null,
    priorities: null,
    report: null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!ready) return;

    async function loadReportView() {
      setLoading(true);
      setError(null);
      try {
        const [profile, examList, overview, trends, subjects, priorities] = await Promise.all([
          api.getProfile(),
          api.listExams(),
          api.getOverview(),
          api.getTrends(),
          api.getSubjectsAnalytics(),
          api.getPriorities(),
        ]);

        const latestExam = examList.exams[0];
        let report: ReportResponse | null = null;
        if (latestExam) {
          try {
            report = await api.getLatestReport(latestExam.id);
          } catch {
            report = await api.generateReport(latestExam.id);
          }
        }

        setState({
          profile,
          exams: examList.exams,
          overview,
          trends,
          subjects,
          priorities,
          report,
        });
      } catch (nextError) {
        setError(nextError instanceof Error ? nextError.message : "Unable to load report summary");
      } finally {
        setLoading(false);
      }
    }

    void loadReportView();
  }, [ready]);

  if (!ready || loading) {
    return <div className="section-card">Loading printable student summary...</div>;
  }

  if (error) {
    return <div className="notice error">{error}</div>;
  }

  if (!state.profile || !state.overview || !state.subjects || !state.priorities || !state.exams.length) {
    return (
      <div className="hero-card">
        <span className="eyebrow">Printable reports</span>
        <h1 className="hero-title">Add profile and exam data before generating a printable summary.</h1>
        <p className="lede">
          This report view becomes useful once at least one exam is saved and the student profile is complete.
        </p>
        <div className="button-row">
          <Link className="button button-primary" href="/exams/new">
            Add exam
          </Link>
          <Link className="button button-secondary" href="/settings">
            Complete setup
          </Link>
        </div>
      </div>
    );
  }

  const latestExam = state.exams[0];
  const subjectRows = [...state.subjects.subjects].sort((a, b) => b.latestPercentage - a.latestPercentage);
  const topPriorities = state.priorities.priorities.slice(0, 4);
  const weakSubjects = subjectRows.filter((subject) => subject.latestPercentage < 60);

  return (
    <div className="report-page-shell">
      <div className="report-toolbar no-print">
        <Link className="button button-secondary" href="/dashboard">
          Back to dashboard
        </Link>
        <button className="button button-primary" onClick={() => window.print()} type="button">
          Print / Save PDF
        </button>
      </div>

      <article className="report-sheet">
        <header className="report-header">
          <div>
            <span className="eyebrow">Student summary report</span>
            <h1 className="display-line report-title">{state.profile.fullName}</h1>
            <p className="muted report-subtitle">
              {state.profile.schoolName} · Class {state.profile.classGrade}
              {state.profile.section ? `-${state.profile.section}` : ""}
            </p>
          </div>
          <div className="report-meta-card">
            <div>
              <span>Generated</span>
              <strong>{state.report ? formatDate(state.report.generatedAt) : formatDate(latestExam.updatedAt)}</strong>
            </div>
            <div>
              <span>Latest exam</span>
              <strong>{latestExam.examName}</strong>
            </div>
            <div>
              <span>Exam type</span>
              <strong>{formatExamType(latestExam.examType)}</strong>
            </div>
          </div>
        </header>

        <section className="report-grid report-overview-grid">
          <div className="metric-card">
            <span className="status-chip tone-info">Overall score</span>
            <div className="metric-value">{formatPercentage(state.overview.overallPercentage)}</div>
            <p className="muted">{state.overview.totalScore}/{state.overview.totalMaxScore} in the latest exam.</p>
          </div>
          <div className="metric-card">
            <span className="status-chip tone-success">Performance band</span>
            <div className="metric-value">{state.overview.performanceBand}</div>
            <p className="muted">Strongest subject: {state.overview.strongestSubject ?? "N/A"}</p>
          </div>
          <div className="metric-card">
            <span className={`status-chip ${state.overview.riskFlag ? "tone-warning" : "tone-neutral"}`}>
              Trend
            </span>
            <div className="metric-value">{titleizeTrend(state.overview.trendStatus)}</div>
            <p className="muted">Consistency score: {state.overview.consistencyScore.toFixed(0)}/100</p>
          </div>
        </section>

        <section className="section-card report-section">
          <div className="report-section-header">
            <div>
              <h2 className="section-title">Academic overview</h2>
              <p className="muted">A printable summary of current performance, strengths, and intervention needs.</p>
            </div>
            <span className={`status-chip ${state.overview.riskFlag ? "tone-danger" : "tone-success"}`}>
              {state.overview.riskFlag ? "Needs intervention" : "Stable performance"}
            </span>
          </div>
          <p className="report-summary-copy">
            {state.report?.summary ?? "This student summary consolidates the latest exam performance, current subject strengths, and areas that need improvement."}
          </p>
        </section>

        <section className="report-grid report-dual-grid">
          <div className="section-card report-section">
            <h2 className="section-title">Subject performance</h2>
            <div className="table-card report-table-card">
              <table className="table report-table">
                <thead>
                  <tr>
                    <th>Subject</th>
                    <th>Latest</th>
                    <th>Average</th>
                    <th>Trend</th>
                    <th>Exams</th>
                  </tr>
                </thead>
                <tbody>
                  {subjectRows.map((subject) => (
                    <tr key={subject.subjectId}>
                      <td>{subject.subjectName}</td>
                      <td>{formatPercentage(subject.latestPercentage)}</td>
                      <td>{formatPercentage(subject.averagePercentage)}</td>
                      <td>
                        <span className={`status-chip ${trendTone(subject.trendStatus)}`}>
                          {titleizeTrend(subject.trendStatus)}
                        </span>
                      </td>
                      <td>{subject.examsTaken}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="section-card report-section">
            <h2 className="section-title">Priority focus</h2>
            <div className="list report-list">
              {topPriorities.map((priority) => (
                <div className="list-item" key={priority.subjectId}>
                  <div className="inline-row" style={{ justifyContent: "space-between" }}>
                    <strong>{priority.subjectName}</strong>
                    <span className="status-chip tone-warning">{priority.effortShare}% effort</span>
                  </div>
                  <p className="muted">Current level: {formatPercentage(priority.currentPercentage)}</p>
                  <p className="muted" style={{ marginBottom: 0 }}>{priority.reason}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="report-grid report-dual-grid">
          <div className="section-card report-section">
            <h2 className="section-title">Strengths and weaknesses</h2>
            <div className="report-bullet-grid">
              <div>
                <span className="status-chip tone-success">Strengths</span>
                <ul className="list report-list">
                  {(state.report?.strengths ?? []).map((item) => (
                    <li className="list-item" key={item}>{item}</li>
                  ))}
                </ul>
              </div>
              <div>
                <span className="status-chip tone-warning">Weaknesses</span>
                <ul className="list report-list">
                  {(state.report?.weaknesses ?? weakSubjects.map((subject) => `${subject.subjectName} is below the desired threshold.`)).map((item) => (
                    <li className="list-item" key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="section-card report-section">
            <h2 className="section-title">Weekly improvement plan</h2>
            <div className="list report-list">
              {(state.report?.weeklyPlan ?? []).map((item) => (
                <div className="list-item" key={item.title}>
                  <div className="inline-row" style={{ justifyContent: "space-between" }}>
                    <strong>{item.title}</strong>
                    <span className="status-chip tone-info">{item.durationMinutes} min</span>
                  </div>
                  <p className="muted">{item.cadence} · {item.focus}</p>
                </div>
              ))}
              {(state.report?.targetImprovements ?? []).map((item) => (
                <div className="list-item" key={item.subject}>
                  <strong>{item.subject}</strong>
                  <p className="muted">Target {formatPercentage(item.targetPercentage)} from {formatPercentage(item.currentPercentage)}.</p>
                  <p className="muted" style={{ marginBottom: 0 }}>{item.rationale}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="section-card report-section">
          <h2 className="section-title">Exam history snapshot</h2>
          <div className="table-card report-table-card">
            <table className="table report-table">
              <thead>
                <tr>
                  <th>Exam</th>
                  <th>Date</th>
                  <th>Type</th>
                  <th>Total score</th>
                  <th>Overall</th>
                </tr>
              </thead>
              <tbody>
                {state.exams.map((exam) => (
                  <tr key={exam.id}>
                    <td>{exam.examName}</td>
                    <td>{formatDate(exam.examDate)}</td>
                    <td>{formatExamType(exam.examType)}</td>
                    <td>{exam.totalScore}/{exam.totalMaxScore}</td>
                    <td>{formatPercentage(exam.percentage)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </article>
    </div>
  );
}
