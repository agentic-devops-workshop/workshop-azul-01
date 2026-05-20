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

### Par 1 · CADBENEF — Cadastro de beneficiários

| ID | Regra de Negócio | Programa Fonte | Campos DDM | Nível de Risco | Notas |
| --- | --- | --- | --- | --- | --- |
| BR-BENEF-001 | CPF é obrigatório e deve ser válido pelo algoritmo módulo 11 (dois dígitos verificadores) | `01-arqueologia/legado-sifap/natural-programs/CADBENEF.NSN#L105-L112` | `BENEFICIARIO.NUM-CPF` | CRÍTICO | Regra adicionada em 2005 por MARCIA HELENA; falha na validação rejeita o cadastro |
| BR-BENEF-002 | Operação de cadastro aceita apenas I (Inclusão) ou A (Alteração); qualquer outro valor aborta | `01-arqueologia/legado-sifap/natural-programs/CADBENEF.NSN#L79-L83` | — | ALTO | Controle de fluxo principal do programa |
| BR-BENEF-003 | Em inclusão, CPF não pode já existir na base (ARQ 150); em alteração, CPF deve existir | `01-arqueologia/legado-sifap/natural-programs/CADBENEF.NSN#L139-L148` | `BENEFICIARIO.NUM-CPF` | CRÍTICO | Evita duplicidade; regra de integridade da base de 4,2M registros |
| BR-BENEF-004 | Nome, data de nascimento e sexo são obrigatórios no cadastro | `01-arqueologia/legado-sifap/natural-programs/CADBENEF.NSN#L119-L131` | `BENEFICIARIO.NOME-COMPLETO`, `BENEFICIARIO.DT-NASCIMENTO`, `BENEFICIARIO.SEXO` | ALTO | Sexo aceito: M ou F (DDM define M/F/I mas programa não aceita I) |
| BR-BENEF-005 | Status inicial de inclusão é sempre 'A' (Ativo) | `01-arqueologia/legado-sifap/natural-programs/CADBENEF.NSN#L163-L165` | `BENEFICIARIO.SIT-BENEFICIARIO` | ALTO | Status não é informado pelo usuário; definido pelo sistema |
| BR-BENEF-006 | Beneficiário com idade calculada acima de 75 anos recebe status 'S' na inclusão | `01-arqueologia/legado-sifap/natural-programs/CADBENEF.NSN#L167-L169` | `BENEFICIARIO.SIT-BENEFICIARIO`, `BENEFICIARIO.DT-NASCIMENTO` | CRÍTICO | Conflito: DDM define 'S' como Suspenso; programa usa 'S' como categoria etária de idoso — semântica divergente |

### Par 1 · CADDEPEND — Cadastro de dependentes

| ID | Regra de Negócio | Programa Fonte | Campos DDM | Nível de Risco | Notas |
| --- | --- | --- | --- | --- | --- |
| BR-DEP-001 | Inclusão de dependente exige que o titular (CPF) exista e esteja ativo na base | `01-arqueologia/legado-sifap/natural-programs/CADDEPEND.NSN#L46-L56` | `BENEFICIARIO.SIT-BENEFICIARIO` | ALTO | Titular com status C (Cancelado) ou D (Desligado) bloqueia qualquer inclusão de dependente |
| BR-DEP-002 | Limite máximo de 5 dependentes por beneficiário titular | `01-arqueologia/legado-sifap/natural-programs/CADDEPEND.NSN#L63-L66` | `BENEFICIARIO.GRP-DEPENDENTE` | ALTO | DDM comporta até 10 ocorrências (PE); limite de 5 é regra do programa — possível limitação de tela, não de negócio |
| BR-DEP-003 | Parentesco do dependente deve ser: FI (Filho), CO (Cônjuge), IR (Irmão) ou OU (Outro) | `01-arqueologia/legado-sifap/natural-programs/CADDEPEND.NSN#L72-L84` | `BENEFICIARIO.PARENTESCO` | MÉDIO | DDM define domínio diferente: FI/CJ/NT/TU — divergência que pode impactar relatórios históricos |
| BR-DEP-004 | CPF de dependente não pode ser duplicado dentro do mesmo titular (quando informado) | `01-arqueologia/legado-sifap/natural-programs/CADDEPEND.NSN#L97-L104` | `BENEFICIARIO.CPF-DEPENDENTE` | ALTO | Apenas quando CPF ≠ 0; dependente sem CPF pode ser cadastrado sem validação de unicidade |
| BR-DEP-005 | Dependente sem nome é rejeitado; nome é obrigatório | `01-arqueologia/legado-sifap/natural-programs/CADDEPEND.NSN#L86-L90` | `BENEFICIARIO.NOME-DEPENDENTE` | MÉDIO | Única validação obrigatória de dependente além do parentesco |

