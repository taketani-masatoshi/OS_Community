import { Fragment } from "react";
import type { MonoIconName } from "@/components/icons/MonoIcon";
import { NavIconChip } from "@/components/nav/NavIconChip";

export type IconFlowStep = {
  icon: MonoIconName;
  label: string;
  active?: boolean;
};

/** Horizontal icon flow (e.g. はじめての方 見る → ログイン → 応募). Matches bottom-nav chip styling. */
export function IconFlowStrip({
  steps,
  ariaLabel,
}: {
  steps: IconFlowStep[];
  ariaLabel: string;
}) {
  return (
    <div className="icon-flow-strip" aria-label={ariaLabel}>
      <div className="icon-flow-row" role="list">
        {steps.map((step, index) => (
          <Fragment key={`${step.label}-${index}`}>
            {index > 0 && (
              <span className="icon-flow-arrow" aria-hidden>
                →
              </span>
            )}
            <div className="icon-flow-step" role="listitem">
              <NavIconChip icon={step.icon} label={step.label} active={step.active} />
            </div>
          </Fragment>
        ))}
      </div>
    </div>
  );
}
