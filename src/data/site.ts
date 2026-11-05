import preview from "../assets/lilienblum42.jpg";

/**
 * The site the "create a site" flow produces. Everything here comes from a real run of the Wix
 * app in ChatGPT on 2026-11-05 (headless build): the name, the free address and the preview crop.
 */
export const SITE = {
  name: "Lilienblum 42",
  tagline: "Beer & Billiards",
  /** The free address a headless Wix site gets. Long on purpose: this is the real shape. */
  freeUrl: "headless-ftujnvnmyqe-adamdi1-1407.wix-site-host.com",
  dashboardUrl: "https://manage.wix.com/dashboard/66209f0d-7e05-48b8-b2a5-2a30847c3b2a",
  preview,
};

export type DomainStatus = "AVAILABLE" | "PREMIUM" | "REGISTERED";

/** Suggestions as GetSuggestedDomains + CheckDomainAvailability would return them. */
export const DOMAIN_SUGGESTIONS: Array<{ domain: string; status: DomainStatus }> = [
  { domain: "lilienblum42.com", status: "AVAILABLE" },
  { domain: "lilienblum42.bar", status: "AVAILABLE" },
  { domain: "lilienblumbeer.com", status: "AVAILABLE" },
  { domain: "lilienblum42.co.il", status: "AVAILABLE" },
  { domain: "lilienblum.com", status: "REGISTERED" },
  { domain: "lilienblum.bar", status: "PREMIUM" },
];

export const BEST_DOMAIN = DOMAIN_SUGGESTIONS[0].domain;

/** Scripted availability check for names the user types. */
export function domainStatus(raw: string): { domain: string; status: DomainStatus } {
  let d = raw
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/\/.*$/, "")
    .replace(/\s+/g, "");
  if (!d.includes(".")) d += ".com";
  const known = DOMAIN_SUGGESTIONS.find((s) => s.domain === d);
  if (known) return known;
  return { domain: d, status: /42|billiard|beer|bar|tap/.test(d) ? "AVAILABLE" : "REGISTERED" };
}
