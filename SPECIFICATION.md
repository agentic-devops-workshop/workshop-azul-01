<!-- markdownlint-disable MD013 MD025 MD026 MD028 MD029 MD034 MD040 MD051 MD056 MD060 -->

# Especificação — SIFAP 2.0 Ciclo de Pagamentos Mensal

> **Versão:** 1.0  
> **Data:** 2026-05-20  
> **Autores:** Par 1 (Requirements Engineer) + Par 2 (Software Architect)  
> **Status:** Draft — Aguardando validação em H2

---

## Objetivo da Feature

Permitir que **operadores autorizados** gerem um **ciclo mensal de pagamento** para beneficiários ativos, com rastreabilidade total contra o sistema legado SIFAP.

---

## Requisitos (EARS Format)

### REQ-PAY-001: Gerar Ciclo Mensal de Pagamento

**Given** um operador autenticado com perfil OPERATOR  
**And** existe um conjunto de beneficiários com `status = ACTIVE`  
**And** o mês/ano é definido (ex: maio/2026)  

**When** o operador aciona "Gerar Ciclo de Pagamento" na interface  

**Then** o sistema deve:
1. Validar que nenhum ciclo para esse mês/ano já existe
2. Recuperar todos os beneficiários com status ACTIVE
3. Calcular valor de pagamento para cada beneficiário (regra legada CALCDSCT.NSN)
4. Criar um registro de ciclo em `payment_cycle` com status `DRAFT`
5. Registrar auditoria em `audit_log`

**Acceptance Criteria:**
- [ ] Ciclo criado com status DRAFT
- [ ] 100% dos beneficiários ACTIVE incluídos
- [ ] Mensagem de sucesso exibida
- [ ] Auditoria registrada com `action=GENERATE_CYCLE, user=operator1, timestamp=now()`

**Source Legacy:** `BATCHPGT.NSN` (programa que gera batch mensal de pagamentos)

---

### REQ-PAY-002: Validar Duplicação de Ciclo

**Given** um operador tenta gerar um ciclo para maio/2026  
**And** já existe um ciclo para maio/2026 com status DRAFT ou PUBLISHED  

**When** o operador submete a ação  

**Then** o sistema deve:
1. Rejeitar a operação
2. Exibir mensagem: "Ciclo para maio/2026 já existe com status DRAFT"
3. Sugerir: "Revise o ciclo existente ou crie para junho/2026"
4. Não criar duplicate

**Source Legacy:** Validação implícita em BATCHPGT.NSN (evita rodadas duplicadas)

---

### REQ-PAY-003: Cálculo de Valor por Beneficiário

**Given** um beneficiário com:
- `base_amount = 1000.00`
- `discount_rate = 0.05` (5% desconto por bom comportamento)
- `tax_status = TAX_EXEMPT`

**When** o sistema calcula o valor para o ciclo  

**Then** o valor deve ser:
```
valor_final = base_amount * (1 - discount_rate)
            = 1000.00 * 0.95
            = 950.00
```

**Acceptance Criteria:**
- [ ] Desconto aplicado corretamente
- [ ] Isenção fiscal respeitada (nenhum imposto cobrado)
- [ ] Logaritmo de cálculo armazenado em `payment_calculation_log`

**Source Legacy:** `CALCDSCT.NSN` (cálculo de desconto) + `CALCICMS.NSN` (cálculo de ICMS/impostos)

---

### REQ-PAY-004: Auditoria Completa de Ciclo

**Given** um ciclo de pagamento foi criado ou modificado  

**When** o operador ou sistema executa uma ação (GENERATE, PUBLISH, CANCEL)  

**Then** o sistema deve registrar em `audit_log`:
- `payment_cycle_id` (chave estrangeira)
- `action` (GENERATE_CYCLE | PUBLISH | CANCEL | RECALCULATE)
- `user_id` (quem fez)
- `timestamp` (quando)
- `old_state` (JSON do estado anterior, se aplicável)
- `new_state` (JSON do estado novo)
- `ip_address` (para rastreabilidade de acesso)

**Acceptance Criteria:**
- [ ] Toda mudança deixa auditoria
- [ ] Impossível deletar histórico (append-only)
- [ ] Relatório de auditoria acessível por usuário AUDITOR

**Source Legacy:** Tabela `AUDIT_LOG_LEGACY` em Adabas (equivalente direto)

---

## Casos de Uso (Fluxo Principal)

### UC-001: Operador Gera Ciclo Mensal

```
Ator: Operador (perfil OPERATOR)
Pré-condição: 
  - Operador autenticado
  - Não existe ciclo para maio/2026
  - Pelo menos 1 beneficiário com status ACTIVE

Fluxo Principal:
1. Operador navega a "Ciclos de Pagamento" → "Novo Ciclo"
2. Seleciona mês/ano (maio/2026)
3. Clica "Gerar Ciclo"
4. Sistema validar duplicação
5. Sistema recupera beneficiários ACTIVE
6. Sistema calcula valores
7. Sistema cria ciclo com status DRAFT
8. Sistema exibe: "Ciclo de maio/2026 criado. 1.234 beneficiários incluídos."
9. Operador vê ciclo na listagem

Fluxo Alternativo (A1 — Duplicação):
6a. Sistema detecta ciclo para maio/2026 já existe
6b. Sistema exibe erro: "Ciclo já existe"
6c. Operador cancela ou revisa ciclo existente

Pós-condição:
  - Ciclo em status DRAFT ou erro reportado
  - Auditoria registrada
```

