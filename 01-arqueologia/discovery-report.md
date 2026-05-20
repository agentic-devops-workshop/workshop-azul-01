<!-- markdownlint-disable MD012 MD013 MD025 MD026 MD028 MD029 MD033 MD034 MD040 MD051 MD060 -->

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

**Time**: Par 2 — Arquitetura (Enterprise Architect + Software Architect)
**Data**: 20/05/2026
**Edição**: workshop-azul-01
**Participantes**: EA + SA — cobertura dos 3 batches do ciclo mensal

---

## 1. Sumário Executivo

O SIFAP é um sistema de pagamentos de programas sociais com 29 anos de evolução em Natural/Adabas, com lógica financeira crítica não trivial (fatores regional, familiar, renda, idade, 13º e abono). Os 3 batches lidos pelo Par 2 (`BATCHPGT`, `BATCHCON`, `BATCHREL`) formam o **ciclo mensal completo**: geração, conciliação CNAB 240 e relatório consolidado. Não existe nenhum `CALLNAT` entre os três; o acoplamento é puramente via 4 tabelas Adabas compartilhadas (`BENEFICIARIO`, `PROGRAMA-SOCIAL`, `PAGAMENTO`, `AUDITORIA`). O sistema apresenta **dualítades silenciosas** (cabeçalho menciona subprogramas inexistentes, regras de arredondamento divergentes entre os três batches, hardcoded de banco e regiões) que indicam alto risco de regressão numa migração ingênua.

---

## 2. Visão Geral do Sistema

### 2.1 Propósito do SIFAP

Gerar, conciliar e relatar pagamentos mensais de benefícios de programas sociais a beneficiários identificados por CPF/NIS, com cálculo baseado em valor-base do programa modulado por fatores demográficos (região, família, renda, idade) e ajustes anuais (13º, abono).

### 2.2 Arquitetura Legada (escopo Par 2)

- **3 batches** Natural sequenciais sem CALLNAT entre si, orquestrados por convenção operacional (não por código)
- **4 entidades Adabas** como contrato implícito de integração
- **1 integração externa**: arquivo CNAB 240 do Banco do Brasil (apenas retorno; remessa não encontrada)
- **Cálculo financeiro inline** com tabelas hardcoded (27 fatores regionais, 5 faixas de renda)
- **Sub-rotinas internas** apenas: `DET-FAIXA-RENDA-BATCH` (PGT), `GRAVA-AUDITORIA-CONC` e `GRAVA-AUDITORIA-DIVERG` (CON), `IMPRIME-CABECALHO` (REL)

### 2.3 Usuários e Perfis

- **Operador SIFAP**: dispara batches via JCL/operador (PGT no 1º dia útil; CON ao receber retorno BB; REL no fechamento do ciclo).
- **Audit trail**: `USUARIO = 'BATCH'` literal nos lançamentos automáticos (`BATCHCON.NSN#L228, L240`).
- Papéis humanos para tratamento de divergência/devolução não ficam claros nos 3 batches — escalar para PO.

---

## 3. Principais Descobertas

### 3.1 Regras de Negócio Críticas (top 5 do Par 2)

1. **BR-PGT-010** — Fórmula do valor benefício: `VLR-BASE × fator-reg × fator-fam × fator-rnd × fator-idade × (1 + FATOR-REAJUSTE)` (`BATCHPGT.NSN#L266-L268`).
2. **BR-PGT-011 / BR-REL-003** — Inconsistência de arredondamento: PGT trunca, REL arredonda bancariamente, CON tolera 1 centavo (`BATCHPGT.NSN#L269-L271`, `BATCHREL.NSN#L120-L125`, `BATCHCON.NSN#L158`).
3. **BR-PGT-012/013** — 13º salário em dezembro + abono adicional de 15% para programas tipo `'A'` (`BATCHPGT.NSN#L275-L286`).
4. **BR-CON-004 a 008** — Máquina de estados do pagamento: `G → P/D/E` via códigos CNAB 00/01/02 do BB (`BATCHCON.NSN#L137-L196`).
5. **BR-PGT-004** — Idempotência: não gerar 2º pagamento na mesma competência para o mesmo CPF (`BATCHPGT.NSN#L192-L203`).

### 3.2 Dependências Complexas

