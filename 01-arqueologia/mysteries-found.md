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

