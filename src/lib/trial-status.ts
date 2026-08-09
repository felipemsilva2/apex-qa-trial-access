type TrialStatusTenant = {
  subscription_status?: string | null;
  trial_end?: string | null;
  is_complimentary?: boolean | null;
  current_period_end?: string | null;
  status?: string | null;
  subscription_test_blocked?: boolean | null;
};

export interface ActiveTrialStatus {
  active: boolean;
  daysRemaining: number | null;
  trialEnd: Date | null;
}

export function getActiveTrialStatus(
  tenant: TrialStatusTenant | null | undefined,
  now = new Date(),
): ActiveTrialStatus {
  const trialEnd = tenant?.trial_end ? new Date(tenant.trial_end) : null;
  const periodEnd = tenant?.current_period_end ? new Date(tenant.current_period_end) : null;
  const status = String(tenant?.subscription_status || "").toLowerCase();
  const isBlocked =
    ["blocked", "suspended"].includes(status) ||
    ["inactive", "paused", "suspended"].includes(String(tenant?.status || "").toLowerCase()) ||
    tenant?.subscription_test_blocked === true;
  const hasTrialStatus = status === "trialing" || (tenant?.is_complimentary === true && !isBlocked);
  const active = Boolean(
    hasTrialStatus &&
      trialEnd &&
      !Number.isNaN(trialEnd.getTime()) &&
      trialEnd > now &&
      (!periodEnd || Number.isNaN(periodEnd.getTime()) || periodEnd > now),
  );

  return {
    active,
    daysRemaining:
      active && trialEnd
        ? Math.max(0, Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
        : null,
    trialEnd,
  };
}
