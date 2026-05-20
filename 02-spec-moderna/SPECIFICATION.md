<!-- markdownlint-disable MD013 MD025 MD026 MD028 MD029 MD034 MD040 MD051 MD056 MD060 -->

# SPECIFICATION — SIFAP 2.0 (Sistema Moderno)

> **Versão:** 2.0  
> **Data:** 2026-05-20  
> **Autores:** Par 1 (RE) + Par 2 (SA)  
> **Status:** Accepted — Pós Passagem #2  
> **Bounded Contexts:** Beneficiary · Social Program · Payment · Bank Reconciliation · Audit (Shared Kernel)

---

## Bounded Context: Beneficiary

### REQ-001: Validação de CPF por Módulo 11

O sistema deverá validar o CPF do beneficiário usando o algoritmo módulo 11 (dois dígitos verificadores) antes de permitir qualquer operação de cadastro.

- **EARS Pattern:** Ubiquitous
- **Source:** `01-arqueologia/legado-sifap/natural-programs/CADBENEF.NSN#L105-L112` (BR-BENEF-001)
- **Critérios de Aceite:**
  - [ ] CPF com dígito verificador inválido é rejeitado com mensagem "CPF inválido"
  - [ ] CPF com formato incorreto (não 11 dígitos) é rejeitado
  - [ ] CPFs conhecidos como inválidos (todos dígitos iguais: 111.111.111-11) são rejeitados
  - [ ] CPF válido permite prosseguir com a operação

### REQ-002: Unicidade de CPF na Base

Quando um operador solicitar inclusão de beneficiário, o sistema deverá rejeitar a operação se já existir registro com o mesmo CPF na base.

- **EARS Pattern:** Event-driven
- **Source:** `01-arqueologia/legado-sifap/natural-programs/CADBENEF.NSN#L139-L148` (BR-BENEF-003)
- **Critérios de Aceite:**
  - [ ] Inclusão com CPF existente retorna HTTP 409 Conflict
  - [ ] Mensagem indica "Beneficiário com CPF XXX.XXX.XXX-XX já cadastrado"
  - [ ] Alteração com CPF inexistente retorna HTTP 404 Not Found
  - [ ] Base mantém integridade após tentativas concorrentes (unique constraint)

### REQ-003: Status Inicial do Beneficiário

Quando um novo beneficiário for incluído, o sistema deverá atribuir status 'ACTIVE' automaticamente.

- **EARS Pattern:** Event-driven
- **Source:** `01-arqueologia/legado-sifap/natural-programs/CADBENEF.NSN#L163-L165` (BR-BENEF-005)
- **Critérios de Aceite:**
  - [ ] Novo beneficiário sempre recebe status ACTIVE
  - [ ] Status não pode ser informado pelo operador na inclusão
  - [ ] Registro de auditoria criado com action=BENEFICIARY_CREATED

### REQ-004: Classificação Etária de Beneficiário Idoso

Onde o beneficiário tiver idade superior a 75 anos na data de inclusão, o sistema deverá atribuir a classificação 'ELDERLY' (separada do status de suspensão).

- **EARS Pattern:** Optional
- **Source:** `01-arqueologia/legado-sifap/natural-programs/CADBENEF.NSN#L167-L169` (BR-BENEF-006)
- **Critérios de Aceite:**
  - [ ] Beneficiário >75 anos recebe flag `ageCategory=ELDERLY` além de status ACTIVE
  - [ ] Classificação etária é campo separado do status administrativo (resolve MYS-002)
  - [ ] Idade calculada usando data completa (não apenas ano)
  - [ ] Classificação atualizada em reprocessamento batch (não apenas na inclusão)

### REQ-005: Bloqueio de Dependente para Titular Inativo

Se o titular tiver status CANCELLED ou DETACHED, então o sistema deverá rejeitar a inclusão de dependentes para esse titular.

