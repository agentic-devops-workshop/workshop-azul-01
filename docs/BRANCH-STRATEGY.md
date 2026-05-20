# Estratégia de Branches — SIFAP 2.0

## Nomenclatura

- **main**: código de produção (tags semânticas v1.0.0)
- **develop**: integração do estágio de implementação
- **feat/REQ-XXX-descricao**: nova feature (ex: `feat/REQ-PAY-001-calculo-beneficio`)
- **fix/MYS-XXX-descricao**: correção de mistério (ex: `fix/MYS-005-truncamento`)
- **refactor/...**: refatoração sem novo comportamento
- **docs/...**: apenas documentação

## Fluxo

1. Cria branch a partir de `develop`: `git checkout -b feat/REQ-PAY-001-...`
2. Commit com referência: `Implements REQ-PAY-001: descrição curta`
3. Push para remote
4. Abre PR contra `develop`
5. Merge após aprovação de 1 peer

## Proteções

- `develop` protegido: requer 1 review + CI verde
- `main` protegido: requer 2 reviews + CI verde
- Squash-merge em develop; rebase-merge em main

## Convenções de Commit

```
<tipo>(<escopo>): <descrição curta>

<corpo opcional>

<footer opcional>
```

### Tipos

- `feat`: nova feature (REQ-XXX)
- `fix`: correção de bug (MYS-XXX)
- `docs`: documentação
- `refactor`: refatoração sem mudança de comportamento
- `test`: adiciona ou modifica testes
- `chore`: atualizações de dependências, scripts
- `perf`: melhoria de performance

### Exemplo

```
feat(payment): Implements REQ-PAY-001 - calculate base benefit

- Apply regional factor from 27-region table
- Calculate family factor based on dependents (0-10)
- Apply income bracket (100%-40% scale)

Closes #123
```

## Padrão de Tags

Usar versionamento semântico com Git tags:

```bash
git tag -a v1.0.0 -m "Release 1.0.0 - Initial SIFAP 2.0"
git push origin v1.0.0
```

Format: `vMAJOR.MINOR.PATCH`
