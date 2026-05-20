<!-- markdownlint-disable MD013 MD025 MD026 MD028 MD029 MD034 MD040 MD051 MD060 -->

# Checklist de Mistérios do SIFAP

![ESTÁGIO 01 Arqueologia](https://img.shields.io/badge/ESTÁGIO-01%20Arqueologia-F25022?style=for-the-badge) ![TIPO Worksheet](https://img.shields.io/badge/TIPO-Worksheet-1A1A1A?style=for-the-badge) ![PREENCHA Durante S1](https://img.shields.io/badge/PREENCHA-Durante%20S1-737373?style=for-the-badge)

> 🗺 **Você está aqui:** [Kit PT-BR](../README.md) → [Estágio 1](README.md) → **mysteries-checklist**

> **Para quem é isto?** Este é um **artefato preenchido pelo time** durante o Estágio 1 (Arqueologia).
>
> **O que você terá ao final do estágio:**
>
> 1. Este documento totalmente preenchido com os dados reais do legado SIFAP
> 2. Rastreabilidade para `01-arqueologia/legado-sifap/` (programas `.NSN` e DDMs)
> 3. Base de evidência usada nas EARS do Estágio 2 (`source_legacy:`)
>
> 📘 **Guia passo a passo:** [`GUIDE.md`](GUIDE.md).


> Há **10 regras de negócio escondidas** e **3 easter eggs** plantados no código legado. Quanto mais seu time encontrar, melhor a nota na rubrica (dimensão A1).

## Por que isso existe

Em sistemas legados de verdade, regras de negócio críticas frequentemente ficam escondidas em código sem comentário, em constantes mágicas, em casos especiais sem justificativa. A facilitadora plantou 10 dessas armadilhas no SIFAP justamente para treinar o olhar do time. Quem aprende a achar mistérios no workshop, acha em produção.

## Como funciona

- Cada mistério vale 1–3 pontos dependendo da dificuldade
- Total possível: **32 pontos**
- Os mistérios estão distribuídos nos 15 programas .NSN e nos 4 DDMs
- Nenhum mistério está documentado em `legacy-docs/` (os docs estão desatualizados de propósito!)

## Regras de Negócio Escondidas (10)

Marque [x] quando encontrar:

- [x] **MYS-001** (★★): Um programa modifica silenciosamente o status do beneficiário baseado em um critério demográfico. Onde? Por quê?
  - **ENCONTRADO:** BATCHPGT aplica FATOR-IDADE baseado em idade (65+=1.15, 60+=1.10, <18=1.05). Nao documentado em CALCBENF.
  - **DETALHE PAR 2:** Mesma evidencia principal; sem divergencia adicional consolidada neste checklist.
  
- [x] **MYS-002** (★): Um limite numérico está hardcoded no código mas contradiz a capacidade definida no DDM. Qual é o limite? Em qual programa?
  - **ENCONTRADO:** BATCHPGT usa desconto fixo 3% se > R$500; CALCDSCT tem motor completo com 6 tipos. Divergencia critica.
  - **DETALHE PAR 2:** `MYS-PGT-03` (`#TAB-REG` 27 posicoes, so 25 usadas) + `MYS-PGT-05` (`RENDA-MAX` no DDM nunca consultado) — `BATCHPGT.NSN#L120-L147, L43`.
  
- [x] **MYS-003** (★★★): Uma variável misteriosa é usada em cálculos mas nunca foi documentada — ninguém sabe de onde veio a constante. Qual variável?
  - **ENCONTRADO:** FATOR-K em PROGRAMA-SOCIAL DDM (N5.4, 2008). Nunca aparece em nenhum programa. Campo fantasma.
  - **DETALHE PAR 2:** Constantes magicas sem documentacao (`0.15`, `0.03`, `500.00`), tabela regional (27) e faixas de renda (5) inline; cabecalho cita `CALCBENF`/`CALCDSCT` mas logica esta inline (`MYS-PGT-01`) — `BATCHPGT.NSN#L120-L159, L281-L294`.
  
- [x] **MYS-004** (★★★): Em um mês específico do ano, o cálculo de benefício muda completamente. Qual mês? O que muda?
  - **ENCONTRADO:** Dezembro. Adiciona 13º (1/12 × base × região × idade) + abono 15% (só programas tipo 'A').
  - **DETALHE PAR 2:** **Dezembro** (`#MES = 12`): gera 13º (`VLR-BASE × fator-reg × fator-idade`) + abono 15% para tipo `'A'` + `TIPO-PGTO = 'D'` — `BATCHPGT.NSN#L275-L286`.
  
- [x] **MYS-005** (★★★): O sistema usa uma técnica de arredondamento que causa perda sistemática de centavos. Qual técnica? Onde?
  - **ENCONTRADO:** Multiplicacao x 100 / 100 em BATCHPGT, CALCBENF, CALCDSCT. Remove tudo alem de 2 casas. 180M x R$0.005 = R$900k perdido.
  - **DETALHE PAR 2:** Tres regras divergentes na cadeia: `BATCHPGT` trunca `(x100)/100`, `BATCHREL` arredonda com `+0.005`, `BATCHCON` tolera `0.01` — `MYS-PGT-04` / `MYS-CON-02` / `MYS-REL-01`.
  
- [x] **MYS-006** (★★): Um tipo de desconto ignora uma regra de limite que se aplica a todos os outros. Qual tipo? Por quê?
  - **ENCONTRADO:** Tipo 'J' (judicial) ignora teto de 30% em CALCDSCT. Sem justificativa.
  - **DETALHE PAR 2:** Mesma evidencia principal; sem complemento adicional consolidado no segundo bloco.
  
- [x] **MYS-007** (★): Certos CPFs são aceitos sem validação real. Quais? Isso é um bug ou feature?
  - **NAO ENCONTRADO COMPLETAMENTE:** VALBENEF valida CPF com modulo 11, mas BATCHPGT nao valida antes de processar.
  - **DETALHE PAR 2:** Sem complemento adicional consolidado no segundo bloco.
  
- [x] **MYS-008** (★): Beneficiários de uma região específica pulam TODAS as verificações de elegibilidade. Qual região?
  - **ENCONTRADO (parcial):** Região 99 (especial) usa fator padrão 1.0. Sem penalidade regional.
  - **DETALHE PAR 2:** Sem complemento adicional consolidado no segundo bloco.
  
- [x] **MYS-009** (★★): O processamento batch segue uma ordem que não é a mais lógica, mas que virou dependência de outros sistemas. Qual ordem?
  - **ENCONTRADO:** CPF ASC em BATCHPGT. Comentário: "SISTEMAS DOWNSTREAM DEPENDEM DESTA ORDENACAO".
  - **DETALHE PAR 2:** **Ordenacao por CPF** (`READ BENEFICIARIO BY CPF`); consumidor nao identificado nos 3 batches do Par 2 (`MYS-PGT-02`) — `BATCHPGT.NSN#L4, L169-L171`.
  
- [x] **MYS-010** (★★★): Um tipo de evento de auditoria é sistematicamente ocultado dos relatórios. Qual tipo? Isso é intencional ou bug?
  - **ENCONTRADO:** Ação 'EX' (exclusão) filtrada por RELAUDIT.NSN. Só visível via SYSAOS (painel Adabas).
  - **DETALHE PAR 2:** **Divergencia bancaria** (`ACAO = 'DV'`) e `STATUS-PGTO` permanece `'G'`, ficando invisivel por agregacao de status no `BATCHREL` (`MYS-CON-08`) — `BATCHCON.NSN#L153-L201`.

## Easter Eggs (3)

- [x] **EGG-001** (★): Um bloco de código comentado referencia uma política econômica dos anos 90 que nunca foi removida. Qual política?
  - **ENCONTRADO:** Plano Verão (1989-1991) em CALCCORR.NSN. Transição Cruzado → Cruzeiro. Multiplicadores 2.75x + 1.4289x.
  
- [x] **EGG-002** (★): Um programa tem uma função de validação especial que aceita certos documentos sem verificação. Parece um backdoor de teste. Onde?
  - **ENCONTRADO:** VALDOCS.NSN. Prefixos especiais de CPF (000, 001, 002, 010, 011, 099, 100, **999**) pulam validação de dígito verificador. '999' é teste.
  
- [x] **EGG-003** (★): Código morto referencia uma integração com uma empresa que não existe mais. Qual empresa?
  - **ENCONTRADO:** CADPROG.NSN. Constante mágica **0.347215** sem documentação em fórmula de cálculo. Provável integração terceirizada removida.
  **Banco Real** — bloco comentado desde 2007 (adquirido pelo Santander); 19 anos de código morto → `MYS-CON-07` — `BATCHCON.NSN#L218-L237`


## Inconsistências entre Documentação e Código (bônus)

- [x] **INC-001**: Um limite documentado diverge do que o código permite → `RENDA-MAX` declarado no DDM `PROGRAMA-SOCIAL` mas ignorado por `BATCHPGT` → `MYS-PGT-05` — `BATCHPGT.NSN#L43`
- [ ] **INC-002**: O documento de arquitetura original não menciona uma estrutura de dados que foi adicionada depois
- [x] **INC-003**: Regras críticas de cálculo não aparecem em nenhum documento → Toda a fórmula de benefício (5 fatores), 13º, abono e desconto estão **inline** em `BATCHPGT`; cabeçalho cita `CALCBENF`/`CALCDSCT` como se a lógica fosse externa → `MYS-PGT-01` — `BATCHPGT.NSN#L11`
- [x] **INC-004**: Dois programas usam métodos de arredondamento diferentes para o mesmo tipo de valor → Na verdade **três** programas divergem; `BATCHREL.NSN#L121` tem comentário explícito confirmando → `MYS-PGT-04` / `MYS-CON-02` / `MYS-REL-01`

## Pontuação

| Faixa        | Classificação                           |
| ------------ | --------------------------------------- |
| 26–32 pontos | Excelente — arqueologia completa!       |
| 18–25 pontos | Sólido — bom trabalho de investigação   |
| 10–17 pontos | Satisfatório — encontrou o básico       |
| 0–9 pontos   | Precisa melhorar — explore mais a fundo |

## Dicas

- Use **Copilot Chat** para perguntar sobre cada programa: _"Tem alguma lógica escondida neste código? Existe alguma condição que parece um workaround ou caso especial não documentado?"_
- Compare o que a **documentação diz** com o que o **código faz** — as inconsistências são intencionais
- Os DDMs também contêm pistas em seus comentários
- Se travar, levante a mão — o facilitador pode dar uma dica calibrada após 90 minutos

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
<a href="mysteries-found.md"><strong>mysteries-found.md</strong></a><br/>
<sub>Onde você registra os mistérios.</sub>
</td>
</tr>
</table>

<sub>↑ <a href="README.md">Voltar ao Kit PT-BR</a></sub>

