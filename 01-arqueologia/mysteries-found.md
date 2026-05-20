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
| MYS-001 | Constante mágica 0.347215 no cálculo do FATOR-K | `CADPROG.NSN#L87` | CRÍTICO — valor base de todos os programas calculado com esta constante desconhecida | ALTA |
| MYS-002 | Status 'S' com semântica dupla: idoso >75 (programa) vs. Suspenso (DDM) | `CADBENEF.NSN#L167`, `BENEFICIARIO.ddm#L52` | ALTO — migração pode interpretar registros de idosos como "suspensos" e viceversa | ALTA |
| MYS-003 | HASH-DIGITAL (SHA-256) declarado no DDM mas com status "NAO IMPL" desde 2005 | `BENEFICIARIO.ddm#L76` | MÉDIO — campo ocupa espaço mas nunca foi preenchido; dado fantasma na base | ALTA |
| MYS-004 | FATOR-K inserido em 2008 "por solicitação SENARC" sem documentação de regra normativa | `PROGRAMA-SOCIAL.ddm#L39-L43` | CRÍTICO — sem lei ou decreto de referência; cálculo pode ser ilegal ou desatualizado | ALTA |
| MYS-005 | Divergência no domínio de parentesco: programa usa FI/CO/IR/OU; DDM define FI/CJ/NT/TU | `CADDEPEND.NSN#L72`, `BENEFICIARIO.ddm#L65` | ALTO — registros históricos podem ter parentesco inválido pelo domínio atual do programa | ALTA |
| MYS-006 | Limite de 5 dependentes no programa vs. 10 ocorrências no DDM (PE group) | `CADDEPEND.NSN#L63`, `BENEFICIARIO.ddm#L61` | MÉDIO — pode haver registros com 6-10 dependentes na base que o programa nunca consegue exibir | MÉDIA |
| MYS-007 | COD-PROGRAMA é N4 no programa (numérico) mas A4 no DDM (alfanumérico) | `CADBENEF.NSN#L44`, `BENEFICIARIO.ddm#L48` | ALTO — conversão de tipo pode truncar/corromper códigos alfanuméricos existentes | ALTA |
| MYS-008 | CADPROG não tem operação de Alteração (só I e C) — quem altera programas ativos? | `CADPROG.NSN#L48-L56` | ALTO — módulo responsável pela alteração não foi identificado; regras de transição de status desconhecidas | MÉDIA |
| MYS-009 | Campo COD-ELEGIBILIDADE (A5) no programa mas não há tabela decodificadora no DDM | `CADPROG.NSN#L18`, `PROGRAMA-SOCIAL.ddm#L47` | ALTO — elegibilidade é critério de acesso; sem tabela de decodificação, regras de acesso são opacas | MÉDIA |
| MYS-010 | NOME-MAE obrigatório no DDM (BENEFICIARIO.AD) mas não aparece nos campos de entrada do CADBENEF | `BENEFICIARIO.ddm#L17`, `CADBENEF.NSN#L80-L95` | MÉDIO — campo obrigatório nunca preenchido via este programa; como é populado? | BAIXA |

## Detalhamento dos Mistérios

### MYS-001: Constante Mágica 0.347215 no Cálculo do FATOR-K

- **Arquivo**: `01-arqueologia/legado-sifap/natural-programs/CADPROG.NSN#L87-L88`
- **Trecho de código**:

```natural
COMPUTE #FATOR-K = 1.00 + (#FATOR-REAJ * 0.347215)
COMPUTE #VLR-CALC = #VLR-BASE * #FATOR-K
```

- **O que esperávamos**: Fator de reajuste aplicado diretamente ou com percentual documentado
- **O que o código faz**: Multiplica o fator de reajuste por uma constante `0.347215` antes de calcular o valor base do programa
- **Hipótese do time**: Possível constante atuarial ou fator de deflação derivado de portaria ministerial de 2003; a alteração foi feita por Marcos Ribeiro em 05/07/2003 mas sem referência normativa no código
- **Risco se ignorarmos**: Todos os valores-base de programas sociais serão calculados incorretamente na migração — impacto financeiro direto em milhões de beneficiários

