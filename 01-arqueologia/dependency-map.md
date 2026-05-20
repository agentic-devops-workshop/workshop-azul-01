<!-- markdownlint-disable MD013 MD025 MD026 MD028 MD029 MD034 MD040 MD051 MD060 -->

# Mapa de Dependências — SIFAP Legado

![ESTÁGIO 01 Arqueologia](https://img.shields.io/badge/ESTÁGIO-01%20Arqueologia-F25022?style=for-the-badge) ![TIPO Worksheet](https://img.shields.io/badge/TIPO-Worksheet-1A1A1A?style=for-the-badge) ![PREENCHA Durante S1](https://img.shields.io/badge/PREENCHA-Durante%20S1-737373?style=for-the-badge)

> 🗺 **Você está aqui:** [Kit PT-BR](../README.md) → [Estágio 1](README.md) → **dependency-map**

> **Para quem é isto?** Este é um **artefato preenchido pelo time** durante o Estágio 1 (Arqueologia).
>
> **O que você terá ao final do estágio:**
>
> 1. Este documento totalmente preenchido com os dados reais do legado SIFAP
> 2. Rastreabilidade para `01-arqueologia/legado-sifap/` (programas `.NSN` e DDMs)
> 3. Base de evidência usada nas EARS do Estágio 2 (`source_legacy:`)
>
> 📘 **Guia passo a passo:** [`GUIDE.md`](GUIDE.md).


> Use diagramas Mermaid para mapear as dependências entre programas Natural e DDMs Adabas.
> O objetivo é visualizar "quem chama quem" e "quem lê/escreve o quê".

## Como descobrir dependências

- Use `grep` ou Copilot Chat para listar todas as ocorrências de `CALLNAT` nos 15 arquivos `.NSN`.
- Prompt útil: _"Liste todas as ocorrências de CALLNAT nestes arquivos e desenhe um diagrama Mermaid."_
- Para leitura/escrita em DDMs: procure por `READ`, `READ LOGICAL`, `STORE`, `UPDATE`, `DELETE`.

## Diagrama de Dependências entre Programas

> **Achado-chave:** nenhum `CALLNAT` em nenhum dos 15 programas. Todos usam `PERFORM` (sub-rotinas internas).
> O acoplamento entre programas é puramente via **tabelas Adabas compartilhadas** (contrato implícito de dados).
> O cabeçalho de `BATCHPGT` cita "CHAMA CALCBENF E CALCDSCT" — na prática a lógica foi duplicada inline para performance.

```mermaid
graph LR
    %% Estilos
    classDef batch fill:#FDEBD0,stroke:#E67E22,color:#000
    classDef calc fill:#D5F5E3,stroke:#27AE60,color:#000
    classDef cad fill:#D6EAF8,stroke:#2980B9,color:#000
    classDef val fill:#F9E79F,stroke:#F1C40F,color:#000
    classDef rel fill:#FADBD8,stroke:#E74C3C,color:#000
    classDef cons fill:#E8DAEF,stroke:#8E44AD,color:#000
    classDef ddm fill:#F2F3F4,stroke:#566573,color:#000

    %% Programas Batch
    BATCHPGT[BATCHPGT<br/>Geração Pagamentos]:::batch
    BATCHCON[BATCHCON<br/>Conciliação Bancária]:::batch
    BATCHREL[BATCHREL<br/>Relatórios Consolidados]:::batch

    %% Programas de Cálculo
    CALCBENF[CALCBENF<br/>Cálculo Benefício]:::calc
    CALCDSCT[CALCDSCT<br/>Cálculo Descontos]:::calc
    CALCCORR[CALCCORR<br/>Correção Retroativa]:::calc

    %% Programas de Cadastro
    CADBENEF[CADBENEF<br/>Cadastro Beneficiário]:::cad
    CADDEPEND[CADDEPEND<br/>Cadastro Dependentes]:::cad
    CADPROG[CADPROG<br/>Cadastro Programas]:::cad

    %% Programas de Validação
    VALBENEF[VALBENEF<br/>Validação Beneficiário]:::val
    VALDOCS[VALDOCS<br/>Validação Documentos]:::val
    VALELEG[VALELEG<br/>Validação Elegibilidade]:::val

    %% Relatórios
    RELPGT[RELPGT<br/>Relatório Pagamentos]:::rel
    RELAUDIT[RELAUDIT<br/>Relatório Auditoria]:::rel

    %% Consulta
    CONSBENF[CONSBENF<br/>Consulta Beneficiário]:::cons

    %% Arquivos Adabas (DDMs)
    BENEF[(BENEFICIARIO<br/>ARQ 150)]:::ddm
    PAGTO[(PAGAMENTO<br/>ARQ 160)]:::ddm
    PROGSOC[(PROGRAMA-SOCIAL<br/>ARQ 155)]:::ddm
    AUDIT[(AUDITORIA<br/>ARQ 170)]:::ddm

    %% Chamadas entre programas (documentadas em comentários)
    BATCHPGT -->|"CHAMA (lógica inline)"| CALCBENF
    BATCHPGT -->|"CHAMA (lógica inline)"| CALCDSCT
    BATCHREL -.->|"referencia lógica"| CALCBENF
    CALCBENF -.->|"replica lógica"| CALCDSCT

    %% Acessos a dados - Batch
    BATCHPGT --> BENEF
    BATCHPGT --> PAGTO
    BATCHPGT --> PROGSOC
    BATCHCON --> PAGTO
    BATCHCON --> AUDIT
    BATCHREL --> PAGTO
    BATCHREL --> BENEF

    %% Acessos a dados - Cálculo
    CALCBENF --> BENEF
    CALCBENF --> PAGTO
    CALCBENF --> PROGSOC
    CALCDSCT --> PAGTO
    CALCDSCT --> BENEF
    CALCCORR --> PAGTO

    %% Acessos a dados - Cadastro
    CADBENEF --> BENEF
    CADDEPEND --> BENEF
    CADPROG --> PROGSOC

    %% Acessos a dados - Validação
    VALBENEF --> BENEF
    VALDOCS --> BENEF
    VALELEG --> BENEF
    VALELEG --> PROGSOC

    %% Acessos a dados - Consulta/Relatórios
    CONSBENF --> BENEF
    CONSBENF --> PAGTO
    RELPGT --> PAGTO
    RELPGT --> BENEF
    RELAUDIT --> AUDIT
```

### Fluxo de negócio consolidado (sequence)

```mermaid
sequenceDiagram
 autonumber
 participant OPS as Operador SIFAP
 participant PGT as BATCHPGT
 participant DB as Adabas
 participant BB as Banco do Brasil
 participant CON as BATCHCON
 participant AUD as AUDITORIA
 participant REL as BATCHREL

 Note over OPS,PGT: 1º dia útil do mês
 OPS->>PGT: executa (usa *DATN)
 PGT->>DB: READ BENEFICIARIO BY CPF + FIND PROGRAMA
 PGT->>DB: STORE PAGAMENTO (STATUS='G')
 Note over PGT,BB: arquivo de remessa NÃO encontrado nos 3 batches → MISTÉRIO
 BB-->>CON: retorno CNAB 240 (dias depois)
 OPS->>CON: executa (INPUT competência + arquivo)
 CON->>DB: FIND PAGAMENTO (NUM-PAGTO+CPF+COMPETENCIA)
 CON->>DB: UPDATE PAGAMENTO (STATUS = P/D/E)
 CON->>AUD: STORE AUDITORIA (CO ou DV)
 OPS->>REL: executa (INPUT competência)
 REL->>DB: READ PAGAMENTO + FIND BENEFICIARIO
 REL-->>OPS: relatório impresso
```

> **Instrução:** outros pares devem complementar com seus 12 programas restantes.

## Diagrama de Fluxo de Dados (DDMs)

```mermaid
flowchart LR
 subgraph "Entrada de Dados"
 UI["Terminal 3270"]
 BATCH["Arquivos Batch"]
 CNAB[/"Arquivo CNAB 240 BB"/]
 end

 subgraph "Programas Online"
 CADBENEF["CADBENEF"]
 CADDEPEND["CADDEPEND"]
 CADPROG["CADPROG"]
 CONSBENF["CONSBENF"]
 VALBENEF["VALBENEF"]
 VALDOCS["VALDOCS"]
 VALELEG["VALELEG"]
 end

 subgraph "Programas Cálculo"
 CALCBENF["CALCBENF"]
 CALCDSCT["CALCDSCT"]
 CALCCORR["CALCCORR"]
 end

 subgraph "Programas Batch"
 BATCHPGT["BATCHPGT"]
 BATCHCON["BATCHCON"]
 BATCHREL["BATCHREL"]
 RELPGT["RELPGT"]
 RELAUDIT["RELAUDIT"]
 end

 subgraph "Armazenamento (Adabas)"
 DDM1[("BENEFICIARIO<br/>ARQ 150")]
 DDM2[("PAGAMENTO<br/>ARQ 160")]
 DDM3[("PROGRAMA-SOCIAL<br/>ARQ 155")]
 DDM4[("AUDITORIA<br/>ARQ 170")]
 end

 UI --> CADBENEF & CADDEPEND & CADPROG & CONSBENF
 UI --> VALBENEF & VALDOCS & VALELEG
 UI --> CALCBENF & CALCDSCT & CALCCORR
 BATCH --> BATCHPGT & BATCHREL & RELPGT & RELAUDIT
 CNAB --> BATCHCON

 CADBENEF & CADDEPEND & VALBENEF & VALDOCS & VALELEG <--> DDM1
 CADPROG & VALELEG <--> DDM3
 CONSBENF & CALCBENF & CALCDSCT <--> DDM1
 CONSBENF & CALCBENF & BATCHPGT <--> DDM2
 BATCHPGT <--> DDM1
 BATCHPGT & CALCCORR <--> DDM2
 BATCHPGT <--> DDM3
 BATCHCON <--> DDM2
 BATCHCON --> DDM4
 BATCHREL <--> DDM2
 BATCHREL <--> DDM1
 RELPGT <--> DDM2
 RELPGT <--> DDM1
 RELAUDIT <--> DDM4
```

## Tabela de Dependências

| Programa | Chama (CALLNAT) | Lê (READ/FIND) DDMs | Escreve (STORE/UPDATE) DDMs | Sub-rotinas internas (PERFORM) | Observações |
| ------------ | --------------- | -------------- | --------------------------- | ------------------------------ | ----------- |
| BATCHPGT.NSN | _nenhum_ | `BENEFICIARIO` (READ BY CPF), `PROGRAMA-SOCIAL` (FIND), `PAGAMENTO` (FIND) | `PAGAMENTO` (STORE) | `DET-FAIXA-RENDA-BATCH` | Cabeçalho cita CALCBENF/CALCDSCT mas código é inline |
| BATCHCON.NSN | _nenhum_ | `AUDITORIA` (READ BY SEQ DESC), `PAGAMENTO` (FIND), work file CNAB 240 | `PAGAMENTO` (UPDATE), `AUDITORIA` (STORE) | `GRAVA-AUDITORIA-CONC`, `GRAVA-AUDITORIA-DIVERG` | Bloco Banco Real comentado desde 2007 |
| BATCHREL.NSN | _nenhum_ | `PAGAMENTO` (READ BY COMPETENCIA), `BENEFICIARIO` (FIND) | _nenhum_ (read-only) | `IMPRIME-CABECALHO` | Saída flat file impressora mainframe |
| CALCBENF.NSN | _nenhum_ | `BENEFICIARIO` (FIND), `PROGRAMA-SOCIAL` (FIND), `PAGAMENTO` (FIND) | `PAGAMENTO` (STORE) | `DET-FAIXA-RENDA`, `CALC-DESCONTOS` | Programa interativo (INPUT); referencia lógica de CALCDSCT |
| CALCDSCT.NSN | _nenhum_ | `PAGAMENTO` (FIND), `BENEFICIARIO` (FIND) | `PAGAMENTO` (UPDATE) | `CALC-CONTRIB-SOCIAL` | Usa PE GROUP DESCONTOS; teto 30% exceto judicial |
| CALCCORR.NSN | _nenhum_ | `PAGAMENTO` (READ BY CPF-BENEF) | `PAGAMENTO` (UPDATE) | `CALC-INDICE-ACUM` | Tabela IPCA hardcoded 2010-2012; bloco Plano Verão comentado |
| CADBENEF.NSN | _nenhum_ | `BENEFICIARIO` (FIND) | `BENEFICIARIO` (STORE/UPDATE) | `VALIDA-CPF` | Inclusão e Alteração |
| CADDEPEND.NSN | _nenhum_ | `BENEFICIARIO` (FIND) | `BENEFICIARIO` (UPDATE PE GROUP) | _(nenhuma)_ | PE GROUP DEPENDENTES |
| CADPROG.NSN | _nenhum_ | `PROGRAMA-SOCIAL` (FIND) | `PROGRAMA-SOCIAL` (STORE/UPDATE) | `CONSULTA-PROG` | Inclusão/Consulta programas sociais |
| CONSBENF.NSN | _nenhum_ | `BENEFICIARIO` (FIND), `PAGAMENTO` (READ) | _nenhum_ (read-only) | `MASCARA-CPF` | Tela online 3270 (MAP) |
| RELPGT.NSN | _nenhum_ | `PAGAMENTO` (READ), `BENEFICIARIO` (FIND) | _nenhum_ (read-only) | `IMPRIME-SUBTOTAL`, `IMPRIME-CABECALHO` | Relatório analítico por período |
| RELAUDIT.NSN | _nenhum_ | `AUDITORIA` (READ) | _nenhum_ (read-only) | `IMPRIME-CAB-AUDIT` | Trilha de auditoria |
| VALBENEF.NSN | _nenhum_ | `BENEFICIARIO` (FIND) | _nenhum_ (validação) | `VALIDA-CPF-COMPLETO`, `VALIDA-DATA`, `VALIDA-NOME` | Validação dados cadastrais |
| VALDOCS.NSN | _nenhum_ | `BENEFICIARIO` (FIND) | _nenhum_ (validação) | `VALIDA-CPF-DOC`, `VALIDA-RG`, `CHECK-DOC-ESPECIAL` | Validação documentos |
| VALELEG.NSN | _nenhum_ | `BENEFICIARIO` (FIND), `PROGRAMA-SOCIAL` (FIND) | _nenhum_ (validação) | `VERIF-ELEG-ESPECIFICA` | Validação elegibilidade |

## Dependências Circulares

> Nenhuma dependência circular identificada entre os 15 programas (não há `CALLNAT`).

## Programas Órfãos

> Programas que não são chamados por nenhum outro (possíveis pontos de entrada ou código morto):

- **Todos os 15 programas são pontos de entrada independentes** — nenhum é chamado por outro via `CALLNAT`.
- Programas **batch** (BATCHPGT, BATCHCON, BATCHREL) são chamados por JCL/operador.
- Programas **online** (CADBENEF, CADDEPEND, CADPROG, CONSBENF, CALCBENF, CALCDSCT, CALCCORR, VALBENEF, VALDOCS, VALELEG) são acionados via terminal 3270.
- Programas **relatório** (RELPGT, RELAUDIT) são chamados por operador.
- **Suspeita:** deve existir um programa de **remessa CNAB de envio** ao BB — nenhum dos 15 gera esse arquivo. Investigar com PO/EA.

---

### Continuar a leitura

<table width="100%">
<tr>
<td width="50%" valign="top" align="left">
<sub><strong>← ANTERIOR</strong></sub><br/>
<a href="business-rules-catalog.md"><strong>business-rules-catalog.md</strong></a><br/>
<sub>Catálogo de regras.</sub>
</td>
<td width="50%" valign="top" align="right">
<sub><strong>PRÓXIMO →</strong></sub><br/>
<a href="discovery-report.md"><strong>discovery-report.md</strong></a><br/>
<sub>Síntese final.</sub>
</td>
</tr>
</table>

<sub>↑ <a href="README.md">Voltar ao Kit PT-BR</a></sub>