### Par 1 · CADPROG — Cadastro de programas sociais

| ID | Regra de Negócio | Programa Fonte | Campos DDM | Nível de Risco | Notas |
| --- | --- | --- | --- | --- | --- |
| BR-PROG-001 | Programa social não pode ser cadastrado com código já existente na base (ARQ 155) | `01-arqueologia/legado-sifap/natural-programs/CADPROG.NSN#L77-L82` | `PROGRAMA-SOCIAL.COD-PROGRAMA` | ALTO | Código é chave primária do arquivo de programas |
| BR-PROG-002 | Status inicial de inclusão de programa é sempre 'A' (Ativo) | `01-arqueologia/legado-sifap/natural-programs/CADPROG.NSN#L97` | `PROGRAMA-SOCIAL.SIT-PROGRAMA` | MÉDIO | Não há transição de status no CADPROG; apenas outros módulos alteram status |
| BR-PROG-003 | Operações de CADPROG aceitam apenas I (Inclusão) e C (Consulta); sem alteração/exclusão | `01-arqueologia/legado-sifap/natural-programs/CADPROG.NSN#L48-L56` | — | ALTO | Programas são imutáveis após cadastro neste módulo |
| BR-PROG-004 | Valor base do programa é calculado: `FATOR-K = 1.00 + (FATOR-REAJ * 0.347215)`; valor gravado é `VLR-BASE * FATOR-K` | `01-arqueologia/legado-sifap/natural-programs/CADPROG.NSN#L87-L88` | `PROGRAMA-SOCIAL.FATOR-K`, `PROGRAMA-SOCIAL.VLR-BASE-INDIVIDUAL` | CRÍTICO | Constante 0.347215 sem documentação de origem normativa; fórmula introduzida em 2003 |
| BR-PROG-005 | Tipo de programa deve ser A (Assistencial), P (Previdenciário) ou T (Trabalho) | `01-arqueologia/legado-sifap/natural-programs/CADPROG.NSN#L20` | `PROGRAMA-SOCIAL.TIPO-PROGRAMA` | MÉDIO | Definição de tipo impacta regras de elegibilidade e cálculo de benefício |
| BR-PROG-006 | Data de fim de programa = 0 indica vigência indeterminada | `01-arqueologia/legado-sifap/natural-programs/CADPROG.NSN#L70` | `PROGRAMA-SOCIAL.DT-ENCERRAMENTO` | MÉDIO | Convenção 0 = sem prazo; no modelo relacional deve mapear para NULL |

### Par 2 · BATCHPGT — Geração mensal de pagamentos

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
| BR-011 | Programa social não pode ser cadastrado com código já existente na base (ARQ 151) | `01-arqueologia/legado-sifap/natural-programs/CADPROG.NSN#L77-L82` | `PROGRAMA-SOCIAL.AA COD-PROGRAMA` | ALTO | Código é chave primária do arquivo de programas; documentação modernizada padroniza a referência ao DDM/FNR |
| BR-012 | Status inicial de inclusão de programa é sempre 'A' (Ativo) | `01-arqueologia/legado-sifap/natural-programs/CADPROG.NSN#L97` | `PROGRAMA-SOCIAL.AI SIT-PROGRAMA` | MÉDIO | Não há transição de status no CADPROG; apenas outros módulos alteram status |
| BR-013 | Operações de CADPROG aceitam apenas I (Inclusão) e C (Consulta); sem alteração/exclusão | `01-arqueologia/legado-sifap/natural-programs/CADPROG.NSN#L48-L56` | — | ALTO | Programas são imutáveis após cadastro neste módulo; alterações devem ocorrer por outro meio não identificado |
| BR-014 | Valor base do programa é calculado: `FATOR-K = 1.00 + (FATOR-REAJ * 0.347215)`; valor gravado é `VLR-BASE * FATOR-K` | `01-arqueologia/legado-sifap/natural-programs/CADPROG.NSN#L87-L88` | `PROGRAMA-SOCIAL.BG FATOR-K`, `PROGRAMA-SOCIAL.BA VLR-BASE-INDIVIDUAL` | CRÍTICO | Constante 0.347215 sem documentação de origem normativa; fórmula introduzida em 2003 |
| BR-015 | Tipo de programa deve ser A (Assistencial), P (Previdenciário) ou T (Trabalho) | `01-arqueologia/legado-sifap/natural-programs/CADPROG.NSN#L20` | `PROGRAMA-SOCIAL.AD TIPO-PROGRAMA` | MÉDIO | Definição de tipo impacta regras de elegibilidade e cálculo de benefício |
| BR-016 | Dependente sem nome é rejeitado; nome é obrigatório | `01-arqueologia/legado-sifap/natural-programs/CADDEPEND.NSN#L86-L90` | `BENEFICIARIO.DC NOME-DEPENDENTE` | MÉDIO | Única validação obrigatória de dependente além do parentesco |
| BR-017 | Data de fim de programa = 0 indica vigência indeterminada | `01-arqueologia/legado-sifap/natural-programs/CADPROG.NSN#L70` | `PROGRAMA-SOCIAL.AH DT-ENCERRAMENTO` | MÉDIO | Convenção 0 = sem prazo; no modelo relacional deve mapear para NULL |

