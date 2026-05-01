"use client";

import type { ImportPreviewResponse } from "@nuro/contracts";
import { useMemo, useState } from "react";

import { api } from "@/lib/api";
import { useProtectedRoute } from "@/lib/auth";

const expectedHeaders = [
  "exam_name",
  "exam_type",
  "exam_date",
  "subject",
  "marks_obtained",
  "max_marks",
];

const examTypeHints = ["unit_test", "monthly_test", "midterm", "quarterly", "half_yearly", "annual"];

export function CsvImportCard() {
  const { ready } = useProtectedRoute();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<ImportPreviewResponse | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const previewSummary = useMemo(() => {
    if (!preview) return null;
    const exams = new Set(preview.rows.map((row) => `${row.examName}-${row.examDate}`)).size;
    return {
      totalRows: preview.rows.length,
      totalErrors: preview.errors.length,
      detectedSubjects: preview.subjectNames.length,
      detectedExams: exams,
    };
  }, [preview]);

  async function handlePreview() {
    if (!file) return;
    setBusy(true);
    setError(null);
    setMessage(null);
    try {
      const result = await api.previewImport(file);
      setPreview(result);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Unable to preview CSV");
    } finally {
      setBusy(false);
    }
  }

  async function handleCommit() {
    if (!file) return;
    setBusy(true);
    setError(null);
    setMessage(null);
    try {
      const result = await api.commitImport(file);
      setMessage(
        `Imported ${result.importedExamIds.length} exam(s) and ${result.importedSubjects.length} new subject(s).`,
      );
      setPreview(null);
      setFile(null);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Unable to import CSV");
    } finally {
      setBusy(false);
    }
  }

  if (!ready) {
    return <div className="section-card">Loading importer...</div>;
  }

  return (
    <section className="section-card import-card-shell">
      <div className="import-layout">
        <div className="import-main-panel">
          <div className="import-header">
            <div>
              <h2 className="section-title">CSV marks import</h2>
              <p className="muted">
                Import history in bulk with a strict two-step flow: preview first, then commit.
              </p>
            </div>
            <span className="status-chip tone-info">Preview before write</span>
          </div>

          <div className="import-upload-card">
            <div className="import-upload-copy">
              <strong>Upload a marks history CSV</strong>
              <p className="muted">
                Use one structured file for exam history. Validate everything first, then commit only when the data is clean.
              </p>
            </div>

            <div className="import-file-row">
              <label className="import-file-picker">
                <input
                  accept=".csv"
                  type="file"
                  onChange={(event) => setFile(event.target.files?.[0] ?? null)}
                />
                <span>{file ? file.name : "Choose CSV file"}</span>
              </label>
              <button
                className="button button-secondary"
                disabled={!file || busy}
                onClick={() => void handlePreview()}
                type="button"
              >
                {busy ? "Checking..." : "Preview import"}
              </button>
            </div>

            {file ? (
              <div className="notice info import-inline-note">
                Selected file: <strong>{file.name}</strong>
              </div>
            ) : null}
          </div>

          {error ? <div className="notice error import-block-space">{error}</div> : null}
          {message ? <div className="notice success import-block-space">{message}</div> : null}

          {preview ? (
            <div className="import-preview-shell">
              <div className="import-preview-header">
                <div>
                  <h3 className="section-title import-subtitle">Preview results</h3>
                  <p className="muted">Review the parsed rows, fix issues if any, then commit.</p>
                </div>
                {preview.valid ? <span className="status-chip tone-success">Ready to import</span> : <span className="status-chip tone-warning">Needs fixes</span>}
              </div>

              {previewSummary ? (
                <div className="import-summary-grid">
                  <div className="metric-card">
                    <span className="status-chip tone-info">Rows</span>
                    <div className="metric-value">{previewSummary.totalRows}</div>
                    <p className="muted">Validated data rows detected in the file.</p>
                  </div>
                  <div className="metric-card">
                    <span className="status-chip tone-warning">Errors</span>
                    <div className="metric-value">{previewSummary.totalErrors}</div>
                    <p className="muted">Rows requiring correction before import.</p>
                  </div>
                  <div className="metric-card">
                    <span className="status-chip tone-success">Subjects</span>
                    <div className="metric-value">{previewSummary.detectedSubjects}</div>
                    <p className="muted">Subjects detected from the file.</p>
                  </div>
                  <div className="metric-card">
                    <span className="status-chip tone-neutral">Exams</span>
                    <div className="metric-value">{previewSummary.detectedExams}</div>
                    <p className="muted">Exam groups that will be created from this import.</p>
                  </div>
                </div>
              ) : null}

              {preview.errors.length ? (
                <div className="import-error-stack">
                  {preview.errors.map((item) => (
                    <div className="notice error" key={`${item.rowNumber}-${item.message}`}>
                      <strong>Row {item.rowNumber}</strong>
                      <p style={{ marginBottom: 0 }}>{item.message}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <>
                  <div className="notice success">
                    {preview.rows.length} row(s) validated. Subjects detected: {preview.subjectNames.join(", ")}.
                  </div>
                  <div className="table-card import-table-wrap">
                    <table className="table">
                      <thead>
                        <tr>
                          <th>Exam</th>
                          <th>Type</th>
                          <th>Date</th>
                          <th>Subject</th>
                          <th>Score</th>
                        </tr>
                      </thead>
                      <tbody>
                        {preview.rows.map((row, index) => (
                          <tr key={`${row.examName}-${row.subject}-${index}`}>
                            <td>{row.examName}</td>
                            <td>{row.examType}</td>
                            <td>{row.examDate}</td>
                            <td>{row.subject}</td>
                            <td>
                              {row.marksObtained}/{row.maxMarks}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="button-row import-commit-row">
                    <button className="button button-primary" disabled={busy} onClick={() => void handleCommit()} type="button">
                      {busy ? "Importing..." : "Commit import"}
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : null}
        </div>

        <aside className="import-side-panel">
          <div className="section-card import-help-card">
            <span className="eyebrow">CSV format</span>
            <h3 className="section-title import-side-title">What this upload expects</h3>
            <div className="import-chip-row">
              {expectedHeaders.map((header) => (
                <span className="subject-pill" key={header}>{header}</span>
              ))}
            </div>
            <div className="notice info">
              <strong>Date format:</strong>
              <p className="muted" style={{ marginBottom: 0 }}>Use <code>YYYY-MM-DD</code> for every exam date.</p>
            </div>
            <div className="notice info">
              <strong>Valid exam types:</strong>
              <p className="muted" style={{ marginBottom: 0 }}>{examTypeHints.join(", ")}</p>
            </div>
          </div>

          <div className="section-card import-help-card">
            <span className="eyebrow">Workflow</span>
            <div className="list">
              <div className="list-item">
                <strong>1. Upload file</strong>
                <p className="muted">Choose the CSV containing marks history.</p>
              </div>
              <div className="list-item">
                <strong>2. Preview validation</strong>
                <p className="muted">Check row count, detected subjects, and row-level issues.</p>
              </div>
              <div className="list-item">
                <strong>3. Commit import</strong>
                <p className="muted">Only write the data after the preview is clean.</p>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}
