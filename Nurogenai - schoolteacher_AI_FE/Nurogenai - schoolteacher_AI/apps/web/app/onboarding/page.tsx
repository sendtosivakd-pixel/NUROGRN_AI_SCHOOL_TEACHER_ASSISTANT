import { AppShell } from "@/components/AppShell";
import { ProfileForm } from "@/components/ProfileForm";
import { SubjectManager } from "@/components/SubjectManager";

export default function OnboardingPage() {
  return (
    <AppShell>
      <div className="grid-2">
        <section className="hero-card">
          <span className="eyebrow">Onboarding</span>
          <h1 className="hero-title">Set the academic context before the first report is generated.</h1>
          <p className="lede">
            Add the student profile, define the subjects, then head to marks entry and let the
            dashboard do the rest.
          </p>
        </section>
        <ProfileForm mode="onboarding" />
      </div>
      <div style={{ marginTop: 20 }}>
        <SubjectManager />
      </div>
    </AppShell>
  );
}
