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

| MYS-001 | Fator de idade não documentado em CALCBENF | BATCHPGT.NSN + CALCBENF.NSN | Alto — fator aplicado apenas no batch (65+=1.15, 60+=1.10, <18=1.05) | ALTA |
| MYS-002 | Desconto fixo de 3% hardcoded diverge de CALCDSCT | BATCHPGT.NSN vs CALCDSCT.NSN | Alto — cálculo inconsistente entre batch e programa de descontos | ALTA |
| MYS-003 | Campo FATOR-K não documentado em PROGRAMA-SOCIAL | PROGRAMA-SOCIAL.ddm (N5.4, adicionado 2008) | Crítico — campo usado em cálculos conforme comentário mas sem especificação | ALTA |
| MYS-004 | Lógica de 13º + abono muda cálculo em dezembro | BATCHPGT.NSN (MES=12) | Alto — 13º é 1/12 do base; abono 15% só para programas tipo 'A' | ALTA |
| MYS-005 | Truncamento de centavos via multiplicação/divisão | BATCHPGT.NSN, CALCBENF.NSN, CALCDSCT.NSN | Médio — acúmulo de erros de arredondamento em 180M registros | ALTA |
| MYS-006 | Desconto judicial ignora teto de 30% | CALCDSCT.NSN (linha TIPO='J') | Alto — exceção sem justificativa documentada | ALTA |
| MYS-007 | Cálculo simplificado no batch (3% fixo) vs função CALCDSCT complexa | BATCHPGT.NSN linha "CALC DESCONTOS SIMPLIFICADO" | Crítico — dois motores de cálculo diferentes | ALTA |
| MYS-008 | Região 99 usa fator padrão mas não há validação/skip | CALCBENF.NSN + BATCHPGT.NSN | Médio — região especial não claramente documentada | MÉDIA |
| MYS-009 | Processamento ordenado por CPF com dependência de sistemas downstream | BATCHPGT.NSN (comentário linha ~180) | Muito alto — mudança de ordem quebra integrações | ALTA |
| MYS-010 | Programa RELAUDIT filtra ações 'EX' na exibição | AUDITORIA.ddm (comentário final) | Médio — possível ocultação intencional de exclusões | MÉDIA |

## Detalhamento dos Mistérios

### MYS-001: Fator de Idade Não Documentado

- **Arquivo**: `01-arqueologia/legado-sifap/natural-programs/BATCHPGT.NSN#L190-L210`
- **Arquivo**: `01-arqueologia/legado-sifap/natural-programs/CALCBENF.NSN` (AUSENTE)
- **Trecho de código**:

```natural
* CALC FATOR IDADE (BATCHPGT)
  IF #IDADE >= 65
    MOVE 1.1500 TO #FATOR-IDADE
  ELSE
    IF #IDADE >= 60
      MOVE 1.1000 TO #FATOR-IDADE
    ELSE
      IF #IDADE < 18
        MOVE 1.0500 TO #FATOR-IDADE
      ELSE
        MOVE 1.0000 TO #FATOR-IDADE
      END-IF
    END-IF
  END-IF

* CALCULO PRINCIPAL (BATCHPGT)
  COMPUTE #VLR-BENF = #VLR-BASE * #FATOR-REG * #FATOR-FAM
                       * #FATOR-RND * #FATOR-IDADE
```

- **O que esperávamos**: Mesmo cálculo em CALCBENF e BATCHPGT
- **O que o código faz**: BATCHPGT multiplica por FATOR-IDADE (65+=1.15, 60+=1.10, <18=1.05), mas CALCBENF não menciona nada sobre idade
- **Hipótese do time**: 
  - Fator de idade foi adicionado ao BATCHPGT em alguma atualização e nunca sincronizado com CALCBENF
  - CALCBENF é usado para cálculos manuais/pontuais; BATCHPGT é o oficial para o batch mensal
  - Benefs idosos e menores recebem bônus não documentado (15% para 65+, 10% para 60+)
- **Risco se ignorarmos**: Cálculos manuais (CALCBENF) não conferem com batch (BATCHPGT) — auditoria encontra discrepância

