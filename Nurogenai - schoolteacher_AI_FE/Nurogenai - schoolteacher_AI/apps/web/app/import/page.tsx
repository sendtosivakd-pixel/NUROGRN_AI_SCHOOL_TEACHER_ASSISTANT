import { AppShell } from "@/components/AppShell";
import { CsvImportCard } from "@/components/CsvImportCard";

export default function ImportPage() {
  return (
    <AppShell>
      <section className="hero-card" style={{ marginBottom: 20 }}>
        <span className="eyebrow">Bulk import</span>
        <h1 className="hero-title">Bring in structured marks history without sacrificing validation.</h1>
        <p className="lede">
          Preview the CSV first, fix row-level issues, then commit only when the data is clean.
        </p>
      </section>
      <CsvImportCard />
    </AppShell>
  );
}
