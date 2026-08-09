# Testes de trial e controle de acesso — Apex

## Objetivo

Garantir que um checkout iniciado e ainda pendente não bloqueie um trial válido.

O cenário principal simula:

1. profissional entra com um trial ativo;
2. checkout Pix é iniciado;
3. o provedor retorna pagamento pendente;
4. a conta continua acessível e informa que o trial permanece válido.

## Testes publicados

- `cypress/e2e/trial-access.cy.ts`: regressão E2E com APIs simuladas;
- `src/lib/trial-status.test.ts`: regras de cálculo do trial;
- `src/lib/trial-status.ts`: implementação auxiliar independente.

Nenhum QR Code real, cobrança ou conta de cliente é usado.
