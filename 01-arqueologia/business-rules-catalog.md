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
| BR-001 | Programa social inativo não permite elegibilidade do beneficiário. | 01-arqueologia/legado-sifap/natural-programs/VALELEG.NSN#L99-L102 | PROGRAMA-SOCIAL.SIT-PROGRAMA, BENEFICIARIO.SIT-BENEFICIARIO | ALTO | Bloqueio de fluxo principal de concessão. |
| BR-002 | Beneficiário da região especial 99 é marcado elegível imediatamente. | 01-arqueologia/legado-sifap/natural-programs/VALELEG.NSN#L107-L111 | BENEFICIARIO.COD-REGIAO | ALTO | Regra de exceção com bypass das validações subsequentes. |
| BR-003 | Beneficiário com status S, C, D ou I fica inelegível (somente A permanece elegível). | 01-arqueologia/legado-sifap/natural-programs/VALELEG.NSN#L116-L134 | BENEFICIARIO.SIT-BENEFICIARIO | CRÍTICO | Regra central de elegibilidade cadastral. |
| BR-004 | Faixa etária do programa é obrigatória quando idade mínima/máxima estiver parametrizada. | 01-arqueologia/legado-sifap/natural-programs/VALELEG.NSN#L139-L152 | PROGRAMA-SOCIAL.IDADE-MIN, PROGRAMA-SOCIAL.IDADE-MAX | ALTO | Reprova elegibilidade fora da faixa. |
| BR-005 | Renda familiar acima do teto parametrizado do programa reprova elegibilidade. | 01-arqueologia/legado-sifap/natural-programs/VALELEG.NSN#L157-L163 | PROGRAMA-SOCIAL.RENDA-MAX-PERCAP, BENEFICIARIO.IND-RENDA-PERCAP | CRÍTICO | Regra financeira de acesso ao benefício. |
| BR-006 | Programa tipo assistencial exige documentação completa; sem docs válidos, inelegível. | 01-arqueologia/legado-sifap/natural-programs/VALELEG.NSN#L168-L182 | PROGRAMA-SOCIAL.TIPO-PROGRAMA, BENEFICIARIO.MOT-SITUACAO | ALTO | Regra documental para tipo A. |
| BR-007 | Em dezembro, cálculo inclui 13o e, para programa tipo A, aplica abono natalino de 15%. | 01-arqueologia/legado-sifap/natural-programs/CALCBENF.NSN#L242-L260 | PAGAMENTO.ANO-MES-REF, PAGAMENTO.VLR-BRUTO, PROGRAMA-SOCIAL.TIPO-PROGRAMA | CRÍTICO | Regra de impacto direto no valor pago. |
| BR-008 | Desconto básico de 3% só é aplicado quando valor bruto ultrapassa 500,00. | 01-arqueologia/legado-sifap/natural-programs/CALCBENF.NSN#L318-L322 | PAGAMENTO.VLR-BRUTO, PAGAMENTO.VLR-DESCONTO-TOTAL | ALTO | Threshold financeiro explícito. |
| BR-009 | Desconto total é limitado ao teto de 30% do bruto, exceto para desconto judicial (tipo J). | 01-arqueologia/legado-sifap/natural-programs/CALCDSCT.NSN#L165-L169 | PAGAMENTO.VLR-BRUTO, PAGAMENTO.VLR-DESCONTO-TOTAL, PAGAMENTO.TIPO-DESCONTO | CRÍTICO | Exceção legal explícita para judicial. |
| BR-010 | Na conciliação, diferença acima de 0,01 entre SIFAP e banco gera divergência e auditoria; caso contrário, atualiza status pelo código de retorno. | 01-arqueologia/legado-sifap/natural-programs/BATCHCON.NSN#L160-L202 | PAGAMENTO.VLR-LIQUIDO, PAGAMENTO.SIT-PAGAMENTO, PAGAMENTO.COD-RETORNO-BANCO, AUDITORIA.COD-ACAO | CRÍTICO | Regra de conciliação financeira e trilha auditável. |

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

