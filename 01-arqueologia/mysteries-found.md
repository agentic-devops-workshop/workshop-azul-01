<!-- markdownlint-disable MD013 MD025 MD026 MD028 MD029 MD034 MD040 MD051 MD060 -->

# Mistérios Encontrados — SIFAP Legado

![ESTÁGIO 01 Arqueologia](https://img.shields.io/badge/ESTÁGIO-01%20Arqueologia-F25022?style=for-the-badge) ![TIPO Worksheet](https://img.shields.io/badge/TIPO-Worksheet-1A1A1A?style=for-the-badge) ![PREENCHA Durante S1](https://img.shields.io/badge/PREENCHA-Durante%20S1-737373?style=for-the-badge)

> 🗺 **Você está aqui:** [Kit PT-BR](../README.md) → [Estágio 1](README.md) → **mysteries-found**

> **Para quem é isto?** Este é um **artefato preenchido pelo time** durante o Estágio 1 (Arqueologia).
>
> **O que você terá ao final do estágio:**
>
> 1. Este documento totalmente preenchido com os dados reais do legado SIFAP
> 2. Rastreabilidade para `01-arqueologia/legado-sifap/` (programas `.NSN` e DDMs)
> 3. Base de evidência usada nas EARS do Estágio 2 (`source_legacy:`)
>
> 📘 **Guia passo a passo:** [`GUIDE.md`](GUIDE.md).


> Registre aqui toda lógica, comportamento ou código que o time não conseguiu explicar.
> "Mistérios" são trechos de código sem documentação, com lógica não-óbvia ou que parecem workarounds.
>
> **Cota mínima para passar pelo portão do Estágio 2:** 5 mistérios documentados.

## O que conta como "mistério"?

- Código que faz algo inesperado sem comentário explicando por quê
- Valores hardcoded sem explicação (números mágicos)
- Lógica condicional que parece um workaround ou gambiarra
- Campos no DDM que não são usados por nenhum programa
- Programas que existem mas não são chamados por ninguém
- Comportamento diferente entre o que a documentação diz e o que o código faz
- Easter eggs deixados pelos desenvolvedores originais

## Níveis de Confiança

| Nível     | Significado                                         |
| --------- | --------------------------------------------------- |
| **ALTA**  | Temos certeza de que há algo estranho aqui          |
| **MÉDIA** | Parece suspeito, mas pode ter explicação            |
| **BAIXA** | Pode ser intencional, mas não conseguimos confirmar |

## Mistérios Catalogados

> **Contribuição Par 2 (Arquitetura — EA + SA):** 22 mistérios extraídos dos 3 batches.

| ID      | Descrição | Onde Encontrado | Impacto Potencial | Confiança |
| ------- | --------- | --------------- | ----------------- | --------- |
| MYS-PGT-01 | Cabeçalho promete `CALLNAT CALCBENF`/`CALCDSCT`, mas todo o cálculo está inline no programa | `BATCHPGT.NSN#L14` + ausência de CALLNAT | Divergência entre código documentado e executado; outros programas podem usar CALCBENF "verdadeiro" e produzir resultados diferentes | ALTA |
| MYS-PGT-02 | Comentário "OTIMIZ ORD CPF (1999)" + "SISTEMAS DOWNSTREAM DEPENDEM DESTA ORDENACAO" — mas nem CON nem REL dependem da ordem | `BATCHPGT.NSN#L6, L178-L179` | Existe consumidor downstream não mapeado | ALTA |
| MYS-PGT-03 | `#TAB-REG` tem 27 posições mas só 1..25 são consultadas — UFs 26/27 caem em `ELSE 1.0000` | `BATCHPGT.NSN#L124-L150, L240-L244` | Beneficiários de DF (26?) e EX (27?) recebem fator padrão sem decisão de negócio | ALTA |
| MYS-PGT-04 | Truncamento manual `(× 100) / 100` (não arredondamento) — soma de centavos diverge do banco | `BATCHPGT.NSN#L284-L285` | Discrepância contábil acumulada; relaciona-se com MYS-CON-02 e MYS-REL-01 | ALTA |
| MYS-PGT-05 | Campo `RENDA-MAX` da view `PROGRAMA-V` é declarado mas **nunca consultado** | `BATCHPGT.NSN#L49` + ausência de uso | Beneficiários acima do teto de renda do programa não são bloqueados aqui | ALTA |
| MYS-PGT-06 | Idade calculada só por ano (`#ANO − #ANO-NASC`), sem mês/dia | `BATCHPGT.NSN#L236-L237` | Beneficiário que faz 65 em fevereiro já recebe fator de idoso em janeiro | MÉDIA |
| MYS-PGT-07 | Não há `ON ERROR` global; erro de I/O aborta sem registrar em tabela de log | `BATCHPGT.NSN` (ausência) | Falha silenciosa em meio ao lote; difícil retomar | MÉDIA |
| MYS-PGT-08 | `#LOG-WORK` / `#LOG-ERRO` declarados mas nunca gravados em arquivo | `BATCHPGT.NSN#L100-L102` | Log fica só no `WRITE` console | BAIXA |
| MYS-CON-01 | Conciliação compara retorno contra `VLR-LIQUIDO`, mas banco recebe valor pago ao beneficiário (também líquido? confirmar) | `BATCHCON.NSN#L155` | Possível inversão de campo causa falso match/divergência | MÉDIA |
| MYS-CON-02 | Tolerância de R$ 0,01 sugere problema crônico de arredondamento — provável causa em PGT | `BATCHCON.NSN#L160` | Cascata do MYS-PGT-04 | ALTA |
| MYS-CON-03 | `INPUT` pede competência e arquivo, mas nada valida coerência (arquivo CNAB pode ser de outro mês) | `BATCHCON.NSN#L93-L96` | Operador pode conciliar mês errado sem aviso | ALTA |
| MYS-CON-04 | `DT-PGTO` vem do CNAB como `A8`; cast para `N8` sem validar formato (AAAAMMDD vs DDMMAAAA) | `BATCHCON.NSN#L134` | Datas inválidas gravadas silenciosamente | MÉDIA |
| MYS-CON-05 | Apenas códigos CNAB 00/01/02 são tratados; CNAB 240 BB tem dezenas de códigos — demais viram só log | `BATCHCON.NSN#L171-L199` | Devoluções/estornos com códigos específicos ficam invisíveis | ALTA |
| MYS-CON-06 | `COD-BANCO = 1` hardcoded para retorno BB — não há cadastro de bancos | `BATCHCON.NSN#L176` | Multibanco impossível sem refatorar | MÉDIA |
| MYS-CON-07 | Bloco "Banco Real" comentado desde 2007 (aquisição pelo Santander) | `BATCHCON.NSN#L206-L224` | Código morto há 19 anos — remover ou ressuscitar? | BAIXA |
| MYS-CON-08 | Em divergência, auditoria é gravada **mas o pagamento não muda de status** (fica em `'G'`) | `BATCHCON.NSN#L160-L167` | Divergência sem ação operacional — pagamento "preso" no estado inicial | ALTA |
| MYS-REL-01 | Comentário explícito: *"ARREDONDAMENTO DIFERE DO CALCBENF (ROUND VS TRUNCATE)"* | `BATCHREL.NSN#L136` | Confirma inconsistência matemática suspeita em PGT/CON | ALTA |
| MYS-REL-02 | Agrupamento de UFs por intervalo de `COD-REGIAO` (1-5/6-10/11-15/16-20/demais) é simplificado demais para 27 UFs | `BATCHREL.NSN#L116-L133` | Mapeamento por faixa contínua frágil | MÉDIA |
| MYS-REL-03 | `FIND BENEFICIARIO` por CPF para cada pagamento — N+1 reads | `BATCHREL.NSN#L112-L114` | Performance ruim com base grande | MÉDIA |
| MYS-REL-04 | `#MAX-LINHAS`, `#LINHA`, `#PAG` declarados — controle de paginação real não implementado | `BATCHREL.NSN#L60-L62, L70-L72` | Quebra de página falha em listagem longa | BAIXA |
| MYS-REL-05 | `NONE → MOVE 1 TO #IDX-STS` mistura status desconhecido com bucket "Gerado" | `BATCHREL.NSN#L157-L158` | Totais por status mascarados | MÉDIA |
| MYS-REL-06 | `INPUT 'COMPETENCIA RELATORIO:'` interativo num programa chamado BATCH — provavelmente rodava via JCL com parâmetro | `BATCHREL.NSN#L102` | Como migrar de JCL para scheduler moderno? | BAIXA |

## Detalhamento dos Mistérios (alta prioridade)

### MYS-PGT-01 [↔ INC-003 + MYS-003]: Cabeçalho mente sobre CALLNATs — regras críticas de cálculo não documentadas

- **Arquivo**: `01-arqueologia/legado-sifap/natural-programs/BATCHPGT.NSN#L14`
- **Trecho de código**:

```natural
* CHAMA CALCBENF E CALCDSCT - ARQ 150/160/155
```

- **O que esperávamos**: ver `CALLNAT 'CALCBENF'` e `CALLNAT 'CALCDSCT'` no corpo do programa.
- **O que o código faz**: nenhum CALLNAT é executado. Todo o cálculo de fatores (regional/familiar/renda/idade), 13º, abono e desconto está **inline** no programa.
- **Hipótese do time**: o programa foi otimizado para evitar overhead de CALLNAT, e o cabeçalho nunca foi atualizado — OU os subprogramas existem e são consumidos por outros programas que ainda chamam o CALLNAT "verdadeiro".
- **Risco se ignorarmos**: na modernização, podemos reescrever só o cálculo do BATCHPGT e descobrir tarde que `CALCBENF.NSN` tem regras diferentes consumidas por outros 5+ programas.

---

### MYS-PGT-04 / MYS-CON-02 / MYS-REL-01 [↔ MYS-005 + INC-004]: Inconsistência de arredondamento — perda sistemática de centavos

- **Arquivos**:
  - `01-arqueologia/legado-sifap/natural-programs/BATCHPGT.NSN#L284-L285` (truncamento)
  - `01-arqueologia/legado-sifap/natural-programs/BATCHCON.NSN#L160` (tolerância 0,01)
  - `01-arqueologia/legado-sifap/natural-programs/BATCHREL.NSN#L136-L139` (arredondamento bancário +0,005)
- **Trecho de código (PGT)**:

```natural
COMPUTE #VLR-TEMP = #VLR-BENF * 100
COMPUTE #VLR-BENF = #VLR-TEMP / 100
```

- **Trecho de código (REL)**:

```natural
* ARREDONDAMENTO DIFERE DO CALCBENF (ROUND VS TRUNCATE)
COMPUTE #VLR-BRUTO = #VLR-BRUTO + 0.005
```

- **O que esperávamos**: a mesma regra de arredondamento aplicada em toda a cadeia (geração, relatório, conciliação).
- **O que o código faz**: três regras diferentes para a mesma grandeza monetária. CON existe com tolerância de 1 centavo justamente porque PGT e REL discordam.
- **Hipótese do time**: ninguém ousou consertar porque mudar uma das três rotinas quebra a reconciliação acumulada de anos.
- **Risco se ignorarmos**: na modernização, "consertar" para arredondamento ABNT/bancário muda totais históricos e pode disparar conformidade contábil/TCU.

---

### MYS-CON-08 [↔ MYS-010]: Divergência não muda status do pagamento — evento de auditoria invisível nos relatórios

- **Arquivo**: `01-arqueologia/legado-sifap/natural-programs/BATCHCON.NSN#L160-L167`
- **O que esperávamos**: divergência de valor gera status específico (ex.: `'V'` Divergente) para acionar tratamento operacional.
- **O que o código faz**: grava auditoria `'DV'` mas o pagamento permanece com `STATUS-PGTO = 'G'`. Sem visibilidade no relatório.
- **Hipótese do time**: divergências são tratadas manualmente pelo operador via consulta à auditoria — não há fluxo automatizado.
- **Risco se ignorarmos**: pagamentos divergentes podem ficar em "Gerado" para sempre.

---

### MYS-PGT-02 [↔ MYS-009]: Quem é o "sistema downstream"? — ordem por CPF como dependência oculta

- **Arquivo**: `01-arqueologia/legado-sifap/natural-programs/BATCHPGT.NSN#L6, L178-L179`
- **Trecho**:

```natural
* ALTERADO: 15/01/2000 - CARLOS SILVA - OTIMIZ ORD CPF
* LEITURA EM ORDEM ALFABETICA POR CPF (OTIMIZACAO 1999)
* NOTA: SISTEMAS DOWNSTREAM DEPENDEM DESTA ORDENACAO
```

- **O que esperávamos**: identificar `BATCHCON` ou `BATCHREL` como consumidor dependente de ordem.
- **O que o código faz**: nenhum dos 3 batches do Par 2 depende da ordem por CPF.
- **Hipótese do time**: existe um programa de remessa CNAB (não atribuído ao Par 2) que monta o arquivo de envio ao BB já em ordem por CPF para casar com o retorno.
- **Risco se ignorarmos**: trocar a ordem na modernização quebra integração bancária silenciosamente.

---

## Easter Eggs

> Dica: existem **3 easter eggs** escondidos no código legado. Registre aqui os que encontrar:

1. [ ] Easter Egg 1 (EGG-001): a investigar em outros programas
2. [ ] Easter Egg 2 (EGG-002): a investigar em programas de validação (`VAL*.NSN` — Par 4)
3. [x] **Easter Egg 3 (EGG-003) — ENCONTRADO** → `MYS-CON-07`: bloco de integração com o **Banco Real** comentado em `BATCHCON.NSN#L206-L224` desde 2007 (banco adquirido pelo Santander). Código morto há 19 anos.

## Resumo

- Total de mistérios encontrados (Par 2): **22**
- Confiança alta: **10** (MYS-PGT-01, 02, 03, 04, 05 · MYS-CON-02, 03, 05, 08 · MYS-REL-01)
- Confiança média: **8** (MYS-PGT-06, 07 · MYS-CON-01, 04, 06 · MYS-REL-02, 03, 05)
- Confiança baixa: **4** (MYS-PGT-08 · MYS-CON-07 · MYS-REL-04, 06)
- Easter eggs encontrados: **1** / 3 (EGG-003 = MYS-CON-07)
- Checklist confirmados: MYS-002 ✅ · MYS-003 ✅ · MYS-004 ✅ · MYS-005 ✅ · MYS-009 ✅ · MYS-010 ✅ · INC-001 ✅ · INC-003 ✅ · INC-004 ✅

---

### Continuar a leitura

<table width="100%">
<tr>
<td width="50%" valign="top" align="left">
<sub><strong>← ANTERIOR</strong></sub><br/>
<a href="mysteries-checklist.md"><strong>mysteries-checklist.md</strong></a><br/>
<sub>Lista do que procurar.</sub>
</td>
<td width="50%" valign="top" align="right">
<sub><strong>PRÓXIMO →</strong></sub><br/>
<a href="discovery-report.md"><strong>discovery-report.md</strong></a><br/>
<sub>Síntese final.</sub>
</td>
</tr>
</table>

<sub>↑ <a href="README.md">Voltar ao Kit PT-BR</a></sub>

