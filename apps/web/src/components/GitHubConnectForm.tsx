"use client";

import { useState } from "react";
import type { FormMessages } from "@os-community/shared";

function resolveErrorMessage(
  status: number,
  code: string | undefined,
  serverError: string | undefined,
  labels: FormMessages["githubConnect"]
): string {
  if (status === 401 || code === "UNAUTHORIZED") return labels.errorUnauthorized;
  if (code === "PROFILE_INCOMPLETE" || status === 403) return labels.errorProfileIncomplete;
  if (status === 503 || code === "GITHUB_UNAVAILABLE") return labels.errorNetwork;
  if (status === 404 || code === "REPO_NOT_FOUND") return labels.errorNotFound;
  return serverError ?? labels.error;
}

export function GitHubConnectForm({ labels }: { labels: FormMessages["githubConnect"] }) {
  const [repoUrl, setRepoUrl] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [message, setMessage] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setMessage("");

    try {
      const res = await fetch("/api/github/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ repoUrl }),
      });

      let data: { error?: string; code?: string; ok?: boolean } = {};
      try {
        data = (await res.json()) as { error?: string; code?: string; ok?: boolean };
      } catch {
        if (!res.ok) {
          setStatus("error");
          setMessage(resolveErrorMessage(res.status, undefined, undefined, labels));
          return;
        }
      }

      if (res.ok) {
        setStatus("done");
        setMessage(labels.success);
        window.location.reload();
        return;
      }

      setStatus("error");
      setMessage(resolveErrorMessage(res.status, data.code, data.error, labels));
    } catch {
      setStatus("error");
      setMessage(labels.errorNetwork);
    }
  }

  return (
    <form onSubmit={submit}>
      <label style={{ display: "block", marginBottom: "0.75rem" }}>
        {labels.label}
        <input
          required
          value={repoUrl}
          onChange={(e) => setRepoUrl(e.target.value)}
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
      {message && (
        <p
          style={{ marginTop: "0.5rem", color: status === "error" ? "var(--danger)" : "var(--success)" }}
          role={status === "error" ? "alert" : undefined}
        >
          {message}
        </p>
      )}
    </form>
  );
}
