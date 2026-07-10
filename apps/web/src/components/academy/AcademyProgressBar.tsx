type Props = {
  completed: number;
  total: number;
  percent: number;
  label: string;
};

export function AcademyProgressBar({
  completed,
  total,
  percent,
  label,
}: Props) {
  return (
    <div className="academy-progress-bar" aria-label={label}>
      <div className="academy-progress-bar-meta">
        <span>{label}</span>
        <span>
          {completed}/{total} ({percent}%)
        </span>
      </div>
      <div className="academy-progress-bar-track">
        <div className="academy-progress-bar-fill" style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}
