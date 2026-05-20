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
| BR-001 | CPF é obrigatório e deve ser válido pelo algoritmo módulo 11 (dois dígitos verificadores) | `01-arqueologia/legado-sifap/natural-programs/CADBENEF.NSN#L105-L112` | `BENEFICIARIO.AB NUM-CPF` | CRÍTICO | Regra adicionada em 2005 por MARCIA HELENA; falha na validação rejeita o cadastro |
| BR-002 | Operação de cadastro aceita apenas I (Inclusão) ou A (Alteração); qualquer outro valor aborta | `01-arqueologia/legado-sifap/natural-programs/CADBENEF.NSN#L79-L83` | — | ALTO | Controle de fluxo principal do programa |
| BR-003 | Em inclusão, CPF não pode já existir na base (ARQ 150); em alteração, CPF deve existir | `01-arqueologia/legado-sifap/natural-programs/CADBENEF.NSN#L139-L148` | `BENEFICIARIO.AB NUM-CPF` | CRÍTICO | Evita duplicidade; regra de integridade da base de 4,2M registros |
| BR-004 | Nome, data de nascimento e sexo são obrigatórios no cadastro | `01-arqueologia/legado-sifap/natural-programs/CADBENEF.NSN#L119-L131` | `BENEFICIARIO.AC NOME-COMPLETO`, `BENEFICIARIO.AF DT-NASCIMENTO`, `BENEFICIARIO.AG SEXO` | ALTO | Sexo aceito: M ou F (DDM define M/F/I mas programa não aceita I) |
| BR-005 | Status inicial de inclusão é sempre 'A' (Ativo) | `01-arqueologia/legado-sifap/natural-programs/CADBENEF.NSN#L163-L165` | `BENEFICIARIO.CE SIT-BENEFICIARIO` | ALTO | Status não é informado pelo usuário; definido pelo sistema |
| BR-006 | Beneficiário com idade calculada acima de 75 anos recebe status 'S' na inclusão | `01-arqueologia/legado-sifap/natural-programs/CADBENEF.NSN#L167-L169` | `BENEFICIARIO.CE SIT-BENEFICIARIO`, `BENEFICIARIO.AF DT-NASCIMENTO` | CRÍTICO | Conflito: DDM define 'S' como Suspenso; programa usa 'S' como categoria etária de idoso — semântica divergente |
| BR-007 | Inclusão de dependente exige que o titular (CPF) exista e esteja ativo na base | `01-arqueologia/legado-sifap/natural-programs/CADDEPEND.NSN#L46-L56` | `BENEFICIARIO.CE SIT-BENEFICIARIO` | ALTO | Titular com status C (Cancelado) ou D (Desligado) bloqueia qualquer inclusão de dependente |
| BR-008 | Limite máximo de 5 dependentes por beneficiário titular | `01-arqueologia/legado-sifap/natural-programs/CADDEPEND.NSN#L63-L66` | `BENEFICIARIO.DA GRP-DEPENDENTE` | ALTO | DDM comporta até 10 ocorrências (PE); limite de 5 é regra do programa — possível limitação de tela, não de negócio |
| BR-009 | Parentesco do dependente deve ser: FI (Filho), CO (Cônjuge), IR (Irmão) ou OU (Outro) | `01-arqueologia/legado-sifap/natural-programs/CADDEPEND.NSN#L72-L84` | `BENEFICIARIO.DE PARENTESCO` | MÉDIO | DDM define domínio diferente: FI/CJ/NT/TU — divergência que pode impactar relatórios históricos |
| BR-010 | CPF de dependente não pode ser duplicado dentro do mesmo titular (quando informado) | `01-arqueologia/legado-sifap/natural-programs/CADDEPEND.NSN#L97-L104` | `BENEFICIARIO.DB CPF-DEPENDENTE` | ALTO | Apenas quando CPF ≠ 0; dependente sem CPF pode ser cadastrado sem validação de unicidade |
| BR-011 | Programa social não pode ser cadastrado com código já existente na base (ARQ 155) | `01-arqueologia/legado-sifap/natural-programs/CADPROG.NSN#L77-L82` | `PROGRAMA-SOCIAL.AA COD-PROGRAMA` | ALTO | Código é chave primária do arquivo de programas |
| BR-012 | Status inicial de inclusão de programa é sempre 'A' (Ativo) | `01-arqueologia/legado-sifap/natural-programs/CADPROG.NSN#L97` | `PROGRAMA-SOCIAL.AI SIT-PROGRAMA` | MÉDIO | Não há transição de status no CADPROG; apenas outros módulos alteram status |
| BR-013 | Operações de CADPROG aceitam apenas I (Inclusão) e C (Consulta); sem alteração/exclusão | `01-arqueologia/legado-sifap/natural-programs/CADPROG.NSN#L48-L56` | — | ALTO | Programas são imutáveis após cadastro neste módulo; alterações devem ocorrer por outro meio não identificado |
| BR-014 | Valor base do programa é calculado: `FATOR-K = 1.00 + (FATOR-REAJ * 0.347215)`; valor gravado é `VLR-BASE * FATOR-K` | `01-arqueologia/legado-sifap/natural-programs/CADPROG.NSN#L87-L88` | `PROGRAMA-SOCIAL.BG FATOR-K`, `PROGRAMA-SOCIAL.BA VLR-BASE-INDIVIDUAL` | CRÍTICO | Constante 0.347215 sem documentação de origem normativa; fórmula introduzida em 2003 |
| BR-015 | Tipo de programa deve ser A (Assistencial), P (Previdenciário) ou T (Trabalho) | `01-arqueologia/legado-sifap/natural-programs/CADPROG.NSN#L20` | `PROGRAMA-SOCIAL.AD TIPO-PROGRAMA` | MÉDIO | Definição de tipo impacta regras de elegibilidade e cálculo de benefício |
| BR-016 | Dependente sem nome é rejeitado; nome é obrigatório | `01-arqueologia/legado-sifap/natural-programs/CADDEPEND.NSN#L86-L90` | `BENEFICIARIO.DC NOME-DEPENDENTE` | MÉDIO | Única validação obrigatória de dependente além do parentesco |
| BR-017 | Data de fim de programa = 0 indica vigência indeterminada | `01-arqueologia/legado-sifap/natural-programs/CADPROG.NSN#L70` | `PROGRAMA-SOCIAL.AH DT-ENCERRAMENTO` | MÉDIO | Convenção 0 = sem prazo; no modelo relacional deve mapear para NULL |