---

## Dados e Schema

### Tabela: `payment_cycle`

```sql
CREATE TABLE payment_cycle (
  id BIGINT PRIMARY KEY,
  month_year DATE NOT NULL UNIQUE,
  status VARCHAR(20) NOT NULL CHECK(status IN ('DRAFT', 'PUBLISHED', 'PROCESSING', 'COMPLETED', 'CANCELLED')),
  total_beneficiaries INT NOT NULL,
  total_amount NUMERIC(15,2) NOT NULL,
  created_by VARCHAR(50) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_by VARCHAR(50),
  updated_at TIMESTAMP,
  published_at TIMESTAMP,
  notes TEXT
);

CREATE INDEX idx_payment_cycle_month_year ON payment_cycle(month_year);
CREATE INDEX idx_payment_cycle_status ON payment_cycle(status);
```

### Tabela: `payment_cycle_line` (beneficiário x ciclo)

```sql
CREATE TABLE payment_cycle_line (
  id BIGINT PRIMARY KEY,
  payment_cycle_id BIGINT NOT NULL REFERENCES payment_cycle(id) ON DELETE CASCADE,
  beneficiary_id BIGINT NOT NULL REFERENCES beneficiary(id),
  base_amount NUMERIC(15,2) NOT NULL,
  discount_rate NUMERIC(5,2),
  final_amount NUMERIC(15,2) NOT NULL,
  status VARCHAR(20) NOT NULL CHECK(status IN ('PENDING', 'APPROVED', 'REJECTED', 'PAID')),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  
  UNIQUE(payment_cycle_id, beneficiary_id)
);

CREATE INDEX idx_payment_cycle_line_cycle ON payment_cycle_line(payment_cycle_id);
CREATE INDEX idx_payment_cycle_line_beneficiary ON payment_cycle_line(beneficiary_id);
```

---

## Requisitos Não-Funcionais

| RNF | Descrição |
|-----|-----------|
| RNF-001 | Geração de ciclo com ≥5.000 beneficiários deve completar em < 30 segundos |
| RNF-002 | Cálculos devem ser auditáveis (cada cálculo rastreável até a regra legada) |
| RNF-003 | Nenhum beneficiário pode ser duplicado em um ciclo |
| RNF-004 | API deve retornar erro 409 (Conflict) se ciclo duplicado |
| RNF-005 | Suportar rollback de ciclo até status DRAFT (não publicado) |

---

## Riscos & Mitigações

| Risco | Severidade | Mitigação |
|-------|-----------|-----------|
| Problema legado: `BATCHPGT.NSN` costumava falhar silenciosamente em dados ruins | Alta | Adicionar validação de dados antes do cálculo; registrar falhas em `failed_calculations_log` |
| Performance: calcular ≥5k beneficiários pode travar a UI | Média | Implementar cálculo assíncrono com progress bar; usar job queue (ex: Spring Batch) |
| Auditoria incompleta: perder rastreabilidade de cálculos | Alta | Obrigatório logging de cada cálculo em `payment_calculation_log` |
| Operador gera ciclo duplicado por erro | Baixa | Validação única em `month_year`; mensagem clara de erro |

---

## Dependências

| Persona | Artefato Necessário | Entrega |
|---------|-------------------|---------|
| **Software Architect** | ADR: "Como estruturar cálculos de pagamento para auditabilidade?" | T-XXX |
| **DBA** | Schema + migrações Flyway | V2__payment_cycle_tables.sql |
| **QA Engineer** | Cenários BDD para ciclo | payment-cycle.feature |
| **DevOps** | GitHub Action para job assíncrono (opcional) | workflow-async-cycle.yml |

---

## Links & Referências

- **Programa legado BATCHPGT.NSN:** [`legacy/natural-programs/BATCHPGT.NSN`](legacy/natural-programs/BATCHPGT.NSN)
- **Programa legado CALCDSCT.NSN:** [`legacy/natural-programs/CALCDSCT.NSN`](legacy/natural-programs/CALCDSCT.NSN)
- **ADR de estrutura:** (será criada em S2)
- **Exemplo implementado:** [`08-exemplos/PaymentService-exemplo.java`](08-exemplos/PaymentService-exemplo.java)

---

## Próximas Etapas

1. **Estágio 2 (Spec Moderna):** Validar com PO e SA
2. **Estágio 3 (Implementação):** Implementar REQ-PAY-001 a 004
3. **Estágio 4 (Evolução):** Otimizar performance; adicionar relatórios

---

**Status:** Aguardando validação em Passagem H1 (fim do Estágio 1)