---

### MYS-002: Status 'S' com Semântica Dupla — Idoso vs. Suspenso

- **Arquivo**: `01-arqueologia/legado-sifap/natural-programs/CADBENEF.NSN#L167-L169` e `01-arqueologia/legado-sifap/adabas-ddms/BENEFICIARIO.ddm#L52`
- **Trecho de código**:

```natural
* AJUSTE P/ BENEFICIARIOS ACIMA DE 75 ANOS
IF #IDADE > 75
  MOVE 'S' TO #STATUS
END-IF
```

- **O que esperávamos**: Status 'S' = Suspenso (conforme DDM: `CE SIT-BENEFICIARIO A=ATV S=SUSP`)
- **O que o código faz**: CADBENEF atribui 'S' para beneficiários com idade >75, tratando como categoria etária especial, não como suspensão
- **Hipótese do time**: Mudança de semântica não propagada ao DDM; provável ajuste de 2011 (Jose Ferreira) que reaproveitou o código 'S' com novo significado sem atualizar a documentação
- **Risco se ignorarmos**: Migração interpretará todos os idosos >75 como "suspensos" e poderá bloquear pagamentos; ou vice-versa, suspensões reais serão tratadas como casos de idosos

---

### MYS-003: Campo HASH-DIGITAL Declarado mas Nunca Implementado

- **Arquivo**: `01-arqueologia/legado-sifap/adabas-ddms/BENEFICIARIO.ddm#L76`
- **Trecho de código**:

```natural
  1  FD  HASH-DIGITAL           A       64     -     SHA-256 TEMPLATE (NAO IMPL)
```

- **O que esperávamos**: Campo de biometria funcional após 20 anos
- **O que o código faz**: Campo existe no DDM desde 2005 (Adilson Batista) mas nunca foi preenchido por nenhum programa Natural identificado
- **Hipótese do time**: Projeto de biometria foi descontinuado; campo ficou como esqueleto no DDM; nenhum dos 15 programas faz STORE neste campo
- **Risco se ignorarmos**: Baixo — dado nunca foi coletado; pode ser descartado com segurança na migração

---

### MYS-004: FATOR-K Inserido por "Solicitação SENARC" sem Portaria ou Decreto

- **Arquivo**: `01-arqueologia/legado-sifap/adabas-ddms/PROGRAMA-SOCIAL.ddm#L39-L43`
- **Trecho de código**:

```natural
  1  BG  FATOR-K                N        5.4   -     FATOR CORRECAO ESPECIAL
*                                                     >>> NAO DOCUMENTADO <<<
*                                                     INSERIDO AGO/2008 POR ADILSON
*                                                     "ATENDE SOLICITACAO SENARC"
*                                                     SEM MAIS DETALHES NO CHAMADO
```

- **O que esperávamos**: Campo com documentação de origem normativa (lei, decreto, portaria)
- **O que o código faz**: Campo inserido em 2008 sem qualquer referência normativa; comentário do próprio DBA alerta para ausência de documentação
- **Hipótese do time**: Pode ser fator de correção monetária ou ajuste regional; a SENARC (Secretaria Nacional de Renda de Cidadania) solicitou mas o chamado não tem detalhes técnicos
- **Risco se ignorarmos**: Crítico — risco de auditoria do TCU; se o fator não tem base legal, o sistema pode estar pagando valores incorretos há ~18 anos

---

### MYS-005: Divergência de Domínio de Parentesco entre Código e DDM

- **Arquivo**: `01-arqueologia/legado-sifap/natural-programs/CADDEPEND.NSN#L72` e `01-arqueologia/legado-sifap/adabas-ddms/BENEFICIARIO.ddm#L65`
- **Trecho de código**:

