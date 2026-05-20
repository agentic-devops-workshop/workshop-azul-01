# ADR-002: Unificação do Motor de Descontos e Arredondamento Monetário

- **Status:** Accepted
- **Date:** 2026-05-20
- **Deciders:** Par 2 (Enterprise Architect + Software Architect) + Par 1 (PO)
- **Related Requirements:** REQ-012, REQ-013

---

## Context

O Estágio 1 identificou duas divergências críticas no cálculo financeiro:

### Divergência 1: Dois motores de desconto
- **BATCHPGT** (BR-PGT-014): desconto fixo de 3% quando bruto > R$ 500
- **CALCDSCT** (BR-DSCT-001): desconto por 4 faixas (3%/5%/7%/9%) + teto de 30% + exceção judicial

Ambos existem no legado. BATCHPGT é executado em produção (batch noturno). CALCDSCT pode ser chamado interativamente ou por outro programa não mapeado.

### Divergência 2: Três regras de arredondamento
- **BATCHPGT** (BR-PGT-011): truncamento puro `(×100)/100` — perde centavos
- **BATCHREL** (BR-REL-003): arredondamento bancário `+0,005` + truncamento
- **BATCHCON** (BR-CON-005): tolerância de R$ 0,01 na comparação

Impacto estimado: ~R$ 900k/ano em centavos perdidos por truncamento (MYS-005).

---

## Options Considered

### Option 1: CALCDSCT como Motor Oficial + Arredondamento Bancário (Half-Even)

**Description:** Adotar as 4 faixas de CALCDSCT como regra única de desconto. Adotar arredondamento bancário (half-even/banker's rounding) como estratégia única para todos os valores monetários.

**Pros:**
- Motor mais completo (4 faixas + teto + exceção judicial vs. 3% fixo)
- Arredondamento bancário é padrão do setor financeiro brasileiro (BACEN)
- Elimina perda acumulada de centavos
- Uma única regra testável — simplicidade operacional
- `BigDecimal.ROUND_HALF_EVEN` nativo em Java

**Cons:**
- Valores de pagamento gerados pelo sistema moderno divergirão dos históricos do legado
- Necessário período de comparação (dual-run) para validar equivalência
- BATCHPGT atual em produção usa regra diferente — transição exige comunicação

**Risk:** TCU/CGU pode questionar mudança nos valores durante período de transição.

**Effort:** Lower (uma implementação vs. duas)

### Option 2: Manter BATCHPGT (3% fixo) + Truncamento

**Description:** Manter exatamente o comportamento de BATCHPGT — 3% fixo e truncamento — para garantir parity bit-a-bit com legado.

**Pros:**
- Equivalência exata com o batch em produção
- Sem risco de questionamento em auditoria durante migração
- Testes de equivalência triviais (mesma saída)

**Cons:**
- Perde centavos eternamente (~R$ 900k/ano)
- Não aplica descontos progressivos (contribuição social injusta)
- Mantém dívida técnica do legado
- CALCDSCT vira código morto no sistema moderno

**Risk:** Continua com prejuízo financeiro e potencial questionamento futuro sobre por que não corrigiu.

**Effort:** Lower (cópia do legado)

### Option 3: Manter Ambos (Configurável por Programa)

**Description:** Implementar ambos os motores e permitir que cada programa social escolha qual usar via configuração.

**Pros:**
- Flexibilidade máxima
- Programas existentes mantêm comportamento; novos podem usar motor evoluído

**Cons:**
- Complexidade duplicada — dois caminhos de código para testar
- Confusão operacional (qual motor está ativo para qual programa?)
- Não resolve a questão fundamental (qual é o correto?)
- Auditoria e relatórios precisam saber qual motor foi usado por pagamento

**Risk:** Decisão adiada vira débito permanente. Complexidade desnecessária.

**Effort:** Higher (implementar e manter dois motores)

---

## Decision

**Opção 1: CALCDSCT como Motor Oficial + Arredondamento Bancário (Half-Even).**

Justificativa:
1. CALCDSCT é mais completo e justo (progressividade)
2. Arredondamento half-even é padrão BACEN
3. Elimina perda financeira acumulada
4. Simplifica implementação e testes

### Estratégia de Transição (Strangler Fig)
1. **Fase 1 (Dual-run):** Sistema moderno calcula com novo motor; compara com resultado do legado; loga divergências sem alterar pagamentos reais
2. **Fase 2 (Shadow):** Sistema moderno gera pagamentos reais; legado roda em paralelo para validação
3. **Fase 3 (Cutover):** Legado desligado após 3 meses de equivalência aceitável

### Implementação Técnica
- Tipo monetário: `BigDecimal` com `scale=2` e `RoundingMode.HALF_EVEN`
- Classe: `DiscountCalculationService` com interface `DiscountEngine`
- Tabela de faixas: entidade JPA `discount_tiers` (não hardcoded)
- Coluna PostgreSQL: `NUMERIC(15,2)` para todos os valores monetários

---

## Consequences

### Positive
- Sistema financeiramente correto desde o início
- Uma única regra de arredondamento em toda a aplicação
- Faixas de desconto configuráveis (futuras alterações não exigem code change)
- Auditoria simplificada (um motor, um resultado)

### Negative
- Valores do sistema moderno diferem dos históricos legado (necessário campo `calculation_engine_version`)
- Período de dual-run consome recurso de desenvolvimento
- Comunicação necessária com áreas de conformidade sobre a mudança

### Risks
- Se TCU questionar, apresentar como "correção de erro do sistema legado" com evidência do MYS-005
- Documentar a aprovação da decisão pelo PO/gestor do programa