- **EARS Pattern:** Unwanted
- **Source:** `01-arqueologia/legado-sifap/natural-programs/CADDEPEND.NSN#L46-L56` (BR-DEP-001)
- **Critérios de Aceite:**
  - [ ] Tentativa de adicionar dependente a titular CANCELLED retorna HTTP 422
  - [ ] Tentativa de adicionar dependente a titular DETACHED retorna HTTP 422
  - [ ] Mensagem indica o status do titular e sugere reativação
  - [ ] Titular ACTIVE ou ELDERLY permite inclusão normalmente

### REQ-006: Limite de Dependentes por Titular

Onde o beneficiário titular já possuir 10 dependentes cadastrados, o sistema deverá rejeitar novas inclusões.

- **EARS Pattern:** Optional
- **Source:** `01-arqueologia/legado-sifap/natural-programs/CADDEPEND.NSN#L63-L66` (BR-DEP-002)
- **Critérios de Aceite:**
  - [ ] Limite de 10 dependentes (capacidade do PE group, não 5 como limitava a tela legada)
  - [ ] Tentativa de incluir 11º dependente retorna HTTP 422 com contagem atual
  - [ ] Contagem considera apenas dependentes ativos

---

## Bounded Context: Social Program

### REQ-007: Cadastro de Programa Social com Código Único

Quando um gestor criar um novo programa social, o sistema deverá garantir unicidade do código do programa na base.

- **EARS Pattern:** Event-driven
- **Source:** `01-arqueologia/legado-sifap/natural-programs/CADPROG.NSN#L77-L82` (BR-PROG-001)
- **Critérios de Aceite:**
  - [ ] Código duplicado retorna HTTP 409 Conflict
  - [ ] Código é alfanumérico de até 4 caracteres (resolve divergência N4/A4 — ADR-001)
  - [ ] Programa criado com status ACTIVE automaticamente

### REQ-008: Tipificação de Programa Social

O sistema deverá classificar cada programa social em um dos tipos: ASSISTENCIAL (A), PREVIDENCIARIO (P) ou TRABALHO (T).

- **EARS Pattern:** Ubiquitous
- **Source:** `01-arqueologia/legado-sifap/natural-programs/CADPROG.NSN#L20` (BR-PROG-005)
- **Critérios de Aceite:**
  - [ ] Tipo é obrigatório na criação do programa
  - [ ] Apenas valores A, P ou T são aceitos
  - [ ] Tipo determina elegibilidade para abono de dezembro (tipo A recebe 15%)

### REQ-009: Cálculo do Fator-K para Valor Base

Quando um programa social for criado com valor base e fator de reajuste, o sistema deverá calcular o FATOR-K pela fórmula: `FATOR_K = 1.00 + (FATOR_REAJUSTE × 0.347215)` e aplicar ao valor base.

- **EARS Pattern:** Event-driven
- **Source:** `01-arqueologia/legado-sifap/natural-programs/CADPROG.NSN#L87-L88` (BR-PROG-004)
- **Critérios de Aceite:**
  - [ ] Fórmula aplicada corretamente com precisão de 4 casas decimais
  - [ ] Valor final = VLR_BASE × FATOR_K armazenado em `vlr_base_individual`
  - [ ] Constante 0.347215 parametrizada (não hardcoded) — configurável via admin
  - [ ] Histórico de alterações do fator registrado para auditoria

---

## Bounded Context: Payment (Core Domain)

### REQ-010: Geração de Ciclo Mensal de Pagamento

Quando o sistema iniciar o processamento de ciclo mensal, o sistema deverá gerar pagamentos para todos os beneficiários ativos vinculados a programas ativos, para a competência informada.

- **EARS Pattern:** Event-driven
- **Source:** `01-arqueologia/legado-sifap/natural-programs/BATCHPGT.NSN#L178-L340` (BR-PGT-001 a 018)
- **Critérios de Aceite:**
  - [ ] Competência (AAAAMM) é parâmetro explícito (não derivada de data do sistema)
  - [ ] Apenas beneficiários com status ACTIVE são processados
  - [ ] Apenas programas com status ACTIVE são considerados
  - [ ] Pagamento criado com status GENERATED
  - [ ] NUM-PAGTO gerado como sequencial atômico (sem race condition)

