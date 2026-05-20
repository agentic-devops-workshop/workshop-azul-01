<!-- markdownlint-disable MD013 MD025 MD026 MD028 MD029 MD034 MD040 MD051 MD056 MD060 -->

# Análise de DDMs — SIFAP Legacy (Adabas)

> **Data:** 2026-05-20  
> **Extraído de:** `01-arqueologia/legado-sifap/adabas-ddms/`  
> **Propósito:** Mapeamento para migração Java 21 + Spring Boot + PostgreSQL

---

## 📊 DDM 1: BENEFICIARIO (FNR 150)

**Resumo:** Cadastro de 4.2M beneficiários  
**Tamanho médio:** ~850 bytes/registro  
**Estimativa:** 4.200.000 registros

| Nível | Nome Campo | Tipo | Tamanho | Ocor | MU | PE | Observação |
|-------|------------|------|---------|------|----|----|------------|
| 1 | AA · NUM-INSCRICAO | N | 11 | - | | | ISN Alternativo / Matrícula |
| 1 | AB · NUM-CPF | A | 11 | - | | | CPF sem formatação (DE-Descriptor) |
| 1 | AC · NOME-COMPLETO | A | 60 | - | | | Nome civil oficial |
| 1 | AD · NOME-MAE | A | 60 | - | | | Nome da mãe (obrigatório) |
| 1 | AE · NOME-PAI | A | 60 | - | | | Nome do pai (opcional) |
| 1 | AF · DT-NASCIMENTO | N | 8 | - | | | AAAAMMDD |
| 1 | AG · SEXO | A | 1 | - | | | M/F/I (Indefinido) |
| 1 | AH · EST-CIVIL | A | 1 | - | | | S=Solteiro, C=Casado, D=Divorciado, V=Viúvo, U=União estável |
| 1 | AI · RG-NUMERO | A | 15 | - | | | Número RG |
| 1 | AJ · RG-ORGAO | A | 10 | - | | | Órgão expedidor |
| 1 | AK · RG-UF | A | 2 | - | | | UF expedição |
| 1 | AL · RG-DT-EXPEDICAO | N | 8 | - | | | AAAAMMDD |
| **1** | **BA · GRP-ENDERECO** | **-** | **-** | **-** | | | **GRUPO DE ENDEREÇO** |
| 2 | BB · LOGRADOURO | A | 60 | - | | | Rua/Avenida/Travessa |
| 2 | BC · NUMERO | A | 10 | - | | | Número (alfanumérico para S/N) |
| 2 | BD · COMPLEMENTO | A | 30 | - | | | Apto/Bloco/Sala |
| 2 | BE · BAIRRO | A | 40 | - | | | |
| 2 | BF · MUNICIPIO | A | 40 | - | | | |
| 2 | BG · UF | A | 2 | - | | | Sigla UF (DE) |
| 2 | BH · CEP | N | 8 | - | | | CEP sem hífen |
| 2 | BI · COD-IBGE | N | 7 | - | | | Código município IBGE |
| 2 | BJ · COD-REGIAO | A | 2 | - | | | 01-05 ou 99 (especial) |
| 1 | CA · COD-PROGRAMA | A | 4 | - | | | Código programa social (PE!) |
| 1 | CB · DT-CADASTRO | N | 8 | - | | | AAAAMMDD (DE) |
| 1 | CC · DT-INICIO-BENEF | N | 8 | - | | | AAAAMMDD |
| 1 | CD · DT-FIM-BENEF | N | 8 | - | | | AAAAMMDD (0 = sem prazo) |
| 1 | CE · SIT-BENEFICIARIO | A | 1 | - | | | A=Ativo, S=Suspenso, C=Cancelado, I=Inativo, D=Desligado |
| 1 | CF · MOT-SITUACAO | A | 3 | - | | | Código motivo (tabela interna) |
| 1 | CG · DT-ULT-SITUACAO | N | 8 | - | | | AAAAMMDD |
| 1 | CH · VLR-RENDA-FAMILIAR | N | 9.2 | - | | | Renda declarada |
| 1 | CI · QTD-MEMBROS-FAMILIA | N | 2 | - | | | Membros no domicílio |
| 1 | CJ · IND-RENDA-PERCAP | N | 7.2 | - | | | Renda per capita calculada |
| **1** | **DA · GRP-DEPENDENTE** | **-** | **-** | **10** | | **✓ PE** | **GRUPO PERIÓDICO — máx 10 ocorrências** |
| 2 | DB · CPF-DEPENDENTE | A | 11 | - | | | CPF ou 00000000000 |
| 2 | DC · NOME-DEPENDENTE | A | 60 | - | | | |
| 2 | DD · DT-NASC-DEPEND | N | 8 | - | | | AAAAMMDD |
| 2 | DE · PARENTESCO | A | 2 | - | | | FI=Filho, CJ=Cônjuge, NT=Neto, TU=Tutelado |
| 2 | DF · SIT-DEPENDENTE | A | 1 | - | | | A=Ativo, I=Inativo, D=Desligado |
| 2 | DG · IND-DEFICIENCIA | A | 1 | - | | | S/N |
| 1 | EA · TEL-FIXO | A | 14 | - | | | (DD) NNNN-NNNN (adicionado 2015) |
| 1 | EB · TEL-CELULAR | A | 15 | - | | | (DD) NNNNN-NNNN (adicionado 2015) |
| 1 | EC · EMAIL | A | 80 | - | | | Email para notificação (adicionado 2015) |
| 1 | FA · IND-BIOMETRIA | A | 1 | - | | | S=Sim, N=Não, P=Pendente (adicionado 2005) |
| 1 | FB · DT-COLETA-BIO | N | 8 | - | | | AAAAMMDD |
| 1 | FC · COD-POSTO-BIO | A | 6 | - | | | Código posto coleta |
| 1 | FD · HASH-DIGITAL | A | 64 | - | | | SHA-256 template (não implementado) |
| 1 | GA · DT-INCLUSAO | N | 8 | - | | | AAAAMMDD (DE) |
| 1 | GB · HR-INCLUSAO | N | 6 | - | | | HHMMSS |
| 1 | GC · USR-INCLUSAO | A | 8 | - | | | Login Natural |
| 1 | GD · DT-ULT-ALTERACAO | N | 8 | - | | | AAAAMMDD |
| 1 | GE · HR-ULT-ALTERACAO | N | 6 | - | | | HHMMSS |
| 1 | GF · USR-ULT-ALTERACAO | A | 8 | - | | | Login Natural |
| 1 | GG · NUM-VERSAO | N | 5 | - | | | Controle de concorrência |

