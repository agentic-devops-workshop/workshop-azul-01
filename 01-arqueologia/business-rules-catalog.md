<!-- markdownlint-disable MD013 MD025 MD026 MD028 MD029 MD034 MD040 MD051 MD060 -->

# Catálogo de Regras de Negócio — SIFAP Legado

![ESTÁGIO 01 Arqueologia](https://img.shields.io/badge/ESTÁGIO-01%20Arqueologia-F25022?style=for-the-badge) ![TIPO Worksheet](https://img.shields.io/badge/TIPO-Worksheet-1A1A1A?style=for-the-badge) ![PREENCHA Durante S1](https://img.shields.io/badge/PREENCHA-Durante%20S1-737373?style=for-the-badge)

> 🗺 **Você está aqui:** [Kit PT-BR](../README.md) → [Estágio 1](README.md) → **business-rules-catalog**

> **Para quem é isto?** Este é um **artefato preenchido pelo time** durante o Estágio 1 (Arqueologia).
>
> **O que você terá ao final do estágio:**
>
> 1. Este documento totalmente preenchido com os dados reais do legado SIFAP
> 2. Rastreabilidade para `01-arqueologia/legado-sifap/` (programas `.NSN` e DDMs)
> 3. Base de evidência usada nas EARS do Estágio 2 (`source_legacy:`)
>
> 📘 **Guia passo a passo:** [`GUIDE.md`](GUIDE.md).


> Registre aqui todas as regras de negócio extraídas do código Natural/Adabas.
> Cada regra precisa ter rastreabilidade até o código-fonte.
>
> **REGRA DURA:** linhas com `Programa Fonte` vazio são **inválidas** e não contam para o gate do Estágio 2. Use o formato `01-arqueologia/legado-sifap/natural-programs/ARQUIVO.NSN#L<inicio>-L<fim>` sempre que possível. Mínimo aceito: nome do arquivo .NSN.

## Como pensar em "regra de negócio"

O que conta:

- Um `IF` que decide algo no domínio (ex.: _"se a UF é do Nordeste e o programa é Seca, valor base × 1.2"_)
- Uma constante numérica sem explicação (ex.: `0.075` num cálculo de imposto)
- Uma transição de status com regra (ex.: _"só de A para S, nunca de I para A"_)
- Um tratamento especial para um caso (ex.: _"se o CPF começa com 999, é teste"_)

O que NÃO conta: paginação de relatório, formatação de saída, manipulação de cursor Adabas, abertura de arquivo. Ignore esses detalhes de implementação.

## Níveis de Risco

| Nível       | Descrição                                                     |
| ----------- | ------------------------------------------------------------- |
| **CRÍTICO** | Regra financeira ou de segurança — erro causa prejuízo direto |
| **ALTO**    | Regra de negócio central — afeta fluxo principal              |
| **MÉDIO**   | Regra de validação ou formatação — afeta qualidade dos dados  |
| **BAIXO**   | Regra de apresentação ou conveniência — impacto limitado      |

## Regras Encontradas

> **Contribuição Par 2 (Arquitetura — EA + SA):** 34 regras extraídas dos 3 batches (`BATCHPGT.NSN`, `BATCHCON.NSN`, `BATCHREL.NSN`). Outros pares completam com seus programas.

### Par 2 · BATCHPGT — Geração mensal de pagamentos

| ID     | Regra de Negócio | Programa Fonte | Campos DDM | Nível de Risco | Notas |
| ------ | ---------------- | -------------- | ---------- | -------------- | ----- |
| BR-PGT-001 | Competência (AAAAMM) derivada de `*DATN` na execução do batch | `01-arqueologia/legado-sifap/natural-programs/BATCHPGT.NSN#L113-L115` | — | ALTO | Sem parâmetro externo; batch assume "hoje" |
| BR-PGT-002 | `NUM-PAGTO` é sequencial, incrementado a partir do maior já gravado | `01-arqueologia/legado-sifap/natural-programs/BATCHPGT.NSN#L163-L167`, `#L296` | `PAGAMENTO.NUM-PAGTO` | ALTO | Race condition se executado em paralelo |
| BR-PGT-003 | Beneficiário só é processado se `STATUS = 'A'` (ativo) | `01-arqueologia/legado-sifap/natural-programs/BATCHPGT.NSN#L186-L189` | `BENEFICIARIO.STATUS` | ALTO | Demais status são ignorados silenciosamente |
| BR-PGT-004 | Não gerar 2º pagamento na mesma competência para o mesmo CPF | `01-arqueologia/legado-sifap/natural-programs/BATCHPGT.NSN#L192-L203` | `PAGAMENTO.CPF-BENEF`, `PAGAMENTO.COMPETENCIA` | CRÍTICO | Idempotência da execução |
| BR-PGT-005 | Programa social precisa existir e ter `STATUS-PROG = 'A'` | `01-arqueologia/legado-sifap/natural-programs/BATCHPGT.NSN#L207-L221` | `PROGRAMA-SOCIAL.STATUS-PROG` | ALTO | Programa inexistente = erro; inativo = ignorado |
| BR-PGT-006 | Fator regional indexado por `COD-REGIAO` 1..25 (tabela hardcoded 27 posições) | `01-arqueologia/legado-sifap/natural-programs/BATCHPGT.NSN#L120-L147`, `#L231-L235` | `BENEFICIARIO.COD-REGIAO` | CRÍTICO | Valores de 1,00 a 1,40 |
| BR-PGT-007 | Fator familiar por faixa de dependentes: 0=1,00 / 1-2=1+(n×0,05) / 3-4=1,10+((n-2)×0,03) / 5+=1,16+((n-4)×0,02) | `01-arqueologia/legado-sifap/natural-programs/BATCHPGT.NSN#L237-L249` | `BENEFICIARIO.NUM-DEPENDENTES` | CRÍTICO | Cálculo financeiro |
| BR-PGT-008 | Fator renda em 5 faixas (300 / 600 / 1000 / 1500 / 9999,99) → (1,00 / 0,85 / 0,70 / 0,55 / 0,40) | `01-arqueologia/legado-sifap/natural-programs/BATCHPGT.NSN#L149-L159`, `#L342-L349` | `BENEFICIARIO.RENDA-FAMILIAR` | CRÍTICO | Faixas hardcoded |
| BR-PGT-009 | Fator idade: ≥65=1,15 · ≥60=1,10 · <18=1,05 · demais=1,00 | `01-arqueologia/legado-sifap/natural-programs/BATCHPGT.NSN#L253-L263` | `BENEFICIARIO.DT-NASCIMENTO` | CRÍTICO | Idade pelo ano somente |
| BR-PGT-010 | Valor benefício = `VLR-BASE × fator-reg × fator-fam × fator-rnd × fator-idade × (1 + FATOR-REAJUSTE)` | `01-arqueologia/legado-sifap/natural-programs/BATCHPGT.NSN#L266-L268` | `PROGRAMA-SOCIAL.VLR-BASE`, `.FATOR-REAJUSTE` | CRÍTICO | Fórmula principal |
| BR-PGT-011 | Valores monetários sofrem **truncamento** para 2 casas (não arredondamento) | `01-arqueologia/legado-sifap/natural-programs/BATCHPGT.NSN#L269-L271`, `#L281-L283`, `#L292-L294` | `PAGAMENTO.VLR-*` | CRÍTICO | Divergente de BR-REL-003 |
| BR-PGT-012 | Em dezembro (`#MES = 12`), gera 13º = `VLR-BASE × fator-reg × fator-idade` — `TIPO-PGTO = 'D'` | `01-arqueologia/legado-sifap/natural-programs/BATCHPGT.NSN#L275-L286` | `PAGAMENTO.TIPO-PGTO` | CRÍTICO | Só ocorre 1 vez/ano |
| BR-PGT-013 | Em dezembro, programas com `TIPO = 'A'` recebem abono adicional de 15% do valor benefício | `01-arqueologia/legado-sifap/natural-programs/BATCHPGT.NSN#L281-L286` | `PROGRAMA-SOCIAL.TIPO`, `PAGAMENTO.VLR-ABONO` | CRÍTICO | Combina com 13º |
| BR-PGT-014 | Desconto = 3% do bruto quando bruto > R$ 500,00; senão zero | `01-arqueologia/legado-sifap/natural-programs/BATCHPGT.NSN#L289-L294` | `PAGAMENTO.VLR-DESCONTO` | CRÍTICO | Cabeçalho dizia chamar CALCDSCT — inline |
| BR-PGT-015 | Líquido nunca pode ser negativo (clamp em zero) | `01-arqueologia/legado-sifap/natural-programs/BATCHPGT.NSN#L297-L300` | `PAGAMENTO.VLR-LIQUIDO` | ALTO | Defensivo |
| BR-PGT-016 | Pagamento nasce com `STATUS-PGTO = 'G'` (Gerado) | `01-arqueologia/legado-sifap/natural-programs/BATCHPGT.NSN#L306` | `PAGAMENTO.STATUS-PGTO` | ALTO | Estado inicial do ciclo |
| BR-PGT-017 | Deduplicação por CPF no loop assume ordenação ascendente (READ BY CPF) | `01-arqueologia/legado-sifap/natural-programs/BATCHPGT.NSN#L171-L184` | `BENEFICIARIO.CPF` | ALTO | Comentário: "sistemas downstream dependem" |
| BR-PGT-018 | Idade calculada apenas por ano (`#ANO - #ANO-NASC`), sem considerar mês/dia | `01-arqueologia/legado-sifap/natural-programs/BATCHPGT.NSN#L227-L229` | `BENEFICIARIO.DT-NASCIMENTO` | MÉDIO | Beneficiário faz 65 em fev recebe fator desde jan |

### Par 2 · BATCHCON — Conciliação bancária CNAB 240

| ID     | Regra de Negócio | Programa Fonte | Campos DDM | Nível de Risco | Notas |
| ------ | ---------------- | -------------- | ---------- | -------------- | ----- |
| BR-CON-001 | Processa apenas registros CNAB tipo `'3'` (detalhe) | `01-arqueologia/legado-sifap/natural-programs/BATCHCON.NSN#L118-L120` | — | ALTO | Header/trailer ignorados |
| BR-CON-002 | Layout CNAB 240 BB: banco 1-3, lote 4-7, tipo 8, CPF 44-54, valor 120-134, data 140-147, num doc 74-83, cod ret 231-232 | `01-arqueologia/legado-sifap/natural-programs/BATCHCON.NSN#L113-L128` | — | CRÍTICO | Posições fixas hardcoded |
| BR-CON-003 | Valor do CNAB chega em centavos; conversão por divisão por 100 | `01-arqueologia/legado-sifap/natural-programs/BATCHCON.NSN#L131-L133` | — | CRÍTICO | Arredondamento implícito |
| BR-CON-004 | Match exige `NUM-PAGTO + CPF-BENEF + COMPETENCIA` coincidentes | `01-arqueologia/legado-sifap/natural-programs/BATCHCON.NSN#L137-L142` | `PAGAMENTO.NUM-PAGTO`, `.CPF-BENEF`, `.COMPETENCIA` | CRÍTICO | Chave composta |
| BR-CON-005 | Divergência de valor: `|VLR-LIQUIDO − VLR-RETORNO| > 0,01` | `01-arqueologia/legado-sifap/natural-programs/BATCHCON.NSN#L153-L158` | `PAGAMENTO.VLR-LIQUIDO` | CRÍTICO | Tolerância de 1 centavo |
| BR-CON-006 | Cod retorno `'00'` → `STATUS = 'P'`, grava `DT-PGTO` e `BANCO = 1` (BB) | `01-arqueologia/legado-sifap/natural-programs/BATCHCON.NSN#L168-L177` | `PAGAMENTO.STATUS-PGTO`, `.DT-PGTO`, `.COD-BANCO` | CRÍTICO | Pagamento confirmado |
| BR-CON-007 | Cod retorno `'01'` → `STATUS = 'D'` (Devolvido) | `01-arqueologia/legado-sifap/natural-programs/BATCHCON.NSN#L178-L184` | `PAGAMENTO.STATUS-PGTO` | ALTO | Reenviar? |
| BR-CON-008 | Cod retorno `'02'` → `STATUS = 'E'` (Estornado) | `01-arqueologia/legado-sifap/natural-programs/BATCHCON.NSN#L185-L191` | `PAGAMENTO.STATUS-PGTO` | ALTO | Reversão |
| BR-CON-009 | Códigos diferentes de 00/01/02: log "DESCONHECIDO" sem alterar pagamento | `01-arqueologia/legado-sifap/natural-programs/BATCHCON.NSN#L192-L196` | — | MÉDIO | Limitação |
| BR-CON-010 | Toda conciliação (match ou divergência) gera registro em `AUDITORIA` | `01-arqueologia/legado-sifap/natural-programs/BATCHCON.NSN#L198-L201`, `#L222-L249` | `AUDITORIA.*` | ALTO | Trilha imutável |
| BR-CON-011 | Auditoria de batch grava `USUARIO = 'BATCH'`, `ACAO = 'CO'` (conciliado) ou `'DV'` (divergência) | `01-arqueologia/legado-sifap/natural-programs/BATCHCON.NSN#L228-L232`, `#L240-L244` | `AUDITORIA.USUARIO`, `.ACAO` | MÉDIO | Usuário literal |

### Par 2 · BATCHREL — Relatório consolidado mensal

| ID     | Regra de Negócio | Programa Fonte | Campos DDM | Nível de Risco | Notas |
| ------ | ---------------- | -------------- | ---------- | -------------- | ----- |
| BR-REL-001 | Agrupamento em 5 macro-regiões por intervalo de `COD-REGIAO`: 1-5 Norte, 6-10 Nordeste, 11-15 Sudeste, 16-20 Sul, demais Centro-Oeste | `01-arqueologia/legado-sifap/natural-programs/BATCHREL.NSN#L102-L118` | `BENEFICIARIO.COD-REGIAO` | ALTO | Mapeamento por faixa contínua |
| BR-REL-002 | 5 buckets de status: G→Gerado · P→Pago · C→Cancelado · D→Devolvido · E→Estornado; demais caem em "Gerado" | `01-arqueologia/legado-sifap/natural-programs/BATCHREL.NSN#L128-L144` | `PAGAMENTO.STATUS-PGTO` | MÉDIO | Default suspeito |
| BR-REL-003 | Relatório aplica **arredondamento bancário** (+0,005 e truncamento) — diverge do truncamento puro de BR-PGT-011 | `01-arqueologia/legado-sifap/natural-programs/BATCHREL.NSN#L120-L125` | — | CRÍTICO | Comentário explícito de divergência |
| BR-REL-004 | Layout impressora: 66 linhas/página, 132 colunas | `01-arqueologia/legado-sifap/natural-programs/BATCHREL.NSN#L72-L74` | — | BAIXO | Apresentação |
| BR-REL-005 | Totaliza bruto/desconto/líquido por região e status; bucket de status só soma bruto | `01-arqueologia/legado-sifap/natural-programs/BATCHREL.NSN#L120-L144` | `PAGAMENTO.VLR-*` | ALTO | Auditoria contábil |

> Outros pares: adicionem suas linhas abaixo conforme seus programas.

## Exemplo de linha bem preenchida

| ID     | Regra de Negócio                                                                        | Programa Fonte                                   | Campos DDM                                                               | Nível de Risco | Notas                                      |
| ------ | --------------------------------------------------------------------------------------- | ------------------------------------------------ | ------------------------------------------------------------------------ | -------------- | ------------------------------------------ |
| BR-013 | Desconto total não pode exceder 30% do valor bruto, exceto descontos judiciais (tipo J) | `01-arqueologia/legado-sifap/natural-programs/CALCDSCT.NSN#L142-L148` | `PAGAMENTO.VLR-BRUTO`, `PAGAMENTO.VLR-TOTAL-DSCT`, `PAGAMENTO.TIPO-DSCT` | CRÍTICO        | Regra financeira. Tipo 'J' = exceção legal |

## Regras por Categoria

### Cálculos Financeiros

<!-- Liste aqui as regras relacionadas a cálculos de valores, benefícios, etc. -->
- BR-PGT-006 — Fator regional (tabela 27 posições, 1,00–1,40)
- BR-PGT-007 — Fator familiar por faixa de dependentes
- BR-PGT-008 — Fator renda em 5 faixas (1,00→0,40)
- BR-PGT-009 — Fator idade (≥65 / ≥60 / <18 / demais)
- BR-PGT-010 — Fórmula principal do benefício
- BR-PGT-011 — Truncamento para 2 casas `(×100)/100` ⚠️ diverge de BR-REL-003
- BR-PGT-012 — 13º salário em dezembro
- BR-PGT-013 — Abono 15% em dezembro (programas tipo `'A'`)
- BR-PGT-014 — Desconto 3% do bruto quando bruto > R$ 500,00
- BR-PGT-015 — Líquido nunca negativo (clamp em zero)
- BR-CON-003 — Conversão valor CNAB (centavos ÷ 100)
- BR-CON-005 — Divergência de valor: tolerância de R$ 0,01
- BR-REL-003 — Arredondamento bancário `+0,005` ⚠️ diverge de BR-PGT-011
- BR-REL-005 — Totalização bruto/desconto/líquido por região e status

### Validações de Status

<!-- Liste aqui as regras de transição de status (A, S, C, I, D) -->
- BR-PGT-003 — `STATUS = 'A'` para processar beneficiário
- BR-PGT-005 — `STATUS-PROG = 'A'` para processar programa social
- BR-PGT-016 — Pagamento nasce com `STATUS-PGTO = 'G'` (Gerado)
- BR-CON-006 — Cod retorno `'00'` → `STATUS = 'P'` (Pago)
- BR-CON-007 — Cod retorno `'01'` → `STATUS = 'D'` (Devolvido)
- BR-CON-008 — Cod retorno `'02'` → `STATUS = 'E'` (Estornado)
- BR-REL-002 — 5 buckets de status no relatório; desconhecidos caem em "Gerado"

### Regras de Autorização

<!-- Liste aqui as regras de quem pode fazer o quê -->
- BR-PGT-004 — Idempotência: não gerar 2º pagamento na mesma competência/CPF
- BR-CON-011 — Auditoria batch usa `USUARIO = 'BATCH'` literal; `ACAO = 'CO'` ou `'DV'`

### Regras de Negócio Temporais

<!-- Liste aqui regras com prazos, datas-limite, períodos -->
- BR-PGT-001 — Competência = AAAAMM derivado de `*DATN` (mensal, 1º dia útil)
- BR-PGT-012 — 13º salário somente em dezembro (`#MES = 12`)
- BR-PGT-013 — Abono 15% somente em dezembro, programas tipo `'A'`
- BR-PGT-018 — Idade por ano apenas (`#ANO − #ANO-NASC`), sem mês/dia
- BR-CON-001 — Conciliação por competência informada no `INPUT`

## Resumo Estatístico

- Total de regras encontradas: **34**
- Regras críticas: **15**
- Regras com duplicação: **2** (BR-PGT-011 ↔ BR-REL-003; BR-PGT-014 ↔ CALCDSCT citado no cabeçalho)
- Regras sem documentação (escondidas): **6** (MYS-003/004/005 do checklist)

---

### Continuar a leitura

<table width="100%">
<tr>
<td width="50%" valign="top" align="left">
<sub><strong>← ANTERIOR</strong></sub><br/>
<a href="GUIDE.md"><strong>GUIDE do Estágio 1</strong></a><br/>
<sub>Passo a passo do estágio.</sub>
</td>
<td width="50%" valign="top" align="right">
<sub><strong>PRÓXIMO →</strong></sub><br/>
<a href="dependency-map.md"><strong>dependency-map.md</strong></a><br/>
<sub>Mapa de quem chama quem.</sub>
</td>
</tr>
</table>

<sub>↑ <a href="README.md">Voltar ao Kit PT-BR</a></sub>

