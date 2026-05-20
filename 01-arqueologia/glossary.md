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

| #  | Termo            | Expansão                                 | Programa                | Contexto/Comentário                                   |
|----|------------------|------------------------------------------|-------------------------|------------------------------------------------------|
| 1  | CPF              | Cadastro de Pessoa Física                | VALELEG, VALBENEF, VALDOCS | Documento de identificação nacional              |
| 2  | NOME             | Nome completo                            | VALELEG, VALBENEF, VALDOCS | Nome do beneficiário                              |
| 3  | DT-NASC          | Data de Nascimento                       | VALELEG, VALBENEF       | Data de nascimento                                 |
| 4  | STATUS           | Status do Beneficiário                   | VALELEG, VALBENEF       | Situação cadastral ('A', 'S', 'C', etc.)           |
| 5  | COD-PROGRAMA     | Código do Programa                       | VALELEG                 | Identificador do programa social                   |
| 6  | RENDA-FAMILIAR   | Renda Familiar                           | VALELEG                 | Valor da renda familiar                            |
| 7  | NUM-DEPENDENTES  | Número de Dependentes                    | VALELEG                 | Quantidade de dependentes                          |
| 8  | COD-REGIAO       | Código da Região                         | VALELEG                 | Região administrativa                              |
| 9  | UF               | Unidade Federativa                       | VALELEG, VALBENEF, VALDOCS | Estado brasileiro (ex: SP, RJ)                  |
| 10 | NIS              | Número de Identificação Social           | VALELEG                 | Identificador social do beneficiário               |
| 11 | DOCUMENTOS-OK    | Documentação Ok                          | VALELEG, VALDOCS        | Indica se a documentação está completa (HIPÓTESE)  |
| 12 | TIPO             | Tipo de Programa                         | VALELEG                 | 'A' (Assistencial), 'P' (Previdenciário), 'T' (Trabalho) |
| 13 | VLR-BASE         | Valor Base                               | VALELEG                 | Valor base do benefício                            |
| 14 | COD-ELEGIBILIDADE| Código de Elegibilidade                  | VALELEG                 | Código de regra de elegibilidade                   |
| 15 | STATUS-PROG      | Status do Programa                       | VALELEG                 | Situação do programa                               |
| 16 | RENDA-MAX        | Renda Máxima                             | VALELEG                 | Teto de renda para elegibilidade                   |
| 17 | IDADE-MIN        | Idade Mínima                             | VALELEG                 | Idade mínima para o programa                       |
| 18 | IDADE-MAX        | Idade Máxima                             | VALELEG                 | Idade máxima para o programa                       |
| 19 | RG               | Registro Geral                           | VALDOCS                 | Documento de identidade                            |
| 20 | CTPS             | Carteira de Trabalho e Previdência Social| VALDOCS                 | Documento trabalhista                              |

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

