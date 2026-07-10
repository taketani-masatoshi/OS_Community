import { MODULE_LIFECYCLE, getLocalized, type Locale } from "@os-community/shared";

export function LifecyclePipeline({
  locale,
  highlight,
}: {
  locale: Locale;
  highlight?: string;
}) {
  return (
    <div className="lifecycle-pipeline">
      {MODULE_LIFECYCLE.map((step) => (
        <div
          key={step.stage}
          className={`lifecycle-step${highlight === step.stage ? " lifecycle-step-highlight" : ""}`}
        >
          <div className="lifecycle-step-label">{getLocalized(step.name, locale)}</div>
          <div className="lifecycle-step-name">{getLocalized(step.name, locale)}</div>
          <div className="lifecycle-step-desc">{getLocalized(step.desc, locale)}</div>
        </div>
      ))}
    </div>
  );
}
