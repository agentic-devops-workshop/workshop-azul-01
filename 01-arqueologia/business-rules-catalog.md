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
| BR-PGT-005 | Programa social precisa existir e ter `STATUS-PROG = 'A'` | `01-arqueologia/legado-sifap/natural-programs/BATCHPGT.NSN#L213-L230` | `PROGRAMA-SOCIAL.STATUS-PROG` | ALTO | Programa inexistente = erro; inativo = ignorado |
| BR-PGT-006 | Fator regional indexado por `COD-REGIAO` 1..25 (tabela hardcoded 27 posições) | `01-arqueologia/legado-sifap/natural-programs/BATCHPGT.NSN#L124-L150, L240-L244` | `BENEFICIARIO.COD-REGIAO` | CRÍTICO | Valores de 1,00 a 1,40 |
| BR-PGT-007 | Fator familiar por faixa de dependentes: 0=1,00 / 1-2=1+(n×0,05) / 3-4=1,10+((n-2)×0,03) / 5+=1,16+((n-4)×0,02) | `01-arqueologia/legado-sifap/natural-programs/BATCHPGT.NSN#L247-L259` | `BENEFICIARIO.NUM-DEPENDENTES` | CRÍTICO | Cálculo financeiro |
| BR-PGT-008 | Fator renda em 5 faixas (300 / 600 / 1000 / 1500 / 9999,99) → (1,00 / 0,85 / 0,70 / 0,55 / 0,40) | `01-arqueologia/legado-sifap/natural-programs/BATCHPGT.NSN#L153-L162, L262` | `BENEFICIARIO.RENDA-FAMILIAR` | CRÍTICO | Faixas hardcoded; lógica em PERFORM DET-FAIXA-RENDA-BATCH |
| BR-PGT-009 | Fator idade: ≥65=1,15 · ≥60=1,10 · <18=1,05 · demais=1,00 | `01-arqueologia/legado-sifap/natural-programs/BATCHPGT.NSN#L265-L277` | `BENEFICIARIO.DT-NASCIMENTO` | CRÍTICO | Idade pelo ano somente |
| BR-PGT-010 | Valor benefício = `VLR-BASE × fator-reg × fator-fam × fator-rnd × fator-idade × (1 + FATOR-REAJUSTE)` | `01-arqueologia/legado-sifap/natural-programs/BATCHPGT.NSN#L280-L282` | `PROGRAMA-SOCIAL.VLR-BASE`, `.FATOR-REAJUSTE` | CRÍTICO | Fórmula principal |
| BR-PGT-011 | Valores monetários sofrem **truncamento** para 2 casas (não arredondamento) | `01-arqueologia/legado-sifap/natural-programs/BATCHPGT.NSN#L284-L285, L295-L296, L310-L311, L319-L320` | `PAGAMENTO.VLR-*` | CRÍTICO | Divergente de BR-REL-003 |
| BR-PGT-012 | Em dezembro (`#MES = 12`), gera 13º = `VLR-BASE × fator-reg × fator-idade` — `TIPO-PGTO = 'D'` | `01-arqueologia/legado-sifap/natural-programs/BATCHPGT.NSN#L292-L304` | `PAGAMENTO.TIPO-PGTO` | CRÍTICO | Só ocorre 1 vez/ano |
| BR-PGT-013 | Em dezembro, programas com `TIPO = 'A'` recebem abono adicional de 15% do valor benefício | `01-arqueologia/legado-sifap/natural-programs/BATCHPGT.NSN#L298-L303` | `PROGRAMA-SOCIAL.TIPO`, `PAGAMENTO.VLR-ABONO` | CRÍTICO | Combina com 13º |
| BR-PGT-014 | Desconto = 3% do bruto quando bruto > R$ 500,00; senão zero | `01-arqueologia/legado-sifap/natural-programs/BATCHPGT.NSN#L308-L311` | `PAGAMENTO.VLR-DESCONTO` | CRÍTICO | Cabeçalho dizia chamar CALCDSCT — inline |
| BR-PGT-015 | Líquido nunca pode ser negativo (clamp em zero) | `01-arqueologia/legado-sifap/natural-programs/BATCHPGT.NSN#L316-L318` | `PAGAMENTO.VLR-LIQUIDO` | ALTO | Defensivo |
| BR-PGT-016 | Pagamento nasce com `STATUS-PGTO = 'G'` (Gerado) | `01-arqueologia/legado-sifap/natural-programs/BATCHPGT.NSN#L332` | `PAGAMENTO.STATUS-PGTO` | ALTO | Estado inicial do ciclo |
| BR-PGT-017 | Deduplicação por CPF no loop assume ordenação ascendente (READ BY CPF) | `01-arqueologia/legado-sifap/natural-programs/BATCHPGT.NSN#L178-L179, L182` | `BENEFICIARIO.CPF` | ALTO | Comentário: "sistemas downstream dependem" |
| BR-PGT-018 | Idade calculada apenas por ano (`#ANO - #ANO-NASC`), sem considerar mês/dia | `01-arqueologia/legado-sifap/natural-programs/BATCHPGT.NSN#L236-L237` | `BENEFICIARIO.DT-NASCIMENTO` | MÉDIO | Beneficiário faz 65 em fev recebe fator desde jan |

