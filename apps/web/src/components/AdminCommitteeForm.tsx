"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { CommitteeType } from "@os-community/db";
import {
  GOVERNANCE_EXPERT_DOMAINS,
  GOVERNANCE_JURISDICTIONS,
} from "@os-community/shared";

type Labels = {
  committeesTypeStandard: string;
  committeesTypeDomain: string;
  committeesTypeModule: string;
  committeesSlugLabel: string;
  committeesNameLabel: string;
  committeesDescriptionLabel: string;
  committeesJurisdictionLabel: string;
  committeesExpertDomainLabel: string;
  committeesModuleLabel: string;
  committeesSubmitCreate: string;
  committeesCreated: string;
  committeesErrorGeneric: string;
};

export function AdminCommitteeForm({
  modules,
  labels,
}: {
  modules: { id: string; slug: string; name: string }[];
  labels: Labels;
}) {
  const router = useRouter();
  const [type, setType] = useState<CommitteeType>("DOMAIN");
  const [slug, setSlug] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [jurisdictionCode, setJurisdictionCode] = useState(GOVERNANCE_JURISDICTIONS[0]?.code ?? "");
  const [expertDomainKey, setExpertDomainKey] = useState(GOVERNANCE_EXPERT_DOMAINS[0]?.key ?? "");
  const [moduleId, setModuleId] = useState(modules[0]?.id ?? "");
  const [status, setStatus] = useState<"idle" | "saving" | "error" | "done">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("saving");
    const res = await fetch("/api/admin/committees", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type,
        slug,
        name,
        description: description.trim() || undefined,
        jurisdictionCode: type === "DOMAIN" ? jurisdictionCode : undefined,
        expertDomainKey: type === "DOMAIN" ? expertDomainKey : undefined,
        moduleId: type === "MODULE" ? moduleId : undefined,
      }),
    });

    if (res.ok) {
      const body = (await res.json()) as { slug?: string };
      router.push(`/admin/committees/${body.slug ?? slug}`);
      router.refresh();
      return;
    }

    setStatus("error");
  }

  return (
    <form onSubmit={handleSubmit} className="lf-card" style={{ maxWidth: 640 }}>
      <label style={{ display: "block", marginBottom: "1rem" }}>
        <span className="page-muted-note">{labels.committeesFilterType}</span>
        <select
          value={type}
          onChange={(e) => setType(e.target.value as CommitteeType)}
          style={{ display: "block", width: "100%", marginTop: "0.35rem" }}
        >
          <option value="STANDARD">{labels.committeesTypeStandard}</option>
          <option value="DOMAIN">{labels.committeesTypeDomain}</option>
          <option value="MODULE">{labels.committeesTypeModule}</option>
        </select>
      </label>

      <label style={{ display: "block", marginBottom: "1rem" }}>
        {labels.committeesSlugLabel}
        <input
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          required
          style={{ display: "block", width: "100%", marginTop: "0.35rem" }}
        />
      </label>

      <label style={{ display: "block", marginBottom: "1rem" }}>
        {labels.committeesNameLabel}
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          style={{ display: "block", width: "100%", marginTop: "0.35rem" }}
        />
      </label>

      <label style={{ display: "block", marginBottom: "1rem" }}>
        {labels.committeesDescriptionLabel}
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          style={{ display: "block", width: "100%", marginTop: "0.35rem" }}
        />
      </label>

      {type === "DOMAIN" && (
        <>
          <label style={{ display: "block", marginBottom: "1rem" }}>
            {labels.committeesJurisdictionLabel}
            <select
              value={jurisdictionCode}
              onChange={(e) => setJurisdictionCode(e.target.value)}
              style={{ display: "block", width: "100%", marginTop: "0.35rem" }}
            >
              {GOVERNANCE_JURISDICTIONS.map((j) => (
                <option key={j.code} value={j.code}>
                  {j.code} — {j.label.en}
                </option>
              ))}
            </select>
          </label>
          <label style={{ display: "block", marginBottom: "1rem" }}>
            {labels.committeesExpertDomainLabel}
            <select
              value={expertDomainKey}
              onChange={(e) => setExpertDomainKey(e.target.value)}
              style={{ display: "block", width: "100%", marginTop: "0.35rem" }}
            >
              {GOVERNANCE_EXPERT_DOMAINS.map((d) => (
                <option key={d.key} value={d.key}>
                  {d.key} — {d.label.en}
                </option>
              ))}
            </select>
          </label>
        </>
      )}

      {type === "MODULE" && (
        <label style={{ display: "block", marginBottom: "1rem" }}>
          {labels.committeesModuleLabel}
          <select
            value={moduleId}
            onChange={(e) => setModuleId(e.target.value)}
            required
            style={{ display: "block", width: "100%", marginTop: "0.35rem" }}
          >
            {modules.map((mod) => (
              <option key={mod.id} value={mod.id}>
                {mod.slug} — {mod.name}
              </option>
            ))}
          </select>
        </label>
      )}

      <button type="submit" className="btn btn-primary btn-sm" disabled={status === "saving"}>
        {labels.committeesSubmitCreate}
      </button>
      {status === "error" && (
        <p style={{ color: "var(--danger)", marginTop: "0.75rem" }}>{labels.committeesErrorGeneric}</p>
      )}
    </form>
  );
}
