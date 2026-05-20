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

> **Contribuição Par 2 (Arquitetura):** mapa dos 3 batches do ciclo mensal de pagamentos. Outros pares completam com seus programas.
>
> **Achado-chave:** nenhum `CALLNAT` entre os 3 batches. Acoplamento é puramente via **tabelas Adabas compartilhadas** (contrato implícito de dados).

```mermaid
flowchart TD
 subgraph CAD["Programas de Cadastro (Par 1 — Visão)"]
   CADBENEF["CADBENEF.NSN<br/>Cadastro Beneficiário<br/>ARQ 150"]
   CADDEPEND["CADDEPEND.NSN<br/>Cadastro Dependentes<br/>ARQ 150"]
   CADPROG["CADPROG.NSN<br/>Cadastro Programas<br/>ARQ 155"]
 end

 subgraph BATCH["Programas Batch (Par 2 — Arquitetura)"]
   BATCHPGT["BATCHPGT.NSN<br/>Batch Pagamentos"]
   BATCHREL["BATCHREL.NSN<br/>Batch Relatórios"]
   BATCHCON["BATCHCON.NSN<br/>Batch Consolidação"]
 end

 subgraph CALC["Programas de Cálculo (Par 3 — Implementação)"]
   CALCBENF["CALCBENF.NSN<br/>Cálculo Benefício"]
   CALCCORR["CALCCORR.NSN<br/>Cálculo Correção"]
   CALCDSCT["CALCDSCT.NSN<br/>Cálculo Desconto"]
 end

 subgraph VAL["Programas de Validação (Par 4 — Qualidade)"]
   VALBENEF["VALBENEF.NSN<br/>Validação Beneficiário"]
   VALDOCS["VALDOCS.NSN<br/>Validação Documentos"]
   VALELEG["VALELEG.NSN<br/>Validação Elegibilidade"]
 end

 subgraph CONS["Programas de Consulta/Relatório (Par 5 — Operações)"]
   CONSBENEF["CONSBENEF.NSN<br/>Consulta Beneficiário"]
   RELPGT["RELPGT.NSN<br/>Relatório Pagamentos"]
   RELAUDIT["RELAUDIT.NSN<br/>Relatório Auditoria"]
 end

 subgraph DDM["DDMs Adabas"]
   DDM_BENEF[("BENEFICIARIO<br/>ARQ 150<br/>~4,2M registros")]
   DDM_PROG[("PROGRAMA-SOCIAL<br/>ARQ 155<br/>~45 programas")]
   DDM_PGTO[("PAGAMENTO<br/>ARQ 160")]
   DDM_AUDIT[("AUDITORIA<br/>ARQ 170")]
 end

 CADBENEF -->|"STORE/UPDATE<br/>CADBENEF.NSN#L197,L213"| DDM_BENEF
 CADBENEF -->|"FIND<br/>CADBENEF.NSN#L139"| DDM_BENEF
 CADDEPEND -->|"FIND/UPDATE<br/>CADDEPEND.NSN#L46,L120"| DDM_BENEF
 CADPROG -->|"STORE (+ FATOR-K)<br/>CADPROG.NSN#L87-L88,L102"| DDM_PROG
 CADPROG -->|"FIND<br/>CADPROG.NSN#L77"| DDM_PROG

 BATCHPGT -->|READ/STORE| DDM_PGTO
 BATCHPGT -->|READ| DDM_BENEF
 BATCHPGT -->|READ| DDM_PROG
 BATCHPGT -.->|"comentário ref<br/>(lógica inline)"| CALCBENF
 BATCHPGT -.->|"comentário ref<br/>(lógica inline)"| CALCDSCT
 BATCHREL -->|READ| DDM_PGTO
 BATCHREL -->|READ| DDM_BENEF
 BATCHCON -->|READ/UPDATE| DDM_PGTO
 BATCHCON -->|STORE| DDM_AUDIT

 CALCBENF -->|READ| DDM_BENEF
 CALCBENF -->|READ| DDM_PROG
 CALCCORR -->|READ| DDM_PROG
 CALCDSCT -->|READ| DDM_BENEF

 VALBENEF -->|READ| DDM_BENEF
 VALDOCS -->|READ| DDM_BENEF
 VALELEG -->|READ| DDM_BENEF
 VALELEG -->|READ| DDM_PROG

 CONSBENEF -->|READ| DDM_BENEF
 RELPGT -->|READ| DDM_PGTO
 RELPGT -->|READ| DDM_BENEF
 RELAUDIT -->|READ| DDM_AUDIT
```