### REQ-011: Idempotência de Geração de Pagamento

Se já existir pagamento para o mesmo CPF na mesma competência, então o sistema deverá ignorar a duplicação sem gerar erro.

- **EARS Pattern:** Unwanted
- **Source:** `01-arqueologia/legado-sifap/natural-programs/BATCHPGT.NSN#L201-L210` (BR-PGT-004)
- **Critérios de Aceite:**
  - [ ] Constraint UNIQUE em (cpf, competencia) impede duplicatas no banco
  - [ ] Reprocessamento de ciclo não gera pagamentos duplicados
  - [ ] Log registra "pagamento já existe" para cada skip
  - [ ] Contadores de processados/skipped retornados no resultado

### REQ-012: Cálculo de Valor do Benefício

Quando o sistema calcular o valor de um beneficiário, o sistema deverá aplicar a fórmula: `VALOR = VLR_BASE × fator_regional × fator_familiar × fator_renda × fator_idade × (1 + FATOR_REAJUSTE)`.

- **EARS Pattern:** Event-driven
- **Source:** `01-arqueologia/legado-sifap/natural-programs/BATCHPGT.NSN#L280-L282` (BR-PGT-010)
- **Critérios de Aceite:**
  - [ ] Fator regional aplicado conforme tabela de 27 regiões (1.00 a 1.40)
  - [ ] Fator familiar aplicado conforme faixas de dependentes (BR-PGT-007)
  - [ ] Fator renda aplicado conforme 5 faixas (BR-PGT-008)
  - [ ] Fator idade aplicado: ≥65→1.15, ≥60→1.10, <18→1.05, demais→1.00
  - [ ] Idade calculada com data completa (dia/mês/ano), não apenas ano
  - [ ] Resultado com arredondamento bancário (half-even) para 2 casas decimais

### REQ-013: Desconto por Contribuição Social (Motor Unificado)

Onde o valor bruto do pagamento for calculado, o sistema deverá aplicar desconto por faixas: ≤R$500→3%, ≤R$1000→5%, ≤R$2000→7%, >R$2000→9%, com teto de 30% do bruto.

- **EARS Pattern:** Optional
- **Source:** `01-arqueologia/legado-sifap/natural-programs/CALCDSCT.NSN#L35-L58` (BR-DSCT-001, BR-DSCT-002)
- **Critérios de Aceite:**
  - [ ] Motor de desconto CALCDSCT é o oficial (não o 3% fixo de BATCHPGT) — ADR-002
  - [ ] Teto de 30% aplicado exceto para descontos judiciais (tipo J)
  - [ ] Valor líquido nunca negativo (clamp em zero) — BR-PGT-015
  - [ ] Vigência de descontos respeitada (datas início/fim) — BR-DSCT-004

### REQ-014: Geração de 13º Salário em Dezembro

Enquanto a competência for dezembro (mês 12), quando o sistema gerar pagamentos, o sistema deverá criar um pagamento adicional de 13º salário com TIPO_PGTO = 'D'.

- **EARS Pattern:** Complex (State + Event)
- **Source:** `01-arqueologia/legado-sifap/natural-programs/BATCHPGT.NSN#L292-L304` (BR-PGT-012)
- **Critérios de Aceite:**
  - [ ] 13º gerado apenas em dezembro (competência AAAA12)
  - [ ] Valor do 13º = VLR_BASE × fator_regional × fator_idade
  - [ ] Tipo de pagamento marcado como DECIMO_TERCEIRO
  - [ ] Apenas um 13º por beneficiário por ano

### REQ-015: Abono Adicional para Programas Assistenciais

Enquanto a competência for dezembro, onde o programa for tipo ASSISTENCIAL (A), o sistema deverá gerar abono adicional de 15% sobre o valor do benefício.

