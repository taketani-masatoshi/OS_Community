import Link from "next/link";

export type OnboardingStepView = {
  id: string;
  title: string;
  body: string;
  href: string;
  cta: string;
  done: boolean;
};

export function MyPageOnboardingChecklist({
  steps,
  title,
  subtitle,
  progressLabel,
}: {
  steps: OnboardingStepView[];
  title: string;
  subtitle: string;
  progressLabel?: string;
}) {
  const doneCount = steps.filter((s) => s.done).length;
  const progress = steps.length ? Math.round((doneCount / steps.length) * 100) : 0;

  return (
    <section className="lf-card onboarding-checklist">
      <h2 className="section-title" style={{ marginTop: 0 }}>
        {title}
      </h2>
      <p className="page-desc">{subtitle}</p>
      {progressLabel && (
        <div className="wizard-progress onboarding-progress" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
          <div className="wizard-progress-bar" style={{ width: `${progress}%` }} />
          <span className="wizard-progress-label">
            {progressLabel.replace("{done}", String(doneCount)).replace("{total}", String(steps.length))}
          </span>
        </div>
      )}
      <ol className="onboarding-checklist-list">
        {steps.map((step, index) => (
          <li key={step.id} className={step.done ? "onboarding-step done" : "onboarding-step"}>
            <div className="onboarding-step-head">
              <span className="onboarding-step-num">{index + 1}</span>
              <div>
                <strong>{step.title}</strong>
                {step.done && (
                  <span className="badge badge-success" style={{ marginLeft: "0.5rem" }}>
                    ✓
                  </span>
                )}
              </div>
            </div>
            {!step.done && (
              <>
                <p className="page-muted-note">{step.body}</p>
                <Link href={step.href} className="btn btn-primary btn-sm">
                  {step.cta}
                </Link>
              </>
            )}
          </li>
        ))}
      </ol>
    </section>
  );
}
