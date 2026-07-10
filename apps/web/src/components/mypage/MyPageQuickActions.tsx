import Link from "next/link";

export type MyPageQuickAction = {
  href: string;
  label: string;
};

export function MyPageQuickActions({
  title,
  actions,
}: {
  title: string;
  actions: MyPageQuickAction[];
}) {
  return (
    <section className="mypage-section mypage-section-tight">
      <h2 className="mypage-section-label">{title}</h2>
      <div className="mypage-actions-grid">
        {actions.map((action) => (
          <Link key={action.href + action.label} href={action.href} className="mypage-action-card">
            <span className="mypage-action-label">{action.label}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