| BR-PGT-001 | Competência (AAAAMM) derivada de `*DATN` na execução do batch | `01-arqueologia/legado-sifap/natural-programs/BATCHPGT.NSN#L105, L108-L110` | — | ALTO | Sem parâmetro externo; batch assume "hoje" |
| BR-PGT-002 | `NUM-PAGTO` é sequencial, incrementado a partir do maior já gravado | `01-arqueologia/legado-sifap/natural-programs/BATCHPGT.NSN#L171-L174, L323-L324` | `PAGAMENTO.NUM-PAGTO` | ALTO | Race condition se executado em paralelo |
| BR-PGT-003 | Beneficiário só é processado se `STATUS = 'A'` (ativo) | `01-arqueologia/legado-sifap/natural-programs/BATCHPGT.NSN#L195-L198` | `BENEFICIARIO.STATUS` | ALTO | Demais status são ignorados silenciosamente |
| BR-PGT-004 | Não gerar 2º pagamento na mesma competência para o mesmo CPF | `01-arqueologia/legado-sifap/natural-programs/BATCHPGT.NSN#L201-L210` | `PAGAMENTO.CPF-BENEF`, `PAGAMENTO.COMPETENCIA` | CRÍTICO | Idempotência da execução |
| BR-PGT-005 | Programa social precisa existir e ter `STATUS-PROG = 'A'` | `01-arqueologia/legado-sifap/natural-programs/BATCHPGT.NSN#L213-L230` | `PROGRAMA-SOCIAL.STATUS-PROG` | ALTO | Inexistente = erro; inativo = ignorado |
| BR-PGT-006 | Fator regional indexado por `COD-REGIAO` 1..25 (tabela hardcoded 27 posições) | `01-arqueologia/legado-sifap/natural-programs/BATCHPGT.NSN#L124-L150` | `BENEFICIARIO.COD-REGIAO` | CRÍTICO | Valores de 1,00 a 1,40 |
| BR-PGT-007 | Fator familiar: 0=1,00 / 1-2=1+(n×0,05) / 3-4=1,10+((n-2)×0,03) / 5+=1,16+((n-4)×0,02) | `01-arqueologia/legado-sifap/natural-programs/BATCHPGT.NSN#L247-L259` | `BENEFICIARIO.NUM-DEPENDENTES` | CRÍTICO | Cálculo financeiro |
| BR-PGT-008 | Fator renda: 5 faixas (300/600/1000/1500/9999,99) → (1,00/0,85/0,70/0,55/0,40) | `01-arqueologia/legado-sifap/natural-programs/BATCHPGT.NSN#L153-L162` | `BENEFICIARIO.RENDA-FAMILIAR` | CRÍTICO | PERFORM DET-FAIXA-RENDA-BATCH |
| BR-PGT-009 | Fator idade: ≥65=1,15 · ≥60=1,10 · <18=1,05 · demais=1,00 | `01-arqueologia/legado-sifap/natural-programs/BATCHPGT.NSN#L265-L277` | `BENEFICIARIO.DT-NASCIMENTO` | CRÍTICO | Idade calculada pelo ano somente |
| BR-PGT-010 | Valor benefício = `VLR-BASE × fator-reg × fator-fam × fator-rnd × fator-idade × (1 + FATOR-REAJUSTE)` | `01-arqueologia/legado-sifap/natural-programs/BATCHPGT.NSN#L280-L282` | `PROGRAMA-SOCIAL.VLR-BASE`, `.FATOR-REAJUSTE` | CRÍTICO | Fórmula principal |
| BR-PGT-011 | Valores monetários sofrem **truncamento** para 2 casas (não arredondamento) | `01-arqueologia/legado-sifap/natural-programs/BATCHPGT.NSN#L284-L285` | `PAGAMENTO.VLR-*` | CRÍTICO | ⚠️ Diverge de BR-REL-003 |
| BR-PGT-012 | Em dezembro (`#MES = 12`), gera 13º = `VLR-BASE × fator-reg × fator-idade` — `TIPO-PGTO = 'D'` | `01-arqueologia/legado-sifap/natural-programs/BATCHPGT.NSN#L292-L304` | `PAGAMENTO.TIPO-PGTO` | CRÍTICO | Só 1 vez/ano |
| BR-PGT-013 | Em dezembro, programas `TIPO = 'A'` recebem abono adicional de 15% do benefício | `01-arqueologia/legado-sifap/natural-programs/BATCHPGT.NSN#L298-L303` | `PROGRAMA-SOCIAL.TIPO`, `PAGAMENTO.VLR-ABONO` | CRÍTICO | Combina com 13º |
| BR-PGT-014 | Desconto = 3% do bruto quando bruto > R$ 500,00; senão zero | `01-arqueologia/legado-sifap/natural-programs/BATCHPGT.NSN#L308-L311` | `PAGAMENTO.VLR-DESCONTO` | CRÍTICO | ⚠️ Diverge de CALCDSCT (BR-DSCT-001) |
| BR-PGT-015 | Líquido nunca pode ser negativo (clamp em zero) | `01-arqueologia/legado-sifap/natural-programs/BATCHPGT.NSN#L316-L318` | `PAGAMENTO.VLR-LIQUIDO` | ALTO | Defensivo |
| BR-PGT-016 | Pagamento nasce com `STATUS-PGTO = 'G'` (Gerado) | `01-arqueologia/legado-sifap/natural-programs/BATCHPGT.NSN#L332` | `PAGAMENTO.STATUS-PGTO` | ALTO | Estado inicial do ciclo |
| BR-PGT-017 | Deduplicação por CPF no loop assume ordenação ascendente (READ BY CPF) | `01-arqueologia/legado-sifap/natural-programs/BATCHPGT.NSN#L178-L182` | `BENEFICIARIO.CPF` | ALTO | [MYS-009] "sistemas downstream dependem" |
| BR-PGT-018 | Idade calculada apenas por ano (`#ANO - #ANO-NASC`), sem mês/dia | `01-arqueologia/legado-sifap/natural-programs/BATCHPGT.NSN#L236-L237` | `BENEFICIARIO.DT-NASCIMENTO` | MÉDIO | Quem faz 65 em fev recebe fator desde jan |

