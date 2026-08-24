import Link from "next/link";

type Props = {
  labels: {
    title: string;
    desc: string;
    manageUsers: string;
    dashboard: string;
  };
};

export function MyPageAdminSection({ labels }: Props) {
  return (
    <section className="mypage-admin-card" aria-labelledby="mypage-admin-heading">
      <div className="mypage-admin-card-body">
        <h2 id="mypage-admin-heading" className="mypage-admin-title">
          {labels.title}
        </h2>
        <p className="mypage-admin-desc">{labels.desc}</p>
      </div>
      <div className="mypage-admin-actions">
        <Link href="/admin/users" className="btn btn-primary btn-sm">
          {labels.manageUsers}
        </Link>
        <Link href="/admin" className="btn btn-ghost btn-sm">
          {labels.dashboard}
        </Link>
      </div>
    </section>
  );
}
