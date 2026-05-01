import { AppShell } from "@/components/AppShell";
import { ProfileForm } from "@/components/ProfileForm";
import { SubjectManager } from "@/components/SubjectManager";

export default function SettingsPage() {
  return (
    <AppShell>
      <section className="hero-card" style={{ marginBottom: 20 }}>
        <span className="eyebrow">Academic setup</span>
        <h1 className="hero-title">Keep profile data and subject structure clean before scaling analytics.</h1>
        <p className="lede">
          These settings drive exam entry quality, CSV import accuracy, and the usefulness of the dashboard.
        </p>
      </section>
      <div className="settings-layout">
        <ProfileForm mode="settings" />
        <SubjectManager />
      </div>
    </AppShell>
  );
}
