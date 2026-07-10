"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { FormMessages } from "@os-community/shared";

export function AdminCertActions({
  applicationId,
  labels,
}: {
  applicationId: string;
  labels: FormMessages["admin"];
}) {
  const router = useRouter();
  const [error, setError] = useState("");

  async function act(action: "approve" | "reject") {
    setError("");
    const res = await fetch("/api/admin/certifications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({ applicationId, action }),
    });
    if (res.ok) {
      router.push("/admin");
      return;
    }
    setError(labels.errorAction);
  }

  return (
    <div>
      <div style={{ display: "flex", gap: "0.5rem", marginTop: "1rem" }}>
        <button type="button" className="btn btn-success" onClick={() => act("approve")}>
          {labels.approve}
        </button>
        <button type="button" className="btn btn-danger" onClick={() => act("reject")}>
          {labels.reject}
        </button>
      </div>
      {error && (
        <p style={{ color: "var(--danger)", marginTop: "0.5rem", fontSize: "0.9rem" }} role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
