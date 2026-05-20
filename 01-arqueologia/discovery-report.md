# Relatorio de Descoberta - Estagio 1

Time: [Nome da Equipe]
Data: 2026-05-20

## Resumo Executivo (maximo de 5 frases)
A codebase legada mapeada nesta passada tem 15 programas Natural (.NSN), 4 DDMs e 30 arquivos no total, distribuidos em 4 diretorios principais. [Fonte](inventory.md)
Foram identificadas 11 regras de negocio no catalogo, das quais 5 estao sem marcador de inferencia e 6 estao explicitamente marcadas como inferidas. [Fonte](business-rules-catalog.md)
O sistema apresenta conectividade alta entre programas e dados (34 arestas programa-para-dados verificadas), mas sem arestas programa-para-programa por CALLNAT/INCLUDE no escopo analisado. [Fonte](dependency-map.md)
O maior risco para entrada no Estagio 2 e a existencia de validacoes e overrides documentais sem classificacao formal de bloqueio, com destaque para o misterio MYS-001 (documento especial forcando resultado valido e limpando erros). [Fonte](mysteries-found.md)
O nivel de confianca para modernizacao nesta etapa e medio, pois ha boa base de evidencias tecnicas, mas ainda com lacunas de classificacao de risco e inventario incompleto de misterios. [Fonte](mysteries-found.md)

## O Que Sabemos (Confirmado)

### Regras de Negocio (somente confirmadas)
1. BR-001: CPF do beneficiario deve ser valido por modulo 11, com regra especial para prefixo 000 em caso de teste. Candidato EARS: Ubiquitous. [Fonte](business-rules-catalog.md)
2. BR-002: Data de nascimento deve estar em faixa valida de ano/mes/dia, incluindo ano bissexto para fevereiro. Candidato EARS: Ubiquitous. [Fonte](business-rules-catalog.md)
3. BR-003: Nome nao pode ser vazio e deve conter ao menos nome e sobrenome. Candidato EARS: Ubiquitous. [Fonte](business-rules-catalog.md)
4. BR-004: UF, quando informada, deve estar no conjunto de 27 siglas validas. Candidato EARS: Ubiquitous. [Fonte](business-rules-catalog.md)
5. BR-005: Status do beneficiario deve pertencer ao dominio A, S, C, I ou D. Candidato EARS: State-driven. [Fonte](business-rules-catalog.md)

Observacao de criterio: nesta sintese, "confirmadas" sao as regras sem anotacao explicita "Classificacao: Inferida" no catalogo. [Fonte](business-rules-catalog.md)

### Dependencias (arestas verificadas)
- Arestas programa-para-programa verificadas: 0. [Fonte](dependency-map.md)
- Arestas programa-para-dados verificadas: 34. [Fonte](dependency-map.md)
- DDMs com acesso verificado nas arestas: BENEFICIARIO, PAGAMENTO, PROGRAMA-SOCIAL e AUDITORIA (alem de WORK FILE 1 como estrutura de trabalho). [Fonte](dependency-map.md)
- Programas com maior intensidade de acesso a dados no mapa: BATCHPGT.NSN (5 arestas), BATCHCON.NSN (5 arestas), CADBENEF.NSN (3 arestas), CALCBENF.NSN (3 arestas) e CALCDSCT.NSN (3 arestas). [Fonte](dependency-map.md)

### Estruturas de Dados (DDMs documentados)
- BENEFICIARIO.ddm
- PAGAMENTO.ddm
- PROGRAMA-SOCIAL.ddm
- AUDITORIA.ddm

Resumo de inventario: os DDMs estao centralizados em um diretorio dedicado e representam as quatro entidades de dados principais observadas no fluxo legado. [Fonte](inventory.md)

## O Que Traz Risco

### Misterios que Bloqueiam o Estagio 2
Nao ha classificacao formal "blocks-stage-2" registrada no arquivo de misterios; isso e uma lacuna de rastreabilidade para handoff. [Fonte](mysteries-found.md)