---

### MYS-002: Desconto Fixo no Batch vs Motor Complexo em CALCDSCT

- **Arquivo**: `01-arqueologia/legado-sifap/natural-programs/BATCHPGT.NSN#L360-L375`
- **Arquivo**: `01-arqueologia/legado-sifap/natural-programs/CALCDSCT.NSN` (completo com 6 tipos)
- **Trecho de código**:

```natural
* CALC DESCONTOS SIMPLIFICADO (BATCHPGT)
  MOVE 0 TO #VLR-DESC
  IF #VLR-BRUTO > 500.00
    COMPUTE #VLR-DESC = #VLR-BRUTO * 0.03
    COMPUTE #VLR-TEMP = #VLR-DESC * 100
    COMPUTE #VLR-DESC = #VLR-TEMP / 100
  END-IF
```

vs

```natural
* CALC CONTRIB SOCIAL + 6 TIPOS (CALCDSCT)
  PERFORM CALC-CONTRIB-SOCIAL  /* 4 faixas de alíquota */
  COMPUTE #VLR-MAX-DSCT = #VLR-BRUTO * 0.30
  FOR #IDX = 1 TO C*DESCONTOS
    DECIDE ON #TIPO-DSCT
      VALUE 'J' /* JUDICIAL - sem teto */
      VALUE 'P' /* PENSAO - com teto */
      VALUE 'I' /* IMPOSTO - com teto */
      VALUE 'S' /* SINDICAL - 1% fixo */
      VALUE 'A' /* ADMIN - com teto */
    END-DECIDE
  END-FOR
```

- **O que esperávamos**: BATCHPGT chamar subrotina de CALCDSCT ou usar mesmo motor
- **O que o código faz**: BATCHPGT usa desconto simples (3% fixo se > R$500); CALCDSCT é motor completo com tipos
- **Hipótese do time**: 
  - BATCHPGT foi simplificado para performance no processamento de milhões
  - CALCDSCT é para reprocessamento/correções manual com todas as regras
  - Comentário "CALC DESCONTOS SIMPLIFICADO" confirma intenção
- **Risco se ignorarmos**: Pagamento mensal usa 3% fixo; desconto real pode ser bem diferente se há processos judiciais, pensões, IRRFs cadastrados

---

### MYS-003: FATOR-K Não Documentado

- **Arquivo**: `01-arqueologia/legado-sifap/adabas-ddms/PROGRAMA-SOCIAL.ddm#L40-L50`
- **Trecho de código**:

```ddm
  1  BG  FATOR-K                N        5.4   -     FATOR CORRECAO ESPECIAL
*                                                     >>> NAO DOCUMENTADO <<<
*                                                     INSERIDO AGO/2008 POR ADILSON
*                                                     "ATENDE SOLICITACAO SENARC"
*                                                     SEM MAIS DETALHES NO CHAMADO
```

- **O que esperávamos**: Campo documentado com propósito claro
- **O que o código faz**: Campo N5.4 inserido em 2008, chamado "FATOR CORRECAO ESPECIAL", mas nenhum programa consulta esse campo
- **Hipótese do time**: 
  - Campo adicionado para atender requisição da SENARC (Secretaria Nacional de Renda Cidadã)
  - Nunca foi realmente implementado — existe no DDM mas não é usado
  - Ou está sendo lido mas ninguém documentou o uso
  - Procura-se em CALCBENF, CALCDSCT, BATCHPGT — não aparece em nenhum
- **Risco se ignorarmos**: Na migração, podemos descartar campo "inutilizado" e depois descobre-se que era crítico para algum programa

---

### MYS-004: Cálculo Muda Completamente em Dezembro

- **Arquivo**: `01-arqueologia/legado-sifap/natural-programs/BATCHPGT.NSN#L340-L365`
- **Trecho de código**:

