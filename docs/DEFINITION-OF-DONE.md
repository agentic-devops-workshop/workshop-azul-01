# Definition of Done — SIFAP 2.0

Uma tarefa está **PRONTA** quando atende TODOS os itens abaixo.

## Para Código (Backend Java)

- [ ] Feature implementada conforme REQ-ID
- [ ] Rastreabilidade: commit message cita `Implements REQ-XXX`
- [ ] Testes unitários escritos (mínimo 1 por método de negócio)
- [ ] Testes de integração (com Testcontainers se persistência)
- [ ] `mvn test` passa com cobertura ≥70% da classe
- [ ] Sem warnings do compilador (build limpo)
- [ ] Código revisto por pelo menos 1 dev (PR review)
- [ ] Documentação Swagger atualizada se novo endpoint

## Para Banco de Dados

- [ ] Migração Flyway criada (`V<número>__<descricao>.sql`)
- [ ] Script é idempotente (rode 2× sem erro)
- [ ] Índices criados se necessário (performance)
- [ ] Sem dados hardcoded (usar seeds em arquivo separado)

## Para Frontend

- [ ] Componente testado em navegador (Chrome + Firefox)
- [ ] `npm test` passa com cobertura ≥60%
- [ ] Responsivo (mobile + desktop)
- [ ] Sem console errors/warnings
- [ ] Acessibilidade validada (alt text, ARIA labels)

## Para Documentação

- [ ] README atualizado se mudar setup
- [ ] ADR escrita se decisão arquitetural significativa
- [ ] Glossário atualizado se novo termo de negócio

## Checklist Final

- [ ] Passou pelo menos 1 peer review
- [ ] Toda a CI passou (testes + linting)
- [ ] Commit message clara e rastreada
- [ ] Não há TODO/FIXME sem issue associada

## Rastreabilidade Obrigatória

**TODOS os commits devem referenciar um REQ-ID ou MYS-ID:**

```bash
# Feature
git commit -m "feat(payment): Implements REQ-PAY-001 - calculate base benefit"

# Fix
git commit -m "fix(discount): Fixes MYS-005 - truncation loss in discount calculation"

# Refactor
git commit -m "refactor(validation): Improves code clarity for REQ-VAL-002"
```

Sem rastreabilidade → PR rejeitada.
