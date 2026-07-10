"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { FormMessages } from "@os-community/shared";

export function WildModuleRegisterForm({ labels }: { labels: FormMessages["wildModule"] }) {
  const router = useRouter();
  const [form, setForm] = useState({
    slug: "",
    name: "",
    repoUrl: "",
    manifestUrl: "",
    authorName: "",
    description: "",
    agreed: false,
  });
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.agreed) return;
    setStatus("loading");
    setErrorMessage("");
    const res = await fetch("/api/wild-modules/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = (await res.json().catch(() => ({}))) as { slug?: string; code?: string; error?: string };
    if (res.ok && data.slug) {
      router.refresh();
      router.push(`/modules/${data.slug}?registered=1`);
      return;
    }
    setStatus("error");
    if (data.code === "SLUG_CONFLICT" || data.code === "DUPLICATE") {
      setErrorMessage(labels.errorSlugConflict);
    } else if (data.code === "REPO_NOT_FOUND") {
      setErrorMessage(labels.errorRepoNotFound);
    } else {
      setErrorMessage(data.error ?? labels.error);
    }
  }

  const textField = (
    key: Exclude<keyof typeof form, "agreed">,
    label: string,
    hint?: string,
    required = true
  ) => (
    <label className="form-field">
      <span>{label}</span>
      <input
        required={required && key !== "manifestUrl" && key !== "description"}
        type="text"
        value={String(form[key])}
        onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
      />
      {hint && <small>{hint}</small>}
    </label>
  );

  return (
    <form onSubmit={submit} className="profile-register-form">
      {textField("slug", labels.slug, labels.slugHint)}
      {textField("name", labels.name, labels.nameHint)}
      {textField("repoUrl", labels.repoUrl, labels.repoUrlHint)}
      {textField("manifestUrl", labels.manifestUrl, labels.manifestUrlHint, false)}
      {textField("authorName", labels.authorName)}
      <label className="form-field">
        <span>{labels.description}</span>
        <textarea
          value={form.description}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          rows={3}
        />
      </label>
      <label className="form-field form-field-checkbox">
        <input
          type="checkbox"
          checked={form.agreed}
          onChange={(e) => setForm((f) => ({ ...f, agreed: e.target.checked }))}
          required
        />
        <span>
          {labels.agree}
          <a href="/legal/disclaimer" target="_blank" rel="noopener noreferrer">
            {labels.disclaimerLink}
          </a>
        </span>
      </label>
      <button type="submit" className="btn btn-primary" disabled={status === "loading" || !form.agreed}>
        {labels.submit}
      </button>
      {status === "error" && (
        <p className="form-error" role="alert">
          {errorMessage}
        </p>
      )}
      <div className="lf-card success-card" style={{ marginTop: "1rem" }}>
        <strong>{labels.successNextTitle}</strong>
        <ul className="success-next-list">
          {labels.successNextSteps.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ul>
      </div>
    </form>
  );
}