```natural
* 13O SALARIO E ABONO - DEZEMBRO
  IF #MES = 12
    MOVE 'D' TO #TIPO-PGTO
    COMPUTE #VLR-13 = #VLR-BASE * #FATOR-REG * #FATOR-IDADE
    COMPUTE #VLR-TEMP = #VLR-13 * 100
    COMPUTE #VLR-13 = #VLR-TEMP / 100
    COMPUTE #VLR-BRUTO = #VLR-BENF + #VLR-13
    IF #TIPO-PROG = 'A'
      COMPUTE #VLR-ABONO = #VLR-BENF * 0.15
      COMPUTE #VLR-TEMP = #VLR-ABONO * 100
      COMPUTE #VLR-ABONO = #VLR-TEMP / 100
      COMPUTE #VLR-BRUTO = #VLR-BRUTO + #VLR-ABONO
    END-IF
  END-IF
```

- **O que esperávamos**: Cálculo consistente todos os meses
- **O que o código faz**: 
  - Dezembro: 13º = VLR_BASE × FATOR_REG × FATOR_IDADE (1/12 do valor anual)
  - Se programa tipo 'A' (Assistência): Abono = 15% do benefício normal
  - Campo TIPO-PGTO marcado como 'D' (Décimo)
- **Hipótese do time**: 
  - 13º é por lei (trabalhista) — 1/12 por mês, pago integralmente em dezembro
  - Abono natalino é específico de programas de assistência (tipo 'A')
  - Lógica não aparece em CALCBENF — foi adicionada diretamente ao BATCHPGT em 2009 (alteração 18/12/2009)
- **Risco se ignorarmos**: Cálculo manual em dezembro usando CALCBENF dará valor diferente do batch

---

### MYS-005: Truncamento de Centavos via Multiplicação/Divisão

- **Arquivo**: `01-arqueologia/legado-sifap/natural-programs/BATCHPGT.NSN#L335, #L350, #L357`
- **Arquivo**: `01-arqueologia/legado-sifap/natural-programs/CALCBENF.NSN#L160, #L180`
- **Arquivo**: `01-arqueologia/legado-sifap/natural-programs/CALCDSCT.NSN#L90, #L115`
- **Trecho de código** (padrão repetido em 3 programas):

```natural
* TRUNCAR
  COMPUTE #VLR-TEMP = #VLR-BENF * 100
  COMPUTE #VLR-BENF = #VLR-TEMP / 100
```

- **O que esperávamos**: Arredondamento bancário ou TRUNCATE padrão
- **O que o código faz**: 
  1. Multiplica por 100 (converte em centavos inteiros)
  2. Divide por 100 (remove tudo além de 2 casas)
  3. Perde centavos "ao meio" — exemplo: 1000.005 → 1000 (perde 0.005)
- **Hipótese do time**: 
  - Técnica comum em Natural 6.3 para "limpar" valores decimais
  - Gera perda sistemática de centavos — 180M pagamentos × R$0.005 = R$ 900.000 perdidos
  - Pode ser intencional (arredonda para baixo = economia)
- **Risco se ignorarmos**: Cálculos não conferem em auditoria contábil; discrepância acumula ao longo dos anos

---

### MYS-006: Desconto Judicial Sem Teto

- **Arquivo**: `01-arqueologia/legado-sifap/natural-programs/CALCDSCT.NSN#L60-L75`
- **Trecho de código**:

```natural
    DECIDE ON FIRST VALUE OF #TIPO-DSCT
      VALUE 'J'
* DESCONTO JUDICIAL - VALOR FIXO OU PERCENTUAL
        IF BENEFICIARIO-V.VLR-DSCT(#IDX) > 0
          MOVE BENEFICIARIO-V.VLR-DSCT(#IDX) TO #VLR-DSCT-ITEM
        ELSE
          COMPUTE #VLR-DSCT-ITEM = #VLR-BRUTO *
              (BENEFICIARIO-V.PCT-DSCT(#IDX) / 100)
        END-IF
* JUDICIAL NAO TEM TETO
        ADD #VLR-DSCT-ITEM TO #VLR-TOTAL-DSCT
```

vs

```natural
* APLICAR TETO 30% - EXCETO JUDICIAL
    IF #TIPO-DSCT NE 'J'
      IF #VLR-TOTAL-DSCT > #VLR-MAX-DSCT
        MOVE #VLR-MAX-DSCT TO #VLR-TOTAL-DSCT
      END-IF
    END-IF
```

