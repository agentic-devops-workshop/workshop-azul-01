<!-- markdownlint-disable MD013 MD025 MD026 MD028 MD029 MD034 MD040 MD051 MD060 -->

# Mistérios Encontrados — SIFAP Legado

![ESTÁGIO 01 Arqueologia](https://img.shields.io/badge/ESTÁGIO-01%20Arqueologia-F25022?style=for-the-badge) ![TIPO Worksheet](https://img.shields.io/badge/TIPO-Worksheet-1A1A1A?style=for-the-badge) ![PREENCHA Durante S1](https://img.shields.io/badge/PREENCHA-Durante%20S1-737373?style=for-the-badge)

> 🗺 **Você está aqui:** [Kit PT-BR](../README.md) → [Estágio 1](README.md) → **mysteries-found**

> **Para quem é isto?** Este é um **artefato preenchido pelo time** durante o Estágio 1 (Arqueologia).
>
> **O que você terá ao final do estágio:**
>
> 1. Este documento totalmente preenchido com os dados reais do legado SIFAP
> 2. Rastreabilidade para `01-arqueologia/legado-sifap/` (programas `.NSN` e DDMs)
> 3. Base de evidência usada nas EARS do Estágio 2 (`source_legacy:`)
>
> 📘 **Guia passo a passo:** [`GUIDE.md`](GUIDE.md).


> Registre aqui toda lógica, comportamento ou código que o time não conseguiu explicar.
> "Mistérios" são trechos de código sem documentação, com lógica não-óbvia ou que parecem workarounds.
>
> **Cota mínima para passar pelo portão do Estágio 2:** 5 mistérios documentados.

## O que conta como "mistério"?

- Código que faz algo inesperado sem comentário explicando por quê
- Valores hardcoded sem explicação (números mágicos)
- Lógica condicional que parece um workaround ou gambiarra
- Campos no DDM que não são usados por nenhum programa
- Programas que existem mas não são chamados por ninguém
- Comportamento diferente entre o que a documentação diz e o que o código faz
- Easter eggs deixados pelos desenvolvedores originais

## Níveis de Confiança

| Nível     | Significado                                         |
| --------- | --------------------------------------------------- |
| **ALTA**  | Temos certeza de que há algo estranho aqui          |
| **MÉDIA** | Parece suspeito, mas pode ter explicação            |
| **BAIXA** | Pode ser intencional, mas não conseguimos confirmar |

## Mistérios Catalogados

| ID      | Descrição | Onde Encontrado | Impacto Potencial | Confiança |
| ------- | --------- | --------------- | ----------------- | --------- |
| MYS-001 | A regra de documento especial limpa todos os erros e força válido. Precisa confirmar com negócio se isso deve ignorar também falha de RG, ou apenas flexibilizar CPF. | 01-arqueologia/legado-sifap/natural-programs/VALDOCS.NSN#L176; 01-arqueologia/legado-sifap/natural-programs/VALDOCS.NSN#L178 | Pode aprovar cadastro com inconsistências de documento. | **ALTA** |
| MYS-002 | TITULO e CTPS são coletados na entrada, mas não entram em nenhuma validação neste programa. Pode haver validação externa ou requisito incompleto. | 01-arqueologia/legado-sifap/natural-programs/VALDOCS.NSN#L52 | Regras de documento podem ficar incompletas na migração. | **ALTA** |
| MYS-003 | Lista de prefixos especiais contém valores aparentemente administrativos/teste sem documentação funcional no código. | 01-arqueologia/legado-sifap/natural-programs/VALDOCS.NSN#L41 | Pode manter exceções indevidas ou quebrar cenários especiais. | **MÉDIA** |
| MYS-004 |           |                 |                   |           |
| MYS-005 |           |                 |                   |           |
| MYS-006 |           |                 |                   |           |
| MYS-007 |           |                 |                   |           |
| MYS-008 |           |                 |                   |           |
| MYS-009 |           |                 |                   |           |
| MYS-010 |           |                 |                   |           |

## Detalhamento dos Mistérios

### MYS-001: Documento especial sobrescreve erros

- **Arquivo**: `01-arqueologia/legado-sifap/natural-programs/VALDOCS.NSN#L176-L179`
- **Trecho de código**:

```natural
MOVE 'V' TO #RESULTADO
MOVE 0 TO #QTD-ERROS
```

- **O que esperávamos**: confirmação de quais validações podem ser flexibilizadas.
- **O que o código faz**: força o resultado para válido e apaga erros acumulados.
- **Hipótese do time**: regra histórica para casos especiais de cadastro.
- **Risco se ignorarmos**: aprovação incorreta de beneficiários sem critérios claros.

---

### MYS-002: TITULO e CTPS sem validação

- **Arquivo**: `01-arqueologia/legado-sifap/natural-programs/VALDOCS.NSN#L52`
- **Trecho de código**:

```natural
'TITULO ELEITOR:' #TITULO /
'CTPS..........:' #CTPS
```

- **O que esperávamos**: regras explícitas para validar os dois documentos.
- **O que o código faz**: coleta/exibe os campos, sem aplicar validação.
- **Hipótese do time**: validação pode existir em outro programa ou ter sido removida.
- **Risco se ignorarmos**: perda de requisitos de conformidade documental.

---

### MYS-003: Prefixos especiais sem documentação

- **Arquivo**: `01-arqueologia/legado-sifap/natural-programs/VALDOCS.NSN#L41`
- **Trecho de código**:

```natural
1 #PREF-ESP            (A3/8)
```

- **O que esperávamos**: documentação funcional justificando os prefixos especiais.
- **O que o código faz**: define e usa lista fixa de prefixos sem contexto de negócio no código.
- **Hipótese do time**: códigos administrativos/teste legados.
- **Risco se ignorarmos**: comportamento divergente em produção e homologação.

---

> Copie o bloco acima para cada mistério encontrado.

## Easter Eggs

> Dica: existem **3 easter eggs** escondidos no código legado. Registre aqui os que encontrar:

1. [ ] Easter Egg 1: \_\_\_
2. [ ] Easter Egg 2: \_\_\_
3. [ ] Easter Egg 3: \_\_\_

## Resumo

- Total de mistérios encontrados: 3
- Confiança alta: 2
- Confiança média: 1
- Confiança baixa: 0
- Easter eggs encontrados: \_\_\_ / 3

---

### Continuar a leitura

<table width="100%">
<tr>
<td width="50%" valign="top" align="left">
<sub><strong>← ANTERIOR</strong></sub><br/>
<a href="mysteries-checklist.md"><strong>mysteries-checklist.md</strong></a><br/>
<sub>Lista do que procurar.</sub>
</td>
<td width="50%" valign="top" align="right">
<sub><strong>PRÓXIMO →</strong></sub><br/>
<a href="discovery-report.md"><strong>discovery-report.md</strong></a><br/>
<sub>Síntese final.</sub>
</td>
</tr>
</table>

<sub>↑ <a href="README.md">Voltar ao Kit PT-BR</a></sub>