**Superdescriptors (índices):**
- S1 = AB(1-11) — CPF completo
- S2 = BG(1-2) + CE(1-1) — UF + Situação
- S3 = CA(1-4) + CE(1-1) — Programa + Situação

**Total campos:** 52  
**Grupos periódicos:** 1 (GRP-DEPENDENTE × 10)

---

## 📊 DDM 2: PROGRAMA-SOCIAL (FNR 151)

**Resumo:** Cadastro de 45 programas sociais (tabela paramétrica)  
**Tamanho médio:** ~420 bytes/registro  
**Estimativa:** 45 registros

| Nível | Nome Campo | Tipo | Tamanho | Ocor | MU | PE | Observação |
|-------|------------|------|---------|------|----|----|------------|
| 1 | AA · COD-PROGRAMA | A | 4 | - | | | Chave primária (DE) |
| 1 | AB · NOME-PROGRAMA | A | 60 | - | | | Nome oficial |
| 1 | AC · SIGLA-PROGRAMA | A | 10 | - | | | Sigla (ex: PBF, BPC, PETI) |
| 1 | AD · TIPO-PROGRAMA | A | 1 | - | | | A=Assistência, T=Trabalho, P=Previdência |
| 1 | AE · ORGAO-RESPONSAVEL | A | 10 | - | | | Código órgão MDS/MDAS |
| 1 | AF · LEI-CRIACAO | A | 20 | - | | | Número lei ou decreto |
| 1 | AG · DT-CRIACAO | N | 8 | - | | | AAAAMMDD |
| 1 | AH · DT-ENCERRAMENTO | N | 8 | - | | | AAAAMMDD (0 = vigente) |
| 1 | AI · SIT-PROGRAMA | A | 1 | - | | | A=Ativo, I=Inativo, E=Encerrado |
| 1 | BA · VLR-BASE-INDIVIDUAL | N | 7.2 | - | | | Valor mensal base por pessoa |
| 1 | BB · VLR-BASE-FAMILIAR | N | 7.2 | - | | | Valor mensal base por família |
| 1 | BC · VLR-TETO-BENEF | N | 9.2 | - | | | Valor máximo do benefício |
| 1 | BD · VLR-PISO-BENEF | N | 7.2 | - | | | Valor mínimo do benefício |
| 1 | BE · PCT-REAJUSTE-ANUAL | N | 3.2 | - | | | Percentual reajuste (ex: 5.75) |
| 1 | BF · DT-ULT-REAJUSTE | N | 8 | - | | | AAAAMMDD |
| 1 | BG · FATOR-K | N | 5.4 | - | | | **⚠️ Fator de correção especial — NÃO documentado** |
| 1 | CA · RENDA-MAX-PERCAP | N | 7.2 | - | | | Renda per capita máxima |
| 1 | CB · IDADE-MIN | N | 3 | - | | | Idade mínima beneficiário (0 = sem) |
| 1 | CC · IDADE-MAX | N | 3 | - | | | Idade máxima beneficiário (0 = sem) |
| 1 | CD · IND-EXIGE-FILHOS | A | 1 | - | | | S/N |
| 1 | CE · QTD-MIN-FILHOS | N | 2 | - | | | Mínimo filhos (se CD='S') |
| 1 | CF · IND-EXIGE-ESCOLA | A | 1 | - | | | S/N — frequência escolar |
| 1 | CG · IND-EXIGE-VACINA | A | 1 | - | | | S/N — cartão vacinação |
| 1 | CH · IND-EXIGE-PRENATAL | A | 1 | - | | | S/N — pré-natal |
| 1 | CI · IND-EXIGE-BIOMETRIA | A | 1 | - | | | S/N (obrigatório a partir 2005) |
| **1** | **DA · GRP-FAIXA-CALCULO** | **-** | **-** | **5** | | **✓ PE** | **GRUPO PERIÓDICO — máx 5 faixas de cálculo** |
| 2 | DB · RENDA-INICIO | N | 7.2 | - | | | Início faixa renda |
| 2 | DC · RENDA-FIM | N | 7.2 | - | | | Fim faixa renda |
| 2 | DD · FATOR-MULTIPLICADOR | N | 3.4 | - | | | Fator sobre valor base |
| 2 | DE · VLR-ADICIONAL | N | 7.2 | - | | | Valor fixo adicional |
| 2 | DF · IND-ACUMULATIVO | A | 1 | - | | | S=Acumula com faixa anterior |
| 1 | EA · TIPO-DSCT-APLIC | **✓ MU** | 3 | 8 | **✓ MU** | | Tipos desconto válidos (máx 8) |
| | | | | | | | IR=IRRF, JD=Judicial, CS=Consignado |
| | | | | | | | PA=Pensão alimentícia, EM=Empréstimo |
| | | | | | | | TX=Taxa, OU=Outros, EX=Extraordinário |
| **1** | **FA · GRP-PARAM-REGIONAL** | **-** | **-** | **6** | | **✓ PE** | **GRUPO PERIÓDICO — 5 regiões + 1 especial** |
| 2 | FB · COD-REGIAO | A | 2 | - | | | 01-05 ou 99 |
| 2 | FC · FATOR-REGIONAL | N | 3.4 | - | | | Multiplicador regional |
| 2 | FD · VLR-COMPLEMENTO-REG | N | 7.2 | - | | | Complemento fixo regional |
| 2 | FE · IND-ATIVO-REGIAO | A | 1 | - | | | S/N |
| 1 | GA · DT-INCLUSAO | N | 8 | - | | | AAAAMMDD |
| 1 | GB · USR-INCLUSAO | A | 8 | - | | | |
| 1 | GC · DT-ULT-ALTERACAO | N | 8 | - | | | AAAAMMDD |
| 1 | GD · USR-ULT-ALTERACAO | A | 8 | - | | | |

