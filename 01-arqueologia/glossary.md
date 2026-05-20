<!-- markdownlint-disable MD013 MD025 MD026 MD028 MD029 MD034 MD040 MD051 MD060 -->

# Glossário do SIFAP Legado

![ESTÁGIO 01 Arqueologia](https://img.shields.io/badge/ESTÁGIO-01%20Arqueologia-F25022?style=for-the-badge) ![TIPO Worksheet](https://img.shields.io/badge/TIPO-Worksheet-1A1A1A?style=for-the-badge) ![PREENCHA Durante S1](https://img.shields.io/badge/PREENCHA-Durante%20S1-737373?style=for-the-badge)

> 🗺 **Você está aqui:** [Kit PT-BR](../README.md) → [Estágio 1](README.md) → **glossary**

> **Para quem é isto?** Este é um **artefato preenchido pelo time** durante o Estágio 1 (Arqueologia).
>
> **O que você terá ao final do estágio:**
>
> 1. Este documento totalmente preenchido com os dados reais do legado SIFAP
> 2. Rastreabilidade para `01-arqueologia/legado-sifap/` (programas `.NSN` e DDMs)
> 3. Base de evidência usada nas EARS do Estágio 2 (`source_legacy:`)
>
> 📘 **Guia passo a passo:** [`GUIDE.md`](GUIDE.md).


> Preencha esta tabela com todos os termos, abreviações e siglas encontrados no código Natural/Adabas.
> **Meta: no mínimo 30 termos.**

## Por que isso importa

Sistemas legados têm vocabulário próprio que ninguém documenta em lugar nenhum — só está no nome das variáveis. Se o time do Estágio 2 não souber o que `DSCT`, `BENF`, `PE` ou `CTC` significam, vai escrever uma spec sobre o que ele _acha_ que isso significa. Glossário é o que evita esse desencontro.

## Como preencher

- **Termo**: a abreviação ou sigla exatamente como aparece no código
- **Expansão**: o significado completo do termo
- **Programa**: em qual arquivo `.NSN` ou `.ddm` o termo foi encontrado
- **Contexto**: breve explicação de como/onde o termo é usado

## Dica de extração

Prompt útil no Copilot Chat (cole o conteúdo de 2–3 arquivos `.NSN` no chat antes):

> _"Liste todas as abreviações e siglas usadas neste código Natural. Para cada uma, sugira a expansão e marque com 'CONFIRMADO' ou 'HIPÓTESE'."_

## Termos encontrados

| #   | Termo | Expansão | Programa | Contexto |
| --- | ----- | -------- | -------- | -------- |
| 1   | SIFAP | Sistema de Fiscalização e Administração de Pagamentos | `legado-sifap/README.md` | Nome do sistema legado responsável por cadastro, cálculo, pagamento e fiscalização. |
| 2   | CPF | Cadastro de Pessoas Físicas | `BENEFICIARIO.ddm`, `PAGAMENTO.ddm`, `AUDITORIA.ddm` | Identificador principal do cidadão em cadastro, pagamento e trilha de auditoria. |
| 3   | NUM-INSCRICAO | Número de inscrição/matrícula do beneficiário | `BENEFICIARIO.ddm`, `PAGAMENTO.ddm` | Chave alternativa usada para vínculo interno do beneficiário. |
| 4   | SIT-BENEFICIARIO | Situação do beneficiário | `BENEFICIARIO.ddm` | Status operacional do beneficiário (A, S, C, I, D). |
| 5   | MOT-SITUACAO | Motivo da situação | `BENEFICIARIO.ddm` | Código que justifica alterações de situação cadastral. |
| 6   | VLR-RENDA-FAMILIAR | Valor da renda familiar | `BENEFICIARIO.ddm` | Valor declarado para apuração de elegibilidade. |
| 7   | IND-RENDA-PERCAP | Indicador de renda per capita | `BENEFICIARIO.ddm` | Campo de renda per capita calculada a partir da composição familiar. |
| 8   | QTD-MEMBROS-FAMILIA | Quantidade de membros da família | `BENEFICIARIO.ddm` | Base para cálculo de renda per capita e validações de programa. |
| 9   | COD-PROGRAMA | Código do programa social | `BENEFICIARIO.ddm`, `PAGAMENTO.ddm`, `PROGRAMA-SOCIAL.ddm` | Chave de relacionamento entre cadastro, regras e pagamentos. |
| 10  | DT-INICIO-BENEF | Data de início do benefício | `BENEFICIARIO.ddm` | Marco inicial de vigência do benefício. |
| 11  | DT-FIM-BENEF | Data de fim do benefício | `BENEFICIARIO.ddm` | Fim de vigência; valor zero representa benefício sem prazo definido. |
| 12  | IND-BIOMETRIA | Indicador de biometria | `BENEFICIARIO.ddm`, `PROGRAMA-SOCIAL.ddm` | Sinaliza exigência/coleta biométrica para concessão e manutenção. |
| 13  | HASH-DIGITAL | Hash da digital biométrica | `BENEFICIARIO.ddm` | Referência técnica de integridade para dado biométrico. |
| 14  | ANO-MES-REF | Ano/mês de referência (competência) | `PAGAMENTO.ddm` | Competência financeira do pagamento no formato AAAAMM. |
| 15  | NUM-CICLO | Número do ciclo de processamento | `PAGAMENTO.ddm` | Identifica a rodada batch em que o pagamento foi gerado. |
| 16  | VLR-BRUTO | Valor bruto | `PAGAMENTO.ddm` | Valor calculado antes da aplicação de descontos. |
| 17  | VLR-LIQUIDO | Valor líquido | `PAGAMENTO.ddm` | Valor final após descontos e deduções. |
| 18  | VLR-DESCONTO-TOTAL | Valor total de descontos | `PAGAMENTO.ddm` | Soma dos descontos aplicados no pagamento. |
| 19  | TIPO-DESCONTO | Tipo de desconto | `PAGAMENTO.ddm` | Classificação de desconto (IR, JD, CS, PA, EM, TX, OU, EX). |
| 20  | NUM-PROCESSO | Número de processo | `PAGAMENTO.ddm` | Referência processual, principalmente em desconto judicial. |
| 21  | SIT-PAGAMENTO | Situação do pagamento | `PAGAMENTO.ddm` | Status do pagamento no ciclo (pendente, gerado, emitido, confirmado etc.). |
| 22  | COD-RETORNO-BANCO | Código de retorno bancário | `PAGAMENTO.ddm` | Código de ocorrência de retorno usado na conciliação. |
| 23  | CNAB 240 | Padrão de arquivo bancário CNAB 240 | `PAGAMENTO.ddm`, `legado-sifap/README.md` | Layout de remessa/retorno com instituições financeiras. |
| 24  | SIAFI | Sistema Integrado de Administração Financeira | `PAGAMENTO.ddm`, `legado-sifap/README.md` | Sistema externo para integração financeira governamental. |
| 25  | OB | Ordem Bancária | `PAGAMENTO.ddm` | Documento financeiro de pagamento integrado ao SIAFI. |
| 26  | NE | Nota de Empenho | `PAGAMENTO.ddm` | Referência orçamentária associada ao pagamento. |
| 27  | RENDA-MAX-PERCAP | Renda máxima per capita | `PROGRAMA-SOCIAL.ddm` | Limite de renda para elegibilidade em cada programa social. |
| 28  | FATOR-K | Fator de correção especial | `PROGRAMA-SOCIAL.ddm` | Parâmetro de cálculo legado com documentação incompleta. |
| 29  | TIPO-DSCT-APLIC | Tipos de desconto aplicáveis | `PROGRAMA-SOCIAL.ddm` | Lista de descontos permitidos por programa social. |
| 30  | COD-ACAO | Código de ação de auditoria | `AUDITORIA.ddm` | Tipo de evento auditado (inclusão, alteração, login, batch, erro etc.). |

> Adicione mais linhas conforme necessário. Não se limite a 30!

## Exemplo de linha bem preenchida

| #   | Termo  | Expansão | Programa                        | Contexto                                                                                                         |
| --- | ------ | -------- | ------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| 1   | `DSCT` | Desconto | `CALCDSCT.NSN`, `PAGAMENTO.ddm` | Tipo de dedução aplicada sobre valor bruto do pagamento. Tipos: 'J' (judicial), 'I' (imposto), 'T' (trabalhista) |

## Observações

- Anote aqui qualquer padrão de nomenclatura que o time identificou:
- Convenções de prefixo/sufixo encontradas:
- Termos ambíguos que precisam de validação com especialista:

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
<a href="business-rules-catalog.md"><strong>business-rules-catalog.md</strong></a><br/>
<sub>Catálogo de regras.</sub>
</td>
</tr>
</table>

<sub>↑ <a href="README.md">Voltar ao Kit PT-BR</a></sub>

