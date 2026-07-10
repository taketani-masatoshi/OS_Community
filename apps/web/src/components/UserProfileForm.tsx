"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useRefreshClientSession } from "@/lib/refresh-client-session";

type Labels = {
  name: string;
  specialty: string;
  specialtyHint: string;
  region: string;
  regionHint: string;
  organization: string;
  bio: string;
  submit: string;
  saved: string;
  required: string;
};

type Initial = {
  name: string;
  specialty: string;
  region: string;
  organization: string;
  bio: string;
};

export function UserProfileForm({
  initial,
  labels,
  redirectTo = "/mypage",
  errorUnauthorized = "Sign in required. Please sign in with GitHub again.",
}: {
  initial: Initial;
  labels: Labels;
  redirectTo?: string;
  errorUnauthorized?: string;
}) {
  const router = useRouter();
  const refreshSession = useRefreshClientSession();
  const [form, setForm] = useState(initial);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("saving");
    setError("");

    const res = await fetch("/api/user/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify(form),
    });

    if (!res.ok) {
      const data = (await res.json()) as { error?: string; code?: string };
      setStatus("error");
      if (res.status === 401 || data.code === "UNAUTHORIZED") {
        setError(errorUnauthorized);
        return;
      }
      setError(data.error ?? "Error");
      return;
    }

    setStatus("saved");
    await refreshSession();
    router.push(redirectTo);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="profile-register-form">
      <label className="form-field">
        <span>
          {labels.name} <em className="form-required">{labels.required}</em>
        </span>
        <input
          type="text"
          required
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
      </label>

      <label className="form-field">
        <span>
          {labels.specialty} <em className="form-required">{labels.required}</em>
        </span>
        <input
          type="text"
          required
          value={form.specialty}
          onChange={(e) => setForm({ ...form, specialty: e.target.value })}
        />
        <small>{labels.specialtyHint}</small>
      </label>

      <label className="form-field">
        <span>
          {labels.region} <em className="form-required">{labels.required}</em>
        </span>
        <input
          type="text"
          required
          value={form.region}
          onChange={(e) => setForm({ ...form, region: e.target.value })}
        />
        <small>{labels.regionHint}</small>
      </label>

      <label className="form-field">
        <span>{labels.organization}</span>
        <input
          type="text"
          value={form.organization}
          onChange={(e) => setForm({ ...form, organization: e.target.value })}
        />
      </label>

      <label className="form-field">
        <span>{labels.bio}</span>
        <textarea
          rows={4}
          value={form.bio}
          onChange={(e) => setForm({ ...form, bio: e.target.value })}
        />
      </label>

      <button type="submit" className="btn btn-primary" disabled={status === "saving"}>
        {labels.submit}
      </button>

      {status === "error" && <p className="form-error">{error}</p>}
    </form>
  );
}
