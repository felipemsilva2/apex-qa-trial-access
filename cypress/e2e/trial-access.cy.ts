describe("Acesso durante o trial", () => {
  it("mantém o trial válido quando existe um checkout Pix pendente", () => {
    const trialEnd = "2099-12-31T00:00:00.000Z";

    cy.intercept("GET", "**/functions/v1/auth-proxy*", {
      statusCode: 200,
      body: { success: false, session: null, error: null },
    });
    cy.intercept("POST", "**/auth/v1/token?grant_type=password", {
      statusCode: 200,
      body: {
        access_token: "eyJhbGciOiJub25lIn0.eyJzdWIiOiJxYS10cmlhbC11c2VyIiwiZXhwIjoyNTMyMzk2MDAwLCJlbWFpbCI6InRyaWFsQGV4YW1wbGUuY29tIn0.",
        refresh_token: "qa-refresh-token",
        expires_in: 3600,
        token_type: "bearer",
        user: {
          id: "qa-trial-user",
          email: "trial@example.com",
          email_confirmed_at: "2099-01-01T00:00:00.000Z",
        },
      },
    }).as("passwordLogin");
    cy.intercept("GET", "**/rest/v1/profiles*", {
      statusCode: 200,
      body: {
        id: "qa-trial-user",
        role: "coach",
        tenant_id: "qa-trial-tenant",
        full_name: "Coach em Trial",
        cpf: "52998224725",
        phone: "11999999999",
        created_at: "2099-01-01T00:00:00.000Z",
        has_seen_tour: true,
      },
    });
    cy.intercept("GET", "**/rest/v1/tenants*", {
      statusCode: 200,
      body: {
        id: "qa-trial-tenant",
        business_name: "Academia Trial",
        subscription_status: "trialing",
        trial_end: trialEnd,
        current_period_end: trialEnd,
        is_complimentary: false,
        subscription_test_blocked: false,
        has_seen_tour: true,
      },
    });
    cy.intercept("GET", "**/rest/v1/subscriptions*", (request) => {
      if (request.url.includes("select=current_period_end")) {
        request.reply({ statusCode: 200, body: { current_period_end: trialEnd } });
        return;
      }

      request.reply({
        statusCode: 200,
        body: {
          id: "qa-pending-subscription",
          status: "pending",
          asaas_id: "qa-pending-payment",
          plan: {
            id: "qa-plan-monthly",
            name: "Plano Pro Mensal",
            plan_tier: "pro",
            price_monthly: 79.9,
            contract_duration_months: 0,
            active: true,
          },
        },
      });
    });
    cy.intercept("GET", "**/rest/v1/billing_plans*", {
      statusCode: 200,
      body: [
        {
          id: "qa-plan-monthly",
          name: "Plano Pro Mensal",
          plan_tier: "pro",
          price_monthly: 79.9,
          price_yearly: 958.8,
          contract_duration_months: 0,
          active: true,
        },
      ],
    });
    cy.intercept("POST", "**/functions/v1/asaas-manager", (request) => {
      const body = request.body as { action?: string };
      if (body.action === "get-pix-qr-code") {
        request.reply({ statusCode: 200, body: { encodedImage: "cXEtaW1hZ2U=", payload: "pix-copy-code" } });
        return;
      }
      if (body.action === "list-payments") {
        request.reply({ statusCode: 200, body: { data: [] } });
        return;
      }
      request.reply({ statusCode: 200, body: { status: "PENDING", confirmed: false } });
    });

    cy.visit("/login");
    cy.get("#login-identifier").type("trial@example.com");
    cy.get("#login-password").type("Apex#2026");
    cy.contains("button", "Entrar no sistema").click();
    cy.wait("@passwordLogin");
    cy.location("pathname", { timeout: 10000 }).should("eq", "/dashboard");
    cy.visit("/dashboard/billing");

    cy.location("pathname").should("eq", "/dashboard/billing");
    cy.get("#mentor-billing-header")
      .should("be.visible")
      .and("contain.text", "Pagamento em confirmação");
    cy.contains("Seu trial atual continua válido enquanto isso.").should("be.visible");
  });
});
