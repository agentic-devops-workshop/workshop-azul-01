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

| ID      | Descrição | Onde Encontrado | Impacto Potencial | Confiança |
| ------- | --------- | --------------- | ----------------- | --------- |
| MYS-001 | Máscara de CPF inconsistente — CPFs com menos de 11 dígitos expõem os primeiros 3 dígitos em vez de ocultar | `CONSBENF.NSN#L152-L166` | Vazamento de dados sensíveis para CPFs curtos (preenchidos com zeros) | ALTA |
| MYS-002 | Eventos de exclusão (ação='EX') são silenciosamente filtrados do relatório de auditoria e nunca são exibidos | `RELAUDIT.NSN#L93-L97` | Exclusões não aparecem na trilha — possível brecha de auditoria/fraude | ALTA |
| MYS-003 | Data padrão de início do relatório de auditoria é hardcoded como 19970101 (1997) quando não informada | `RELAUDIT.NSN#L84-L85` | Consultas sem filtro de data podem retornar volume massivo de registros | MÉDIA |
| MYS-004 | Campo VLR-ABONO existe no DDM PAGAMENTO e é totalizado separadamente, mas não aparece nas linhas de detalhe do RELPGT | `RELPGT.NSN#L149-L157` | Abono pode ser relevante financeiramente mas é invisível no detalhe — só no total geral | MÉDIA |
| MYS-005 | Comentário no CONSBENF menciona "ARQ 150/160" como referência do Map de tela, mas não há arquivo de Map no legado disponível | `CONSBENF.NSN#L10` | Layouts de tela originais perdidos — dificulta reprodução fiel da UI | BAIXA |
| MYS-006 | Relatório de auditoria na saída tela (WRITE) omite campo DESCRICAO que aparece na saída impressora (PRINT) | `RELAUDIT.NSN#L131-L145` | Usuário que consulta em tela não vê a descrição completa do evento | MÉDIA |
| MYS-007 | O RELPGT busca nome do beneficiário a cada registro de pagamento com FIND separado — não há cache nem JOIN | `RELPGT.NSN#L96-L100` | Performance potencialmente ruim em grandes volumes; na migração, usar JOIN SQL | BAIXA |

## Detalhamento dos Mistérios

### MYS-001: Máscara de CPF inconsistente para CPFs curtos

- **Arquivo**: `01-arqueologia/legado-sifap/natural-programs/CONSBENF.NSN#L152-L166`
- **Trecho de código**:

```natural
* MASCARA CPF - FORMATO ***.***.XXX-XX
* NOTA: INCONSISTENCIA CONHECIDA - AS VEZES MOSTRA PRIMEIROS 3
*       DIGITOS AO INVES DOS ULTIMOS. DEPENDE DO TAMANHO DO CPF
*       ARMAZENADO. NAO CORRIGIR SEM APROVACAO DA AUDITORIA.
IF BENEFICIARIO-V.CPF < 10000000000
    MOVE SUBSTR(#CPF-STR,1,3) TO #CPF-P1
    COMPRESS #CPF-P1 '.***.' '***-**' INTO #CPF-MASK LEAVING NO SPACE
```

- **O que esperávamos**: CPFs sempre mascarados da mesma forma, ocultando dados sensíveis
- **O que o código faz**: CPFs com menos de 11 dígitos (< 10 bilhões) mostram os primeiros 3 dígitos; os demais mostram os últimos 5
- **Hipótese do time**: Bug antigo de 2003 nunca corrigido; o comentário diz explicitamente "NAO CORRIGIR SEM APROVACAO DA AUDITORIA"
- **Risco se ignorarmos**: Vazamento parcial de CPF para beneficiários com CPFs curtos — problema de LGPD

---

### MYS-002: Exclusões filtradas silenciosamente da trilha de auditoria

- **Arquivo**: `01-arqueologia/legado-sifap/natural-programs/RELAUDIT.NSN#L93-L97`
- **Trecho de código**:

```natural
* FILTRO ACAO - EXCLUSOES NAO SAO EXIBIDAS
IF AUDITORIA-V.ACAO = 'EX'
    ADD 1 TO #QTD-FILTRADOS
    ESCAPE TOP
END-IF
```

- **O que esperávamos**: Trilha de auditoria mostra todos os eventos, inclusive exclusões
- **O que o código faz**: Exclui (ironia) as exclusões do relatório — elas contam em #QTD-FILTRADOS mas nunca são exibidas
- **Hipótese do time**: Pode ser intencional (para evitar poluição visual) ou uma tentativa de ocultar operações destrutivas
- **Risco se ignorarmos**: Auditores do TCU podem não ver registros deletados — brecha de conformidade

---

### MYS-003: Data default hardcoded 19970101

