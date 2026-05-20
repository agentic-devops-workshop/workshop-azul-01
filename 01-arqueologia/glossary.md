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

> **Contribuição Pares (Arquitetura — EA + SA):** 34 termos extraídos dos 3 batches e DDMs relacionados.

| #   | Termo | Expansão | Programa | Contexto |
| --- | ----- | -------- | -------- | -------- |
| 1   | `BENEF` | Beneficiário | `CADBENEF.NSN`, `BENEFICIARIO.ddm` | Pessoa cadastrada em programa social do SIFAP |
| 2   | `CADBENEF` | Cadastro de Beneficiário | `CADBENEF.NSN` | Programa de inclusão/alteração de beneficiário (ARQ 150) |
| 3   | `CADDEPEND` | Cadastro de Dependentes | `CADDEPEND.NSN` | Programa de vinculação de dependentes ao beneficiário titular |
| 4   | `CADPROG` | Cadastro de Programas | `CADPROG.NSN` | Programa de inclusão/consulta de programas sociais (ARQ 155) |
| 5   | `CPF` | Cadastro de Pessoa Física | `CADBENEF.NSN#L105`, `BENEFICIARIO.ddm#L21` | Número identificador do beneficiário; validado por módulo 11 |
| 6   | `NIS` | Número de Identificação Social | `CADBENEF.NSN#L51`, `BENEFICIARIO.ddm` | Identificador único do beneficiário nos programas sociais |
| 7   | `STATUS` | Situação do Beneficiário | `CADBENEF.NSN#L163`, `BENEFICIARIO.ddm#L52` | A=Ativo, S=Suspenso/Idoso>75, C=Cancelado, I=Inativo, D=Desligado |
| 8   | `COD-PROGRAMA` | Código do Programa Social | `CADBENEF.NSN#L44`, `CADPROG.NSN#L14` | Identificador do programa ao qual o beneficiário está vinculado |
| 9   | `PE` | Periodic Group (Grupo Periódico Adabas) | `CADDEPEND.NSN#L18`, `BENEFICIARIO.ddm#L61` | Estrutura repetitiva de dependentes; DDM suporta até 10 ocorrências |
| 10  | `PARENTESCO` | Vínculo familiar do dependente | `CADDEPEND.NSN#L72` | Domínio no programa: FI=Filho, CO=Cônjuge, IR=Irmão, OU=Outro |
| 11  | `FATOR-K` | Fator de Correção Especial | `CADPROG.NSN#L87`, `PROGRAMA-SOCIAL.ddm#L39` | Multiplicador de valor base; não documentado; inserido em 2008 por solicitação da SENARC |
| 12  | `FATOR-REAJ` | Fator de Reajuste | `CADPROG.NSN#L88` | Percentual de reajuste do programa; aplicado via fórmula `FATOR-K = 1.00 + (FATOR-REAJ * 0.347215)` |
| 13  | `VLR-BASE` | Valor Base do Benefício | `CADPROG.NSN#L87`, `PROGRAMA-SOCIAL.ddm#L30` | Valor mensal calculado após aplicação do fator K; gravado no ARQ 155 |
| 14  | `ARQ 150` | Arquivo/Base de Beneficiários | `CADBENEF.NSN#L9` | Base principal do SIFAP (~4,2 milhões de registros); DDM BENEFICIARIO, DBID=57 FNR=150 |
| 15  | `ARQ 155` | Arquivo/Base de Programas Sociais | `CADPROG.NSN#L9` | Tabela paramétrica de programas; DDM PROGRAMA-SOCIAL, DBID=57 FNR=151 |
| 16  | `DT-NASC` | Data de Nascimento | `CADBENEF.NSN#L126`, `BENEFICIARIO.ddm#L19` | Formato AAAAMMDD; usada para cálculo de idade e regra de status idoso |
| 17  | `#IDADE` | Idade Calculada | `CADBENEF.NSN#L157` | Variável local; calculada como `ANO-ATUAL - ANO-NASC`; usada para definir status S |
| 18  | `COD-REGIAO` | Código de Região | `CADBENEF.NSN#L50`, `BENEFICIARIO.ddm#L37` | 01 a 05 = regiões do Brasil + 99 = especial; influencia regionalização de benefícios |
| 19  | `RENDA-FAMILIAR` | Renda Familiar Declarada | `CADBENEF.NSN#L47`, `BENEFICIARIO.ddm#L55` | Renda total declarada pelo núcleo familiar; usada para elegibilidade |
| 20  | `NUM-DEPENDENTES` | Número de Dependentes | `CADDEPEND.NSN#L19`, `BENEFICIARIO.ddm` | Contador de dependentes vinculados; limite de 5 pelo programa, 10 pelo DDM |
| 21  | `OPER` | Tipo de Operação | `CADBENEF.NSN#L56`, `CADPROG.NSN#L48` | I=Inclusão, A=Alteração, C=Consulta |
| 22  | `STORE` | Gravar registro novo (Adabas) | `CADBENEF.NSN#L197` | Equivalente ao INSERT no banco de dados; sempre seguido de END TRANSACTION |
| 23  | `UPDATE` | Atualizar registro existente (Adabas) | `CADBENEF.NSN#L213`, `CADDEPEND.NSN#L120` | Equivalente ao UPDATE; requer FIND prévio |
| 24  | `FIND` | Buscar registro por descritor (Adabas) | `CADBENEF.NSN#L139` | Busca por campo DE (Descriptor); equivale ao SELECT com WHERE |
| 25  | `END TRANSACTION` | Commit da transação Adabas | `CADBENEF.NSN#L199`, `CADDEPEND.NSN#L122` | Confirmação da gravação; equivale ao COMMIT |
| 26  | `COD-ELEGIBILIDADE` | Código de Elegibilidade do Programa | `CADPROG.NSN#L18`, `PROGRAMA-SOCIAL.ddm#L47` | Código que define critérios de acesso ao programa; mapeamento incompleto no DDM |
| 27  | `SIT-BENEFICIARIO` | Situação do Beneficiário (DDM) | `BENEFICIARIO.ddm#L52` | A=Ativo, S=Suspenso, C=Cancelado, I=Inativo, D=Desligado; campo CE no DDM |
| 28  | `IND-BIOMETRIA` | Indicador de Biometria | `BENEFICIARIO.ddm#L73` | S=Sim, N=Não, P=Pendente; campo FA; adicionado em 2005 |
| 29  | `HASH-DIGITAL` | Hash de Template Biométrico | `BENEFICIARIO.ddm#L76` | SHA-256 do template; campo FD; status: NAO IMPLEMENTADO |
| 30  | `SENARC` | Secretaria Nacional de Renda de Cidadania | `PROGRAMA-SOCIAL.ddm#L42` | Órgão responsável pela autorização de alterações no FATOR-K |
| 31  | `MDAS` | Ministério do Desenvolvimento e Assistência Social | `PROGRAMA-SOCIAL.ddm#L11` | Órgão gestor dos programas sociais |
| 32  | `DE` | Descriptor (Adabas) | `BENEFICIARIO.ddm#L22` | Campo indexado para busca por FIND; equivale a coluna indexada no SQL |
| 33  | `GRP-DEPENDENTE` | Grupo de Dependentes (Adabas) | `BENEFICIARIO.ddm#L61` | Grupo periódico DA; armazena até 10 dependentes por beneficiário |
| 34  | `VLR-TETO-BENEF` | Valor Teto do Benefício | `PROGRAMA-SOCIAL.ddm#L32` | Valor máximo que um beneficiário pode receber no programa |
| 35  | `MOD11` | Módulo 11 (Algoritmo de Validação) | `CADBENEF.NSN#L224` | Algoritmo de validação de CPF por dígito verificador; subroutine VALIDA-CPF |

> Adicione mais linhas conforme necessário. Não se limite a 30!

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