**Superdescriptors (índices):**
- S1 = AA(1-4) — Código programa
- S2 = AD(1-1) + AI(1-1) — Tipo + Situação

**Total campos:** 42  
**Grupos periódicos:** 2 (GRP-FAIXA-CALCULO × 5, GRP-PARAM-REGIONAL × 6)  
**Multi-valor:** 1 (TIPO-DSCT-APLIC × 8)

---

## 📊 DDM 3: PAGAMENTO (FNR 152)

**Resumo:** Histórico de 180M pagamentos processados  
**Tamanho médio:** ~720 bytes/registro  
**Estimativa:** 180.000.000 registros  
**⚠️ CRÍTICO:** Arquivo sem política de purge — todos registros desde 1998 presentes

| Nível | Nome Campo | Tipo | Tamanho | Ocor | MU | PE | Observação |
|-------|------------|------|---------|------|----|----|------------|
| 1 | AA · NUM-PAGAMENTO | N | 15 | - | | | Sequencial único (DE) |
| 1 | AB · NUM-CPF | A | 11 | - | | | CPF beneficiário (DE) |
| 1 | AC · NUM-INSCRICAO | N | 11 | - | | | Matrícula beneficiário |
| 1 | AD · COD-PROGRAMA | A | 4 | - | | | Programa social (DE) |
| 1 | AE · ANO-MES-REF | N | 6 | - | | | AAAAMM — competência (DE) |
| 1 | AF · NUM-CICLO | N | 6 | - | | | Ciclo processamento |
| 1 | BA · VLR-BRUTO | N | 9.2 | - | | | Valor bruto calculado |
| 1 | BB · VLR-LIQUIDO | N | 9.2 | - | | | Valor líquido (bruto - descontos) |
| 1 | BC · VLR-DESCONTO-TOTAL | N | 7.2 | - | | | Soma descontos |
| **1** | **CA · GRP-DESCONTO** | **-** | **-** | **8** | | **✓ PE** | **GRUPO PERIÓDICO — máx 8 tipos de desconto** |
| 2 | CB · TIPO-DESCONTO | A | 3 | - | | | IR/JD/CS/PA/EM/TX/OU/EX |
| 2 | CC · VLR-DESCONTO | N | 7.2 | - | | | Valor desconto |
| 2 | CD · PCT-DESCONTO | N | 3.2 | - | | | Percentual aplicado |
| 2 | CE · NUM-PROCESSO | A | 20 | - | | | Número processo judicial (se JD) |
| 2 | CF · DT-INICIO-DSCT | N | 8 | - | | | AAAAMMDD |
| 2 | CG · DT-FIM-DSCT | N | 8 | - | | | AAAAMMDD (0 = indefinido) |
| 1 | DA · SIT-PAGAMENTO | A | 1 | - | | | P=Pendente, G=Gerado, E=Emitido |
| | | | | | | | C=Confirmado, D=Devolvido, X=Cancelado |
| | | | | | | | R=Reprocessado |
| 1 | DB · DT-GERACAO | N | 8 | - | | | AAAAMMDD — geração batch (DE) |
| 1 | DC · HR-GERACAO | N | 6 | - | | | HHMMSS |
| 1 | DD · DT-EMISSAO | N | 8 | - | | | AAAAMMDD — envio ao banco |
| 1 | DE · DT-CONFIRMACAO | N | 8 | - | | | AAAAMMDD — retorno banco |
| 1 | DF · DT-CANCELAMENTO | N | 8 | - | | | AAAAMMDD (se aplicável) |
| 1 | DG · MOT-CANCELAMENTO | A | 3 | - | | | Código motivo (tabela interna) |
| 1 | EA · COD-BANCO | A | 3 | - | | | Código FEBRABAN |
| 1 | EB · COD-AGENCIA | A | 6 | - | | | Número agência |
| 1 | EC · NUM-CONTA | A | 13 | - | | | Número conta |
| 1 | ED · TIPO-CONTA | A | 1 | - | | | C=Corrente, P=Poupança |
| 1 | EE · COD-OPERACAO | A | 3 | - | | | Operação caixa (se aplicável) |
| 1 | FA · NUM-OB-SIAFI | A | 12 | - | | | Ordem bancária SIAFI (adicionado 2002) |
| 1 | FB · NUM-NE-SIAFI | A | 12 | - | | | Nota empenho SIAFI |
| 1 | FC · COD-UG-EMITENTE | A | 6 | - | | | Unidade gestora |
| 1 | FD · COD-GESTAO | A | 5 | - | | | Código gestão SIAFI |
| 1 | FE · SIT-INTEG-SIAFI | A | 1 | - | | | I=Integrado, P=Pendente, E=Erro |
| 1 | GA · DT-CONCILIACAO | N | 8 | - | | | AAAAMMDD |
| 1 | GB · SIT-CONCILIACAO | A | 1 | - | | | C=Conciliado, D=Divergência, P=Pendente, N=NA |
| 1 | GC · VLR-CONCILIADO | N | 9.2 | - | | | Valor confirmado banco |
| 1 | GD · COD-RETORNO-BANCO | A | 2 | - | | | Código retorno CNAB 240 |
| 1 | GE · DES-RETORNO-BANCO | A | 40 | - | | | Descrição retorno |
| 1 | HA · HASH-ARQ-REMESSA | A | 64 | - | | | SHA-256 arquivo remessa (adicionado 2015) |
| 1 | HB · HASH-ARQ-RETORNO | A | 64 | - | | | SHA-256 arquivo retorno |
| 1 | IA · DT-INCLUSAO | N | 8 | - | | | AAAAMMDD |
| 1 | IB · HR-INCLUSAO | N | 6 | - | | | HHMMSS |
| 1 | IC · USR-INCLUSAO | A | 8 | - | | | Login — geralmente 'BATCH' |
| 1 | ID · DT-ULT-ALTERACAO | N | 8 | - | | | AAAAMMDD |
| 1 | IE · HR-ULT-ALTERACAO | N | 6 | - | | | HHMMSS |
| 1 | IF · USR-ULT-ALTERACAO | A | 8 | - | | | |

