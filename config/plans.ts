export type PlanTier = "free" | "starter" | "pro" | "agency";

export interface PlanConfig {
  id: PlanTier;
  name: string;
  monthlyPrice: number;
  annualPrice: number;
  description: string;
  features: string[];
  limits: {
    clients: number | "unlimited";
    docsPerMonth: number | "unlimited";
    aiActionsPerMonth: number | "unlimited";
    teamMembers: number | "unlimited";
  };
}

export const PLANS: Record<PlanTier, PlanConfig> = {
  free: {
    id: "free",
    name: "Free",
    monthlyPrice: 0,
    annualPrice: 0,
    description: "Get started at no cost",
    features: [
      "3 clients",
      "5 documents/month",
      "2 templates",
      "20 AI actions/month",
      "Router + Document Writer agents",
    ],
    limits: {
      clients: 3,
      docsPerMonth: 5,
      aiActionsPerMonth: 20,
      teamMembers: 1,
    },
  },
  starter: {
    id: "starter",
    name: "Starter",
    monthlyPrice: 19,
    annualPrice: 15,
    description: "For growing freelancers",
    features: [
      "15 clients",
      "Unlimited documents",
      "All templates",
      "100 AI actions/month",
      "Agents 1–4 (incl. Project Intelligence)",
    ],
    limits: {
      clients: 15,
      docsPerMonth: "unlimited",
      aiActionsPerMonth: 100,
      teamMembers: 1,
    },
  },
  pro: {
    id: "pro",
    name: "Pro",
    monthlyPrice: 49,
    annualPrice: 39,
    description: "Unlimited power for serious freelancers",
    features: [
      "Unlimited clients",
      "Unlimited documents",
      "All agents (incl. Pricing Advisor + Strategist)",
      "Unlimited AI actions",
      "Custom portal domain",
      "API access",
    ],
    limits: {
      clients: "unlimited",
      docsPerMonth: "unlimited",
      aiActionsPerMonth: "unlimited",
      teamMembers: 1,
    },
  },
  agency: {
    id: "agency",
    name: "Agency",
    monthlyPrice: 99,
    annualPrice: 79,
    description: "For teams and agencies",
    features: [
      "Everything in Pro",
      "5 team members",
      "Shared workspace",
      "White-label client portal",
    ],
    limits: {
      clients: "unlimited",
      docsPerMonth: "unlimited",
      aiActionsPerMonth: "unlimited",
      teamMembers: 5,
    },
  },
};

export const PLAN_ORDER: PlanTier[] = ["free", "starter", "pro", "agency"];

export function isPlanAtLeast(userPlan: PlanTier, required: PlanTier): boolean {
  return PLAN_ORDER.indexOf(userPlan) >= PLAN_ORDER.indexOf(required);
}
