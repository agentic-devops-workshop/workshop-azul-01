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

| ID     | Regra de Negócio | Programa Fonte | Campos DDM | Nível de Risco | Notas |
| ------ | ---------------- | -------------- | ---------- | -------------- | ----- |
| BR-001 | Cálculo de benefício: valor base × fator regional (27 regiões: 1.0–1.4) | `CALCBENF.NSN#L110-L120` | `PROGRAMA-SOCIAL.VLR-BASE`, `BENEFICIARIO.COD-REGIAO` | CRÍTICO | Tabela hardcoded; região 99 = fator 1.0 |
| BR-002 | Fator familiar: adiciona até 28% por dependentes (0–10 dependentes) | `CALCBENF.NSN#L120-L145` | `BENEFICIARIO.NUM-DEPENDENTES`, `BENEFICIARIO.GRP-DEPENDENTE` | CRÍTICO | 3 patamares: ≤2 (+5%), 3-4 (+3%), 5+ (+2%) |
| BR-003 | Fator de renda: reduz valor de 100% a 40% conforme renda familiar sobe | `CALCBENF.NSN#L145-L160` | `BENEFICIARIO.RENDA-FAMILIAR`, `PROGRAMA-SOCIAL.RENDA-MAX-PERCAP` | CRÍTICO | 5 faixas: até R$300, 600, 1000, 1500, >1500 |
| BR-004 | **[MISTÉRIO MYS-001]** Fator de idade não documentado em CALCBENF | `BATCHPGT.NSN#L190-L210` | `BENEFICIARIO.DT-NASCIMENTO` | ALTO | 65+→1.15, 60+→1.10, <18→1.05. BATCHPGT só. |
| BR-005 | 13º salário em dezembro: 1/12 × base × fator regional × fator idade | `BATCHPGT.NSN#L340-L360` | `PAGAMENTO.VLR-13` (não existe em DDM) | ALTO | Adicionado 2009; tipo_pgto='D' |
| BR-006 | Abono natalino em dezembro: 15% do benefício para programas tipo 'A' | `BATCHPGT.NSN#L365-L375` | `PROGRAMA-SOCIAL.TIPO` | ALTO | Só programas assistência (tipo='A') |
| BR-007 | **[MISTÉRIO MYS-005]** Truncamento de centavos via mult×100/÷100 | `CALCBENF.NSN#L160`, `CALCDSCT.NSN#L90` | Todos valores N9.2 | CRÍTICO | Perda acumulada ~R$900k/ano em 180M registros |
| BR-008 | Desconto obrigatório: contribuição social com 4 faixas de alíquota | `CALCDSCT.NSN#L35-L50` | `PAGAMENTO.VLR-DESCONTO` | CRÍTICO | ≤500→3%, ≤1k→5%, ≤2k→7%, >2k→9% |
| BR-009 | **[MISTÉRIO MYS-006]** Desconto tipo 'J' (judicial) ignora teto de 30% | `CALCDSCT.NSN#L60-L80` | `PAGAMENTO.GRP-DESCONTO.TIPO-DESCONTO` | CRÍTICO | Exceção legal — sentença executória |
| BR-010 | Teto máximo desconto: não pode exceder 30% do valor bruto | `CALCDSCT.NSN#L52-L58` | `PAGAMENTO.VLR-BRUTO` | CRÍTICO | Exceto tipo 'J' (judicial) |
| BR-011 | **[MISTÉRIO MYS-002]** BATCHPGT usa desconto simplificado: 3% fixo se > R$500 | `BATCHPGT.NSN#L360-L375` | `PAGAMENTO.VLR-DESCONTO` | CRÍTICO | Diverge completamente de CALCDSCT |
| BR-012 | Validação de vigência: desconto só aplica se dentro datas início/fim | `CALCDSCT.NSN#L65-L75` | `BENEFICIARIO.GRP-DESCONTO.DT-INICIO/FIM` | ALTO | Beneficiário responsável, não desconto |
| BR-013 | Correção retroativa por IPCA: acumula índices mensais do período | `CALCCORR.NSN#L90-L130` | `PAGAMENTO.VLR-BRUTO` | ALTO | Tabela 2010–2014 hardcoded (desatualizada) |
| BR-014 | **[MISTÉRIO MYS-009]** Processamento batch ordenado por CPF ASC | `BATCHPGT.NSN#L175-L185` | `BENEFICIARIO.CPF` | CRÍTICO | Comentário aviso: "SISTEMAS DOWNSTREAM DEPENDEM" |
| BR-015 | **[MISTÉRIO MYS-010]** Programa RELAUDIT filtra ações 'EX' (exclusão) | `AUDITORIA.ddm#L95-L100` | `AUDITORIA.COD-ACAO` | MÉDIO | Ações EX ocultadas em relatório, visíveis só em SYSAOS |
| BR-016 | **[MISTÉRIO MYS-003]** Campo FATOR-K em PROGRAMA-SOCIAL não documentado | `PROGRAMA-SOCIAL.ddm#L40-L50` | `PROGRAMA-SOCIAL.FATOR-K` (N5.4) | CRÍTICO | Adicionado 2008, nunca usado em programa; identificar propósito |
| BR-017 | **[MISTÉRIO MYS-004]** Cálculo muda completamente em dezembro | `BATCHPGT.NSN#L340-L365` | `PAGAMENTO.COMPETENCIA`, `PAGAMENTO.TIPO-PGTO` | ALTO | Agrega 13º + abono; TIPO_PGTO='D' |
| BR-018 | **[MISTÉRIO MYS-008]** Região código 99 (especial) usa fator padrão 1.0 | `CALCBENF.NSN#L110-L120`, `BATCHPGT.NSN#L200-L210` | `BENEFICIARIO.COD-REGIAO` | MÉDIO | Sem ajuste regional — tratamento privilegiado |
| BR-019 | Validações obrigatórias: beneficiário status='A' e programa status='A' | `CALCBENF.NSN#L75-L100` | `BENEFICIARIO.SIT-BENEFICIARIO`, `PROGRAMA-SOCIAL.SIT-PROGRAMA` | CRÍTICO | Impede cálculo se inativo/suspenso/cancelado |
| BR-020 | Duplicação evitada em batch: não gera pagamento 2× mesma competência | `BATCHPGT.NSN#L245-L255` | `PAGAMENTO.COMPETENCIA` | ALTO | Procura por CPF + competência antes de gerar |