### Par 2 · BATCHCON — Conciliação bancária CNAB 240

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
| BR-CON-001 | Processa apenas registros CNAB tipo `'3'` (detalhe) | `01-arqueologia/legado-sifap/natural-programs/BATCHCON.NSN#L115-L118` | — | ALTO | Header/trailer ignorados |
| BR-CON-002 | Layout CNAB 240 BB: banco 1-3, lote 4-7, tipo 8, CPF 44-54, valor 120-134, data 140-147, num doc 74-83, cod ret 231-232 | `01-arqueologia/legado-sifap/natural-programs/BATCHCON.NSN#L111-L113, L120-L124` | — | CRÍTICO | Posições fixas hardcoded |
| BR-CON-003 | Valor do CNAB chega em centavos; conversão por divisão por 100 | `01-arqueologia/legado-sifap/natural-programs/BATCHCON.NSN#L130-L132` | — | CRÍTICO | Arredondamento implícito |
| BR-CON-004 | Match exige `NUM-PAGTO + CPF-BENEF + COMPETENCIA` coincidentes | `01-arqueologia/legado-sifap/natural-programs/BATCHCON.NSN#L138-L144` | `PAGAMENTO.NUM-PAGTO`, `.CPF-BENEF`, `.COMPETENCIA` | CRÍTICO | Chave composta |
| BR-CON-005 | Divergência de valor: `|VLR-LIQUIDO − VLR-RETORNO| > 0,01` | `01-arqueologia/legado-sifap/natural-programs/BATCHCON.NSN#L155-L160` | `PAGAMENTO.VLR-LIQUIDO` | CRÍTICO | Tolerância de 1 centavo |
| BR-CON-006 | Cod retorno `'00'` → `STATUS = 'P'`, grava `DT-PGTO` e `BANCO = 1` (BB) | `01-arqueologia/legado-sifap/natural-programs/BATCHCON.NSN#L172-L180` | `PAGAMENTO.STATUS-PGTO`, `.DT-PAGAMENTO`, `.COD-BANCO` | CRÍTICO | Pagamento confirmado |
| BR-CON-007 | Cod retorno `'01'` → `STATUS = 'D'` (Devolvido) | `01-arqueologia/legado-sifap/natural-programs/BATCHCON.NSN#L181-L187` | `PAGAMENTO.STATUS-PGTO` | ALTO | Reenviar? |
| BR-CON-008 | Cod retorno `'02'` → `STATUS = 'E'` (Estornado) | `01-arqueologia/legado-sifap/natural-programs/BATCHCON.NSN#L188-L194` | `PAGAMENTO.STATUS-PGTO` | ALTO | Reversão |
| BR-CON-009 | Códigos diferentes de 00/01/02: log "DESCONHECIDO" sem alterar pagamento | `01-arqueologia/legado-sifap/natural-programs/BATCHCON.NSN#L195-L198` | — | MÉDIO | Limitação |
| BR-CON-010 | Toda conciliação (match ou divergência) gera registro em `AUDITORIA` | `01-arqueologia/legado-sifap/natural-programs/BATCHCON.NSN#L167, L201, L238-L270` | `AUDITORIA.*` | ALTO | Trilha imutável |
| BR-CON-011 | Auditoria de batch grava `USUARIO = 'BATCH'`, `ACAO = 'CO'` (conciliado) ou `'DV'` (divergência) | `01-arqueologia/legado-sifap/natural-programs/BATCHCON.NSN#L244-L245, L259-L260` | `AUDITORIA.USUARIO`, `.ACAO` | MÉDIO | Usuário literal |