- **EARS Pattern:** Complex (State + Optional)
- **Source:** `01-arqueologia/legado-sifap/natural-programs/BATCHPGT.NSN#L298-L303` (BR-PGT-013)
- **Critérios de Aceite:**
  - [ ] Abono de 15% aplicado apenas a programas tipo A (Assistencial)
  - [ ] Abono gerado como registro separado com tipo ABONO
  - [ ] Apenas em dezembro
  - [ ] Cumulativo com 13º (beneficiário tipo A recebe: mensal + 13º + abono)

---

## Bounded Context: Bank Reconciliation

### REQ-016: Processamento de Arquivo Retorno CNAB 240

Quando um arquivo de retorno CNAB 240 do Banco do Brasil for recebido, o sistema deverá processar apenas registros tipo '3' (detalhe), extraindo: CPF (pos 44-54), valor em centavos (pos 120-134), data (pos 140-147), num documento (pos 74-83) e código retorno (pos 231-232).

- **EARS Pattern:** Event-driven
- **Source:** `01-arqueologia/legado-sifap/natural-programs/BATCHCON.NSN#L111-L124` (BR-CON-001, BR-CON-002)
- **Critérios de Aceite:**
  - [ ] Registros tipo '3' processados; header/trailer ignorados
  - [ ] Valor convertido de centavos para reais (÷100)
  - [ ] Layout CNAB 240 parametrizado (posições configuráveis, não hardcoded)
  - [ ] Arquivo inválido (formato incorreto) rejeitado com erro descritivo

### REQ-017: Match de Pagamento por Chave Composta

Quando um registro CNAB for processado, o sistema deverá localizar o pagamento correspondente pela chave composta: NUM_PAGTO + CPF_BENEF + COMPETENCIA.

- **EARS Pattern:** Event-driven
- **Source:** `01-arqueologia/legado-sifap/natural-programs/BATCHCON.NSN#L138-L144` (BR-CON-004)
- **Critérios de Aceite:**
  - [ ] Match encontrado: prosseguir para validação de valor
  - [ ] Match não encontrado: registrar como "pagamento não localizado" em auditoria
  - [ ] Chave composta garante unicidade do match

### REQ-018: Transição de Status por Código de Retorno

Quando o código de retorno CNAB for processado, o sistema deverá transicionar o pagamento: '00'→PAID, '01'→RETURNED, '02'→REVERSED.

- **EARS Pattern:** Event-driven
- **Source:** `01-arqueologia/legado-sifap/natural-programs/BATCHCON.NSN#L172-L198` (BR-CON-006 a 009)
- **Critérios de Aceite:**
  - [ ] Código '00': status → PAID, data de pagamento registrada
  - [ ] Código '01': status → RETURNED
  - [ ] Código '02': status → REVERSED
  - [ ] Outros códigos: status → DIVERGENT (novo status, resolve MYS-CON-08), log "código desconhecido"
  - [ ] Transição inválida (ex: PAID→GENERATED) rejeitada

### REQ-019: Validação de Divergência de Valor

Se o valor retornado pelo banco divergir do valor líquido em mais de R$ 0,01, então o sistema deverá marcar o pagamento como DIVERGENT e registrar a diferença em auditoria.

- **EARS Pattern:** Unwanted
- **Source:** `01-arqueologia/legado-sifap/natural-programs/BATCHCON.NSN#L155-L160` (BR-CON-005)
- **Critérios de Aceite:**
  - [ ] Tolerância de R$ 0,01 (inclusive)
  - [ ] Diferença > R$ 0,01 marca pagamento como DIVERGENT (não PAID)
  - [ ] Auditoria registra: valor esperado, valor retornado, diferença
  - [ ] Pagamento DIVERGENT requer tratamento manual (fila de operador)

---

## Bounded Context: Audit (Shared Kernel)

### REQ-020: Registro Imutável de Auditoria

O sistema deverá registrar em trilha de auditoria imutável (append-only) toda operação que altere estado de negócio, incluindo: ação, usuário, timestamp, entidade afetada e detalhes da mudança.