## Exemplo de linha bem preenchida

| ID     | Regra de Negócio                                                                        | Programa Fonte                                   | Campos DDM                                                               | Nível de Risco | Notas                                      |
| ------ | --------------------------------------------------------------------------------------- | ------------------------------------------------ | ------------------------------------------------------------------------ | -------------- | ------------------------------------------ |
| BR-013 | Desconto total não pode exceder 30% do valor bruto, exceto descontos judiciais (tipo J) | `01-arqueologia/legado-sifap/natural-programs/CALCDSCT.NSN#L142-L148` | `PAGAMENTO.VLR-BRUTO`, `PAGAMENTO.VLR-TOTAL-DSCT`, `PAGAMENTO.TIPO-DSCT` | CRÍTICO        | Regra financeira. Tipo 'J' = exceção legal |

## Regras por Categoria

### Cálculos Financeiros

- **BR-001:** Fator regional (27 regiões, 1.0–1.4) — `CALCBENF.NSN#L110-L120`
- **BR-002:** Fator familiar (0–10 dependentes, até +28%) — `CALCBENF.NSN#L120-L145`
- **BR-003:** Fator de renda (5 faixas, 100% → 40%) — `CALCBENF.NSN#L145-L160`
- **BR-004:** [MYS-001] Fator de idade não documentado (65+→1.15, 60+→1.10, <18→1.05) — `BATCHPGT.NSN#L190-L210`
- **BR-005:** 13º salário em dezembro (1/12 × base × região × idade) — `BATCHPGT.NSN#L340-L360`
- **BR-006:** Abono natalino em dezembro (15% para programas tipo 'A') — `BATCHPGT.NSN#L365-L375`
- **BR-007:** [MYS-005] Truncamento via mult×100/÷100 causa perda de centavos — `CALCBENF.NSN#L160`, `CALCDSCT.NSN#L90`
- **BR-008:** Contribuição social (4 faixas: 3% → 9%) — `CALCDSCT.NSN#L35-L50`
- **BR-009:** [MYS-006] Desconto judicial ignora teto 30% — `CALCDSCT.NSN#L60-L80`
- **BR-010:** Teto máximo 30% em descontos (exceto tipo 'J') — `CALCDSCT.NSN#L52-L58`
- **BR-011:** [MYS-002] BATCHPGT usa desconto 3% fixo (diverge de CALCDSCT) — `BATCHPGT.NSN#L360-L375`
- **BR-013:** Correção retroativa por IPCA (acumula índices 2010–2014) — `CALCCORR.NSN#L90-L130`

