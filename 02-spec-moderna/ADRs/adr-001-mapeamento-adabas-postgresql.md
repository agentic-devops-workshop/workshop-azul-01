# ADR-001: Estratégia de Mapeamento Adabas-para-PostgreSQL/JPA

- **Status:** Accepted
- **Date:** 2026-05-20
- **Deciders:** Par 2 (Enterprise Architect + Software Architect)
- **Related Requirements:** REQ-004, REQ-006, REQ-007, REQ-009, REQ-012

---

## Context

O sistema legado SIFAP usa 4 DDMs Adabas com estruturas que não mapeiam diretamente para SQL relacional:

1. **Campos MU (Multiple-Value):** Não existem nos DDMs do SIFAP analisados.
2. **PE (Periodic Groups):** `GRP-DEPENDENTE` em BENEFICIARIO (ARQ 150) com até 10 ocorrências por titular, contendo 5 campos por ocorrência (nome, CPF, parentesco, dt-nascimento, sexo).
3. **Super-descriptors:** Chaves compostas implícitas (CPF + COMPETENCIA em PAGAMENTO).
4. **Divergência de tipos:** COD-PROGRAMA é N4 no código Natural mas A4 no DDM (BR-PROG-001).
5. **Campo dual:** Status 'S' com semântica idoso (programa) vs. suspenso (DDM) (MYS-002).

A equipe precisa decidir como representar essas estruturas em PostgreSQL 16 + JPA/Hibernate.

---

## Options Considered

### Option 1: PE Groups como `@OneToMany` com Entidade Separada

**Description:** Cada PE group vira uma tabela filha com FK para a tabela pai. `GRP-DEPENDENTE` vira tabela `dependents` com FK `beneficiary_id`.

**Pros:**
- Modelo relacional canônico — queries SQL padrão, sem parsing especial
- Dependentes tornam-se entidades com ciclo de vida próprio (útil para REQ-005, REQ-006)
- Sem limite artificial de 10 (PE group Adabas limitava; SQL não)
- JPA cascade operations funcionam naturalmente

**Cons:**
- N+1 queries se não usar `@EntityGraph` ou `JOIN FETCH`
- Mais tabelas no schema (complexidade DDL)

**Risk:** Performance em batch se carregar 4.2M beneficiários com dependentes sem paginação.

**Effort:** Same (padrão JPA)

### Option 2: PE Groups como `@ElementCollection` (Embeddable)

**Description:** Dependentes como `@ElementCollection` — tabela auxiliar sem ID próprio, valor puro.

**Pros:**
- Mais próximo da semântica Adabas (PE group = dados embutidos no pai)
- Menos código de mapeamento

**Cons:**
- Sem ID próprio — impossível referenciar um dependente individualmente
- Performance: Hibernate re-escreve toda a collection em qualquer alteração
- Não suporta queries JPA diretas sobre dependentes
- Contradiz REQ-006 que precisa contar/gerenciar dependentes individualmente

**Risk:** Refactoring forçado se requisitos de consulta de dependentes crescerem.

**Effort:** Lower (inicialmente), mas higher se precisar migrar depois.

### Option 3: Campos JSONB para Dados Semi-Estruturados

**Description:** `GRP-DEPENDENTE` armazenado como coluna JSONB na tabela `beneficiaries`.

**Pros:**
- Flexibilidade total de schema
- Boa performance de leitura para o PE group completo
- PostgreSQL 16 tem operadores JSONB maduros

**Cons:**
- Perde integridade referencial (constraints em JSON são complexas)
- Queries de busca por dependente exigem operadores especiais
- Não alinha com a arquitetura JPA/Hibernate do projeto
- Auditoria de mudanças em campos individuais é mais difícil
- Contradiz convenção do projeto (JPA/Hibernate como ORM principal)

**Risk:** Divergência arquitetural — equipe Java terá curva de aprendizado em JSONB.

**Effort:** Same para implementar, higher para manter e auditar.

---

## Decision

**Opção 1: `@OneToMany` com Entidade Separada.**

Cada PE group é normalizado em uma tabela filha com FK. Especificamente:

- `GRP-DEPENDENTE` → tabela `dependents` com `@OneToMany(cascade = ALL, orphanRemoval = true)`
- Super-descriptors → `@Index` compostos nas colunas correspondentes
- COD-PROGRAMA → coluna `VARCHAR(4)` (resolvendo divergência N4/A4 em favor do DDM)
- Status → campo `status` (enum: ACTIVE, SUSPENDED, CANCELLED, DETACHED, INACTIVE) + campo separado `age_category` (enum: STANDARD, ELDERLY) para resolver MYS-002

---

## Consequences

### Positive
- Modelo relacional limpo, auditável campo a campo
- Dependentes consultáveis individualmente (suporta REQ-005, REQ-006)
- Performance controlável via `@EntityGraph` e paginação
- Alinhado com stack do projeto (JPA/Hibernate)
- Separação status/age_category resolve 29 anos de ambiguidade

### Negative
- Mais tabelas que o schema Adabas original (normalização)
- Migração de dados exige ETL para explodir PE groups em registros filhos
- Limite de 10 dependentes vira regra de negócio (não mais limitação física)

### Risks
- ETL de 4.2M beneficiários com até 10 dependentes cada = até 42M registros em `dependents`
- Deve ser testado com volume real em Testcontainers antes do go-live