- **Acoplamento via banco de dados** é a forma de integração dominante. Não há API, fila ou CALLNAT entre os 3 batches — todos leem/escrevem nas mesmas tabelas Adabas. Risco arquitetural alto na migração: bounded contexts modernos não podem manter esse acoplamento.
- `BATCHREL` faz **N+1 reads** (`FIND BENEFICIARIO` por CPF dentro do loop de pagamentos) — problema de performance escondido.
- `BATCHPGT` afirma em comentário que "SISTEMAS DOWNSTREAM" dependem da ordenação por CPF, mas nenhum dos outros 2 batches do Par 2 confirma essa dependência — há consumidor não mapeado (provável programa de remessa CNAB).

### 3.3 Dívida Técnica Identificada

- [ ] **3 regras divergentes de arredondamento** para a mesma grandeza monetária (MYS-PGT-04 / MYS-CON-02 / MYS-REL-01)
- [ ] **Cabeçalho mente** sobre uso de CALCBENF/CALCDSCT (MYS-PGT-01) — documentação não reflete código
- [ ] **Hardcoded** de tabelas regionais (27 entradas), faixas de renda (5), código de banco (`1`)
- [ ] **Código morto** desde 2007: bloco Banco Real comentado (MYS-CON-07)
- [ ] **Sem `ON ERROR` global** — falhas de I/O abortam batch sem persistência de log (MYS-PGT-07/08)
- [ ] **Divergência de valor não move pagamento de estado** (MYS-CON-08) — pagamentos podem ficar "presos" em `G`
- [ ] **`RENDA-MAX` declarado mas nunca consultado** (MYS-PGT-05) — elegibilidade por teto de renda não é aplicada aqui
- [ ] **Paginatção do relatório quebrada** (MYS-REL-04)

### 3.4 Gaps de Documentação

> O que a documentação existente NÃO cobre?

- Ordem de execução entre os 3 batches é convenção, não contrato.
- Programa de **remessa CNAB de envio** ao BB não aparece em nenhum dos 3 batches lidos pelo Par 2 — deve existir em outro lugar.
- Lista de códigos CNAB tratados (só 00/01/02) é menor que o padrão do BB.
- Mapeamento UF → macro-região (5 buckets) hardcoded sem referência documental.
- Quem consome o relatório do `BATCHREL` (TCU? CGU? CGU? interno?).

---

## 4. Mistérios e Riscos

### 4.1 Mistérios Não Resolvidos (alta prioridade)

> Resume `mysteries-found.md` (Par 2).

| ID  | Descrição | Risco para Migração |
| --- | --------- | ------------------- |
| MYS-PGT-01 | Cabeçalho cita CALLNAT CALCBENF/CALCDSCT, mas código é inline | CÓDIGO "OFICIAL" pode existir em outro programa e ter regras diferentes — quebrar parity tests |
| MYS-PGT-04 + MYS-CON-02 + MYS-REL-01 | 3 regras divergentes de arredondamento na mesma cadeia | Modernizar com uma só regra muda totais históricos e ofende conformidade contab/TCU |
| MYS-CON-08 | Divergência gera auditoria mas não altera status do pagamento | Backlog operacional invisível; pagamentos travados em `'G'` |
| MYS-PGT-02 | "Sistemas downstream dependem da ordem por CPF" sem consumidor mapeado | Trocar a ordenação pode quebrar integração oculta com BB |
| MYS-PGT-05 | `RENDA-MAX` do programa social declarado mas nunca aplicado | Elegibilidade por teto pode estar implementada em outro lugar (ou não aplicada há anos) |

### 4.2 Riscos para o Estágio 2

1. **Define a regra-fim de arredondamento antes de escrever EARS** — sem isso, qualquer spec sobre cálculo financeiro estará ambígua e ferirá testes de equivalência no Estágio 3.
2. **Mapear o programa de remessa CNAB ausente** — sem ele, o ciclo de pagamento não fecha e bounded context de Bank Reconciliation está incompleto.
3. **Decidir comportamento de divergência** — manter `'G'` (legado) ou criar status `'V'` (Divergência) explicitamente? Impacta UI e relatórios.
4. **Acoplamento via tabelas compartilhadas** — modular monolito moderno exige fronteiras claras; o atual layout não tem. ADR de bounded contexts é obrigatório.
5. **Tabelas hardcoded (região, faixa de renda, banco)** — modernizar como configuração + histórico versão-controlado, senão repete a dívida.