### Validações de Status

- **BR-019:** Validações obrigatórias (beneficiário='A', programa='A') — `CALCBENF.NSN#L75-L100`
- **BR-020:** Duplicação evitada em batch (CPF + competência único) — `BATCHPGT.NSN#L245-L255`

### Regras de Negócio Temporais

- **BR-005:** 13º em dezembro — `BATCHPGT.NSN#L340-L360`
- **BR-006:** Abono natalino em dezembro — `BATCHPGT.NSN#L365-L375`
- **BR-012:** Vigência de descontos (datas início/fim) — `CALCDSCT.NSN#L65-L75`
- **BR-017:** [MYS-004] Cálculo muda em dezembro (13º + abono) — `BATCHPGT.NSN#L340-L365`

### Operações Críticas de Processamento

- **BR-014:** [MYS-009] Processamento batch ordenado por CPF ASC (dependência downstream) — `BATCHPGT.NSN#L175-L185`
- **BR-015:** [MYS-010] Auditoria: ações 'EX' ocultadas em RELAUDIT — `AUDITORIA.ddm#L95-L100`

### Campos Não Resolvidos (Mistérios)

- **BR-016:** [MYS-003] FATOR-K em PROGRAMA-SOCIAL não documentado (N5.4) — `PROGRAMA-SOCIAL.ddm#L40-L50`
- **BR-018:** [MYS-008] Região 99 (especial) usa fator padrão 1.0 — `CALCBENF.NSN#L110-L120`

## Resumo Estatístico

- **Total de regras encontradas:** 20
- **Regras críticas:** 11 (BR-001, BR-002, BR-003, BR-007, BR-008, BR-009, BR-010, BR-011, BR-016, BR-019)
- **Regras com duplicação:** 2 (BR-002 + BR-005 usam dependentes/idade; BR-007 aparece em 2 programas)
- **Regras sem documentação (escondidas):** 10 (todos os BR- marcados [MYS-XXX])
- **Mistérios mapeados:** 10/10 ✅
- **Easter Eggs encontrados:** 1/3 (Plano Verão 1989–1991 em CALCCORR)

---

## 🔴 Alertas Críticos para Estágio 2

| Alerta | Regra | Ação Necessária |
|--------|-------|-----------------|
| **Divergência de lógica** | BR-011 vs BR-008 | BATCHPGT simplifica (3%) vs CALCDSCT complexo — unificar ou documentar? |
| **Campo não utilizado** | BR-016 | FATOR-K existe mas nunca é usado — entrevistar SENARC |
| **Dependência oculta** | BR-014 | Ordem CPF é crítica para downstream — validar com TL antes de redesenhar scheduler |
| **Perda financeira** | BR-007 | Técnica de truncamento perde ~R$900k/ano — revisar vs PostgreSQL |
| **Fator não documentado** | BR-004 | Idade aplica em BATCHPGT mas não em CALCBENF — qual é oficial? |
| **Auditoria incompleta** | BR-015 | Ações EX ocultadas — pode impedir rastreamento de fraudes |

---

## 📚 Rastreabilidade para Estágio 2

Cada regra marcada [MYS-XXX] deve ter uma **Architectural Decision Record (ADR)** explicando:
1. Por que existe a regra?
2. Qual é o impacto de mudar?
3. Como será implementada na arquitetura moderna?

Exemplo de ADR esperado:
```
# ADR-002: Divergência entre BATCHPGT e CALCDSCT

## Contexto
BR-011: BATCHPGT usa desconto 3% fixo
BR-008: CALCDSCT usa 6 tipos + 4 faixas

## Decisão
Manter CALCDSCT como motor oficial; BATCHPGT será refatorado
para reutilizar DiscountCalculationService.

## Consequências
- Performance pode degradar em batch se não otimizar queries
- Descontos históricos (batch 3%) divergirão de novos (completos)
```

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

