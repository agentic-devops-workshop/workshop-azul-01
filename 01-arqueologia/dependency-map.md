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
 UI["Terminal 3270"]
 BATCH["Arquivos Batch"]
 end

 subgraph "Processamento"
 PROG["Programas Natural"]
 end

 subgraph "Armazenamento (Adabas)"
 DDM1[("BENEFICIARIO")]
 DDM2[("PAGAMENTO")]
 DDM3[("DDM 3: ???")]
 DDM4[("DDM 4: ???")]
 end

 UI --> PROG
 BATCH --> PROG
 PROG <--> DDM1
 PROG <--> DDM2
 PROG <--> DDM3
 PROG <--> DDM4
```

> Substitua "DDM 3: ???" e "DDM 4: ???" pelos nomes reais encontrados em [`../01-arqueologia/legado-sifap/adabas-ddms/`](../01-arqueologia/legado-sifap/adabas-ddms/).

## Tabela de Dependências

> Linhas preenchidas pelo Par 2. Outros pares completam.

| Programa | Chama (CALLNAT) | Lê (READ/FIND) DDMs | Escreve (STORE/UPDATE) DDMs | Observações |
| ------------ | --------------- | -------------- | --------------------------- | ----------- |
| BATCHPGT.NSN | _nenhum_ (cabeçalho cita CALCBENF/CALCDSCT mas código é inline — `BATCHPGT.NSN#L11`) | `BENEFICIARIO` (READ BY CPF), `PROGRAMA-SOCIAL` (FIND), `PAGAMENTO` (FIND) | `PAGAMENTO` (STORE) | Sub-rotina interna `DET-FAIXA-RENDA-BATCH`; lógica de cálculo duplicada inline |
| BATCHCON.NSN | _nenhum_ | `AUDITORIA` (READ BY SEQ DESC), `PAGAMENTO` (FIND), work file CNAB 240 | `PAGAMENTO` (UPDATE), `AUDITORIA` (STORE) | Sub-rotinas internas `GRAVA-AUDITORIA-CONC`, `GRAVA-AUDITORIA-DIVERG`; bloco Banco Real comentado desde 2007 |
| BATCHREL.NSN | _nenhum_ | `PAGAMENTO` (READ BY COMPETENCIA), `BENEFICIARIO` (FIND) | _nenhum_ (read-only — saída só em impressora) | N+1 reads no FIND BENEFICIARIO; paginação declarada mas não usada |

## Dependências Circulares

> Liste aqui qualquer dependência circular encontrada (programa A chama B que chama A):

- Nenhuma identificada entre os 3 batches do Par 2.

## Programas Órfãos

> Programas que não são chamados por nenhum outro (possíveis pontos de entrada ou código morto):

- Os 3 batches do Par 2 são **pontos de entrada operacionais** (chamados por JCL/operador, não por outro `.NSN`).
- Suspeita: deve existir um 4º programa de **remessa CNAB de envio** ao BB — nenhum dos 3 batches gera esse arquivo. Investigar com PO/EA.

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