**Superdescriptors (índices):**
- S1 = AB(1-11) + AE(1-6) — CPF + competência
- S2 = AD(1-4) + AE(1-6) + DA(1-1) — Programa + competência + situação
- S3 = AF(1-6) + DA(1-1) — Ciclo + situação

**Total campos:** 50  
**Grupos periódicos:** 1 (GRP-DESCONTO × 8)

---

## 📊 DDM 4: AUDITORIA (FNR 153)

**Resumo:** Log de auditoria — trilha imutável de alterações  
**Tamanho médio:** ~1.2 KB (variável)  
**Estimativa:** 25.000.000 registros  
**⚠️ LEGAL:** Retenção mínima 10 anos (Art 14 Lei 8159). Nenhum registro purgado desde 1998.  
**⚠️ CRÍTICO:** Não reorganizar. Consultas pesadas devem usar S2.

| Nível | Nome Campo | Tipo | Tamanho | Ocor | MU | PE | Observação |
|-------|------------|------|---------|------|----|----|------------|
| 1 | AA · NUM-AUDITORIA | N | 15 | - | | | Sequencial único (DE) |
| 1 | AB · DT-EVENTO | N | 8 | - | | | AAAAMMDD (DE) |
| 1 | AC · HR-EVENTO | N | 6 | - | | | HHMMSS |
| 1 | AD · TS-EVENTO | N | 14 | - | | | AAAAMMDDHHMMSS — precisão |
| 1 | BA · COD-ACAO | A | 2 | - | | | Tipo ação (DE) |
| | | | | | | | IN=Inclusão, AL=Alteração, EX=Exclusão |
| | | | | | | | CO=Consulta, LG=Login, LO=Logout, BT=Batch |
| | | | | | | | ER=Erro, AU=Autorização, RE=Rejeição |
| 1 | BB · COD-MODULO | A | 8 | - | | | Nome programa Natural |
| 1 | BC · DES-ACAO | A | 80 | - | | | Descrição livre da ação |
| 1 | CA · TIPO-ENTIDADE | A | 4 | - | | | BENF/PGTO/PROG/ADMN/SIST |
| 1 | CB · ID-ENTIDADE | A | 15 | - | | | Chave da entidade (DE) |
| 1 | CC · NUM-CPF-AFETADO | A | 11 | - | | | CPF (se aplicável) (DE) |
| 1 | DA · GRP-ANTES | - | - | - | | | GRUPO Estado anterior |
| **2** | **DB · CAMPO-ALTERADO-ANT** | **✓ MU** | 30 | **20** | **✓ MU** | | Nome campo — máx 20 ocorrências |
| **2** | **DC · VALOR-ANTERIOR** | **✓ MU** | 80 | **20** | **✓ MU** | | Valor anterior — máx 20 ocorrências |
| 1 | DD · GRP-DEPOIS | - | - | - | | | GRUPO Estado posterior |
| **2** | **DE · CAMPO-ALTERADO-DEP** | **✓ MU** | 30 | **20** | **✓ MU** | | Nome campo — máx 20 ocorrências |
| **2** | **DF · VALOR-POSTERIOR** | **✓ MU** | 80 | **20** | **✓ MU** | | Valor posterior — máx 20 ocorrências |
| 1 | EA · USR-EVENTO | A | 8 | - | | | Login Natural (DE) |
| 1 | EB · NOME-USUARIO | A | 40 | - | | | Nome completo |
| 1 | EC · COD-PERFIL | A | 3 | - | | | ADM/OPR/CON/AUD/SUP |
| 1 | ED · COD-LOTACAO | A | 10 | - | | | Código unidade organizacional |
| 1 | EE · IP-ORIGEM | A | 15 | - | | | IP terminal (adicionado 2012) |
| 1 | EF · ID-SESSAO | A | 20 | - | | | Identificador sessão |
| 1 | FA · NUM-CICLO-BATCH | N | 6 | - | | | Ciclo processamento (se BT) |
| 1 | FB · NUM-SEQ-BATCH | N | 10 | - | | | Sequencial dentro ciclo |
| 1 | FC · NOM-JOB-BATCH | A | 16 | - | | | Nome JOB JES2/JCL |
| 1 | FD · SIT-BATCH | A | 1 | - | | | S=Sucesso, E=Erro, W=Warning |
| 1 | FE · DES-ERRO-BATCH | A | 120 | - | | | Mensagem erro (se aplicável) |
| 1 | GA · ID-CORRELACAO | A | 36 | - | | | UUID operação composta |
| 1 | GB · NUM-SEQ-CORRELACAO | N | 3 | - | | | Sequencial dentro operação |

