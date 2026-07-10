import { MonoIcon, type MonoIconName } from "@/components/icons/MonoIcon";

/** Shared icon + short label chip used by bottom nav and onboarding flow strips. */
export function NavIconChip({
  icon,
  label,
  active = false,
}: {
  icon: MonoIconName;
  label: string;
  active?: boolean;
}) {
  return (
    <span className={`nav-icon-chip${active ? " active" : ""}`}>
      <MonoIcon name={icon} size={22} />
      <span className="nav-icon-chip-label">{label}</span>
    </span>
  );
}
