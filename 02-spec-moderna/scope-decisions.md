<!-- markdownlint-disable MD013 MD025 MD026 MD028 MD029 MD034 MD040 MD051 MD060 -->

# Decisões de Escopo — SIFAP 2.0

![ESTÁGIO 02 Spec](https://img.shields.io/badge/ESTÁGIO-02%20Spec-00A4EF?style=for-the-badge) ![TIPO Worksheet](https://img.shields.io/badge/TIPO-Worksheet-1A1A1A?style=for-the-badge) ![PREENCHA Durante S2](https://img.shields.io/badge/PREENCHA-Durante%20S2-737373?style=for-the-badge)

> 🗺 **Você está aqui:** [Kit PT-BR](../README.md) → [Estágio 2](README.md) → **Scope Decisions**

> **Para quem é isto?** Este é um **artefato preenchido pelo time** durante o Estágio 2 (Spec Moderna).
>
> **O que você terá ao final do estágio:**
>
> 1. Este documento preenchido para sua feature
> 2. Rastreabilidade `source_legacy:` para cada REQ-ID
> 3. Sign-off do Product Owner antes da passagem H2
>
> 📘 **Guia passo a passo:** [`GUIDE.md`](GUIDE.md).


> Para cada funcionalidade encontrada no Estágio 1, decida: **Migrar**, **Descartar** ou **Evoluir**.
>
> - **Migrar**: trazer para o SIFAP 2.0 como está (mesma lógica, nova tecnologia)
> - **Descartar**: não trazer — funcionalidade obsoleta ou desnecessária
> - **Evoluir**: trazer E melhorar (nova UX, novo fluxo, nova capacidade)

**Time**: Workshop Azul-01
**Data**: 20/05/2026
**Edição**: 1.0 — Preenchido no Estágio 2
**Par 1 (Product Owner) responsável**: Maria Dantas

## Por que isso importa

O escopo é o que protege o time de chegar às 17h00 com 12 features pela metade. Se o Par 1 não cortar, o Estágio 3 não fecha. **Decisão difícil é tomada aqui, não no Estágio 3.**

## Como decidir

Pergunte de cada funcionalidade:

1. **Afeta o ciclo mensal de pagamento?** Sim → Migrar. Não → considere descartar.
2. **Tem uso documentado nos últimos 12 meses?** Não → descartar.
3. **Faz parte de um relatório regulatório obrigatório (TCU, CGU, BB)?** Sim → Migrar como está.
4. **Tem uma versão moderna mais barata de implementar?** Sim → Evoluir.

---

## Decisões por Funcionalidade

| #   | Funcionalidade            | Decisão   | Justificativa | Regra de Negócio (BR-XXX) | Prioridade |
| --- | ------------------------- | --------- | ------------- | ------------------------- | ---------- |
| 1   | Cadastro de Beneficiários | **Evoluir** | Entidade central do sistema; adicionar máquina de estados explícita e separar status/age_category (resolve MYS-002) | BR-BENEF-001 a 006 | Alta |
| 2   | Consulta de Beneficiários | **Migrar** | Necessária para operação diária; migrar para REST API com paginação | BR-BENEF-003 (busca CPF) | Alta |
| 3   | Registro de Pagamentos (Ciclo Mensal) | **Evoluir** | Core domain; migrar fórmula completa + parametrizar fatores (não hardcoded) + corrigir arredondamento (ADR-002) | BR-PGT-001 a 018 | Alta |
| 4   | Processamento Batch (Geração) | **Evoluir** | Competência como parâmetro explícito (não *DATN); sequencial atômico (não race); idempotente por design | BR-PGT-001, BR-PGT-004 | Alta |
| 5   | Cálculo de Benefícios | **Evoluir** | Unificar CALCBENF + BATCHPGT (mesma fórmula, mesmas regras); incluir fator idade em ambos; usar HALF_EVEN | BR-CALC-001 a 006, BR-PGT-006 a 010 | Alta |
| 6   | Cálculo de Descontos | **Evoluir** | Adotar CALCDSCT como motor oficial (4 faixas); descartar 3% fixo de BATCHPGT (ADR-002) | BR-DSCT-001 a 005 | Alta |
| 7   | Conciliação Bancária CNAB | **Evoluir** | Adicionar status DIVERGENT explícito (resolve MYS-CON-08); parametrizar layout CNAB; tratar todos códigos FEBRABAN | BR-CON-001 a 011 | Alta |
| 8   | Relatórios Consolidados | **Evoluir** | Substituir impressora 66×132 por relatório HTML/PDF; manter totalização por região/status | BR-REL-001 a 005 | Média |
| 9   | Auditoria | **Evoluir** | Tornar ações 'EX' visíveis (resolve BR-DDM-002); adicionar ip_address; append-only com imutabilidade garantida | BR-CON-010, BR-CON-011, BR-DDM-002 | Alta |
| 10  | Gestão de Usuários/Auth | **[GREENFIELD]** | Legado não possui autenticação interna (RACF externo); implementar OAuth2/JWT com Azure AD (ADR-003) | — | Alta |
| 11  | Cadastro de Programas Sociais | **Evoluir** | Adicionar operação de alteração (legado só tem I/C — MYS-008); parametrizar FATOR-K | BR-PROG-001 a 006 | Média |
| 12  | Cadastro de Dependentes | **Evoluir** | Elevar limite de 5 para 10 (real capacidade do DDM); unificar domínio de parentesco (FI/CO/IR/OU) | BR-DEP-001 a 005 | Média |
| 13  | Correção Retroativa IPCA | **Descartar** | Tabela IPCA hardcoded 2010-2014 está completamente defasada; correção retroativa será feature futura com API de índices do IBGE | BR-CORR-001 a 003 | Baixa |
| 14  | Interface Terminal 3270 | **Descartar** | Substituída por frontend Next.js; sem lógica de negócio na camada de apresentação | — | — |
| 15  | Campo HASH-DIGITAL | **Descartar** | Nunca implementado em 20 anos; biometria moderna é responsabilidade de sistema externo | BR-DDM-001 (MYS-003) | — |

---

## Resumo

| Decisão | Quantidade | % |
|---------|-----------|---|
| **Evoluir** | 10 | 67% |
| **Migrar** | 1 | 7% |
| **Descartar** | 3 | 20% |
| **[GREENFIELD]** | 1 | 7% |

**Features no escopo do Estágio 3 (Alta prioridade):** 8  
**Features postergadas (Média/Baixa):** 4  
**Features descartadas:** 3

---

## Sign-off

- [x] **Product Owner (Par 1):** Aprovado — Maria Dantas, 20/05/2026
- [x] **Software Architect (Par 2):** Validado contra bounded contexts — Douglas Cavalcante, 20/05/2026
| 12  |                           |                              |               |                           |                      |

> Adicione linhas para cada funcionalidade identificada no `discovery-report.md` do Estágio 1.

---

## Funcionalidades Novas (não existem no legado)

> Liste funcionalidades que o SIFAP 2.0 deveria ter e que não existem no sistema legado. Cada uma vira REQ-ID com `source_legacy: [GREENFIELD] <justificativa>`.

| #   | Funcionalidade Nova | Justificativa | Prioridade | Complexidade |
| --- | ------------------- | ------------- | ---------- | ------------ |
| N1  |                     |               |            |              |
| N2  |                     |               |            |              |
| N3  |                     |               |            |              |

---

## Resumo de Escopo

| Decisão   | Quantidade | Percentual |
| --------- | ---------- | ---------- |
| Migrar    |            |            |
| Descartar |            |            |
| Evoluir   |            |            |
| **Total** |            | 100%       |

## Riscos de Escopo

> Liste os riscos das decisões tomadas:

| Risco | Probabilidade        | Impacto              | Mitigação |
| ----- | -------------------- | -------------------- | --------- |
|       | Alta / Média / Baixa | Alto / Médio / Baixo |           |

## Aprovação

- [ ] Par 1 (Product Owner) aprovou as decisões de escopo
- [ ] Par 2 (Enterprise Architect) validou a viabilidade técnica
- [ ] Par 3 (Technical Lead) confirmou que cabe nas 3 horas do Estágio 3
- [ ] Time concordou com as prioridades

> **Aprovação obrigatória na Passagem #2** (~16:00). Sem ela, o Estágio 3 não começa.

— Paula


---

### Continuar a leitura

<table width="100%">
<tr>
<td width="50%" valign="top" align="left">
<sub><strong>← ANTERIOR</strong></sub><br/>
<a href="GUIDE.md"><strong>GUIDE do Estágio 2</strong></a><br/>
<sub>Passo a passo do estágio.</sub>
</td>
<td width="50%" valign="top" align="right">
<sub><strong>PRÓXIMO →</strong></sub><br/>
<a href="ADR-TEMPLATE.md"><strong>ADR-TEMPLATE</strong></a><br/>
<sub>Template de ADR.</sub>
</td>
</tr>
</table>

<sub>↑ <a href="../README.md">Voltar ao Kit PT-BR</a></sub>

