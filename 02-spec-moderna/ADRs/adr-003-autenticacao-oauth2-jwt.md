# ADR-003: Autenticação e Autorização via OAuth2/JWT com Spring Security

- **Status:** Accepted
- **Date:** 2026-05-20
- **Deciders:** Par 2 (Enterprise Architect + Software Architect) + Par 5 (DevOps)
- **Related Requirements:** REQ-010 (operador autenticado), REQ-020 (audit com userId)

---

## Context

O sistema legado SIFAP **não possui autenticação interna**. O controle de acesso era feito externamente (provavelmente RACF no mainframe). O código Natural usa `USUARIO = 'BATCH'` como literal para operações automatizadas e não há perfis de usuário nos 15 programas analisados.

O sistema moderno precisa de:
1. Autenticação de operadores humanos (UI Next.js)
2. Autenticação de processos batch (service-to-service)
3. Autorização por perfil: OPERATOR, AUDITOR, ADMIN
4. Identificação de usuário para trilha de auditoria (REQ-020)
5. Integração com infraestrutura Azure (Managed Identity para serviços)

---

## Options Considered

### Option 1: OAuth2 + JWT com Spring Security (Resource Server) + Azure AD/Entra ID

**Description:** Next.js frontend obtém token JWT via Azure AD (OAuth2 Authorization Code + PKCE). Backend Spring Boot valida o JWT como Resource Server. Service-to-service usa Client Credentials. Roles mapeadas via claims no token.

**Pros:**
- Padrão da indústria — bem suportado por Spring Security 6.x
- Azure AD/Entra ID já disponível na infraestrutura Azure do projeto
- JWT stateless — escalável sem session store
- Roles no token: `ROLE_OPERATOR`, `ROLE_AUDITOR`, `ROLE_ADMIN`
- `@PreAuthorize` em Spring para controle fino por endpoint
- userId extraído do token (claim `sub` ou `preferred_username`) para auditoria
- Managed Identity para batch jobs (sem secrets)

**Cons:**
- Dependência do Azure AD (lock-in parcial)
- Configuração inicial de OAuth2 não trivial (app registration, redirect URIs)
- Token refresh precisa ser tratado no frontend

**Risk:** Se Azure AD ficar indisponível, nenhum usuário faz login. Mitigação: cache de token com TTL generoso (1h).

**Effort:** Medium

### Option 2: Session-Based Auth com Spring Session + Redis

**Description:** Login via formulário, sessão armazenada em Redis, cookie HttpOnly.

**Pros:**
- Mais simples de implementar inicialmente
- Sem complexidade de OAuth2/OIDC
- Revogação de sessão imediata

**Cons:**
- Stateful — requer Redis como dependência de infraestrutura
- Não suporta service-to-service nativamente
- Não integra com Azure AD sem adaptação
- Contradiz a diretriz do projeto (`copilot-instructions.md`: "Autenticação via OAuth2/JWT")
- Não escala horizontalmente sem sticky sessions ou Redis cluster
- Batch jobs precisariam de mecanismo separado

**Risk:** Refactoring forçado quando integração com Azure for necessária.

**Effort:** Lower (inicialmente), higher no médio prazo

### Option 3: API Keys para Backend + Basic Auth para UI

**Description:** API Keys para service-to-service, Basic Auth para UI com Spring Security.

**Pros:**
- Máxima simplicidade
- Sem dependências externas

**Cons:**
- API Keys são secrets estáticos — risco de vazamento
- Basic Auth transmite credenciais a cada request (mesmo com HTTPS)
- Não suporta MFA
- Não integra com SSO corporativo
- Viola OWASP (credenciais em headers)
- Contradiz diretriz do projeto

**Risk:** Inaceitável para sistema com dados de 4.2M beneficiários (CPF, NIS, renda).

**Effort:** Lowest

---

## Decision

**Opção 1: OAuth2 + JWT com Spring Security + Azure AD/Entra ID.**

### Arquitetura de Autenticação

```
┌──────────────┐     ┌───────────────┐     ┌──────────────────┐
│   Next.js    │────▶│   Azure AD    │────▶│  Spring Boot     │
│   Frontend   │◀────│   (Entra ID)  │     │  Resource Server │
│              │     │               │     │  (JWT validation)│
└──────────────┘     └───────────────┘     └──────────────────┘
      │                                            │
      │  Authorization: Bearer <JWT>               │
      └────────────────────────────────────────────┘
```

### Perfis de Acesso

| Role | Permissões | Origem |
|------|------------|--------|
| `ROLE_OPERATOR` | CRUD beneficiários, gerar ciclo de pagamento | Claim `roles` no JWT |
| `ROLE_AUDITOR` | Leitura de auditoria, relatórios (read-only) | Claim `roles` no JWT |
| `ROLE_ADMIN` | Gestão de programas sociais, configuração de parâmetros | Claim `roles` no JWT |
| `ROLE_BATCH` | Operações batch (geração, conciliação) | Client Credentials (Managed Identity) |

### Implementação Técnica

- **Spring Security 6.x** com `spring-boot-starter-oauth2-resource-server`
- **JWT validation:** issuer = Azure AD tenant, audience = app registration
- **Annotations:** `@PreAuthorize("hasRole('OPERATOR')")` em controllers
- **Batch:** Azure Managed Identity → Client Credentials → JWT com role BATCH
- **Audit integration:** `SecurityContextHolder.getContext().getAuthentication().getName()` para userId
- **CORS:** configuração explícita para domínio do frontend (sem wildcard `*`)

---

## Consequences

### Positive
- Segurança padrão da indústria para sistema com dados sensíveis (CPF, NIS, renda)
- Integração nativa com Azure (Managed Identity para service-to-service)
- SSO corporativo (se o órgão usar Azure AD)
- userId sempre disponível para auditoria via token
- Stateless — backend escala horizontalmente sem session store

### Negative
- Complexidade inicial de configuração OAuth2 (app registration, redirect URIs)
- Dependência do Azure AD para autenticação (mitigação: pode trocar issuer sem mudar código)
- Frontend precisa tratar token refresh (biblioteca MSAL.js)

### Risks
- Azure AD outage = sistema inacessível. Mitigação: TTL de token de 1h + refresh token de 24h
- Secrets de app registration devem estar em Azure Key Vault (nunca em código/env)
