export type OooLoginEmailPolicy = {
  email_domains: string[];
  grandfather_emails: string[];
};

function parseList(raw: string | undefined): string[] {
  return (raw ?? "")
    .split(/[,;\s]+/)
    .map((part) => part.trim().toLowerCase())
    .filter(Boolean);
}

export function normalizeOooEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function oooEmailDomain(email: string): string | undefined {
  const norm = normalizeOooEmail(email);
  const at = norm.lastIndexOf("@");
  if (at <= 0 || at === norm.length - 1) return undefined;
  return norm.slice(at + 1);
}

export function getCommunityOooLoginEmailPolicy(): OooLoginEmailPolicy {
  return {
    email_domains: parseList(process.env.OOO_LOGIN_EMAIL_DOMAINS).map((d) =>
      d.replace(/^\./, ""),
    ),
    // Founder migration seat only — first entry wins (max 1).
    grandfather_emails: parseList(process.env.OOO_LOGIN_EMAIL_GRANDFATHER)
      .filter((e) => e.includes("@"))
      .slice(0, 1),
  };
}

export function isOooLoginEmailAllowed(
  email: string,
  policy: OooLoginEmailPolicy = getCommunityOooLoginEmailPolicy(),
): boolean {
  const norm = normalizeOooEmail(email);
  if (!norm.includes("@")) return false;
  if (policy.grandfather_emails.includes(norm)) return true;
  if (policy.email_domains.length === 0) return true;
  const domain = oooEmailDomain(norm);
  if (!domain) return false;
  return policy.email_domains.some(
    (allowed) => domain === allowed || domain.endsWith(`.${allowed}`),
  );
}