```natural
* Programa CADDEPEND:
IF #PARENTESCO NE 'FI' AND #PARENTESCO NE 'CO'
    AND #PARENTESCO NE 'IR' AND #PARENTESCO NE 'OU'
  WRITE 'PARENTESCO INVALIDO'

* DDM BENEFICIARIO campo DE:
2  DE  PARENTESCO  A  2  -  FI=FILHO CJ=CONJ NT=NETO TU=TUTEL
```

- **O que esperávamos**: Domínio consistente entre código e DDM
- **O que o código faz**: Programa aceita CO/IR/OU; DDM documenta CJ/NT/TU — 3 dos 4 códigos são diferentes
- **Hipótese do time**: O DDM foi atualizado em 2008 mas o programa CADDEPEND não foi sincronizado; registros históricos com CJ/NT/TU nunca passaram pela validação do programa
- **Risco se ignorarmos**: DE/PARA de dados obrigatório na migração; relatórios de composição familiar estão produzindo dados inconsistentes

---

### MYS-006: Limite de 5 Dependentes no Código vs. 10 no DDM

- **Arquivo**: `01-arqueologia/legado-sifap/natural-programs/CADDEPEND.NSN#L63` e `01-arqueologia/legado-sifap/adabas-ddms/BENEFICIARIO.ddm#L61`
- **Trecho de código**:

```natural
IF #NUM-DEP > 5
  WRITE 'LIMITE DE DEPENDENTES ATINGIDO'
  ESCAPE BOTTOM
END-IF
```

- **O que esperávamos**: Limite igual entre código e DDM
- **O que o código faz**: Programa bloqueia inclusão após o 5º dependente; DDM suporta PE group com até 10 ocorrências
- **Hipótese do time**: Limite de tela ou regra de negócio de um programa específico; pode haver beneficiários com 6-10 dependentes inseridos por outros canais (batch ou sistema anterior)
- **Risco se ignorarmos**: Médio — consulta ao banco pode revelar registros com >5 dependentes que o sistema nunca consegue exibir completamente

---

### MYS-007: Divergência de Tipo em COD-PROGRAMA — N4 no Código vs. A4 no DDM

- **Arquivo**: `01-arqueologia/legado-sifap/natural-programs/CADBENEF.NSN#L44` e `01-arqueologia/legado-sifap/adabas-ddms/BENEFICIARIO.ddm#L48`
- **Trecho de código**:

```natural
* Programa:
2 COD-PROGRAMA  (N4)    ← numérico

* DDM:
1  CA  COD-PROGRAMA  A  4  -  COD DO PROG SOCIAL (PE)
                              ↑ alfanumérico
```

- **O que esperávamos**: Tipo consistente entre a VIEW do programa e o DDM físico
- **O que o código faz**: O programa declara N4 (numérico 4 dígitos) mas o DDM registra A4 (alfanumérico 4 posições)
- **Hipótese do time**: O Adabas faz conversão implícita; os programas só trabalham com códigos numéricos mas o DDM permite alfanuméricos para programas especiais criados por outros canais
- **Risco se ignorarmos**: Alto — se houver programas com código alfanumérico (ex: "BPC1"), a VIEW N4 trunca/corrompe silenciosamente

---

### MYS-008: Nenhum Módulo de Alteração de Programa Identificado

- **Arquivo**: `01-arqueologia/legado-sifap/natural-programs/CADPROG.NSN#L48-L56`
- **Trecho de código**:

```natural
IF #OPER NE 'I' AND #OPER NE 'C'
  WRITE 'OPERACAO INVALIDA'
  ESCAPE ROUTINE
END-IF
```

- **O que esperávamos**: Operação de Alteração (A) ou Exclusão (E) para governança do programa
- **O que o código faz**: CADPROG aceita apenas I (Inclusão) e C (Consulta); não há operação de alteração ou exclusão
- **Hipótese do time**: Alterações de programa são feitas diretamente na base via ferramenta Adabas (utilitário ADABAS Online System) ou por programa não identificado nos 15 NSN analisados
- **Risco se ignorarmos**: Alto — regras de transição de status de programa (A→I, I→E) são desconhecidas; sistema moderno precisa implementar governança que não existe no legado

