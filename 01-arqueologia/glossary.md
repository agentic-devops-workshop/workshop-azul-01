<!-- markdownlint-disable MD012 MD013 MD025 MD026 MD028 MD029 MD033 MD034 MD040 MD051 MD060 -->

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

> **Contribuição Par 2 (Arquitetura — EA + SA):** 30 termos extraídos dos 3 batches e DDMs relacionados.

| #   | Termo | Expansão | Programa | Contexto |
| --- | ----- | -------- | -------- | -------- |
| 1   | SIFAP | Sistema de Fiscalização e Administração de Pagamentos | `BATCHPGT.NSN#L3` | Nome do sistema legado |
| 2   | PGT | Pagamento | `BATCHPGT.NSN`, `PAGAMENTO.ddm` | Prefixo/sufixo de "pagamento" em variáveis e programas |
| 3   | BENF | Beneficiário | `BATCHPGT.NSN#L188`, `BENEFICIARIO.ddm` | Pessoa cadastrada como destinatário do pagamento |
| 4   | CON | Conciliação | `BATCHCON.NSN#L3` | Casamento de pagamentos com retorno bancário |
| 5   | REL | Relatório | `BATCHREL.NSN#L3` | Saída tabular consolidada |
| 6   | COMPETENCIA | Mês/ano de referência do pagamento, formato AAAAMM | `BATCHPGT.NSN#L113-L115` | Chave temporal do ciclo |
| 7   | CPF | Cadastro de Pessoa Física (11 dígitos) | `BENEFICIARIO.ddm`, `BATCHPGT.NSN#L18` | Identificador único do beneficiário |
| 8   | NIS | Número de Identificação Social | `BENEFICIARIO.ddm`, `BATCHPGT.NSN#L26` | Identificador alternativo (cadastro social) |
| 9   | UF | Unidade da Federação (2 letras) | `BENEFICIARIO.ddm`, `BATCHPGT.NSN#L25` | Localização do beneficiário |
| 10  | COD-REGIAO | Código numérico da região (1..27) | `BATCHPGT.NSN#L24, L120-L147` | Indexa tabela de fator regional |
| 11  | VLR-BASE | Valor base do programa social (antes de fatores) | `PROGRAMA-SOCIAL.ddm`, `BATCHPGT.NSN#L40` | Insumo do cálculo do benefício |
| 12  | FATOR-REAJUSTE | Multiplicador de reajuste anual do programa | `PROGRAMA-SOCIAL.ddm`, `BATCHPGT.NSN#L41` | Aplicado como `(1 + fator)` |
| 13  | TAB-REG | Tabela de fatores regionais (27 posições, 1,00..1,40) | `BATCHPGT.NSN#L66, L120-L147` | Multiplicador por região |
| 14  | FATOR-FAM | Fator familiar (depende do nº de dependentes) | `BATCHPGT.NSN#L237-L249` | Multiplicador progressivo |
| 15  | FATOR-RND | Fator de renda (5 faixas) | `BATCHPGT.NSN#L149-L159` | Quanto maior a renda, menor o benefício |
| 16  | FATOR-IDADE | Fator idade (≥65 / ≥60 / <18 / demais) | `BATCHPGT.NSN#L253-L263` | Beneficia idosos e menores |
| 17  | VLR-BRUTO | Valor bruto do pagamento (benefício + 13º + abono) | `PAGAMENTO.ddm`, `BATCHPGT.NSN#L272` | Antes do desconto |
| 18  | VLR-LIQUIDO | Valor líquido (bruto − desconto) | `PAGAMENTO.ddm`, `BATCHPGT.NSN#L297` | Valor efetivamente pago |
| 19  | VLR-DESCONTO | Valor de descontos aplicados sobre o bruto | `PAGAMENTO.ddm`, `BATCHPGT.NSN#L289-L294` | 3% se bruto > 500,00 |
| 20  | VLR-ABONO | Valor do abono (15% do benefício em dezembro, programas tipo A) | `PAGAMENTO.ddm`, `BATCHPGT.NSN#L281-L286` | Só em dezembro |
| 21  | TIPO-PGTO | Tipo do pagamento: `N` normal · `D` dezembro (13º) | `PAGAMENTO.ddm`, `BATCHPGT.NSN#L273-L275` | Marca o ciclo anual |
| 22  | STATUS-PGTO | Status do pagamento: `G` Gerado · `P` Pago · `D` Devolvido · `E` Estornado · `C` Cancelado | `PAGAMENTO.ddm`, `BATCHCON.NSN#L168-L196` | Máquina de estados |
| 23  | STATUS (BENEF) | Status do beneficiário: `A` Ativo (outros estados ignorados) | `BENEFICIARIO.ddm`, `BATCHPGT.NSN#L186-L189` | Filtro de elegibilidade |
| 24  | STATUS-PROG | Status do programa social: `A` Ativo | `PROGRAMA-SOCIAL.ddm`, `BATCHPGT.NSN#L42, L217-L221` | Programas inativos bloqueiam pagamento |
| 25  | CNAB 240 | Layout padrão FEBRABAN para troca eletrônica com bancos (registros de 240 caracteres) | `BATCHCON.NSN#L3-L8` | Arquivo de retorno do BB |
| 26  | COD-RETORNO | Código de retorno do CNAB (`00`=pago, `01`=devolvido, `02`=estornado) | `BATCHCON.NSN#L165-L196` | Define transição de status |
| 27  | NUM-PAGTO | Número sequencial do pagamento (chave) | `PAGAMENTO.ddm`, `BATCHPGT.NSN#L29, L296` | Incrementado por READ DESCENDING |
| 28  | AUDITORIA | Trilha imutável de eventos (CO=conciliado, DV=divergência) | `AUDITORIA.ddm`, `BATCHCON.NSN#L222-L249` | Compliance |
| 29  | SEQ-AUDIT | Sequencial da auditoria | `AUDITORIA.ddm`, `BATCHCON.NSN#L91` | Sem orfãos |
| 30  | CALLNAT | Comando Natural para chamar subprograma | (ausente nos 3 batches lidos) | Cabeçalho do PGT cita CALCBENF/CALCDSCT mas não executa |
| 31  | READ WORK FILE | Leitura sequencial de arquivo externo (não-Adabas) | `BATCHCON.NSN#L109-L110` | Lê CNAB ASCII |
| 32  | END TRANSACTION | Commit Adabas (libera locks) | `BATCHPGT.NSN#L309` | Por registro, não por lote |
| 33  | *DATN | Variável de sistema Natural — data atual (formato N8 AAAAMMDD) | `BATCHPGT.NSN#L113` | Determina a competência |
| 34  | PERFORM | Chama sub-rotina interna do mesmo programa | `BATCHPGT.NSN#L251 (DET-FAIXA-RENDA-BATCH)` | Equivalente a private method |
| 35  | RG | Registro Geral | `VALDOCS.NSN#L78-L79, L148-L160` | Documento de identidade validado separadamente do CPF |
| 36  | CTPS | Carteira de Trabalho e Previdência Social | `VALDOCS.NSN#L52` | Coletado na entrada, mas sem validação visível neste recorte |
| 37  | TITULO | Título de Eleitor | `VALDOCS.NSN#L52` | Outro documento capturado na interface sem regra explícita no programa |
| 38  | DOCUMENTOS-OK | Indicador de validação documental concluída | `VALDOCS.NSN#L35, L174-L179` | Flag alterada pelo fluxo normal e pelo override de documento especial |
| 39  | NOME | Nome completo do beneficiário | `VALBENEF.NSN#L136-L154` | Requer pelo menos nome e sobrenome |
| 40  | Arqueologia de Software | Leitura sistemática do legado para extrair regras, dependências e mistérios | `README.md`, `GUIDE.md` | Termo de contexto usado ao longo do workshop |

## Exemplo de linha bem preenchida

| #   | Termo  | Expansão | Programa                        | Contexto                                                                                                         |
| --- | ------ | -------- | ------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| 1   | `DSCT` | Desconto | `CALCDSCT.NSN`, `PAGAMENTO.ddm` | Tipo de dedução aplicada sobre valor bruto do pagamento. Tipos: 'J' (judicial), 'I' (imposto), 'T' (trabalhista) |

## Observações

- Anote aqui qualquer padrão de nomenclatura que o time identificou:
- Convenções de prefixo/sufixo encontradas: `PGT`, `CON`, `REL`, `VLR-`, `STATUS-`, `COD-`
- Termos ambíguos que precisam de validação com especialista: `DOCUMENTOS-OK`, prefixos especiais de CPF e uso operacional de `SEQ-AUDIT`

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
