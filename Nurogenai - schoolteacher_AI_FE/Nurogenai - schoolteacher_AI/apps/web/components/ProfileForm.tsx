"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { api } from "@/lib/api";
import { useAuth, useProtectedRoute } from "@/lib/auth";

const emptyForm = {
  fullName: "",
  classGrade: "",
  section: "",
  schoolName: "",
  age: "",
  targetGoal: "",
};

export function ProfileForm({ mode }: { mode: "onboarding" | "settings" }) {
  const router = useRouter();
  const { refreshUser } = useAuth();
  const { ready } = useProtectedRoute({ allowIncompleteProfile: true });
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const completionScore = useMemo(() => {
    const fields = [form.fullName, form.classGrade, form.schoolName, form.targetGoal, form.section, form.age];
    const completed = fields.filter((field) => String(field).trim()).length;
    return Math.round((completed / fields.length) * 100);
  }, [form]);

  useEffect(() => {
    if (!ready) return;
    async function loadProfile() {
      try {
        const profile = await api.getProfile();
        setForm({
          fullName: profile.fullName,
          classGrade: profile.classGrade,
          section: profile.section ?? "",
          schoolName: profile.schoolName,
          age: profile.age ? String(profile.age) : "",
          targetGoal: profile.targetGoal ?? "",
        });
      } catch (nextError) {
        setError(nextError instanceof Error ? nextError.message : "Unable to load profile");
      } finally {
        setLoading(false);
      }
    }
    void loadProfile();
  }, [ready]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      await api.updateProfile({
        fullName: form.fullName,
        classGrade: form.classGrade,
        section: form.section || null,
        schoolName: form.schoolName,
        age: form.age ? Number(form.age) : null,
        targetGoal: form.targetGoal || null,
      });
      await refreshUser();
      setMessage("Profile saved successfully.");
      if (mode === "onboarding") {
        router.push("/dashboard");
      }
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Unable to save profile");
    } finally {
      setSaving(false);
    }
  }

  if (!ready || loading) {
    return <div className="section-card">Loading your profile...</div>;
  }

  return (
    <form className="form-card settings-card-shell" onSubmit={handleSubmit}>
      <div className="settings-card-header">
        <div>
          <h2 className="section-title">Student profile</h2>
          <p className="muted">
            This information shapes analytics, recommendations, and the academic context used across the app.
          </p>
        </div>
        <span className="status-chip tone-info">{completionScore}% complete</span>
      </div>

      <div className="notice info">
        Keep class, school, and goal details up to date so reports remain useful and relevant.
      </div>

      <div className="input-grid settings-form-grid">
        <div className="field">
          <label htmlFor="fullName">Full name</label>
          <input
            id="fullName"
            value={form.fullName}
            onChange={(event) => setForm((current) => ({ ...current, fullName: event.target.value }))}
            required
          />
        </div>
        <div className="field">
          <label htmlFor="classGrade">Class / grade</label>
          <input
            id="classGrade"
            value={form.classGrade}
            onChange={(event) => setForm((current) => ({ ...current, classGrade: event.target.value }))}
            required
          />
        </div>
        <div className="field">
          <label htmlFor="section">Section</label>
          <input
            id="section"
            value={form.section}
            onChange={(event) => setForm((current) => ({ ...current, section: event.target.value }))}
            placeholder="Example: A"
          />
        </div>
        <div className="field">
          <label htmlFor="schoolName">School name</label>
          <input
            id="schoolName"
            value={form.schoolName}
            onChange={(event) => setForm((current) => ({ ...current, schoolName: event.target.value }))}
            required
          />
        </div>
        <div className="field">
          <label htmlFor="age">Age</label>
          <input
            id="age"
            inputMode="numeric"
            value={form.age}
            onChange={(event) => setForm((current) => ({ ...current, age: event.target.value }))}
            placeholder="Example: 15"
          />
        </div>
        <div className="field">
          <label htmlFor="targetGoal">Target exam / goal</label>
          <input
            id="targetGoal"
            value={form.targetGoal}
            onChange={(event) => setForm((current) => ({ ...current, targetGoal: event.target.value }))}
            placeholder="Example: 85% overall in final exams"
          />
        </div>
      </div>

      {error ? <div className="notice error" style={{ marginTop: 18 }}>{error}</div> : null}
      {message ? <div className="notice success" style={{ marginTop: 18 }}>{message}</div> : null}

      <div className="button-row" style={{ marginTop: 20 }}>
        <button className="button button-primary" disabled={saving} type="submit">
          {saving ? "Saving..." : mode === "onboarding" ? "Save and continue" : "Save profile"}
        </button>
      </div>
    </form>
  );
}
