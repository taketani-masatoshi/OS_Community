import Link from "next/link";
import type { Session } from "next-auth";

export function MyPageLayerStatus({
  session,
  labels,
}: {
  session: Session;
  labels: {
    title: string;
    community: string;
    professional: string;
    technical: string;
    complete: string;
    incomplete: string;
    partial: string;
    connectionsCta: string;
  };
}) {
  const user = session.user;
  const communityDone = Boolean(user.profileComplete && user.emailLoginConnected);
  const communityPartial = Boolean(user.emailLoginConnected) && !communityDone;
  const professionalDone = Boolean(user.linkedinConnected);
  const technicalDone = Boolean(user.githubAccountLinked && user.githubReposConnected);
  const technicalPartial = Boolean(user.githubAccountLinked) && !technicalDone;

  return (
    <section className="mypage-section mypage-section-tight">
      <div className="mypage-section-header">
        <h2 className="mypage-section-label">{labels.title}</h2>
        <Link href="/settings/connections" className="btn btn-primary btn-sm">
          {labels.connectionsCta}
        </Link>
      </div>
      <div className="mypage-layer-status-grid">
        <LayerPill label={labels.community} done={communityDone} partial={communityPartial} labels={labels} />
        <LayerPill label={labels.professional} done={professionalDone} partial={false} labels={labels} />
        <LayerPill
          label={labels.technical}
          done={technicalDone}
          partial={technicalPartial}
          labels={labels}
        />
      </div>
    </section>
  );
}

function LayerPill({
  label,
  done,
  partial,
  labels,
}: {
  label: string;
  done: boolean;
  partial: boolean;
  labels: { complete: string; incomplete: string; partial: string };
}) {
  const status = done ? labels.complete : partial ? labels.partial : labels.incomplete;
  const variant = done ? "badge-success" : partial ? "badge-navy" : "badge-warning";
  return (
    <div className="mypage-layer-pill">
      <span className="mypage-layer-pill-label">{label}</span>
      <span className={`badge ${variant}`}>{status}</span>
    </div>
  );
}