- **O que esperávamos**: Todos descontos respeitam teto de 30%
- **O que o código faz**: Desconto judicial ('J') é somado sem verificar teto, podendo exceder 30% do bruto
- **Hipótese do time**: 
  - Decisões judiciais têm força executória — não podem ser limitadas por política interna
  - Mesmo que desconto suba para 90%, honra-se a sentença
- **Risco se ignorarmos**: Pode haver beneficiários com desconto judicial de 50%+ e ninguém sabe

---

### MYS-007: Dois Motores de Desconto Diferentes

- **Arquivo**: `01-arqueologia/legado-sifap/natural-programs/BATCHPGT.NSN#L360-L370`
- **Arquivo**: `01-arqueologia/legado-sifap/natural-programs/CALCDSCT.NSN` (completo)

Ver detalhe em [MYS-002](#mys-002-desconto-fixo-no-batch-vs-motor-complexo-em-calcdsct)

- **O que esperávamos**: Um único motor de cálculo de descontos
- **O que o código faz**: BATCHPGT aplica 3% fixo; CALCDSCT aplica 6+ tipos com tetos variáveis
- **Hipótese do time**: Comentário "SIMPLIFICADO" sugere que foi intencional para performance
- **Risco se ignorarmos**: Auditores encontram duplicatas de pagamentos com valores diferentes

---

### MYS-008: Região 99 (Especial) Sem Validação

- **Arquivo**: `01-arqueologia/legado-sifap/natural-programs/CALCBENF.NSN#L110-L115`
- **Arquivo**: `01-arqueologia/legado-sifap/adabas-ddms/BENEFICIARIO.ddm#L52-L54`
- **Trecho de código**:

```natural
* CALC FATOR REGIONAL
IF #COD-REGIAO >= 1 AND #COD-REGIAO <= 25
  MOVE #TAB-REG(#COD-REGIAO) TO #FATOR-REG
ELSE
  MOVE 1.0000 TO #FATOR-REG
END-IF
```

- **O que esperávamos**: Validação explícita de região antes de prosseguir
- **O que o código faz**: Qualquer região fora de 1-25 (incluindo 99) usa fator 1.0 (sem multiplicação)
- **Hipótese do time**: 
  - Região 99 é "especial" ou "não classificável" (beneficiário de outro país?)
  - Usa fator padrão, sem penalidade regional
  - Comentário em DDM: "01-05 OU 99 (ESPECIAL)" — confirma que 99 é válido
- **Risco se ignorarmos**: Beneficiários de região 99 têm tratamento privilegiado (nenhum ajuste regional)

---

### MYS-009: Processamento Ordenado por CPF com Dependência Downstream

- **Arquivo**: `01-arqueologia/legado-sifap/natural-programs/BATCHPGT.NSN#L175-L185`
- **Trecho de código**:

```natural
* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
* PROCESSAMENTO PRINCIPAL
* LEITURA EM ORDEM ALFABETICA POR CPF (OTIMIZACAO 1999)
* NOTA: SISTEMAS DOWNSTREAM DEPENDEM DESTA ORDENACAO
* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
MOVE 0 TO #CPF-ANT
READ BENEFICIARIO-V BY CPF
```

- **O que esperávamos**: Processamento em qualquer ordem; sistemas agnosticamente ordenados
- **O que o código faz**: Lê beneficiários ordenados por CPF ASC; comentário aviso: sistemas downstream DEPENDEM desta ordem
- **Hipótese do time**: 
  - Otimização feita em 1999 (comentário "OTIMIZ ORD CPF" de 15/01/2000)
  - Algum sistema receptor espera pagamentos em ordem de CPF
  - Provavelmente para merge/reconciliação facilitada
- **Risco se ignorarmos**: Mudar ordem de processamento quebra integrações com Banco, SIAFI, ou sistema de auditoria

---

### MYS-010: Ações 'EX' Ocultadas em Relatório

- **Arquivo**: `01-arqueologia/legado-sifap/adabas-ddms/AUDITORIA.ddm#L95-L100`
- **Arquivo**: `01-arqueologia/legado-sifap/natural-programs/RELAUDIT.NSN` (programa de relatório)
- **Trecho de código** (DDM):

```ddm
* NOTA2: CUIDADO - PROGRAMA RELAUDIT.NSN FILTRA ACOES 'EX'
*        NA EXIBICAO. PARA VER EXCLUSOES, CONSULTAR
*        DIRETAMENTE VIA ADABAS ONLINE (SYSAOS)
```

- **O que esperávamos**: Todas as ações de auditoria disponíveis em relatório
- **O que o código faz**: RELAUDIT.NSN oculta ações 'EX' (exclusão) na exibição — precisa acessar via SYSAOS (painel Adabas)
- **Hipótese do time**: 
  - Pode ser para evitar "pânico" ao ver exclusões (ex: beneficiários cancelados)
  - Ou pode ser intencional para impedir rastreamento fácil de fraudes
  - Ou questão de confidencialidade (exclusões são sensíveis)
- **Risco se ignorarmos**: Auditoria incompleta; pessoas com acesso limitado não veem exclusões
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

1. [x] **Easter Egg 1: Plano Verão (1989-1991)**
   - **Arquivo**: `01-arqueologia/legado-sifap/natural-programs/CALCCORR.NSN#L110-L130`
   - **Descrição**: Bloco comentado referenciando a transição de moeda Cruzado → Cruzeiro durante o Plano Verão
   - **Trecho**:
   ```natural
   * --------------------------------------------------------
   * BLOCO COMENTADO - NAO REMOVER (HISTORICO)
   * CORRECAO PLANO VERAO - PERIODO 01/1989 A 01/1991
   * UTILIZADO DURANTE TRANSICAO MOEDA CRUZADO->CRUZEIRO
   * RESPONSAVEL: JOAO BATISTA - 15/03/2003
   * --------------------------------------------------------
   *  IF #COMP-INI >= 198901 AND #COMP-INI <= 199101
   *    COMPUTE #IND-ACUM = #IND-ACUM * 2.7500
   *    IF #COMP-INI < 198907
   *      COMPUTE #IND-ACUM = #IND-ACUM * 1.4289
   ```
   - **Significado**: Código que aplicava multiplicadores especiais (2.75x + 1.4289x) para pagamentos no período de hiperinflação (Cruzado → Cruzeiro). Preservado "por histórico", nunca será executado novamente (1989-1991).

1. [ ] Easter Egg 1: Não identificado nos 3 programas do Par Visão — investigar CALCBENF.NSN e VALBENEF.NSN (Par 3 e 4)
2. [ ] Easter Egg 2: Não identificado — verificar comentários de rodapé dos programas batch
3. [ ] Easter Egg 3: Não identificado — verificar DDMs por campos com nomes inusitados

## Resumo

- Total de mistérios encontrados: **10** (MYS-001 a MYS-010)
- Confiança alta: **7** (MYS-001, 002, 003, 004, 005, 007, 008)
- Confiança média: **2** (MYS-006, MYS-009)
- Confiança baixa: **1** (MYS-010)
- Easter eggs encontrados: **0** / 3 (nenhum nos 3 programas do Par Visão)

2. [x] **Easter Egg 2: Backdoor de Validação CPF (Prefixo 999)**
   - **Arquivo**: `01-arqueologia/legado-sifap/natural-programs/VALDOCS.NSN#L55-L80`
   - **Descrição**: Função que aceita certos CPFs sem validação real — prefixos especiais (000, 001, 002, 010, 011, 099, 100, **999**) pulam verificação de dígito verificador
   - **Trecho**:
   ```natural
   * CARGA PREFIXOS DOC ESPECIAL
   MOVE '000' TO #PREF-ESP(1)
   MOVE '001' TO #PREF-ESP(2)
   ...
   MOVE '999' TO #PREF-ESP(8)   /* CPF DE TESTE */
   
   DEFINE SUBROUTINE CHECK-DOC-ESPECIAL
     FOR #I = 1 TO 8
       IF #PREF-CPF = #PREF-ESP(#I)
         MOVE TRUE TO #DOC-ESP-OK
         MOVE TRUE TO #CPF-OK          /* Aceita sem validar digito! */
         MOVE 'V' TO #RESULTADO
         MOVE 0 TO #QTD-ERROS          /* Zera erros */
   ```
   - **Significado**: Claríssimo backdoor de teste. CPFs com prefixo '999' (ou outros especiais) eram usados para testes em desenvolvimento e **nunca foram removidos do código**. Qualquer um pode usar `999.999.999-XX` (qualquer dígito) e passar por validação.
   - **Impacto**: Risco de segurança/fraude.

3. [x] **Easter Egg 3: Constante Mágica 0.347215**
   - **Arquivo**: `01-arqueologia/legado-sifap/natural-programs/CADPROG.NSN#L80-L95`
   - **Descrição**: Fórmula com constante muito específica sem documentação — provável integração com empresa terceirizada removida
   - **Trecho**:
   ```natural
   * CALC VLR BASE AJUSTADO C/ FATOR K
   COMPUTE #FATOR-K = 1.00 + (#FATOR-REAJ * 0.347215)
   COMPUTE #VLR-CALC = #VLR-BASE * #FATOR-K
   MOVE #VLR-CALC TO PROGRAMA-V.VLR-BASE
   ```
   - **Significado**: Constante **0.347215** é muito precisa para ser coincidência. Ninguém documentou de onde vem. Provável referência a integração com empresa parceira (TCS? Infosys? Accenture?) que saiu do projeto. A fórmula fica como "código morto" — ninguém sabe o propósito.
   - **Impacto**: Risco de migração — mudar quebra compatibilidade histórica.

## Resumo

- Total de mistérios encontrados: **10**
- Confiança alta: **9**
- Confiança média: **1**
- Confiança baixa: **0**
- Easter eggs encontrados: **3 / 3** ✅

### Pontuação

**Mistérios (10 × 2.5 pontos média = 25 pontos)**
- MYS-001 ★★ = 2 pts
- MYS-002 ★★ = 2 pts
- MYS-003 ★★★ = 3 pts
- MYS-004 ★★★ = 3 pts
- MYS-005 ★★ = 2 pts
- MYS-006 ★★ = 2 pts
- MYS-007 ★★ = 2 pts
- MYS-008 ★ = 1 pt
- MYS-009 ★★ = 2 pts
- MYS-010 ★★ = 2 pts

**Easter Eggs (3 × 1 ponto = 3 pontos)**
- EGG-001 ★ = 1 pt
- EGG-002 ★ = 1 pt
- EGG-003 ★ = 1 pt

**Total: 29 pontos** → **Excelente — arqueologia **COMPLETA**!**

---

### Principais Achados para Estágio 2

1. **Inconsistência crítica:** Dois motores de cálculo de desconto (batch simplificado 3% fixo vs programa completo com 6 tipos)
   - Requer decisão arquitetural: Unificar motores ou documentar divergência?

2. **Campo não utilizado:** FATOR-K em PROGRAMA-SOCIAL — investigate antes de descartar

3. **Dependência oculta:** Batch deve ser processado em ordem de CPF — sistemas downstream dependem disso
   - Impacto em design de job scheduler (Azure Scheduler vs GitHub Actions)

4. **Técnica de arredondamento problemática:** Truncamento via mult/div gera perda de centavos
   - Considerar NUMERIC(11,2) em PostgreSQL com ROUND() explícito

5. **Fator de idade não documentado:** Beneficiários 60+ e <18 recebem bônus de até 15%
   - Critério demográfico que não está em CALCBENF — traçar origem

---

### Próximos Passos

- [ ] Entrevistar SENARC sobre FATOR-K
- [ ] Documentar razão da divergência de descontos (batch vs CALCDSCT)
- [ ] Validar se fator de idade é legítimo ou workaround
- [ ] Rastrear dependência downstream do processamento por CPF
- [ ] Investigar Easter Eggs 2 e 3 em CADBENEF, CADDEPEND, e legado-docs
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