### Par 2 · BATCHCON — Conciliação bancária CNAB 240

| ID | Regra de Negócio | Programa Fonte | Campos DDM | Nível de Risco | Notas |
| --- | --- | --- | --- | --- | --- |
| BR-CON-001 | Processa apenas registros CNAB tipo `'3'` (detalhe) | `01-arqueologia/legado-sifap/natural-programs/BATCHCON.NSN#L115-L118` | — | ALTO | Header/trailer ignorados |
| BR-CON-002 | Layout CNAB 240 BB: banco 1-3, lote 4-7, tipo 8, CPF 44-54, valor 120-134, data 140-147, num doc 74-83, cod ret 231-232 | `01-arqueologia/legado-sifap/natural-programs/BATCHCON.NSN#L111-L124` | — | CRÍTICO | Posições fixas hardcoded |
| BR-CON-003 | Valor do CNAB chega em centavos; conversão por divisão por 100 | `01-arqueologia/legado-sifap/natural-programs/BATCHCON.NSN#L130-L132` | — | CRÍTICO | Arredondamento implícito |
| BR-CON-004 | Match exige `NUM-PAGTO + CPF-BENEF + COMPETENCIA` coincidentes | `01-arqueologia/legado-sifap/natural-programs/BATCHCON.NSN#L138-L144` | `PAGAMENTO.NUM-PAGTO`, `.CPF-BENEF`, `.COMPETENCIA` | CRÍTICO | Chave composta |
| BR-CON-005 | Divergência de valor: `|VLR-LIQUIDO − VLR-RETORNO| > 0,01` | `01-arqueologia/legado-sifap/natural-programs/BATCHCON.NSN#L155-L160` | `PAGAMENTO.VLR-LIQUIDO` | CRÍTICO | Tolerância de 1 centavo |
| BR-CON-006 | Cod retorno `'00'` → `STATUS = 'P'` (Pago), grava `DT-PGTO` e `BANCO = 1` | `01-arqueologia/legado-sifap/natural-programs/BATCHCON.NSN#L172-L180` | `PAGAMENTO.STATUS-PGTO`, `.DT-PAGAMENTO`, `.COD-BANCO` | CRÍTICO | Pagamento confirmado |
| BR-CON-007 | Cod retorno `'01'` → `STATUS = 'D'` (Devolvido) | `01-arqueologia/legado-sifap/natural-programs/BATCHCON.NSN#L181-L187` | `PAGAMENTO.STATUS-PGTO` | ALTO | Reenviar? |
| BR-CON-008 | Cod retorno `'02'` → `STATUS = 'E'` (Estornado) | `01-arqueologia/legado-sifap/natural-programs/BATCHCON.NSN#L188-L194` | `PAGAMENTO.STATUS-PGTO` | ALTO | Reversão |
| BR-CON-009 | Códigos diferentes de 00/01/02: log "DESCONHECIDO" sem alterar pagamento | `01-arqueologia/legado-sifap/natural-programs/BATCHCON.NSN#L195-L198` | — | MÉDIO | Limitação conhecida |
| BR-CON-010 | Toda conciliação (match ou divergência) gera registro em `AUDITORIA` | `01-arqueologia/legado-sifap/natural-programs/BATCHCON.NSN#L167-L270` | `AUDITORIA.*` | ALTO | Trilha imutável |
| BR-CON-011 | Auditoria batch: `USUARIO = 'BATCH'`, `ACAO = 'CO'` (conciliado) ou `'DV'` (divergência) | `01-arqueologia/legado-sifap/natural-programs/BATCHCON.NSN#L244-L260` | `AUDITORIA.USUARIO`, `.ACAO` | MÉDIO | Usuário literal |

