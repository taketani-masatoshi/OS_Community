import Link from "next/link";
import type { ReactNode } from "react";

export function IdentityLayerCard({
  title,
  status,
  complete,
  children,
  action,
}: {
  title: string;
  status: string;
  complete: boolean;
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className={`identity-layer-card ${complete ? "identity-layer-complete" : ""}`}>
      <div className="identity-layer-header">
        <div>
          <h3 className="identity-layer-title">{title}</h3>
          <p className="identity-layer-status">
            <span className={`badge ${complete ? "badge-success" : "badge-warning"}`}>
              {status}
            </span>
          </p>
        </div>
        {action}
      </div>
      <div className="identity-layer-body">{children}</div>
    </div>
  );
}

export function IdentityLayerLink({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} className="btn btn-primary btn-sm">
      {label}
    </Link>
  );
}
