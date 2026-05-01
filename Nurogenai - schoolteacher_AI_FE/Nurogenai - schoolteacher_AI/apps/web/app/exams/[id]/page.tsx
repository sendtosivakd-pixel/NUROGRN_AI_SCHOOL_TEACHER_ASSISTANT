import { AppShell } from "@/components/AppShell";
import { ExamForm } from "@/components/ExamForm";

export default async function ExamDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <AppShell>
      <section className="hero-card" style={{ marginBottom: 20 }}>
        <span className="eyebrow">Exam detail</span>
        <h1 className="hero-title">Review, update, or remove an exam record.</h1>
        <p className="lede">
          Editing an exam automatically invalidates the cached report so the dashboard stays honest.
        </p>
      </section>
      <ExamForm examId={id} />
    </AppShell>
  );
}
