"use client";

import type { SubjectRecord } from "@nuro/contracts";
import { useEffect, useMemo, useState } from "react";

import { api } from "@/lib/api";
import { useProtectedRoute } from "@/lib/auth";

const starterSubjects = ["Mathematics", "Science", "English", "Social Science", "Hindi"];

export function SubjectManager() {
  const { ready } = useProtectedRoute({ allowIncompleteProfile: true });
  const [subjects, setSubjects] = useState<SubjectRecord[]>([]);
  const [newSubject, setNewSubject] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const normalizedSubjects = useMemo(
    () => new Set(subjects.map((subject) => subject.name.trim().toLowerCase())),
    [subjects],
  );

  async function loadSubjects() {
    try {
      const response = await api.listSubjects();
      setSubjects(response);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Unable to load subjects");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!ready) return;
    void loadSubjects();
  }, [ready]);

  async function addSubject(nameOverride?: string) {
    const candidate = (nameOverride ?? newSubject).trim();
    if (!candidate) return;
    setError(null);
    setMessage(null);
    try {
      await api.createSubject({ name: candidate });
      setNewSubject("");
      setMessage("Subject added.");
      await loadSubjects();
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Unable to add subject");
    }
  }

  async function saveSubject(subjectId: string) {
    try {
      await api.updateSubject(subjectId, { name: editingName.trim() });
      setEditingId(null);
      setEditingName("");
      setMessage("Subject updated.");
      await loadSubjects();
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Unable to update subject");
    }
  }

  async function removeSubject(subjectId: string) {
    try {
      await api.deleteSubject(subjectId);
      setMessage("Subject removed.");
      await loadSubjects();
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Unable to delete subject");
    }
  }

  if (!ready || loading) {
    return <div className="section-card">Loading subjects...</div>;
  }

  return (
    <section className="section-card settings-card-shell">
      <div className="settings-card-header">
        <div>
          <h2 className="section-title">Subjects</h2>
          <p className="muted">
            Keep this list aligned with the actual academic subjects so exam entry, imports, and analytics stay accurate.
          </p>
        </div>
        <span className="status-chip tone-info">{subjects.length} configured</span>
      </div>

      <div className="settings-add-card">
        <div>
          <strong>Add a subject</strong>
          <p className="muted">Create the subjects once, then reuse them across manual exam entry and CSV import.</p>
        </div>
        <div className="settings-add-row">
          <input
            aria-label="New subject"
            placeholder="Add a subject"
            value={newSubject}
            onChange={(event) => setNewSubject(event.target.value)}
          />
          <button className="button button-primary" onClick={() => void addSubject()} type="button">
            Add subject
          </button>
        </div>
      </div>

      <div className="settings-chip-cloud">
        {starterSubjects.map((subject) => {
          const exists = normalizedSubjects.has(subject.toLowerCase());
          return (
            <button
              className={`subject-pill ${exists ? "settings-chip-disabled" : ""}`}
              disabled={exists}
              key={subject}
              onClick={() => void addSubject(subject)}
              type="button"
            >
              {exists ? `${subject} added` : `Add ${subject}`}
            </button>
          );
        })}
      </div>

      {error ? <div className="notice error">{error}</div> : null}
      {message ? <div className="notice success">{message}</div> : null}

      <div className="list settings-subject-list">
        {subjects.length ? (
          subjects.map((subject) => (
            <div className="list-item settings-subject-item" key={subject.id}>
              {editingId === subject.id ? (
                <div className="settings-inline-edit">
                  <input
                    value={editingName}
                    onChange={(event) => setEditingName(event.target.value)}
                  />
                  <button
                    className="button button-primary"
                    onClick={() => void saveSubject(subject.id)}
                    type="button"
                  >
                    Save
                  </button>
                  <button
                    className="button button-secondary"
                    onClick={() => setEditingId(null)}
                    type="button"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <div className="settings-subject-row">
                  <div>
                    <strong>{subject.name}</strong>
                    <p className="muted settings-subject-copy">Used for exam entry, import mapping, and analytics.</p>
                  </div>
                  <div className="button-row">
                    <button
                      className="button button-secondary"
                      onClick={() => {
                        setEditingId(subject.id);
                        setEditingName(subject.name);
                      }}
                      type="button"
                    >
                      Edit
                    </button>
                    <button
                      className="button button-danger"
                      onClick={() => void removeSubject(subject.id)}
                      type="button"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="empty-state">No subjects yet. Add them here before entering marks.</div>
        )}
      </div>
    </section>
  );
}
