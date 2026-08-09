import { describe, expect, it } from "vitest";
import { getActiveTrialStatus } from "./trial-status";

const now = new Date("2026-08-05T12:00:00.000Z");

describe("getActiveTrialStatus", () => {
  it("identifica um trial e calcula os dias restantes", () => {
    expect(
      getActiveTrialStatus(
        {
          subscription_status: "trialing",
          trial_end: "2026-08-07T12:00:00.000Z",
          is_complimentary: false,
          current_period_end: "2026-08-07T12:00:00.000Z",
        },
        now,
      ),
    ).toMatchObject({ active: true, daysRemaining: 2 });
  });

  it("mantém um trial cortesia ativo após cancelamento do provedor", () => {
    expect(
      getActiveTrialStatus(
        {
          subscription_status: "canceled",
          trial_end: "2026-08-06T12:00:00.000Z",
          is_complimentary: true,
          current_period_end: "2026-08-06T12:00:00.000Z",
          status: "active",
        },
        now,
      ),
    ).toMatchObject({ active: true, daysRemaining: 1 });
  });

  it("bloqueia trial suspenso ou expirado", () => {
    expect(
      getActiveTrialStatus(
        {
          subscription_status: "blocked",
          trial_end: "2026-08-20T12:00:00.000Z",
          is_complimentary: true,
          current_period_end: "2026-08-20T00:00:00.000Z",
        },
        now,
      ).active,
    ).toBe(false);

    expect(
      getActiveTrialStatus(
        {
          subscription_status: "trialing",
          trial_end: "2026-08-04T12:00:00.000Z",
          is_complimentary: true,
          current_period_end: "2026-08-04T12:00:00.000Z",
        },
        now,
      ).active,
    ).toBe(false);
  });
});
