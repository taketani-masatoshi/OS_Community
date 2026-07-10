/** External links — update when official social / store accounts are live. */
export const BRAND_LINKS = {
  store: "https://store.openorgos.org",
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