### Par 2 · BATCHREL — Relatório consolidado mensal

| ID | Regra de Negócio | Programa Fonte | Campos DDM | Nível de Risco | Notas |
| --- | --- | --- | --- | --- | --- |
| BR-REL-001 | Agrupamento em 5 macro-regiões: 1-5 Norte, 6-10 Nordeste, 11-15 Sudeste, 16-20 Sul, demais C-Oeste | `01-arqueologia/legado-sifap/natural-programs/BATCHREL.NSN#L116-L133` | `BENEFICIARIO.COD-REGIAO` | ALTO | Mapeamento por faixa contínua |
| BR-REL-002 | 5 buckets de status: G→Gerado · P→Pago · C→Cancelado · D→Devolvido · E→Estornado; demais→"Gerado" | `01-arqueologia/legado-sifap/natural-programs/BATCHREL.NSN#L146-L159` | `PAGAMENTO.STATUS-PGTO` | MÉDIO | Default suspeito |
| BR-REL-003 | Relatório aplica **arredondamento bancário** (+0,005 e truncamento) | `01-arqueologia/legado-sifap/natural-programs/BATCHREL.NSN#L136-L139` | — | CRÍTICO | ⚠️ Diverge de BR-PGT-011 (truncamento puro) |
| BR-REL-004 | Layout impressora: 66 linhas/página, 132 colunas | `01-arqueologia/legado-sifap/natural-programs/BATCHREL.NSN#L59-L70` | — | BAIXO | Apresentação |
| BR-REL-005 | Totaliza bruto/desconto/líquido por região e status; bucket de status só soma bruto | `01-arqueologia/legado-sifap/natural-programs/BATCHREL.NSN#L137-L167` | `PAGAMENTO.VLR-*` | ALTO | Auditoria contábil |

### Par 3 · CALCBENF — Cálculo valor benefício (interativo)

| ID | Regra de Negócio | Programa Fonte | Campos DDM | Nível de Risco | Notas |
| --- | --- | --- | --- | --- | --- |
| BR-CALC-001 | Valor base × fator regional (27 regiões, 1.0–1.4); região 99 = fator 1.0 | `01-arqueologia/legado-sifap/natural-programs/CALCBENF.NSN#L110-L120` | `PROGRAMA-SOCIAL.VLR-BASE`, `BENEFICIARIO.COD-REGIAO` | CRÍTICO | Tabela hardcoded; [MYS-008] região 99 especial |
| BR-CALC-002 | Fator familiar: até +28% por dependentes (3 patamares: ≤2→+5%, 3-4→+3%, 5+→+2%) | `01-arqueologia/legado-sifap/natural-programs/CALCBENF.NSN#L120-L145` | `BENEFICIARIO.NUM-DEPENDENTES` | CRÍTICO | Idêntico a BR-PGT-007 |
| BR-CALC-003 | Fator de renda: 5 faixas (≤300→1,00 / ≤600→0,85 / ≤1000→0,70 / ≤1500→0,55 / >1500→0,40) | `01-arqueologia/legado-sifap/natural-programs/CALCBENF.NSN#L145-L160` | `BENEFICIARIO.RENDA-FAMILIAR` | CRÍTICO | Idêntico a BR-PGT-008 |
| BR-CALC-004 | [MYS-001] Fator de idade **não aplicado** em CALCBENF — presente apenas em BATCHPGT | `01-arqueologia/legado-sifap/natural-programs/CALCBENF.NSN` (ausência) | `BENEFICIARIO.DT-NASCIMENTO` | ALTO | Divergência: BATCHPGT aplica, CALCBENF não |
| BR-CALC-005 | Validações obrigatórias: beneficiário `STATUS='A'` e programa `STATUS-PROG='A'` | `01-arqueologia/legado-sifap/natural-programs/CALCBENF.NSN#L75-L100` | `BENEFICIARIO.STATUS`, `PROGRAMA-SOCIAL.STATUS-PROG` | CRÍTICO | Impede cálculo se inativo |
| BR-CALC-006 | Truncamento de centavos via `(×100)/100` | `01-arqueologia/legado-sifap/natural-programs/CALCBENF.NSN#L160` | Todos valores N9.2 | CRÍTICO | [MYS-005] Perda acumulada |