flowchart LR
 classDef batch fill:#FFF7E0,stroke:#FFB900,color:#0A0A0A
 classDef view fill:#E5F6FD,stroke:#00A4EF,color:#0A0A0A
 classDef ext fill:#F1F8E3,stroke:#7FBA00,color:#0A0A0A

 PGT[BATCHPGT<br/>geração mensal]:::batch
 CON[BATCHCON<br/>conciliação CNAB]:::batch
 REL[BATCHREL<br/>relatório consolidado]:::batch

 BEN[(BENEFICIARIO)]:::view
 PAG[(PAGAMENTO)]:::view
 PRG[(PROGRAMA-SOCIAL)]:::view
 AUD[(AUDITORIA)]:::view
 CNAB[/Arquivo CNAB 240 BB/]:::ext

 PGT -- READ BY CPF --> BEN
 PGT -- FIND --> PRG
 PGT -- FIND/STORE --> PAG

 CNAB -- READ WORK FILE --> CON
 CON -- FIND/UPDATE --> PAG
 CON -- STORE --> AUD

 REL -- READ BY COMPETENCIA --> PAG
 REL -- FIND --> BEN
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
   UI["Terminal 3270<br/>(Operação Online)"]
   BATCH["Arquivos Batch<br/>(Processamento Noturno)"]
 end

 subgraph "Processamento Natural"
   PROG_CAD["Cadastro<br/>CADBENEF / CADDEPEND / CADPROG"]
   PROG_CALC["Cálculo<br/>CALCBENF / CALCCORR / CALCDSCT"]
   PROG_VAL["Validação<br/>VALBENEF / VALDOCS / VALELEG"]
   PROG_REL["Relatório/Consulta<br/>CONSBENEF / RELPGT / RELAUDIT"]
   PROG_BATCH["Batch<br/>BATCHPGT / BATCHREL / BATCHCON"]
 end

 subgraph "Adabas (DBID=57)"
   DDM_BENEF[("BENEFICIARIO<br/>FNR=150")]
   DDM_PROG[("PROGRAMA-SOCIAL<br/>FNR=155")]
   DDM_PGTO[("PAGAMENTO<br/>FNR=160")]
   DDM_AUDIT[("AUDITORIA<br/>FNR=170")]
 end

 UI --> PROG_CAD
 UI --> PROG_REL
 BATCH --> PROG_BATCH

 PROG_CAD <--> DDM_BENEF
 PROG_CAD --> DDM_PROG
 PROG_CALC --> DDM_BENEF
 PROG_CALC --> DDM_PROG
 PROG_VAL --> DDM_BENEF
 PROG_VAL --> DDM_PROG
 PROG_REL --> DDM_BENEF
 PROG_REL --> DDM_PGTO
 PROG_REL --> DDM_AUDIT
 PROG_BATCH <--> DDM_PGTO
 PROG_BATCH --> DDM_BENEF
 PROG_BATCH --> DDM_AUDIT