### Par 2 · BATCHREL — Relatório consolidado mensal

| ID     | Regra de Negócio | Programa Fonte | Campos DDM | Nível de Risco | Notas |
| ------ | ---------------- | -------------- | ---------- | -------------- | ----- |
| BR-REL-001 | Agrupamento em 5 macro-regiões por intervalo de `COD-REGIAO`: 1-5 Norte, 6-10 Nordeste, 11-15 Sudeste, 16-20 Sul, demais Centro-Oeste | `01-arqueologia/legado-sifap/natural-programs/BATCHREL.NSN#L116-L133` | `BENEFICIARIO.COD-REGIAO` | ALTO | Mapeamento por faixa contínua |
| BR-REL-002 | 5 buckets de status: G→Gerado · P→Pago · C→Cancelado · D→Devolvido · E→Estornado; demais caem em "Gerado" | `01-arqueologia/legado-sifap/natural-programs/BATCHREL.NSN#L146-L159` | `PAGAMENTO.STATUS-PGTO` | MÉDIO | Default suspeito |
| BR-REL-003 | Relatório aplica **arredondamento bancário** (+0,005 e truncamento) — diverge do truncamento puro de BR-PGT-011 | `01-arqueologia/legado-sifap/natural-programs/BATCHREL.NSN#L136-L139` | — | CRÍTICO | Comentário explícito de divergência |
| BR-REL-004 | Layout impressora: 66 linhas/página, 132 colunas | `01-arqueologia/legado-sifap/natural-programs/BATCHREL.NSN#L59, L70` | — | BAIXO | Apresentação |
| BR-REL-005 | Totaliza bruto/desconto/líquido por região e status; bucket de status só soma bruto | `01-arqueologia/legado-sifap/natural-programs/BATCHREL.NSN#L137-L167` | `PAGAMENTO.VLR-*` | ALTO | Auditoria contábil |

> Outros pares: adicionem suas linhas abaixo conforme seus programas.

## Exemplo de linha bem preenchida

| ID     | Regra de Negócio                                                                        | Programa Fonte                                   | Campos DDM                                                               | Nível de Risco | Notas                                      |
| ------ | --------------------------------------------------------------------------------------- | ------------------------------------------------ | ------------------------------------------------------------------------ | -------------- | ------------------------------------------ |
| BR-EX-001 | Desconto total não pode exceder 30% do valor bruto, exceto descontos judiciais (tipo J) | `01-arqueologia/legado-sifap/natural-programs/CALCDSCT.NSN#L142-L148` | `PAGAMENTO.VLR-BRUTO`, `PAGAMENTO.VLR-TOTAL-DSCT`, `PAGAMENTO.TIPO-DSCT` | CRÍTICO        | Exemplo didático. Tipo 'J' = exceção legal |

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

### Regras de Negócio Temporais

- **BR-005:** 13º em dezembro — `BATCHPGT.NSN#L340-L360`
- **BR-006:** Abono natalino em dezembro — `BATCHPGT.NSN#L365-L375`
- **BR-012:** Vigência de descontos (datas início/fim) — `CALCDSCT.NSN#L65-L75`
- **BR-017:** [MYS-004] Cálculo muda em dezembro (13º + abono) — `BATCHPGT.NSN#L340-L365`
<!-- Liste aqui as regras de quem pode fazer o quê -->
- BR-PGT-004 — Idempotência: não gerar 2º pagamento na mesma competência/CPF
- BR-CON-011 — Auditoria batch usa `USUARIO = 'BATCH'` literal; `ACAO = 'CO'` ou `'DV'`

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
<!-- Liste aqui regras com prazos, datas-limite, períodos -->
- BR-PGT-001 — Competência = AAAAMM derivado de `*DATN` (mensal, 1º dia útil)
- BR-PGT-012 — 13º salário somente em dezembro (`#MES = 12`)
- BR-PGT-013 — Abono 15% somente em dezembro, programas tipo `'A'`
- BR-PGT-018 — Idade por ano apenas (`#ANO − #ANO-NASC`), sem mês/dia
- BR-CON-004 — Match de conciliação usa competência informada via `INPUT`

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

