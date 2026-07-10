"use client";

export function AdminAuditExportButton({ label }: { label: string }) {
  return (
    <a
      href="/api/admin/audit/role-changes?format=csv"
      className="btn btn-primary btn-sm"
      download="role-audit-log.csv"
    >
      {label}
    </a>
  );
}
