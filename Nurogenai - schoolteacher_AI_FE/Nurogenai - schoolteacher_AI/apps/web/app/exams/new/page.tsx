import { AppShell } from "@/components/AppShell";
import { ExamForm } from "@/components/ExamForm";

export default function NewExamPage() {
  return (
    <AppShell>
      <section className="hero-card" style={{ marginBottom: 20 }}>
        <span className="eyebrow">Manual entry</span>
        <h1 className="hero-title">Enter one exam at a time, then let trends build naturally.</h1>
        <p className="lede">
          The platform is exam-centric on purpose, so every save becomes a clean analytics checkpoint.
        </p>
      </section>
      <ExamForm />
    </AppShell>
  );
}
