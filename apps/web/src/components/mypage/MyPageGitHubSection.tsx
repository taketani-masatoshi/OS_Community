import Link from "next/link";

type GitHubConnection = {
  id: string;
  repoOwner: string;
  repoName: string;
  repoUrl: string;
  isDefault: boolean;
};

export function MyPageGitHubSection({
  connections,
  labels,
  defaultLabel,
}: {
  connections: GitHubConnection[];
  labels: {
    title: string;
    empty: string;
    connectLink: string;
  };
  defaultLabel: string;
}) {
  return (
    <section className="mypage-panel">
      <h2 className="mypage-panel-title">{labels.title}</h2>
      {connections.length === 0 ? (
        <p className="mypage-panel-empty">
          {labels.empty}{" "}
          <Link href="/github" className="btn btn-primary btn-sm">
            {labels.connectLink}
          </Link>
        </p>
      ) : (
        <ul className="mypage-status-list">
          {connections.map((c) => (
            <li key={c.id} className="mypage-status-item">
              <a href={c.repoUrl} target="_blank" rel="noopener noreferrer" className="mypage-status-link">
                {c.repoOwner}/{c.repoName}
              </a>
              {c.isDefault && <span className="badge badge-success">{defaultLabel}</span>}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
