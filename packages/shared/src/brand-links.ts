/** External links — update when official social / store accounts are live. */
export const BRAND_LINKS = {
  /** Marketing overview (Vercel). */
  overview: "https://oorgos.org",
  /** Community site (default production origin). */
  community: "https://community.oorgos.org",
  /** Operator Console (docs / health; login entry uses Community SSO start). */
  console: "https://operator.oorgos.org",
  store: "https://store.openorgos.org",
  /** Public inbox shown on the overview site and /about/contact (forwarded via Cloudflare). */
  contactEmail: "hello@oorgos.org",
  /** Software license terms (GPL v2, commercial license, patents, CLA). */
  termsOfService: "https://github.com/taketani-masatoshi/OpenOrgOS/blob/main/TERMS_OF_SERVICE.md",
  social: {
    x: "https://x.com/OpenOrgOS",
    facebook: "https://www.facebook.com/OpenOrgOS",
    youtube: "https://www.youtube.com/@OpenOrgOS",
    linkedin: "https://www.linkedin.com/company/openorgos",
    github: "https://github.com/openorgos",
    instagram: "https://www.instagram.com/openorgos",
  },
} as const;

export type FooterSocialIconId = keyof typeof BRAND_LINKS.social;

export const FOOTER_SOCIAL_LINKS: { id: FooterSocialIconId; label: string }[] = [
  { id: "x", label: "X" },
  { id: "facebook", label: "Facebook" },
  { id: "youtube", label: "YouTube" },
  { id: "linkedin", label: "LinkedIn" },
  { id: "github", label: "GitHub" },
  { id: "instagram", label: "Instagram" },
];