**Superdescriptors (índices):**
- S1 = AB(1-8) + BA(1-2) — Data + ação
- S2 = CA(1-4) + CB(1-15) + AB(1-8) — Entidade + data (para consultas pesadas)
- S3 = EA(1-8) + AB(1-8) — Usuário + data

**Total campos:** 34  
**Multi-valor:** 4 (campos antes/depois com máx 20 ocorrências cada)

**Notas importantes:**
- Ações 'CO' (consulta) não gravadas desde 2010 (decisão CGTI — PORT. 213/2010)
- Programa RELAUDIT.NSN filtra ações 'EX' na exibição — para ver exclusões, consultar SYSAOS direto

---

## 📈 Resumo Comparativo

| DDM | Registros (est) | Tamanho médio | Grupos Periódicos | Multi-valor | Observação |
|-----|-----------------|---------------|-------------------|-------------|-----------|
| **BENEFICIARIO** | 4.200.000 | ~850 B | 1 × 10 | — | Quadro expandido com dependentes |
| **PROGRAMA-SOCIAL** | 45 | ~420 B | 2 (× 5, × 6) | 1 × 8 | Tabela paramétrica pequena |
| **PAGAMENTO** | 180.000.000 | ~720 B | 1 × 8 | — | **CRÍTICO** — maior tabela, sem purge |
| **AUDITORIA** | 25.000.000 | ~1.2 KB | — | 4 × 20 | **LEGAL** — retenção mínima 10 anos |

