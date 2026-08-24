"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { IconFlowStrip } from "@/components/nav/IconFlowStrip";

type Step = {
  id: string;
  title: string;
  body: string;
  href: string;
  cta: string;
  intent: string;
};

export function GettingStartedWizard({
  steps,
  labels,
  isSignedIn,
}: {
  steps: Step[];
  labels: {
    flowTitle: string;
    flowBrowse: string;
    flowSignIn: string;
    flowApply: string;
    progressLabel: string;
    back: string;
    next: string;
    finish: string;
    caseStudiesTitle: string;
    caseStudies: { title: string; body: string }[];
  };
  isSignedIn: boolean;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialStep = Math.min(
    Math.max(Number(searchParams.get("step") ?? "1") - 1, 0),
    steps.length - 1
  );
  const [active, setActive] = useState(initialStep);

  const progress = useMemo(
    () => Math.round(((active + 1) / steps.length) * 100),
    [active, steps.length]
  );

  useEffect(() => {
    const intent = searchParams.get("intent");
    if (intent) {
      try {
        localStorage.setItem("onboarding-intent", intent);
      } catch {
        /* ignore */
      }
    }
  }, [searchParams]);

  const goToStep = useCallback(
    (index: number) => {
      setActive(index);
      router.replace(`/getting-started?step=${index + 1}`, { scroll: false });
    },
    [router]
  );

  const current = steps[active];

  function handleNext() {
    try {
      localStorage.setItem("onboarding-intent", current.intent);
    } catch {
      /* ignore */
    }
    if (active < steps.length - 1) {
      goToStep(active + 1);
      return;
    }
    router.push(current.href);
  }

  return (
    <div className="getting-started-wizard">
      <IconFlowStrip
        ariaLabel={labels.flowTitle}
        steps={[
          { icon: "eye", label: labels.flowBrowse, active: active === 0 },
          { icon: "log-in", label: labels.flowSignIn, active: !isSignedIn && active >= 1 },
          {
            icon: "user-plus",
            label: labels.flowApply,
            active: isSignedIn && active === steps.length - 1,
          },
        ]}
      />

      <div className="wizard-progress" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
        <div className="wizard-progress-bar" style={{ width: `${progress}%` }} />
        <span className="wizard-progress-label">{labels.progressLabel.replace("{step}", String(active + 1)).replace("{total}", String(steps.length))}</span>
      </div>

      <div className="lf-card lf-card-full wizard-step-card">
        <h2 className="section-title" style={{ marginTop: 0 }}>
          {current.title}
        </h2>
        <p className="page-desc">{current.body}</p>
        <div className="wizard-actions">
          {active > 0 && (
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => goToStep(active - 1)}>
              {labels.back}
            </button>
          )}
          <button type="button" className="btn btn-primary btn-sm" onClick={handleNext}>
            {active < steps.length - 1 ? labels.next : labels.finish}
          </button>
        </div>
      </div>

      <div className="wizard-step-dots">
        {steps.map((step, index) => (
          <button
            key={step.id}
            type="button"
            className={`wizard-dot ${index === active ? "active" : ""} ${index < active ? "done" : ""}`}
            aria-label={step.title}
            onClick={() => goToStep(index)}
          />
        ))}
      </div>

      <section className="case-studies-section">
        <h3 className="section-title">{labels.caseStudiesTitle}</h3>
        <div className="lf-card-grid">
          {labels.caseStudies.map((story) => (
            <div key={story.title} className="lf-card lf-card-full case-study-card">
              <h4>{story.title}</h4>
              <p className="page-muted-note" style={{ marginBottom: 0 }}>
                {story.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {!isSignedIn && (
        <p className="section-cta">
          <Link
            href={`/login/start?callbackUrl=${encodeURIComponent(`/getting-started?step=${active + 1}&intent=${current.intent}`)}`}
            className="btn btn-primary btn-sm"
          >
            {labels.flowSignIn}
          </Link>
        </p>
      )}
    </div>
  );
}
