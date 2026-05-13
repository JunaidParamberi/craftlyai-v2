import type { TiptapDoc, TiptapNode } from "@/types";

/**
 * Variable substitution engine for Document Studio.
 * Variables use mustache syntax: `{{client_name}}`, `{{today}}`, etc.
 * Missing keys are left in the output verbatim so the editor never silently drops content.
 */

export type VariableContext = {
  client: {
    name: string | null;
    contact_name: string | null;
    email: string | null;
    company: string | null;
  } | null;
  project: {
    title: string | null;
  } | null;
  brand: {
    business_name: string | null;
    primary_color: string | null;
    email_signature: string | null;
  } | null;
  now: Date;
};

export type VariableDescriptor = {
  key: string;
  label: string;
  group: "Client" | "Project" | "Brand" | "Date";
  resolver: (ctx: VariableContext) => string | null;
};

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "long",
  day: "numeric",
});

export const VARIABLE_CATALOG: readonly VariableDescriptor[] = [
  {
    key: "client_name",
    label: "Client name",
    group: "Client",
    resolver: (ctx) => ctx.client?.name ?? null,
  },
  {
    key: "client_contact_name",
    label: "Client contact",
    group: "Client",
    resolver: (ctx) => ctx.client?.contact_name ?? ctx.client?.name ?? null,
  },
  {
    key: "client_email",
    label: "Client email",
    group: "Client",
    resolver: (ctx) => ctx.client?.email ?? null,
  },
  {
    key: "client_company",
    label: "Client company",
    group: "Client",
    resolver: (ctx) => ctx.client?.company ?? ctx.client?.name ?? null,
  },
  {
    key: "project_title",
    label: "Project title",
    group: "Project",
    resolver: (ctx) => ctx.project?.title ?? null,
  },
  {
    key: "brand_business_name",
    label: "Your business name",
    group: "Brand",
    resolver: (ctx) => ctx.brand?.business_name ?? null,
  },
  {
    key: "brand_signature",
    label: "Email signature",
    group: "Brand",
    resolver: (ctx) => ctx.brand?.email_signature ?? null,
  },
  {
    key: "today",
    label: "Today's date",
    group: "Date",
    resolver: (ctx) => dateFormatter.format(ctx.now),
  },
];

const VARIABLE_KEYS = new Set(VARIABLE_CATALOG.map((v) => v.key));
const MUSTACHE_PATTERN = /\{\{\s*([a-z_]+)\s*\}\}/g;

export function isKnownVariable(key: string): boolean {
  return VARIABLE_KEYS.has(key);
}

export function substituteVariables(
  text: string,
  ctx: VariableContext,
): string {
  return text.replace(MUSTACHE_PATTERN, (match, rawKey: string) => {
    const descriptor = VARIABLE_CATALOG.find((v) => v.key === rawKey);
    if (!descriptor) {
      return match;
    }
    const value = descriptor.resolver(ctx);
    if (value === null || value === undefined || value === "") {
      return match;
    }
    return value;
  });
}

function walkNode(node: TiptapNode, ctx: VariableContext): TiptapNode {
  const next: TiptapNode = { ...node };
  if (typeof node.text === "string") {
    next.text = substituteVariables(node.text, ctx);
  }
  if (Array.isArray(node.content)) {
    next.content = node.content.map((child) => walkNode(child, ctx));
  }
  return next;
}

export function substituteInTiptapDoc(
  doc: TiptapDoc,
  ctx: VariableContext,
): TiptapDoc {
  const cloned: TiptapDoc = { ...doc };
  if (Array.isArray(doc.content)) {
    cloned.content = doc.content.map((child) => walkNode(child, ctx));
  }
  return cloned;
}

export function emptyVariableContext(): VariableContext {
  return {
    client: null,
    project: null,
    brand: null,
    now: new Date(),
  };
}