| ID     | Regra de Negócio                                                                        | Programa Fonte                                   | Campos DDM                                                               | Nível de Risco | Notas                                      |
| ------ | --------------------------------------------------------------------------------------- | ------------------------------------------------ | ------------------------------------------------------------------------ | -------------- | ------------------------------------------ |
| BR-EX-001 | Desconto total não pode exceder 30% do valor bruto, exceto descontos judiciais (tipo J) | `01-arqueologia/legado-sifap/natural-programs/CALCDSCT.NSN#L142-L148` | `PAGAMENTO.VLR-BRUTO`, `PAGAMENTO.VLR-TOTAL-DSCT`, `PAGAMENTO.TIPO-DSCT` | CRÍTICO        | Exemplo didático. Tipo 'J' = exceção legal |
### Par 3 · CALCDSCT — Cálculo descontos e deduções

| ID | Regra de Negócio | Programa Fonte | Campos DDM | Nível de Risco | Notas |
| --- | --- | --- | --- | --- | --- |
| BR-DSCT-001 | Contribuição social com 4 faixas: ≤500→3%, ≤1000→5%, ≤2000→7%, >2000→9% | `01-arqueologia/legado-sifap/natural-programs/CALCDSCT.NSN#L35-L50` | `PAGAMENTO.VLR-DESCONTO` | CRÍTICO | ⚠️ Diverge de BR-PGT-014 (3% fixo) |
| BR-DSCT-002 | Teto máximo desconto: 30% do valor bruto | `01-arqueologia/legado-sifap/natural-programs/CALCDSCT.NSN#L52-L58` | `PAGAMENTO.VLR-BRUTO` | CRÍTICO | Exceto tipo 'J' |
| BR-DSCT-003 | [MYS-006] Desconto tipo 'J' (judicial) ignora teto de 30% | `01-arqueologia/legado-sifap/natural-programs/CALCDSCT.NSN#L60-L80` | `BENEFICIARIO.DESCONTOS.TIPO-DSCT` | CRÍTICO | Exceção legal — sentença executória |
| BR-DSCT-004 | Validação de vigência: desconto só aplica se dentro datas início/fim | `01-arqueologia/legado-sifap/natural-programs/CALCDSCT.NSN#L65-L75` | `BENEFICIARIO.DESCONTOS.DT-INICIO-DSCT/DT-FIM-DSCT` | ALTO | Vigência por desconto |
| BR-DSCT-005 | Truncamento de centavos via `(×100)/100` | `01-arqueologia/legado-sifap/natural-programs/CALCDSCT.NSN#L90` | Todos valores N9.2 | CRÍTICO | Mesmo padrão de BR-CALC-006 |

### Par 3 · CALCCORR — Correção retroativa por IPCA

| ID | Regra de Negócio | Programa Fonte | Campos DDM | Nível de Risco | Notas |
| --- | --- | --- | --- | --- | --- |
| BR-CORR-001 | Correção = acúmulo de índices IPCA mensais entre competência original e data atual | `01-arqueologia/legado-sifap/natural-programs/CALCCORR.NSN#L90-L130` | `PAGAMENTO.VLR-BRUTO`, `.VLR-CORRECAO` | ALTO | Tabela 2010–2014 hardcoded (desatualizada) |
| BR-CORR-002 | Pagamento já corrigido (`IND-CORRIGIDO = 'S'`) é ignorado | `01-arqueologia/legado-sifap/natural-programs/CALCCORR.NSN#L135-L137` | `PAGAMENTO.IND-CORRIGIDO` | ALTO | Idempotência |
| BR-CORR-003 | Só corrige se diferença > 0 (valor corrigido > valor original) | `01-arqueologia/legado-sifap/natural-programs/CALCCORR.NSN#L153-L155` | `PAGAMENTO.VLR-CORRECAO` | MÉDIO | Nunca reduz |

### Regras de DDMs / Cross-cutting

