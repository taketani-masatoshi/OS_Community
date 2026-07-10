import { ReactNode } from "react";

export function Badge({
  children,
  variant = "default",
}: {
  children: ReactNode;
  variant?: "default" | "warning" | "danger" | "success" | "honor" | "navy";
}) {
  const cls =
    variant === "success"
      ? "badge badge-success"
      : variant === "warning"
        ? "badge badge-warning"
        : variant === "danger"
          ? "badge badge-danger"
          : variant === "navy" || variant === "honor"
            ? "badge badge-navy"
            : "badge badge-default";
  return <span className={cls}>{children}</span>;
}

export function Card({ children, title }: { children: ReactNode; title?: string }) {
  return (
    <div className="lf-card" style={{ marginBottom: "0.75rem" }}>
      {title && <h3>{title}</h3>}
      {children}
    </div>
  );
}

export function PageLayout({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <div className="page-wrap">
      {title && <h1 className="page-title">{title}</h1>}
      {description && <p className="page-desc">{description}</p>}
      {children}
    </div>
  );
}