- **EARS Pattern:** Ubiquitous
- **Source:** `01-arqueologia/legado-sifap/natural-programs/BATCHCON.NSN#L167-L270` (BR-CON-010, BR-CON-011)
- **Critérios de Aceite:**
  - [ ] Registros de auditoria são append-only (sem UPDATE ou DELETE)
  - [ ] Toda mudança de estado em qualquer contexto gera evento de auditoria
  - [ ] Campos obrigatórios: action, userId, entityType, entityId, timestamp, oldState, newState
  - [ ] Consulta filtrada por período, usuário e tipo de ação disponível
  - [ ] Ações de exclusão ('EX') visíveis no relatório (resolve BR-DDM-002)

---

## Open Questions (Not Requirements Yet)

| ID | Questão | Origem | Impacto |
|----|---------|--------|---------|
| OQ-001 | Origem normativa da constante 0.347215 no FATOR-K | MYS-001, MYS-004 | Risco legal/auditoria se implementar sem base legal |
| OQ-002 | Onde está o programa de remessa CNAB de envio ao BB? | MYS-PGT-02 | Ciclo de pagamento pode estar incompleto |
| OQ-003 | CALCBENF/CALCDSCT existem como subprogramas em produção? | MYS-PGT-01 | Pode haver regras diferentes em outro .NSN |
| OQ-004 | Quem são os "sistemas downstream" que dependem da ordem CPF? | MYS-PGT-02 | Pode quebrar integração oculta |
| OQ-005 | Quem consome o relatório BATCHREL (TCU? CGU? interno?) | discovery-report §3.4 | Definir formato de saída do relatório moderno |
| OQ-006 | Campo RENDA-MAX declarado mas nunca aplicado — elegibilidade é verificada? | MYS-PGT-05 | Feature não implementada ou implementada em outro lugar |

---

## Traceability Matrix

| REQ-ID | Regra(s) Fonte | Bounded Context | Programa(s) Legado |
|--------|---------------|-----------------|-------------------|
| REQ-001 | BR-BENEF-001 | Beneficiary | CADBENEF.NSN#L105-L112 |
| REQ-002 | BR-BENEF-003 | Beneficiary | CADBENEF.NSN#L139-L148 |
| REQ-003 | BR-BENEF-005 | Beneficiary | CADBENEF.NSN#L163-L165 |
| REQ-004 | BR-BENEF-006 | Beneficiary | CADBENEF.NSN#L167-L169 |
| REQ-005 | BR-DEP-001 | Beneficiary | CADDEPEND.NSN#L46-L56 |
| REQ-006 | BR-DEP-002 | Beneficiary | CADDEPEND.NSN#L63-L66 |
| REQ-007 | BR-PROG-001 | Social Program | CADPROG.NSN#L77-L82 |
| REQ-008 | BR-PROG-005 | Social Program | CADPROG.NSN#L20 |
| REQ-009 | BR-PROG-004 | Social Program | CADPROG.NSN#L87-L88 |
| REQ-010 | BR-PGT-001 a 018 | Payment | BATCHPGT.NSN#L178-L340 |
| REQ-011 | BR-PGT-004 | Payment | BATCHPGT.NSN#L201-L210 |
| REQ-012 | BR-PGT-010 | Payment | BATCHPGT.NSN#L280-L282 |
| REQ-013 | BR-DSCT-001, BR-DSCT-002 | Payment | CALCDSCT.NSN#L35-L58 |
| REQ-014 | BR-PGT-012 | Payment | BATCHPGT.NSN#L292-L304 |
| REQ-015 | BR-PGT-013 | Payment | BATCHPGT.NSN#L298-L303 |
| REQ-016 | BR-CON-001, BR-CON-002 | Bank Reconciliation | BATCHCON.NSN#L111-L124 |
| REQ-017 | BR-CON-004 | Bank Reconciliation | BATCHCON.NSN#L138-L144 |
| REQ-018 | BR-CON-006 a 009 | Bank Reconciliation | BATCHCON.NSN#L172-L198 |
| REQ-019 | BR-CON-005 | Bank Reconciliation | BATCHCON.NSN#L155-L160 |
| REQ-020 | BR-CON-010, BR-CON-011 | Audit | BATCHCON.NSN#L167-L270 |