| ID | Regra de Negócio | Programa Fonte | Campos DDM | Nível de Risco | Notas |
| --- | --- | --- | --- | --- | --- |
| BR-DDM-001 | [MYS-003] Campo `FATOR-K` em PROGRAMA-SOCIAL: N5.4, adicionado 2008, nunca usado | `01-arqueologia/legado-sifap/adabas-ddms/PROGRAMA-SOCIAL.ddm#L40-L50` | `PROGRAMA-SOCIAL.FATOR-K` | CRÍTICO | Identificar propósito |
| BR-DDM-002 | [MYS-010] RELAUDIT filtra ações 'EX' (exclusão) — ocultadas do relatório | `01-arqueologia/legado-sifap/adabas-ddms/AUDITORIA.ddm#L95-L100` | `AUDITORIA.COD-ACAO` | MÉDIO | Ações EX visíveis só em SYSAOS |

> **Outros pares:** adicionem suas regras abaixo conforme seus programas (CADBENEF, CADDEPEND, CADPROG, VALBENEF, VALDOCS, VALELEG, CONSBENF, RELPGT, RELAUDIT).

---

## Regras por Categoria

### Cálculos Financeiros

| ID | Resumo | Fonte |
| --- | --- | --- |
| BR-PGT-006 | Fator regional (tabela 27 posições, 1,00–1,40) | BATCHPGT |
| BR-PGT-007 | Fator familiar por faixa de dependentes | BATCHPGT |
| BR-PGT-008 | Fator renda em 5 faixas (1,00→0,40) | BATCHPGT |
| BR-PGT-009 | Fator idade (≥65/≥60/<18/demais) | BATCHPGT |
| BR-PGT-010 | Fórmula principal do benefício | BATCHPGT |
| BR-PGT-011 | Truncamento `(×100)/100` | BATCHPGT |
| BR-PGT-012 | 13º salário em dezembro | BATCHPGT |
| BR-PGT-013 | Abono 15% em dezembro (programas tipo `'A'`) | BATCHPGT |
| BR-PGT-014 | Desconto 3% do bruto quando > R$ 500 | BATCHPGT |
| BR-PGT-015 | Líquido nunca negativo (clamp em zero) | BATCHPGT |
| BR-PROG-004 | `FATOR-K = 1.00 + (FATOR-REAJ * 0.347215)` | CADPROG |
| BR-CALC-001 | Fator regional (mesma tabela de PGT-006) | CALCBENF |
| BR-CALC-002 | Fator familiar (mesmo de PGT-007) | CALCBENF |
| BR-CALC-003 | Fator renda (mesmo de PGT-008) | CALCBENF |
| BR-DSCT-001 | Contribuição social 4 faixas (3%→9%) | CALCDSCT |
| BR-DSCT-002 | Teto 30% em descontos | CALCDSCT |
| BR-CON-003 | Conversão valor CNAB (centavos ÷ 100) | BATCHCON |
| BR-CON-005 | Tolerância de R$ 0,01 | BATCHCON |
| BR-REL-003 | Arredondamento bancário `+0,005` | BATCHREL |
| BR-REL-005 | Totalização bruto/desconto/líquido | BATCHREL |
| BR-CORR-001 | Correção IPCA acumulada | CALCCORR |

### Validações e Transições de Status

| ID | Resumo | Fonte |
| --- | --- | --- |
| BR-BENEF-005 | Status inicial de inclusão = 'A' (Ativo) | CADBENEF |
| BR-BENEF-006 | Beneficiário >75 anos recebe status 'S' na inclusão | CADBENEF |
| BR-PROG-002 | Status inicial de programa = 'A' (Ativo) | CADPROG |
| BR-PGT-003 | `STATUS = 'A'` para processar beneficiário | BATCHPGT |
| BR-PGT-005 | `STATUS-PROG = 'A'` para processar programa | BATCHPGT |
| BR-PGT-016 | Pagamento nasce com `STATUS-PGTO = 'G'` | BATCHPGT |
| BR-CON-006 | Cod `'00'` → `STATUS = 'P'` (Pago) | BATCHCON |
| BR-CON-007 | Cod `'01'` → `STATUS = 'D'` (Devolvido) | BATCHCON |
| BR-CON-008 | Cod `'02'` → `STATUS = 'E'` (Estornado) | BATCHCON |
| BR-REL-002 | 5 buckets no relatório; desconhecido→"Gerado" | BATCHREL |
| BR-CALC-005 | Beneficiário e programa devem estar ativos | CALCBENF |
| BR-CORR-002 | `IND-CORRIGIDO = 'S'` impede reprocessamento | CALCCORR |

### Regras de Autorização / Controle de Acesso

| ID | Resumo | Fonte |
| --- | --- | --- |
| BR-BENEF-002 | Operação aceita apenas I ou A; qualquer outro valor aborta | CADBENEF |
| BR-DEP-001 | Titular com status C ou D bloqueia inclusão de dependente | CADDEPEND |
| BR-PROG-003 | CADPROG aceita apenas I (Inclusão) e C (Consulta); sem alteração | CADPROG |

### Regras Temporais (Periodicidade / Vigência)

