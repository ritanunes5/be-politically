
User asks if Phase 2 is complete. This is a status question, not an implementation request — no plan needed, just a direct answer.

Phase 2 status check:
- ✅ Edge functions created: create-checkout, customer-portal, check-subscription, stripe-webhook
- ✅ Secrets present: STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET
- ❌ Missing secrets: STRIPE_PRICE_MONTHLY, STRIPE_PRICE_YEARLY, SITE_URL
- ❌ No Stripe products created yet (user said they would create the account and products)
- ❌ Webhook endpoint not yet registered in Stripe dashboard
- ❌ No UI yet (/pricing page, upgrade buttons) — but that's Phase 5

So backend code is done, but Phase 2 isn't operational until the user completes their side: create Stripe products, paste price IDs, register webhook endpoint, set SITE_URL.

## Status da Fase 2

**Código backend: pronto ✅**
- 4 edge functions implementadas e seguras (erros sanitizados, redirect protegido)
- Secrets `STRIPE_SECRET_KEY` e `STRIPE_WEBHOOK_SECRET` já configurados

**Falta do teu lado para ficar operacional ❌**

1. **Criar produtos no Stripe Dashboard**
   - Premium Mensal — 4,99€/mês → copiar `price_id` (formato `price_...`)
   - Premium Anual — 49,99€/ano → copiar `price_id`

2. **Adicionar 3 secrets no Supabase**
   - `STRIPE_PRICE_MONTHLY` = price_id mensal
   - `STRIPE_PRICE_YEARLY` = price_id anual
   - `SITE_URL` = `https://be-politically.lovable.app`

3. **Registar webhook no Stripe**
   - Endpoint: `https://vbwodbgrfxhsdlclodrp.supabase.co/functions/v1/stripe-webhook`
   - Eventos: `checkout.session.completed`, `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`
   - Confirmar que o `STRIPE_WEBHOOK_SECRET` corresponde ao deste endpoint

**Resposta curta:** o código está completo, mas a Fase 2 só fica funcional quando criares os produtos, adicionares os 3 secrets e registares o webhook. Depois disso, podemos testar end-to-end e avançar para a Fase 3 (UI de upgrade, limites, gates).