- **Arquivo**: `01-arqueologia/legado-sifap/natural-programs/RELAUDIT.NSN#L84-L85`
- **Trecho de código**:

```natural
IF #DT-INI = 0
  MOVE 19970101 TO #DT-INI
END-IF
```

- **O que esperávamos**: Default razoável (ex.: último mês) ou erro quando data não informada
- **O que o código faz**: Assume 01/01/1997 — busca potencialmente 29 anos de eventos
- **Hipótese do time**: 1997 é a data de implantação do SIFAP; o default garante que nada seja perdido
- **Risco se ignorarmos**: Relatório pode ficar extremamente lento sem filtro de data

---

### MYS-004: VLR-ABONO totalizado à parte mas ausente do detalhe

- **Arquivo**: `01-arqueologia/legado-sifap/natural-programs/RELPGT.NSN#L149-L157`
- **Trecho de código**:

```natural
ADD PAGAMENTO-V.VLR-ABONO TO #TOT-ABONO
...
PRINT 'TOTAL ABONO:' #TOT-ABONO
```

- **O que esperávamos**: VLR-ABONO aparecer nas linhas de detalhe do relatório como os outros valores
- **O que o código faz**: Acumula o abono no total geral mas não imprime por linha
- **Hipótese do time**: Abono pode ter sido adicionado depois (2010, por Jose Ferreira) e nunca integrado ao detalhe
- **Risco se ignorarmos**: Valor de abono por beneficiário fica invisível — dificulta auditoria individual

---

### MYS-005: Referência a MAP "CONSBENF-M01" e "ARQ 150/160" sem arquivo correspondente

- **Arquivo**: `01-arqueologia/legado-sifap/natural-programs/CONSBENF.NSN#L10`
- **Trecho de código**:

```natural
* UTILIZA MAP P/ LAYOUT TELA - ARQ 150/160
INPUT USING MAP 'CONSBENF-M01'
```

- **O que esperávamos**: Arquivo de MAP disponível no legado
- **O que o código faz**: Tenta usar MAP; se falha (*ERROR-NR NE 0), cai numa tela alternativa em texto puro
- **Hipótese do time**: Maps estavam em biblioteca separada do Natural e não foram migrados para o kit
- **Risco se ignorarmos**: Impacto baixo — na modernização web, o layout será totalmente refeito

---

### MYS-006: Saída tela vs impressora com campos diferentes

- **Arquivo**: `01-arqueologia/legado-sifap/natural-programs/RELAUDIT.NSN#L131-L145`
- **Trecho de código**:

```natural
IF #TIPO-SAIDA = 'T'
    WRITE ... AUDITORIA-V.CHAVE-REF
ELSE
    PRINT ... AUDITORIA-V.CHAVE-REF ' ' AUDITORIA-V.DESCRICAO
END-IF
```

- **O que esperávamos**: Mesmas informações em ambas saídas
- **O que o código faz**: Na tela omite DESCRICAO; na impressora inclui
- **Hipótese do time**: Limitação de largura do terminal 3270 (80 colunas) vs impressora (120+)
- **Risco se ignorarmos**: Na web, não há restrição — exibir descrição sempre

---

### MYS-007: FIND sem cache para nome de beneficiário no loop do RELPGT

- **Arquivo**: `01-arqueologia/legado-sifap/natural-programs/RELPGT.NSN#L96-L100`
- **Trecho de código**:

```natural
FIND BENEFICIARIO-V WITH CPF = PAGAMENTO-V.CPF-BENEF
    MOVE SUBSTR(BENEFICIARIO-V.NOME,1,30) TO #NOME-BENEF
    MOVE BENEFICIARIO-V.UF TO #UF-BENEF
END-FIND
```

- **O que esperávamos**: Algum tipo de cache ou leitura em batch
- **O que o código faz**: FIND individual para cada registro de pagamento — N+1 clássico
- **Hipótese do time**: Pattern N+1 aceitável no Adabas pelo design do cursor, mas ineficiente em SQL
- **Risco se ignorarmos**: Na migração para PostgreSQL, deve ser substituído por JOIN

## Easter Eggs

> Dica: existem **3 easter eggs** escondidos no código legado. Registre aqui os que encontrar:

1. [ ] Easter Egg 1: \_\_\_
2. [ ] Easter Egg 2: \_\_\_
3. [ ] Easter Egg 3: \_\_\_

## Resumo

- Total de mistérios encontrados: **7**
- Confiança alta: **2** (MYS-001, MYS-002)
- Confiança média: **3** (MYS-003, MYS-004, MYS-006)
- Confiança baixa: **2** (MYS-005, MYS-007)
- Easter eggs encontrados: **0** / 3

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