| ID | Resumo | Fonte |
| --- | --- | --- |
| BR-PGT-001 | Competência = AAAAMM derivado de `*DATN` (mensal) | BATCHPGT |
| BR-PGT-012 | 13º somente em dezembro (`#MES = 12`) | BATCHPGT |
| BR-PGT-013 | Abono 15% somente em dezembro, programas tipo `'A'` | BATCHPGT |
| BR-PGT-018 | Idade por ano apenas (`#ANO − #ANO-NASC`) | BATCHPGT |
| BR-PROG-006 | Data de fim = 0 indica vigência indeterminada | CADPROG |
| BR-DSCT-004 | Vigência de descontos (datas início/fim) | CALCDSCT |
| BR-CON-004 | Competência informada via INPUT na conciliação | BATCHCON |

### Controles de Idempotência e Auditoria

| ID | Resumo | Fonte |
| --- | --- | --- |
| BR-PGT-004 | Não gera 2º pagamento na mesma competência/CPF | BATCHPGT |
| BR-PGT-017 | Ordenação CPF ASC com dependência downstream | BATCHPGT |
| BR-CON-010 | Toda conciliação gera registro em AUDITORIA | BATCHCON |
| BR-CON-011 | Auditoria: `USUARIO='BATCH'`, `ACAO='CO'/'DV'` | BATCHCON |
| BR-CORR-002 | Pagamento já corrigido é ignorado | CALCCORR |

### Campos Não Resolvidos (Mistérios)

| ID | Mistério | Fonte |
| --- | --- | --- |
| BR-DDM-001 | [MYS-003] FATOR-K em PROGRAMA-SOCIAL — nunca usado | PROGRAMA-SOCIAL.ddm |
| BR-DDM-002 | [MYS-010] Ações 'EX' ocultadas em RELAUDIT | AUDITORIA.ddm |
| BR-CALC-004 | [MYS-001] Fator idade ausente em CALCBENF (presente só em BATCHPGT) | CALCBENF / BATCHPGT |
| BR-CALC-001 | [MYS-008] Região 99 usa fator padrão 1.0 | CALCBENF |

---

## 🔴 Alertas Críticos para Estágio 2

| Alerta | Regras Envolvidas | Ação Necessária |
| --- | --- | --- |
| **Divergência de desconto** | BR-PGT-014 vs BR-DSCT-001 | BATCHPGT usa 3% fixo; CALCDSCT usa 4 faixas — unificar |
| **Divergência de arredondamento** | BR-PGT-011 vs BR-REL-003 | Truncamento vs arredondamento bancário — qual adotar? |
| **Campo não utilizado** | BR-DDM-001 | FATOR-K existe mas nunca é usado — investigar propósito |
| **Dependência oculta** | BR-PGT-017 | Ordem CPF é crítica para downstream — validar antes de redesenhar |
| **Perda financeira** | BR-CALC-006 / BR-DSCT-005 | Truncamento perde centavos acumulados — revisar para PostgreSQL |
| **Fator divergente** | BR-CALC-004 | Idade aplica em BATCHPGT mas não em CALCBENF — qual é oficial? |
| **Auditoria incompleta** | BR-DDM-002 | Ações 'EX' ocultadas — pode impedir rastreamento de fraudes |

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
BR-PGT-014: BATCHPGT usa desconto 3% fixo se bruto > R$500
BR-DSCT-001: CALCDSCT usa 4 faixas (3% → 9%) + 6 tipos

## Decisão
Manter CALCDSCT como motor oficial; BATCHPGT será refatorado
para reutilizar DiscountCalculationService.

## Consequências
- Performance pode degradar em batch se não otimizar queries
- Descontos históricos (batch 3%) divergirão de novos (completos)
```

---

## Resumo Estatístico

| Métrica | Valor |
| --- | --- |
| Total de regras catalogadas | **71** (6 BENEF + 5 DEP + 6 PROG + 18 PGT + 11 CON + 5 REL + 6 CALC + 5 DSCT + 3 CORR + 2 DDM + 4 cross-ref) |
| Regras nível CRÍTICO | **27** |
| Regras nível ALTO | **27** |
| Regras nível MÉDIO | **14** |
| Regras nível BAIXO | **1** |
| Divergências identificadas | **4** (desconto, arredondamento, fator idade, parentesco DDM vs programa) |
| Mistérios mapeados | **10** (vinculados a mysteries-found.md) |
| Easter Eggs encontrados | **1/3** (Plano Verão 1989–1991 em CALCCORR) |
| Programas cobertos | **9/15** (Par 1 + Par 2 + Par 3) |
| Programas pendentes | **6** (Pares 4, 5: VALBENEF, VALDOCS, VALELEG, CONSBENF, RELPGT, RELAUDIT) |

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

