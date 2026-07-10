"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { FormMessages } from "@os-community/shared";

export function CertificationApplyForm({ labels }: { labels: FormMessages["certification"] }) {
  const router = useRouter();
  const [type, setType] = useState("STEWARD_OPERATOR");
  const [statement, setStatement] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    const res = await fetch("/api/certifications/apply", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, statement }),
    });
    if (res.ok) {
      setStatus("done");
      router.push("/certifications");
    } else {
      setStatus("error");
    }
  }

  return (
    <form onSubmit={submit}>
      <label style={{ display: "block", marginBottom: "0.75rem" }}>
        {labels.typeLabel}
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          style={{
            display: "block",
            width: "100%",
            marginTop: "0.25rem",
            padding: "0.5rem",
            background: "var(--background)",
            border: "1px solid var(--border)",
            borderRadius: 6,
            color: "var(--foreground)",
          }}
        >
          <option value="STEWARD_OPERATOR">{labels.types.STEWARD_OPERATOR}</option>
          <option value="STEWARD_DESIGNER">{labels.types.STEWARD_DESIGNER}</option>
        </select>
      </label>
      <label style={{ display: "block", marginBottom: "0.75rem" }}>
        {labels.statementLabel}
        <textarea
          value={statement}
          onChange={(e) => setStatement(e.target.value)}
          required
          rows={5}
          placeholder={labels.placeholder}
          style={{
            display: "block",
            width: "100%",
            marginTop: "0.25rem",
            padding: "0.5rem",
            background: "var(--background)",
            border: "1px solid var(--border)",
            borderRadius: 6,
            color: "var(--foreground)",
          }}
        />
      </label>
      <button type="submit" className="btn btn-primary" disabled={status === "loading"}>
        {labels.submit}
      </button>
      {status === "error" && <p style={{ color: "var(--danger)", marginTop: "0.5rem" }}>{labels.error}</p>}
    </form>
  );
}