---

## 🔴 Alertas para Migração

| Alerta | DDM | Impacto | Mitigação |
|--------|-----|--------|-----------|
| **FATOR-K não documentado** | PROGRAMA-SOCIAL | Incerteza de cálculo | Entrevistar SENARC; criar teste de cálculo comparativo |
| **Tabela PAGAMENTO sem purge** | PAGAMENTO | 180M registros = 130+ GB | Planejar sharding/particionamento em PostgreSQL |
| **Multi-valor em auditoria** | AUDITORIA | JSON aninhado em PostgreSQL | Usar JSONB com índice GIN |
| **Grupos periódicos** | Todos (exceto AUDITORIA) | Repeating groups = JSON arrays | Normalizar em tabelas filhas (1:N) ou JSONB |
| **Packed decimal** | Todos | Precisão em valores numéricos | Validar truncamento em NUMERIC(15,2) |
| **Descriptors (DE)** | Todos | Índices críticos para performance | Traduzir para índices PostgreSQL + superdescriptors → índices compostos |

---

## 🎯 Estratégia de Mapeamento para PostgreSQL

### Exemplo: GRP-DEPENDENTE (BENEFICIARIO)

**Adabas (Grupo Periódico):**
```
BENEFICIARIO
  ├─ DA · GRP-DEPENDENTE (PE × 10)
     ├─ DB · CPF-DEPENDENTE
     ├─ DC · NOME-DEPENDENTE
     └─ ... (6 campos × 10 ocorrências)
```

