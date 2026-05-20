<!-- markdownlint-disable MD013 MD025 MD026 MD028 MD029 MD034 MD040 MD051 MD060 -->

# Relatório de Descoberta — Estágio 1: Arqueologia Digital

![ESTÁGIO 01 Arqueologia](https://img.shields.io/badge/ESTÁGIO-01%20Arqueologia-F25022?style=for-the-badge) ![TIPO Worksheet](https://img.shields.io/badge/TIPO-Worksheet-1A1A1A?style=for-the-badge) ![PREENCHA Durante S1](https://img.shields.io/badge/PREENCHA-Durante%20S1-737373?style=for-the-badge)

> 🗺 **Você está aqui:** [Kit PT-BR](../README.md) → [Estágio 1](README.md) → **discovery-report**

> **Para quem é isto?** Este é um **artefato preenchido pelo time** durante o Estágio 1 (Arqueologia).
>
> **O que você terá ao final do estágio:**
>
> 1. Este documento totalmente preenchido com os dados reais do legado SIFAP
> 2. Rastreabilidade para `01-arqueologia/legado-sifap/` (programas `.NSN` e DDMs)
> 3. Base de evidência usada nas EARS do Estágio 2 (`source_legacy:`)
>
> 📘 **Guia passo a passo:** [`GUIDE.md`](GUIDE.md).


> Este documento consolida todas as descobertas do Estágio 1.
> Preencha cada seção com as conclusões do time. **Este é o input principal do Estágio 2** — sem ele, a especificação vira chute.

**Time**: Workshop Azul-01 — Par 1 (Visão)
**Data**: 20/05/2026
**Edição**: 1.0 — Estágio 1 completo
**Participantes**: Product Owner (PO) + Requirements Engineer (RE)

---

## 1. Sumário Executivo

O SIFAP (Sistema de Fiscalização e Administração de Pagamentos) é um sistema de gestão de benefícios sociais desenvolvido em Natural/Adabas a partir de 1997, com aproximadamente 4,2 milhões de beneficiários cadastrados na base BENEFICIARIO (ARQ 150). O sistema controla o ciclo completo de programas sociais: cadastro de beneficiários, dependentes e programas, além de processamento em lote de pagamentos e geração de relatórios. O código é funcional mas contém regras de negócio críticas embutidas sem documentação — especialmente a constante 0.347215 no cálculo do FATOR-K, cujo fundamento normativo é desconhecido. A maior fragilidade identificada é a divergência entre domínios no código vs. DDMs (status 'S', parentesco, tipo de COD-PROGRAMA), que pode causar corrupção silenciosa de dados durante a migração se não tratada.

---

## 2. Visão Geral do Sistema

### 2.1 Propósito do SIFAP

Sistema de gestão de benefícios sociais do governo federal. Administra programas de transferência de renda (Assistencial, Previdenciário, Trabalho) com cadastro de beneficiários e seus dependentes, definição de regras de elegibilidade por programa, cálculo automatizado de valores via processamento batch noturno, e geração de relatórios de pagamentos e auditoria. Dados críticos: CPF, NIS, renda familiar, composição do núcleo familiar, vínculo com programas sociais.

### 2.2 Arquitetura Legada

- **15 programas Natural (.NSN)**: 3 de cadastro online, 3 batch, 3 de cálculo, 3 de validação, 3 de consulta/relatório
- **4 DDMs Adabas**: BENEFICIARIO (ARQ 150, DBID=57), PROGRAMA-SOCIAL (ARQ 151), PAGAMENTO (ARQ 160), AUDITORIA (ARQ 170)
- **Fluxo principal online**: Terminal 3270 → CADBENEF/CADDEPEND/CADPROG → Adabas ARQ 150/151
- **Fluxo batch noturno**: BATCHPGT chama CALCBENF/CALCDSCT → grava PAGAMENTO → BATCHCON consolida → BATCHREL gera relatório
- **Sem chamadas CALLNAT identificadas nos 3 programas do Par Visão** — validação de CPF é interna (subroutine VALIDA-CPF em CADBENEF.NSN#L224)

### 2.3 Usuários e Perfis

- **Operadores de cadastro**: alimentam CADBENEF, CADDEPEND e CADPROG via terminal 3270
- **Gestores de programas**: cadastram e consultam programas via CADPROG
- **Processamento automatizado (batch)**: jobs noturnos sem interação humana — BATCHPGT, BATCHREL, BATCHCON
- **Consultores/Fiscais**: consultas via CONSBENEF, RELPGT, RELAUDIT
- Nenhum perfil de autenticação/autorização identificado no código — controle de acesso deve ser externo (RACF ou similar)

---

## 3. Principais Descobertas

### 3.1 Regras de Negócio Críticas

1. **BR-014 — Cálculo FATOR-K**: `VLR-CALC = VLR-BASE * (1.00 + FATOR-REAJ * 0.347215)` — impacta o valor base de todos os programas sociais (`CADPROG.NSN#L87-L88`)
2. **BR-003 — Unicidade de CPF**: inclusão rejeita CPF duplicado; alteração exige CPF existente — integridade da base de 4,2M registros (`CADBENEF.NSN#L139-L148`)
3. **BR-006 — Status idoso**: beneficiário >75 anos recebe status 'S' automaticamente — conflita com semântica 'S=Suspenso' do DDM (`CADBENEF.NSN#L167-L169`, `BENEFICIARIO.ddm#L52`)
4. **BR-007 — Bloqueio de dependente**: titular com status C ou D impede inclusão de dependentes — regra de proteção de dados do núcleo familiar (`CADDEPEND.NSN#L56`)
5. **BR-001 — Validação CPF Módulo 11**: CPF inválido por dígito verificador bloqueia cadastro — regra fiscal obrigatória (`CADBENEF.NSN#L105-L112`)

### 3.2 Dependências Complexas

- **BENEFICIARIO (ARQ 150)** é lido/escrito por 10 dos 15 programas — qualquer mudança de schema impacta todo o sistema
- **CADBENEF + CADDEPEND** compartilham o mesmo arquivo de dados (ARQ 150); CADDEPEND depende do estado persistido pelo CADBENEF
- **BATCHPGT** depende de CALCBENF e CALCDSCT por CALLNAT — mudança de assinatura de parâmetros é cascata
- **CADPROG** alimenta PROGRAMA-SOCIAL (ARQ 151) que é lido por CALCBENF, CALCCORR e VALELEG — parâmetros de elegibilidade impactam todos os cálculos

### 3.3 Dívida Técnica Identificada

- [x] **Constante mágica 0.347215** sem documentação de origem normativa em CADPROG.NSN#L87
- [x] **Divergência de tipos**: COD-PROGRAMA é N4 no código mas A4 no DDM — conversão pode corromper dados
- [x] **Semântica dupla do status 'S'**: idoso (programa) vs. suspenso (DDM)
- [x] **Domínio de parentesco divergente** entre código (FI/CO/IR/OU) e DDM (FI/CJ/NT/TU)
- [x] **HASH-DIGITAL declarado mas nunca implementado** — campo fantasma no DDM desde 2005
- [x] **Sem módulo de alteração de programa** — CADPROG só inclui e consulta; quem altera programas ativos é desconhecido
- [x] **Sem controle de transação explícito para erros** — END TRANSACTION só chamado em sucesso; rollback não identificado

### 3.4 Gaps de Documentação

- Origem e fórmula do FATOR-K (citado apenas como "solicitação SENARC" sem portaria ou lei)
- Tabela de decodificação do COD-ELEGIBILIDADE (campo A5 sem dicionário)
- Regras de transição de status de beneficiário (quando passa de A para C, de S para I etc.)
- Quem e quando altera dados de programa após a inclusão inicial
- Fluxo de desligamento de beneficiário (status D) — nenhum dos 3 programas do Par Visão faz isso
- Regras de impacto de dependentes quando titular é desligado

---

## 4. Mistérios e Riscos

### 4.1 Mistérios Não Resolvidos

> Ver detalhamento completo em [mysteries-found.md](mysteries-found.md).

| ID  | Descrição | Risco para Migração |
| --- | --------- | ------------------- |
| MYS-001 | Constante 0.347215 no cálculo FATOR-K sem origem normativa | CRÍTICO — afeta valor de todo pagamento |
| MYS-002 | Status 'S' com dois significados: idoso >75 e suspenso | CRÍTICO — pode corromper base na migração |
| MYS-003 | HASH-DIGITAL declarado no DDM mas nunca implementado | MÉDIO — campo morto na base |
| MYS-004 | FATOR-K inserido em 2008 sem documentação formal | CRÍTICO — risco legal/auditoria |
| MYS-005 | Domínio de parentesco divergente entre código e DDM | ALTO — histórico de dados inconsistente |
| MYS-008 | Nenhum módulo de alteração de programa identificado | ALTO — regras de governança desconhecidas |

### 4.2 Riscos para o Estágio 2

1. **Risco financeiro (CRÍTICO)**: a fórmula do FATOR-K deve ser validada com especialista de domínio antes de qualquer implementação — RE deve criar REQ específico para rastreabilidade normativa
2. **Risco de integridade (CRÍTICO)**: a divergência de tipos de COD-PROGRAMA (N4 vs. A4) exige estratégia de migração de dados antes do go-live
3. **Risco de negócio (ALTO)**: a divergência de semântica do status 'S' exige reunião com especialista do domínio para definir domínio canônico no sistema moderno
4. **Risco de escopo (ALTO)**: módulo de alteração de programa não identificado — Estágio 2 não pode especificar governança de programas sem esse conhecimento
5. **Risco de dados (MÉDIO)**: registros históricos com parentesco em domínio DDM (CJ/NT/TU) vs. código (CO/IR) — estratégia de DE/PARA necessária

---

## 5. Recomendações

### 5.1 O que migrar primeiro

| Prioridade | Funcionalidade | Justificativa |
| ---------- | -------------- | ------------- |
| 1 | Cadastro de Beneficiário (CADBENEF) | Entidade central; sem ela nenhum outro módulo funciona; menor complexidade de integrações |
| 2 | Cadastro de Programa Social (CADPROG) | Pré-requisito para vincular beneficiários; apenas 1 fluxo (inclusão) a ser migrado |
| 3 | Cadastro de Dependentes (CADDEPEND) | Depende do cadastro de beneficiário; regras de vínculo familiar críticas para elegibilidade |

### 5.2 O que descartar

- **Interface Terminal 3270**: substituir por REST API + frontend Next.js — sem lógica de negócio na camada de apresentação
- **HASH-DIGITAL (campo FD)**: nunca implementado em 20 anos — descartar; biometria moderna é responsabilidade de sistema externo
- **Lógica de formatação de tela** (WRITE com layout fixo): não migrar — sem equivalente no modelo REST

### 5.3 O que evoluir

- **Validação de CPF**: manter algoritmo módulo 11, mas elevar para serviço compartilhado (não duplicar em cada módulo)
- **Gestão de status do beneficiário**: criar máquina de estados explícita com transições documentadas — eliminar a ambiguidade do status 'S'
- **Domínio de parentesco**: unificar tabela de domínio e adicionar campo `SIT-DEPENDENTE` com gestão de ciclo de vida
- **FATOR-K**: após validação normativa, implementar como parâmetro configurável com histórico de versões — não mais constante hardcoded

---

## 6. Métricas do Estágio

| Métrica                       | Valor        |
| ----------------------------- | ------------ |
| Programas analisados          | 3 / 15 (Par Visão: CADBENEF, CADDEPEND, CADPROG) |
| DDMs mapeados                 | 2 / 4 (BENEFICIARIO, PROGRAMA-SOCIAL — referenciados diretamente pelos 3 programas) |
| Regras de negócio encontradas | 17 (BR-001 a BR-017) |
| Regras escondidas encontradas | 3 / 10 (BR-006 status idoso, BR-014 FATOR-K, BR-010 CPF null bypass) |
| Easter eggs encontrados       | 0 / 3 (não identificados nos 3 programas do Par Visão) |
| Termos no glossário           | 35 |
| Mistérios catalogados         | 10 (MYS-001 a MYS-010) |
| Tempo total gasto             | 1,5 horas (Estágio 1 Par Visão) |

---

## 7. Notas para o Próximo Estágio

**Para o Par 2 (Arquitetura) — Enterprise Architect + Software Architect:**
- O BENEFICIARIO (ARQ 150) é o aggregate root central — qualquer bounded context começa por aqui
- PROGRAMA-SOCIAL (ARQ 151) é tabela paramétrica — candidato a contexto separado de "Configuração de Programas"
- Dependentes são parte do aggregate BENEFICIARIO (PE group no Adabas) — decidir se continuam embedded ou viram entidade própria

**Para o RE (Requirements Engineer — você mesmo, Estágio 2):**
- BR-014 (FATOR-K) **precisa de validação de domínio antes de virar EARS** — sinalizar como bloqueado até confirmação normativa
- BR-006 (status 'S') **precisa de decisão de negócio** — criar REQ para máquina de estados com semântica unificada
- Todos os 17 BRs têm `Programa Fonte` preenchido — prontos para `source_legacy:` nas EARS

**Para o PO (Priorização de Escopo):**
- v1 recomendada: cadastro de beneficiário + cadastro de programa + vínculo de dependente
- Fora do escopo v1: batch de pagamento, cálculo de desconto, relatórios de auditoria
- Decisões de escopo devem ser registradas em [02-spec-moderna/scope-decisions.md](../02-spec-moderna/scope-decisions.md)

---

## Definição de Pronto deste relatório

- [x] Todas as seções acima preenchidas (sem placeholders).
- [x] Pelo menos 5 regras críticas listadas em §3.1, cada uma referenciando uma `BR-XXX` do catálogo.
- [x] Decisões de migrar/descartar/evoluir em §5 cobrem as 8+ funcionalidades principais.
- [x] Métricas de §6 conferem com os outros artefatos (glossary.md, business-rules-catalog.md, mysteries-found.md).

> ✅ **Artefato aprovado pelo Par Visão (PO + RE) — 20/05/2026**

— Paula


---

### Continuar a leitura

<table width="100%">
<tr>
<td width="50%" valign="top" align="left">
<sub><strong>← ANTERIOR</strong></sub><br/>
<a href="mysteries-found.md"><strong>mysteries-found.md</strong></a><br/>
<sub>Lista de mistérios.</sub>
</td>
<td width="50%" valign="top" align="right">
<sub><strong>PRÓXIMO →</strong></sub><br/>
<a href="../02-spec-moderna/GUIDE.md"><strong>Estágio 2 — Spec</strong></a><br/>
<sub>Próximo estágio: spec moderna.</sub>
</td>
</tr>
</table>

<sub>↑ <a href="../README.md">Voltar ao Kit PT-BR</a></sub>

