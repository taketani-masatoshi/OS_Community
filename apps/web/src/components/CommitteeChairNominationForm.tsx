"use client";

import { useState } from "react";

type MemberOption = {
  userId: string;
  label: string;
};

export function CommitteeChairNominationForm({
  committeeSlug,
  members,
  labels,
}: {
  committeeSlug: string;
  members: MemberOption[];
  labels: {
    title: string;
    desc: string;
    candidate: string;
    statement: string;
    submit: string;
    success: string;
    error: string;
  };
}) {
  const [candidateUserId, setCandidateUserId] = useState(members[0]?.userId ?? "");
  const [statement, setStatement] = useState("");
  const [status, setStatus] = useState<"idle" | "saved" | "error">("idle");

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setStatus("idle");
    const response = await fetch(`/api/committees/${committeeSlug}/chair-nominations`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ candidateUserId, statement }),
    });
    if (!response.ok) {
      setStatus("error");
      return;
    }
    setStatus("saved");
    setStatement("");
  }

  if (members.length === 0) return null;

  return (
    <form className="lf-card" onSubmit={handleSubmit}>
      <h3 className="section-title-sm">{labels.title}</h3>
      <p className="page-muted-note">{labels.desc}</p>
      <label className="form-label">
        {labels.candidate}
        <select
          className="form-input"
          value={candidateUserId}
          onChange={(event) => setCandidateUserId(event.target.value)}
        >
          {members.map((member) => (
            <option key={member.userId} value={member.userId}>
              {member.label}
            </option>
          ))}
        </select>
      </label>
      <label className="form-label">
        {labels.statement}
        <textarea
          className="form-input"
          rows={3}
          value={statement}
          onChange={(event) => setStatement(event.target.value)}
        />
      </label>
      <button type="submit" className="btn btn-primary btn-sm">
        {labels.submit}
      </button>
      {status === "saved" && <p className="form-success">{labels.success}</p>}
      {status === "error" && (
        <p className="form-error" role="alert">
          {labels.error}
        </p>
      )}
    </form>
  );
}
