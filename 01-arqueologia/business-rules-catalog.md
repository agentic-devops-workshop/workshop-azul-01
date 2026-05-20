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
 | BR-006 | Se o CPF informado for zero ou falhar no cálculo dos dígitos verificadores, a validação documental deve retornar inválida. | 01-arqueologia/legado-sifap/natural-programs/VALDOCS.NSN#L100-L142 | BENEFICIARIO.CPF | ALTO | Regra de consistência cadastral no fluxo de documentos. |
 | BR-007 | O RG é inválido quando estiver em branco ou com menos de 5 caracteres úteis. | 01-arqueologia/legado-sifap/natural-programs/VALDOCS.NSN#L146-L162 | BENEFICIARIO.RG | MÉDIO | Regra mínima de formato de identificação civil. |
 | BR-008 | Se o prefixo do CPF estiver em uma lista especial (000, 001, 002, 010, 011, 099, 100, 999), o sistema marca documentação especial como válida, força resultado válido e zera erros acumulados. | 01-arqueologia/legado-sifap/natural-programs/VALDOCS.NSN#L37-L44; 01-arqueologia/legado-sifap/natural-programs/VALDOCS.NSN#L168-L181 | BENEFICIARIO.CPF, BENEFICIARIO.DOCUMENTOS-OK | ALTO | Exceção de negócio para governo/teste; sobrescreve falhas anteriores. |
 | BR-009 | Se o beneficiário não for encontrado pelo CPF, o processo de elegibilidade deve ser encerrado imediatamente. | 01-arqueologia/legado-sifap/natural-programs/VALELEG.NSN#L70-L84 | BENEFICIARIO.CPF | ALTO | Hard stop por ausência cadastral. |
 | BR-010 | Se o programa social não for encontrado pelo código, o processo deve ser encerrado imediatamente. | 01-arqueologia/legado-sifap/natural-programs/VALELEG.NSN#L88-L97 | PROGRAMA-SOCIAL.COD-PROGRAMA | ALTO | Hard stop por ausência de programa. |
 | BR-011 | Apenas programas com status 'A' (ativo) podem conceder elegibilidade. | 01-arqueologia/legado-sifap/natural-programs/VALELEG.NSN#L99-L102 | PROGRAMA-SOCIAL.STATUS-PROG | ALTO | Programa inativo bloqueia análise. |
 | BR-012 | Beneficiário da região 99 é elegível automaticamente por regra especial e encerra o processamento. | 01-arqueologia/legado-sifap/natural-programs/VALELEG.NSN#L107-L111 | BENEFICIARIO.COD-REGIAO | ALTO | Exceção explícita internacional/diplomático. |
 | BR-013 | Beneficiário com status diferente de 'A' é inelegível, com motivo específico: 'S' suspenso, 'C'/'D' cancelado-desligado, 'I' inativo. | 01-arqueologia/legado-sifap/natural-programs/VALELEG.NSN#L116-L134 | BENEFICIARIO.STATUS | ALTO | Regras de bloqueio por ciclo de vida cadastral. |
 | BR-014 | Quando definidos, limites de idade mínima e máxima do programa devem ser respeitados; idade fora da faixa torna o beneficiário inelegível. | 01-arqueologia/legado-sifap/natural-programs/VALELEG.NSN#L139-L152 | PROGRAMA-SOCIAL.IDADE-MIN, PROGRAMA-SOCIAL.IDADE-MAX, BENEFICIARIO.DT-NASCIMENTO | ALTO | Validação etária parametrizada por programa. |
 | BR-015 | Quando definido teto de renda no programa, renda familiar acima do teto torna o beneficiário inelegível. | 01-arqueologia/legado-sifap/natural-programs/VALELEG.NSN#L157-L163 | PROGRAMA-SOCIAL.RENDA-MAX, BENEFICIARIO.RENDA-FAMILIAR | CRÍTICO | Regra financeira de corte de elegibilidade. |
 | BR-016 | Para programa do tipo assistencial ('A'): se renda > 600 e não houver dependentes, o beneficiário é inelegível; além disso, documentação deve estar completa (DOCUMENTOS-OK = 'S'). | 01-arqueologia/legado-sifap/natural-programs/VALELEG.NSN#L168-L182 | PROGRAMA-SOCIAL.TIPO, BENEFICIARIO.RENDA-FAMILIAR, BENEFICIARIO.NUM-DEPENDENTES, BENEFICIARIO.DOCUMENTOS-OK | ALTO | Combina critério socioeconômico e exigência documental. |
 | BR-017 | Para programa previdenciário ('P'), idade mínima de 60 anos é obrigatória. | 01-arqueologia/legado-sifap/natural-programs/VALELEG.NSN#L183-L189 | PROGRAMA-SOCIAL.TIPO, BENEFICIARIO.DT-NASCIMENTO | ALTO | Regra de elegibilidade por faixa etária fixa. |
 | BR-018 | Para programa de trabalho ('T'), idade permitida é de 16 a 65 anos; tipo de programa desconhecido torna o beneficiário inelegível. | 01-arqueologia/legado-sifap/natural-programs/VALELEG.NSN#L190-L201 | PROGRAMA-SOCIAL.TIPO, BENEFICIARIO.DT-NASCIMENTO | ALTO | Inclui validação de domínio do tipo de programa. |
 | BR-019 | Se o código de elegibilidade tiver 'R' na 1ª posição, NIS cadastrado é obrigatório; se tiver 'D' na 2ª posição, pelo menos um dependente é obrigatório. | 01-arqueologia/legado-sifap/natural-programs/VALELEG.NSN#L226-L241 | PROGRAMA-SOCIAL.COD-ELEGIBILIDADE, BENEFICIARIO.NIS, BENEFICIARIO.NUM-DEPENDENTES | ALTO | Regras condicionais compostas por flags no código de elegibilidade. |