```

> DDMs preenchidos com os nomes reais encontrados em [`../01-arqueologia/legado-sifap/adabas-ddms/`](../01-arqueologia/legado-sifap/adabas-ddms/).

## Tabela de Dependências

| Programa | Chama (CALLNAT) | Lê (READ/FIND) DDMs | Escreve (STORE/UPDATE) DDMs | Sub-rotinas internas | Observações |
| --- | --- | --- | --- | --- | --- |
| **CADBENEF.NSN** | _nenhum_ | `BENEFICIARIO` (FIND por CPF) | `BENEFICIARIO` (STORE inclusão, UPDATE alteração) | `VALIDA-CPF` (módulo 11) | Par 1; ARQ 150; valida CPF, nome, DT-NASC, sexo; status 'S' se >75 anos |
| **CADDEPEND.NSN** | _nenhum_ | `BENEFICIARIO` (FIND por CPF titular) | `BENEFICIARIO` (UPDATE PE group) | — | Par 1; dependentes embedded no mesmo ARQ 150; limite 5 dependentes |
| **CADPROG.NSN** | _nenhum_ | `PROGRAMA-SOCIAL` (FIND por COD-PROGRAMA) | `PROGRAMA-SOCIAL` (STORE inclusão + FATOR-K) | — | Par 1; ARQ 155; calcula `FATOR-K = 1.00 + (FATOR-REAJ * 0.347215)` [BR-PROG-004] |
| **BATCHPGT.NSN** | _nenhum_ (cabeçalho cita CALCBENF/CALCDSCT mas código é inline — L11) | `BENEFICIARIO` (READ BY CPF), `PROGRAMA-SOCIAL` (FIND), `PAGAMENTO` (FIND) | `PAGAMENTO` (STORE) | `DET-FAIXA-RENDA-BATCH` | Par 2; batch noturno; lógica de cálculo duplicada inline |
| **BATCHCON.NSN** | _nenhum_ | `AUDITORIA` (READ BY SEQ DESC), `PAGAMENTO` (FIND), work file CNAB 240 | `PAGAMENTO` (UPDATE), `AUDITORIA` (STORE) | `GRAVA-AUDITORIA-CONC`, `GRAVA-AUDITORIA-DIVERG` | Par 2; bloco Banco Real comentado desde 2007 |
| **BATCHREL.NSN** | _nenhum_ | `PAGAMENTO` (READ BY COMPETENCIA), `BENEFICIARIO` (FIND) | _nenhum_ (read-only — saída só em impressora) | — | Par 2; N+1 reads no FIND BENEFICIARIO |
| **CALCBENF.NSN** | _nenhum_ | `BENEFICIARIO`, `PROGRAMA-SOCIAL` | — | — | Par 3; retorna valor calculado; não aplica fator idade [MYS-001] |
| **CALCCORR.NSN** | _nenhum_ | `PROGRAMA-SOCIAL` | — | — | Par 3; correção monetária IPCA; tabela 2010–2014 desatualizada |
| **CALCDSCT.NSN** | _nenhum_ | `BENEFICIARIO` | — | — | Par 3; 4 faixas desconto; teto 30% exceto tipo 'J' |
| **VALBENEF.NSN** | _nenhum_ | `BENEFICIARIO` | — | — | Par 4; validação de elegibilidade |
| **VALDOCS.NSN** | _nenhum_ | `BENEFICIARIO` | — | — | Par 4; validação documental |
| **VALELEG.NSN** | _nenhum_ | `BENEFICIARIO`, `PROGRAMA-SOCIAL` | — | — | Par 4; cruza regras de elegibilidade |
| **CONSBENEF.NSN** | _nenhum_ | `BENEFICIARIO` | — | — | Par 5; somente consulta |
| **RELPGT.NSN** | _nenhum_ | `PAGAMENTO`, `BENEFICIARIO` | — | — | Par 5; relatório |
| **RELAUDIT.NSN** | _nenhum_ | `AUDITORIA` | — | — | Par 5; filtra ações 'EX' — ocultadas [MYS-010] |

## Dependências Circulares

> Liste aqui qualquer dependência circular encontrada (programa A chama B que chama A):

- Nenhuma identificada entre os 15 programas NSN. Não há CALLNAT em nenhum programa.

## Programas Órfãos

> Programas que não são chamados por nenhum outro (pontos de entrada diretos pelo terminal 3270 ou batch):

**Todos os 15 programas são órfãos (pontos de entrada diretos).** Não existe nenhum `CALLNAT` em todo o legado SIFAP. O acoplamento é 100% via dados compartilhados em Adabas.

| Programa | Modo de Entrada | Notas |
| --- | --- | --- |
| CADBENEF.NSN | Terminal 3270 (online) | Cadastro beneficiário |
| CADDEPEND.NSN | Terminal 3270 (online) | Cadastro dependentes |
| CADPROG.NSN | Terminal 3270 (online) | Cadastro programas; imutável pós-cadastro |
| BATCHPGT.NSN | Job batch noturno | Geração mensal de pagamentos |
| BATCHCON.NSN | Job batch (após retorno BB) | Conciliação CNAB 240 |
| BATCHREL.NSN | Job batch / Terminal | Relatório consolidado mensal |
| CALCBENF.NSN | Terminal 3270 (online) | Simulação de cálculo interativo |
| CALCCORR.NSN | Terminal 3270 (online) | Correção retroativa |
| CALCDSCT.NSN | Terminal 3270 (online) | Simulação de descontos |
| VALBENEF.NSN | Terminal 3270 (online) | Validação beneficiário |
| VALDOCS.NSN | Terminal 3270 (online) | Validação documentos |
| VALELEG.NSN | Terminal 3270 (online) | Validação elegibilidade |
| CONSBENEF.NSN | Terminal 3270 (online) | Consulta beneficiário |
| RELPGT.NSN | Terminal / Batch | Relatório pagamentos |
| RELAUDIT.NSN | Terminal / Batch | Relatório auditoria; filtra 'EX' |

> **Achado-chave:** O comentário no cabeçalho de BATCHPGT (L11) cita "CALLNAT CALCBENF" e "CALLNAT CALCDSCT", mas a lógica foi duplicada inline (sub-rotina `DET-FAIXA-RENDA-BATCH`). Provável refatoração abandonada.

> **Suspeita:** deve existir um programa de **remessa CNAB de envio** ao BB — nenhum dos 15 programas gera esse arquivo. Investigar com PO/EA.

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

