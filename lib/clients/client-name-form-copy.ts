export type ClientNameFormKind = "person" | "organization";

/** Used on edit: if a company is already set, assume org-style labels by default. */
export function initialClientNameFormKind(company: string | null | undefined): ClientNameFormKind {
  return company?.trim() ? "organization" : "person";
}

export function clientNameFormCopy(kind: ClientNameFormKind) {
  const isPerson = kind === "person";
  return {
    kindLegend: "This client is mainly",
    kindPersonLabel: "A person or sole contact",
    kindOrgLabel: "A company or team",
    nameLabel: isPerson ? "Contact name" : "Organization name",
    nameHelper:
      "This is how the client appears in your workspace, lists, and on client-facing documents you send from Craftly.",
    namePlaceholder: isPerson ? "e.g. Jane Doe" : "e.g. Acme Design Ltd",
    nameAutocomplete: isPerson ? "name" : "organization",
    companyLabel: isPerson
      ? "Company they work for (optional)"
      : "Legal or alternate name (optional)",
    companyHelper: isPerson
      ? "Their employer or team name, if different from the display name above."
      : "Trading name, parent company, or a second line if it differs from the name above.",
  };
}
