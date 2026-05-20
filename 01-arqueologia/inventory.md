# Inventário Legado — [Nome da Equipe]

Data: 2026-05-20

Nota: Esta é a primeira passada de arqueologia (top-down), baseada apenas em estrutura e nomes de arquivos. O inventário deve ser revisado conforme o time avançar para leitura de programas individuais.

## Estrutura de Pastas

```text
01-arqueologia/legado-sifap/
├── adabas-ddms/
├── legacy-docs/
└── natural-programs/
```

Total de diretórios mapeados: 4

## Contagem de Arquivos por Tipo

| Extensão | Contagem | Finalidade provável |
| --- | ---: | --- |
| .NSN | 15 | Programa-fonte Natural |
| .ddm | 4 | Data Definition Module (estrutura de dados Adabas) |
| .md | 8 | Documentação técnica e guias de operação |
| .docx | 3 | Documentação legada em formato office |

## Padrões de Convenção de Nomes

| Prefixo | Contagem | Hipótese |
| --- | ---: | --- |
| BATCH | 3 | Processamentos batch e pontos de entrada de lote |
| CAD | 3 | Programas de cadastro/manutenção |
| CALC | 3 | Programas de cálculo de benefício, correção e descontos |
| VAL | 3 | Programas de validação documental/cadastral |
| REL | 2 | Programas de relatório |

Prefixos com baixa recorrência:
- CONS (1): Desconhecido — investigar no próximo passo.

## Itens Incomuns (Top 3)

1. `01-arqueologia/legado-sifap/legacy-docs/ARQUITETURA-ORIGINAL-1997.md`
Motivo: maior arquivo identificado por tamanho (33.825 bytes), potencialmente concentrando contexto histórico amplo.
Sugestão de investigação: usar como referência de contexto, validando divergências com o código real.

2. `01-arqueologia/legado-sifap/natural-programs/CONSBENF.NSN`
Motivo: único programa com prefixo CONS (singleton de padrão).
Sugestão de investigação: priorizar leitura para entender se é ponto de consulta transversal.

3. `01-arqueologia/legado-sifap/legacy-docs/*.docx`
Motivo: extensão com volume pequeno (3 arquivos) e formato não-textual, fora do fluxo natural de diff e rastreabilidade por linha.
Sugestão de investigação: comparar conteúdo `.docx` com versões `.md` equivalentes antes de usar como fonte normativa.

## Ordem de Leitura Proposta

Hipótese de ordem inicial (não é decisão final):

1. Começar por DDMs (`adabas-ddms/*.ddm`) para fixar vocabulário de dados do domínio antes do código procedural.
2. Seguir por entry points batch (`BATCH*.NSN`) para mapear fluxos principais de processamento.
3. Ler núcleo de cálculo e validação (`CALC*.NSN` e `VAL*.NSN`) para extrair regras de negócio e fórmulas.
4. Ler cadastro e consulta (`CAD*.NSN` e `CONSBENF.NSN`) para entender ciclo de vida cadastral.
5. Fechar com relatórios (`REL*.NSN`) para validar projeções de saída e critérios de agregação.

Racional: a ordem prioriza entendimento de dados (DDM) + possíveis entry points de lote, reduzindo ambiguidades antes da leitura detalhada de regras e dependências.
