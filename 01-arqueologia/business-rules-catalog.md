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
 | BR-001 | O CPF do beneficiário deve ser válido conforme o algoritmo do módulo 11. CPFs com todos os dígitos iguais são inválidos, exceto se começarem com 000 (caso de teste do governo). Se o dígito verificador não confere, o CPF é considerado inválido. | 01-arqueologia/legado-sifap/natural-programs/VALBENEF.NSN#L49-L109 | BENEFICIARIO.CPF | ALTO | Regra central de validação cadastral. |
 | BR-002 | A data de nascimento do beneficiário deve ser válida: ano entre 1900 e o ano atual, mês entre 1 e 12, dia compatível com o mês (considerando ano bissexto para fevereiro). | 01-arqueologia/legado-sifap/natural-programs/VALBENEF.NSN#L111-L134 | BENEFICIARIO.DT-NASCIMENTO | MÉDIO | Garante integridade da data de nascimento. |
 | BR-003 | O nome do beneficiário não pode ser vazio e deve conter pelo menos um espaço (nome e sobrenome). | 01-arqueologia/legado-sifap/natural-programs/VALBENEF.NSN#L136-L154 | BENEFICIARIO.NOME | MÉDIO | Evita cadastros incompletos. |
 | BR-004 | Se informado, o campo UF do beneficiário deve estar entre as 27 siglas válidas de estados brasileiros. | 01-arqueologia/legado-sifap/natural-programs/VALBENEF.NSN#L156-L175 | BENEFICIARIO.UF | MÉDIO | Validação de domínio de UF. |
 | BR-005 | O status do beneficiário deve ser um dos seguintes: 'A', 'S', 'C', 'I', 'D'. | 01-arqueologia/legado-sifap/natural-programs/VALBENEF.NSN#L177-L182 | BENEFICIARIO.STATUS | MÉDIO | Controle de status permitido. |
 | BR-006 | Se o CPF for inválido após validação de dígitos verificadores, o sistema deve marcar resultado inválido e registrar erro CPF INVALIDO. | 01-arqueologia/legado-sifap/natural-programs/VALDOCS.NSN#L68; 01-arqueologia/legado-sifap/natural-programs/VALDOCS.NSN#L69; 01-arqueologia/legado-sifap/natural-programs/VALDOCS.NSN#L102; 01-arqueologia/legado-sifap/natural-programs/VALDOCS.NSN#L123; 01-arqueologia/legado-sifap/natural-programs/VALDOCS.NSN#L140 | BENEFICIARIO.CPF | ALTO | EARS: Unwanted. Classificação: Inferida. Observação: Algoritmo de CPF implementado em duas etapas de DV. |
 | BR-007 | Se RG estiver em branco ou com menos de 5 caracteres úteis, o sistema deve invalidar RG. | 01-arqueologia/legado-sifap/natural-programs/VALDOCS.NSN#L78; 01-arqueologia/legado-sifap/natural-programs/VALDOCS.NSN#L79; 01-arqueologia/legado-sifap/natural-programs/VALDOCS.NSN#L148; 01-arqueologia/legado-sifap/natural-programs/VALDOCS.NSN#L160 | BENEFICIARIO.RG | MÉDIO | EARS: Unwanted. Classificação: Inferida. Observação: Comprimento é calculado pelo primeiro espaço encontrado. |
 | BR-008 | Quando o prefixo do CPF estiver na lista especial, o sistema deve validar o documento especial, forçar resultado válido e limpar erros acumulados. | 01-arqueologia/legado-sifap/natural-programs/VALDOCS.NSN#L41; 01-arqueologia/legado-sifap/natural-programs/VALDOCS.NSN#L88; 01-arqueologia/legado-sifap/natural-programs/VALDOCS.NSN#L174 | BENEFICIARIO.CPF, BENEFICIARIO.DOCUMENTOS-OK | ALTO | EARS: Event-driven. Classificação: Inferida. Observação: Regra de override, prevalece sobre falhas anteriores de CPF/RG. |
 | BR-009 | Se houver documento especial válido, o sistema deve exibir mensagem específica de validação especial. | 01-arqueologia/legado-sifap/natural-programs/VALDOCS.NSN#L95 | BENEFICIARIO.CPF | BAIXO | EARS: Optional. Classificação: Inferida. Observação: Saída adicional, não altera mais validações nesse ponto. |
 | BR-010 | O resultado final inicia como válido e só é alterado para inválido quando alguma validação falha, exceto no override de documento especial. | 01-arqueologia/legado-sifap/natural-programs/VALDOCS.NSN#L35; 01-arqueologia/legado-sifap/natural-programs/VALDOCS.NSN#L71; 01-arqueologia/legado-sifap/natural-programs/VALDOCS.NSN#L81; 01-arqueologia/legado-sifap/natural-programs/VALDOCS.NSN#L177 | BENEFICIARIO.CPF, BENEFICIARIO.RG | ALTO | EARS: State-driven. Classificação: Inferida. Observação: Fluxo de estado claro com exceção explícita. |
 | BR-011 | Para cálculo dos dígitos do CPF, quando resto da divisão por 11 for menor que 2, o DV calculado deve ser 0. | 01-arqueologia/legado-sifap/natural-programs/VALDOCS.NSN#L118; 01-arqueologia/legado-sifap/natural-programs/VALDOCS.NSN#L135 | BENEFICIARIO.CPF | MÉDIO | EARS: Ubiquitous. Classificação: Inferida. Observação: Regra matemática padrão do algoritmo no código. |


> Adicione mais linhas conforme necessário. Lembre-se: existem **10 regras escondidas** no código!

## Exemplo de linha bem preenchida

| ID     | Regra de Negócio                                                                        | Programa Fonte                                   | Campos DDM                                                               | Nível de Risco | Notas                                      |
| ------ | --------------------------------------------------------------------------------------- | ------------------------------------------------ | ------------------------------------------------------------------------ | -------------- | ------------------------------------------ |
| BR-013 | Desconto total não pode exceder 30% do valor bruto, exceto descontos judiciais (tipo J) | `01-arqueologia/legado-sifap/natural-programs/CALCDSCT.NSN#L142-L148` | `PAGAMENTO.VLR-BRUTO`, `PAGAMENTO.VLR-TOTAL-DSCT`, `PAGAMENTO.TIPO-DSCT` | CRÍTICO        | Regra financeira. Tipo 'J' = exceção legal |

## Regras por Categoria

### Cálculos Financeiros

- Nenhuma regra financeira adicional identificada neste recorte.

### Validações de Status

- BR-005: O status do beneficiário deve ser um dos seguintes: 'A', 'S', 'C', 'I', 'D'.
- BR-010: O resultado final inicia como válido e é alterado para inválido quando há falha de validação, exceto override por documento especial.

### Regras de Autorização

- BR-008: Prefixo especial de CPF ativa override de validação documental.

### Regras de Negócio Temporais

- BR-002: A data de nascimento do beneficiário deve ser válida: ano entre 1900 e o ano atual, mês entre 1 e 12, dia compatível com o mês (considerando ano bissexto para fevereiro).
- BR-011: No cálculo de dígitos do CPF, quando o resto da divisão por 11 for menor que 2, o DV deve ser 0.

## Resumo Estatístico

- Total de regras encontradas: 11
- Regras críticas: 0
- Regras com duplicação: 1 (BR-001 e BR-006 tratam validação de CPF em módulos distintos)
- Regras sem documentação (escondidas): 1 (BR-008)

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

