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
| BR-001 | Busca de beneficiário pode ser feita por CPF ou NIS; se tipo de busca não informado, assume CPF como padrão | `01-arqueologia/legado-sifap/natural-programs/CONSBENF.NSN#L74-L90` | `BENEFICIARIO.CPF`, `BENEFICIARIO.NIS` | MÉDIO | Default silencioso para CPF quando campo vazio |
| BR-002 | Status do beneficiário possui 5 estados válidos: A(Ativo), S(Suspenso), C(Cancelado), I(Inativo), D(Desligado) | `01-arqueologia/legado-sifap/natural-programs/CONSBENF.NSN#L97-L110` | `BENEFICIARIO.STATUS` | ALTO | Qualquer valor fora desses é marcado "DESCONHECIDO" |
| BR-003 | CPF do beneficiário deve ser mascarado na exibição no formato `***.***XXX-XX` para proteger dados sensíveis | `01-arqueologia/legado-sifap/natural-programs/CONSBENF.NSN#L152-L166` | `BENEFICIARIO.CPF` | CRÍTICO | Regra de segurança/LGPD — mascaramento obrigatório |
| BR-004 | CPF com menos de 11 dígitos (preenchido com zeros à esquerda) usa lógica de máscara diferente — expõe os primeiros 3 dígitos em vez de ocultar | `01-arqueologia/legado-sifap/natural-programs/CONSBENF.NSN#L155-L158` | `BENEFICIARIO.CPF` | CRÍTICO | Inconsistência conhecida documentada no código; não corrigir sem aprovação da auditoria |
| BR-005 | Histórico de pagamentos na consulta é limitado aos últimos 12 registros por beneficiário | `01-arqueologia/legado-sifap/natural-programs/CONSBENF.NSN#L131-L141` | `PAGAMENTO.CPF-BENEF`, `PAGAMENTO.COMPETENCIA` | MÉDIO | Limite fixo de 12 — sem paginação |
| BR-006 | Relatório de pagamentos permite filtro por período de competência (início/fim) e código de programa social (0=todos) | `01-arqueologia/legado-sifap/natural-programs/RELPGT.NSN#L70-L82` | `PAGAMENTO.COMPETENCIA`, `PAGAMENTO.COD-PROGRAMA` | ALTO | Código 0 é convenção para "sem filtro" |
| BR-007 | Relatório de pagamentos exige quebra (subtotal) por programa social, com acumuladores de bruto, líquido e quantidade | `01-arqueologia/legado-sifap/natural-programs/RELPGT.NSN#L85-L93` | `PAGAMENTO.COD-PROGRAMA` | ALTO | Subtotais parciais + total geral no fim |
| BR-008 | Tipo de pagamento: N=Normal, D=Décimo (13º), T=Terceiro; qualquer outro valor é classificado como "OUTRO" | `01-arqueologia/legado-sifap/natural-programs/RELPGT.NSN#L105-L114` | `PAGAMENTO.TIPO-PGTO` | MÉDIO | Enum implícito sem validação na entrada |
| BR-009 | Status de pagamento possui 5 estados: G=Gerado, P=Pago, C=Cancelado, D=Devolvido, E=Estornado | `01-arqueologia/legado-sifap/natural-programs/RELPGT.NSN#L117-L131` | `PAGAMENTO.STATUS-PGTO` | ALTO | Fluxo de ciclo de vida do pagamento |
| BR-010 | Relatório de pagamentos totaliza separadamente o valor de abono (`VLR-ABONO`), que não entra no cálculo de bruto/desconto/líquido | `01-arqueologia/legado-sifap/natural-programs/RELPGT.NSN#L149-L157` | `PAGAMENTO.VLR-ABONO` | ALTO | Abono é verba à parte, totalizada mas não somada ao bruto |
| BR-011 | Eventos de exclusão (ação='EX') são filtrados silenciosamente do relatório de auditoria e nunca são exibidos ao usuário | `01-arqueologia/legado-sifap/natural-programs/RELAUDIT.NSN#L93-L97` | `AUDITORIA.ACAO` | CRÍTICO | Supressão intencional — pode mascarar fraude ou exclusão indevida |
| BR-012 | Relatório de auditoria aceita filtros combinados por período, ação, usuário e tabela; data inicial padrão é 01/01/1997 quando não informada | `01-arqueologia/legado-sifap/natural-programs/RELAUDIT.NSN#L78-L88` | `AUDITORIA.DT-EVENTO` | MÉDIO | Data hardcoded 19970101 = data de implantação do sistema |
| BR-013 | Auditoria contabiliza eventos por tipo de ação (inclusão, alteração, consulta, conciliação, divergência) com resumo quantitativo no final | `01-arqueologia/legado-sifap/natural-programs/RELAUDIT.NSN#L105-L122` | `AUDITORIA.ACAO` | MÉDIO | 6 tipos de ação: IN, AL, CO, CN, DV + "OUTRA" |
| BR-014 | Relatório de auditoria suporta saída dual: T=Tela (WRITE) com menos colunas, I=Impressora (PRINT) com descrição completa | `01-arqueologia/legado-sifap/natural-programs/RELAUDIT.NSN#L131-L145` | — | BAIXO | Na saída tela, campo DESCRICAO é omitido |
| BR-015 | Paginação de relatórios usa padrão mainframe de 66 linhas por página com form feed (`/`) | `01-arqueologia/legado-sifap/natural-programs/RELPGT.NSN#L63-L64` | — | BAIXO | Padrão de impressora matricial — substituir por paginação web |

> Adicione mais linhas conforme necessário. Lembre-se: existem **10 regras escondidas** no código!

## Exemplo de linha bem preenchida

| ID     | Regra de Negócio                                                                        | Programa Fonte                                   | Campos DDM                                                               | Nível de Risco | Notas                                      |
| ------ | --------------------------------------------------------------------------------------- | ------------------------------------------------ | ------------------------------------------------------------------------ | -------------- | ------------------------------------------ |
| BR-013 | Desconto total não pode exceder 30% do valor bruto, exceto descontos judiciais (tipo J) | `01-arqueologia/legado-sifap/natural-programs/CALCDSCT.NSN#L142-L148` | `PAGAMENTO.VLR-BRUTO`, `PAGAMENTO.VLR-TOTAL-DSCT`, `PAGAMENTO.TIPO-DSCT` | CRÍTICO        | Regra financeira. Tipo 'J' = exceção legal |

## Regras por Categoria

### Cálculos Financeiros

<!-- Liste aqui as regras relacionadas a cálculos de valores, benefícios, etc. -->

### Validações de Status

<!-- Liste aqui as regras de transição de status (A, S, C, I, D) -->

### Regras de Autorização

<!-- Liste aqui as regras de quem pode fazer o quê -->

### Regras de Negócio Temporais

<!-- Liste aqui regras com prazos, datas-limite, períodos -->

## Resumo Estatístico

- Total de regras encontradas: \_\_\_
- Regras críticas: \_\_\_
- Regras com duplicação: \_\_\_
- Regras sem documentação (escondidas): \_\_\_

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

