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
| 1   | `SIFAP` | Sistema de Fiscalização e Administração de Pagamentos | Todos | Nome do sistema legado completo |
| 2   | `BENEF` | Beneficiário | `CONSBENF.NSN`, `RELPGT.NSN` | Pessoa física que recebe pagamento de programa social |
| 3   | `CONSBENF` | Consulta Beneficiário | `CONSBENF.NSN` | Programa online de consulta cadastral via terminal 3270 |
| 4   | `RELPGT` | Relatório de Pagamentos | `RELPGT.NSN` | Relatório analítico de pagamentos por período com totalizadores |
| 5   | `RELAUDIT` | Relatório de Auditoria | `RELAUDIT.NSN` | Relatório da trilha de auditoria do sistema |
| 6   | `CPF` | Cadastro de Pessoa Física | `CONSBENF.NSN`, `RELPGT.NSN` | Identificador único do beneficiário (N11) |
| 7   | `NIS` | Número de Identificação Social | `CONSBENF.NSN` | Identificador alternativo de beneficiário, usado em busca |
| 8   | `VLR-BRUTO` | Valor Bruto | `RELPGT.NSN`, `CONSBENF.NSN` | Valor total do pagamento antes de descontos (N9.2) |
| 9   | `VLR-DESCONTO` | Valor Desconto | `RELPGT.NSN` | Valor total de deduções aplicadas ao pagamento |
| 10  | `VLR-LIQUIDO` | Valor Líquido | `RELPGT.NSN`, `CONSBENF.NSN` | Valor efetivamente pago ao beneficiário (bruto − desconto) |
| 11  | `VLR-ABONO` | Valor Abono | `RELPGT.NSN` | Valor de abono adicional ao pagamento, totalizado à parte |
| 12  | `COMPETENCIA` | Competência (mês/ano) | `RELPGT.NSN`, `CONSBENF.NSN` | Período de referência do pagamento no formato AAAAMM (N6) |
| 13  | `STATUS-PGTO` | Status do Pagamento | `RELPGT.NSN`, `CONSBENF.NSN` | Estado do pagamento: G=Gerado, P=Pago, C=Cancelado, D=Devolvido, E=Estornado |
| 14  | `TIPO-PGTO` | Tipo de Pagamento | `RELPGT.NSN`, `CONSBENF.NSN` | Natureza do pagamento: N=Normal, D=Décimo, T=Terceiro |
| 15  | `STATUS` | Status do Beneficiário | `CONSBENF.NSN` | Estado cadastral: A=Ativo, S=Suspenso, C=Cancelado, I=Inativo, D=Desligado |
| 16  | `COD-PROGRAMA` | Código do Programa Social | `CONSBENF.NSN`, `RELPGT.NSN` | Identificador numérico do programa social (N4) |
| 17  | `COD-REGIAO` | Código da Região | `CONSBENF.NSN` | Identificador numérico da região geográfica do beneficiário (N2) |
| 18  | `RENDA-FAMILIAR` | Renda Familiar | `CONSBENF.NSN` | Renda familiar declarada do beneficiário (N9.2) |
| 19  | `NUM-DEPENDENTES` | Número de Dependentes | `CONSBENF.NSN` | Quantidade de dependentes do beneficiário (N2) |
| 20  | `DT-GERACAO` | Data de Geração | `RELPGT.NSN` | Data em que o pagamento foi gerado no sistema (N8) |
| 21  | `DT-CADASTRO` | Data de Cadastro | `CONSBENF.NSN` | Data de inclusão do beneficiário no sistema |
| 22  | `SEQ-AUDIT` | Sequência de Auditoria | `RELAUDIT.NSN` | Número sequencial único do evento de auditoria (N10) |
| 23  | `ACAO` | Ação de Auditoria | `RELAUDIT.NSN` | Código da ação: IN=Inclusão, AL=Alteração, CO=Conciliação, CN=Consulta, DV=Divergência, EX=Exclusão |
| 24  | `TABELA-REF` | Tabela de Referência | `RELAUDIT.NSN` | Nome da entidade/tabela afetada pelo evento de auditoria |
| 25  | `CHAVE-REF` | Chave de Referência | `RELAUDIT.NSN` | Chave primária do registro afetado pelo evento de auditoria |
| 26  | `VLR-ANTERIOR` | Valor Anterior | `RELAUDIT.NSN` | Valor do campo antes da alteração (trilha de auditoria) |
| 27  | `VLR-NOVO` | Valor Novo | `RELAUDIT.NSN` | Valor do campo após a alteração (trilha de auditoria) |
| 28  | `MAP` | Mapa de Tela | `CONSBENF.NSN` | Layout de tela do terminal 3270 para apresentação de dados |
| 29  | `UF` | Unidade da Federação | `CONSBENF.NSN`, `RELPGT.NSN` | Sigla do estado brasileiro do beneficiário (A2) |
| 30  | `PROG-ANT` | Programa Anterior | `RELPGT.NSN` | Variável de controle para quebra de subtotal por programa social |
| 31  | `EX` | Exclusão | `RELAUDIT.NSN` | Código de ação de exclusão na auditoria — filtrado e nunca exibido no relatório |
| 32  | `DV` | Divergência | `RELAUDIT.NSN` | Código de ação para eventos de divergência encontrada em conciliação |
| 33  | `NUM-PAGTO` | Número do Pagamento | `CONSBENF.NSN`, `RELPGT.NSN` | Identificador sequencial único do registro de pagamento (N10) |
| 34  | `HR-EVENTO` | Hora do Evento | `RELAUDIT.NSN` | Hora do evento de auditoria no formato HHMMSS (N6) |
| 35  | `TIPO-SAIDA` | Tipo de Saída | `RELAUDIT.NSN` | Destino do relatório: T=Tela, I=Impressora |

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

