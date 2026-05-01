import type { UserPlan } from "@/constants/luts";

export const PLAN_LABELS: Record<UserPlan, string> = {
  free: "Gratuit",
  pro: "Pro",
  studio: "Studio",
};

export const PLAN_COLORS: Record<UserPlan, string> = {
  free: "#6B7280",
  pro: "#4DC8E8",
  studio: "#7C3AED",
};

export const SUPPORT_FREE_LIMIT = 5;
export const SUPPORT_PRO_LIMIT = 50;

export function supportMessageLimit(plan: UserPlan | undefined): number {
  if (plan === "studio") return Infinity;
  if (plan === "pro") return SUPPORT_PRO_LIMIT;
  return SUPPORT_FREE_LIMIT;
}

export function isUnlimited(plan: UserPlan | undefined): boolean {
  return plan === "studio";
}