> Adicione mais linhas conforme necessário. Lembre-se: existem **10 regras escondidas** no código!

## Exemplo de linha bem preenchida

| ID     | Regra de Negócio                                                                        | Programa Fonte                                   | Campos DDM                                                               | Nível de Risco | Notas                                      |
| ------ | --------------------------------------------------------------------------------------- | ------------------------------------------------ | ------------------------------------------------------------------------ | -------------- | ------------------------------------------ |
| BR-013 | Desconto total não pode exceder 30% do valor bruto, exceto descontos judiciais (tipo J) | `01-arqueologia/legado-sifap/natural-programs/CALCDSCT.NSN#L142-L148` | `PAGAMENTO.VLR-BRUTO`, `PAGAMENTO.VLR-TOTAL-DSCT`, `PAGAMENTO.TIPO-DSCT` | CRÍTICO        | Regra financeira. Tipo 'J' = exceção legal |

## Regras por Categoria

### Cálculos Financeiros

| ID | Descrição resumida | Programa Fonte |
|---|---|---|
| BR-014 | `VLR-CALC = VLR-BASE * (1.00 + FATOR-REAJ * 0.347215)` | `CADPROG.NSN#L87-L88` |

### Validações de Status

| ID | Descrição resumida | Programa Fonte |
|---|---|---|
| BR-005 | Status inicial de inclusão = 'A' (Ativo) | `CADBENEF.NSN#L163-L165` |
| BR-006 | Beneficiário >75 anos recebe status 'S' na inclusão | `CADBENEF.NSN#L167-L169` |
| BR-012 | Status inicial de programa = 'A' (Ativo) | `CADPROG.NSN#L97` |

### Regras de Autorização

| ID | Descrição resumida | Programa Fonte |
|---|---|---|
| BR-002 | Operação aceita apenas I ou A; qualquer outro valor aborta | `CADBENEF.NSN#L79-L83` |
| BR-007 | Titular com status C ou D bloqueia inclusão de dependente | `CADDEPEND.NSN#L56` |
| BR-013 | CADPROG aceita apenas I (Inclusão) e C (Consulta); sem alteração | `CADPROG.NSN#L48-L56` |

### Regras de Negócio Temporais

| ID | Descrição resumida | Programa Fonte |
|---|---|---|
| BR-017 | Data de fim = 0 indica vigência indeterminada do programa | `CADPROG.NSN#L70` |

## Resumo Estatístico

- Total de regras encontradas: **17** (BR-001 a BR-017)
- Regras críticas: **5** (BR-001, BR-003, BR-006, BR-007, BR-014)
- Regras com duplicação: **0** identificadas
- Regras sem documentação (escondidas): **3** (BR-006 status idoso, BR-014 constante 0.347215, BR-010 bypass CPF null)

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