---

### MYS-009: COD-ELEGIBILIDADE sem Tabela de Decodificação

- **Arquivo**: `01-arqueologia/legado-sifap/natural-programs/CADPROG.NSN#L18` e `01-arqueologia/legado-sifap/adabas-ddms/PROGRAMA-SOCIAL.ddm#L47`
- **Trecho de código**:

```natural
* Programa:
2 COD-ELEGIBILIDADE  (A5)   /* sem comentário */

* DDM:
1  CD  IND-EXIGE-FILHOS   A  1  -  S/N
1  CE  QTD-MIN-FILHOS     N  2  -  MINIMO FILHOS
... (demais flags de elegibilidade sem tabela de domínio de COD-ELEG)
```

- **O que esperávamos**: Tabela decodificadora ou enumeration de COD-ELEGIBILIDADE
- **O que o código faz**: O campo A5 é gravado como-está sem validação de domínio; o DDM tem campos de elegibilidade detalhados mas nenhum mapeia explicitamente para os valores de COD-ELEGIBILIDADE
- **Hipótese do time**: COD-ELEGIBILIDADE pode ser uma concatenação de flags (ex: "SF001" = Sim-Filhos + código de faixa), decodificada em VALELEG.NSN — programa fora do escopo do Par 1
- **Risco se ignorarmos**: Alto — critérios de acesso ao programa são opacos; RE não consegue escrever EARS de elegibilidade sem isso

---

### MYS-010: NOME-MAE Obrigatório no DDM mas Ausente no Formulário de Cadastro

- **Arquivo**: `01-arqueologia/legado-sifap/adabas-ddms/BENEFICIARIO.ddm#L17` e `01-arqueologia/legado-sifap/natural-programs/CADBENEF.NSN#L80-L95`
- **Trecho de código**:

```natural
* DDM:
1  AD  NOME-MAE  A  60  -  NOME DA MAE (OBRIGAT)

* Tela INPUT do CADBENEF (sem campo NOME-MAE):
INPUT 'SIFAP - CADASTRO DE BENEFICIARIO' /
      'CPF...........:' #CPF /
      'NOME..........:' #NOME /
      'DT NASCIMENTO.:' #DT-NASC ...
      * NOME-MAE não aparece aqui
```

- **O que esperávamos**: Campo NOME-MAE presente na tela de cadastro
- **O que o código faz**: DDM marca NOME-MAE como obrigatório (`OBRIGAT`) mas CADBENEF.NSN não coleta nem grava este campo
- **Hipótese do time**: Campo pode ser populado na integração com outro sistema (CadÚnico?); ou houve modificação posterior no DDM sem atualizar o programa; ou CADBENEF é apenas um dos formulários de entrada
- **Risco se ignorarmos**: Baixo-Médio — campo com status "obrigatório" pode estar nulo em todos os registros; consultas que filtram por NOME-MAE retornarão zero resultados

---

> Copie o bloco acima para cada mistério encontrado.

## Easter Eggs

> Dica: existem **3 easter eggs** escondidos no código legado. Registre aqui os que encontrar:

1. [ ] Easter Egg 1: Não identificado nos 3 programas do Par Visão — investigar CALCBENF.NSN e VALBENEF.NSN (Par 3 e 4)
2. [ ] Easter Egg 2: Não identificado — verificar comentários de rodapé dos programas batch
3. [ ] Easter Egg 3: Não identificado — verificar DDMs por campos com nomes inusitados

## Resumo

- Total de mistérios encontrados: **10** (MYS-001 a MYS-010)
- Confiança alta: **7** (MYS-001, 002, 003, 004, 005, 007, 008)
- Confiança média: **2** (MYS-006, MYS-009)
- Confiança baixa: **1** (MYS-010)
- Easter eggs encontrados: **0** / 3 (nenhum nos 3 programas do Par Visão)

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