> Adicione mais linhas conforme necessário. Lembre-se: existem **10 regras escondidas** no código!

## Exemplo de linha bem preenchida

| ID     | Regra de Negócio                                                                        | Programa Fonte                                   | Campos DDM                                                               | Nível de Risco | Notas                                      |
| ------ | --------------------------------------------------------------------------------------- | ------------------------------------------------ | ------------------------------------------------------------------------ | -------------- | ------------------------------------------ |
| BR-013 | Desconto total não pode exceder 30% do valor bruto, exceto descontos judiciais (tipo J) | `01-arqueologia/legado-sifap/natural-programs/CALCDSCT.NSN#L142-L148` | `PAGAMENTO.VLR-BRUTO`, `PAGAMENTO.VLR-TOTAL-DSCT`, `PAGAMENTO.TIPO-DSCT` | CRÍTICO        | Regra financeira. Tipo 'J' = exceção legal |

## Regras por Categoria

### Cálculos Financeiros

- BR-015: Quando definido teto de renda no programa, renda familiar acima do teto torna o beneficiário inelegível.
- BR-016: Para programa assistencial, renda acima de 600 sem dependentes bloqueia elegibilidade.

### Validações de Status

- BR-005: O status do beneficiário deve ser um dos seguintes: 'A', 'S', 'C', 'I', 'D'.
- BR-011: Apenas programas com status 'A' (ativo) podem conceder elegibilidade.
- BR-013: Beneficiário com status diferente de 'A' é inelegível, com motivo específico por status.

### Regras de Autorização

- BR-012: Beneficiário da região 99 recebe elegibilidade automática por exceção de negócio.
- BR-019: Flags no código de elegibilidade exigem NIS e/ou dependentes.

### Regras de Negócio Temporais

- BR-002: A data de nascimento do beneficiário deve ser válida: ano entre 1900 e o ano atual, mês entre 1 e 12, dia compatível com o mês (considerando ano bissexto para fevereiro).
- BR-014: Idade mínima e máxima parametrizadas por programa devem ser respeitadas.
- BR-017: Programa previdenciário exige idade mínima de 60 anos.
- BR-018: Programa de trabalho exige idade entre 16 e 65 anos.

## Resumo Estatístico

- Total de regras encontradas: 19
- Regras críticas: 1
- Regras com duplicação: 1 (BR-001 e BR-006 tratam validação de CPF em módulos distintos)
- Regras sem documentação (escondidas): 3 (BR-008, BR-012, BR-019)

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