---

## 5. Recomendações

### 5.1 O que migrar primeiro (Par 2 — a confirmar com PO)

| Prioridade | Funcionalidade | Justificativa |
| ---------- | -------------- | ------------- |
| 1 | Geração mensal de pagamentos (BATCHPGT) | Cúpula do ciclo; sem ela não há nada para conciliar nem relatar |
| 2 | Conciliação CNAB (BATCHCON) | Fecha o ciclo financeiro; dependência direta do BB |
| 3 | Relatório consolidado (BATCHREL) | Pode iniciar como read model derivado dos dois primeiros |

### 5.2 O que descartar

- **Bloco Banco Real comentado** (`BATCHCON.NSN#L218-L237`): morto desde 2007.
- **Variáveis `#LOG-WORK`/`#LOG-ERRO`** não usadas (`BATCHPGT.NSN#L106-L107`): substituir por logging estruturado.
- **Lógica de paginação quebrada do REL**: na modernidade, relatório HTML/PDF não precisa de `66 linhas/página`.

### 5.3 O que evoluir

- **Tabelas de fatores (regional/renda)**: virar entidades configuráveis com vigencia temporal (não hardcoded).
- **Cálculo de idade**: usar data completa, não só ano (corrige MYS-PGT-06).
- **Status de divergência**: adicionar `'V'` explicitamente (resolve MYS-CON-08).
- **Códigos CNAB**: tratar todos os códigos do padrão FEBRABAN BB, não só 00/01/02 (MYS-CON-05).
- **Idempotência do batch**: tornar parâmetro competência explícito (não usar `*DATN` cego).

---

## 6. Métricas do Estágio (Par 2)

| Métrica                       | Valor        |
| ----------------------------- | ------------ |
| Programas analisados (Par 2)  | 3 / 15       |
| DDMs referenciados (Par 2)    | 4 / 4        |
| Regras de negócio (Par 2)     | 34           |
| Regras escondidas (Par 2)     | 8 (de 10)    |
| Easter eggs encontrados       | 0            |
| Termos no glossário (Par 2)   | 34           |
| Mistérios catalogados (Par 2) | 22           |
| Tempo gasto (Par 2)           | ~1,5 hora    |

> Outros pares completam suas linhas; consolidar no Passagem #1.

---

## 7. Notas para o Próximo Estágio

> Mensagens do Par 2 para o time do Estágio 2 (Especificação Moderna):

- **Bounded contexts candidatos** (do Par 2): `Beneficiary`, `SocialProgram`, `Payment`, `BankReconciliation`, `Audit`, `Reporting`. Considerar **`BenefitCalculation`** como subdomínio dentro de `Payment` ou serviço de aplicação separado (depende de MYS-PGT-01).
- **Não escrever EARS sobre cálculo financeiro** sem antes resolver MYS-PGT-04/CON-02/REL-01 com PO.
- **ADR provavelmente necessários**: (1) Modular Monolith com fronteiras de bounded context; (2) Estratégia de arredondamento monetário única; (3) Integração com BB — síncrona/assíncrona, formato (CNAB vs API), idempotência; (4) Máquina de estados de Payment (incluir `V` Divergência?).
- **Pergunta para PO** (top 5 do Par 2):
  1. Onde está a geração da remessa CNAB de envio ao BB?
  2. `CALCBENF`/`CALCDSCT` existem como subprogramas executados em produção (em algum outro `.NSN`)?
  3. Qual é a regra-fim de arredondamento monetário?
  4. Divergência não mover status do pagamento é intencional?
  5. Quem são os "sistemas downstream" que dependem da ordem por CPF?

---

## Definição de Pronto deste relatório

- [ ] Todas as seções acima preenchidas (sem placeholders).
- [ ] Pelo menos 5 regras críticas listadas em §3.1, cada uma referenciando uma `BR-XXX` do catálogo.
- [ ] Decisões de migrar/descartar/evoluir em §5 cobrem as 8+ funcionalidades principais.
- [ ] Métricas de §6 conferem com os outros artefatos (glossary.md, business-rules-catalog.md, mysteries-found.md).

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

