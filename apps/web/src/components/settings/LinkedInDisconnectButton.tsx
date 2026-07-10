"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function LinkedInDisconnectButton({
  label,
  confirmLabel,
  errorLabel,
}: {
  label: string;
  confirmLabel: string;
  errorLabel: string;
}) {
  const router = useRouter();
  const [error, setError] = useState("");

  async function handleDisconnect() {
    if (!window.confirm(confirmLabel)) return;
    setError("");
    const res = await fetch("/api/user/professional-profile", {
      method: "DELETE",
      credentials: "same-origin",
    });
    if (res.ok) {
      router.refresh();
      return;
    }
    setError(errorLabel);
  }

  return (
    <div>
      <button type="button" className="btn btn-primary btn-sm" onClick={handleDisconnect}>
        {label}
      </button>
      {error && (
        <p className="form-error" style={{ marginTop: "0.5rem" }} role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