**PostgreSQL — Opção A (Normalização completa):**
```sql
CREATE TABLE beneficiario (
  id BIGINT PRIMARY KEY,
  num_inscricao INT NOT NULL,
  num_cpf VARCHAR(11) NOT NULL,
  -- ... outros campos
);

CREATE TABLE beneficiario_dependente (
  id BIGINT PRIMARY KEY,
  beneficiario_id BIGINT NOT NULL REFERENCES beneficiario(id),
  cpf_dependente VARCHAR(11),
  nome_dependente VARCHAR(60),
  -- ... outros campos
  sequencia INT NOT NULL  -- para manter ordem
);
```

**PostgreSQL — Opção B (JSONB — híbrida):**
```sql
CREATE TABLE beneficiario (
  id BIGINT PRIMARY KEY,
  num_cpf VARCHAR(11) NOT NULL,
  dependentes JSONB, -- Array de objetos
  -- ... outros campos
);

-- Índice para consultas
CREATE INDEX idx_beneficiario_dependentes 
ON beneficiario USING GIN (dependentes);
```

---

## 📋 Checklist para Developer

- [ ] Ler este documento completamente
- [ ] Notar **PE** (periódico) e **MU** (multi-valor) em cada tabela
- [ ] Confirmar estratégia com SA: normalizar ou JSONB?
- [ ] Criar migrations Flyway mapeando cada DDM
- [ ] Gerar EntityJPA para cada DDM (records Java 21)
- [ ] Criar repositórios com queries nos Superdescriptors
- [ ] Validar precisão decimal em testes comparativos (Adabas vs PostgreSQL)

---

**Próximo passo:** Usar este mapeamento no Estágio 2 (`@architect`) para desenhar a modelagem PostgreSQL.