Potenciais bloqueadores (a confirmar com classificacao explicita):
- MYS-001: Regra de documento especial zera erros acumulados e força resultado valido, podendo mascarar inconsistencias de RG/CPF. Caminho sugerido: validacao com negocio para definir fronteira da excecao. [Fonte](mysteries-found.md)
- MYS-002: TITULO e CTPS sao coletados sem validacao no modulo analisado, com risco de requisito oculto fora do escopo atual. Caminho sugerido: rastrear em outros programas ou documentacao funcional. [Fonte](mysteries-found.md)
- MYS-003: Prefixos especiais de CPF sem justificativa funcional explicita no codigo. Caminho sugerido: obter regra normativa com area de negocio e formalizar criterio. [Fonte](mysteries-found.md)

### Regras com Evidencia Fraca
Regras marcadas como inferidas no catalogo (uso com cautela para requisitos do Estagio 2):
- BR-006, BR-007, BR-008, BR-009, BR-010, BR-011. [Fonte](business-rules-catalog.md)

Risco associado: essas regras dependem de evidencia majoritariamente de codigo sem suporte documental consolidado no artefato. [Fonte](business-rules-catalog.md)

## Hipoteses de Recorte Recomendadas
As hipoteses abaixo sao propostas de trabalho e nao decisoes de arquitetura.

### Hipotese 1: Validacao e Cadastro de Beneficiarios - fronteira natural por governanca cadastral
- Programas candidatos: VALBENEF.NSN, VALDOCS.NSN, CADBENEF.NSN, CADDEPEND.NSN, CONSBENF.NSN.
- DDMs principais: BENEFICIARIO (e leitura de PAGAMENTO para historico em consulta).
- Racional (1 linha): concentra regras de qualidade cadastral e integridade de identidade do beneficiario.

### Hipotese 2: Calculo e Geracao de Pagamentos - fronteira natural por processamento financeiro
- Programas candidatos: CALCBENF.NSN, CALCDSCT.NSN, CALCCORR.NSN, BATCHPGT.NSN.
- DDMs principais: PAGAMENTO, BENEFICIARIO, PROGRAMA-SOCIAL.
- Racional (1 linha): agrupa regras de calculo, correcao e persistencia do ciclo de pagamento.

### Hipotese 3: Programas Sociais e Elegibilidade - fronteira natural por criterio de concessao
- Programas candidatos: CADPROG.NSN, VALELEG.NSN, CALCBENF.NSN, BATCHPGT.NSN.
- DDMs principais: PROGRAMA-SOCIAL, BENEFICIARIO.
- Racional (1 linha): centraliza a manutencao dos programas e a regra de elegibilidade associada.

### Hipotese 4: Auditoria e Conformidade Operacional - fronteira natural por trilha de controle
- Programas candidatos: BATCHCON.NSN, RELAUDIT.NSN.
- DDMs principais: AUDITORIA (com correlacao em PAGAMENTO).
- Racional (1 linha): isola conciliacao, registro de eventos e evidencias para controle e fiscalizacao.

### Hipotese 5: Relatorios e Transparencia - fronteira natural por consumo analitico
- Programas candidatos: RELPGT.NSN, BATCHREL.NSN, RELAUDIT.NSN, CONSBENF.NSN.
- DDMs principais: PAGAMENTO, BENEFICIARIO, AUDITORIA.
- Racional (1 linha): reune programas de leitura e apresentacao de informacao sem foco transacional primario.

## Artefatos-Fonte
- [inventory.md](inventory.md)
- [business-rules-catalog.md](business-rules-catalog.md)
- [dependency-map.md](dependency-map.md)
- [mysteries-found.md](mysteries-found.md)

## Aprovacao da Equipe
Reviewed by: 
Date: 
Confidence: 
