# SIFAP 2.0 Backend

Backend Java 21 + Spring Boot 3 para modernização do SIFAP

## Estrutura

```
src/main/java/br/gov/sifap/
├── SifapApplication.java       # Entrada da aplicação
├── config/                      # Configurações (CORS, JWT, etc)
├── health/                      # Health check
├── domain/                      # Lógica de negócio (Services)
│   ├── payment/                # Cálculo de benefício (REQ-PAY-001)
│   ├── discount/               # Cálculo de desconto (REQ-DIS-001)
│   ├── validation/             # Validações (REQ-VAL-001)
│   └── correction/             # Correções IPCA (REQ-CORR-001)
├── application/                 # Controllers (REST API)
└── infrastructure/              # Persistência, cache, etc

src/main/resources/
├── application.properties       # Configuração padrão (local)
├── application-docker.properties # Configuração Docker
└── db/migration/                # Scripts Flyway
```

## Desenvolvimento Local

### Pré-requisitos
- Java 21 JDK
- Maven 3.9+
- PostgreSQL 16 (ou Docker + docker-compose)

### Setup

1. **PostgreSQL rodando:**
   ```bash
   docker run --name sifap-postgres \
     -e POSTGRES_DB=sifap \
     -e POSTGRES_USER=sifap \
     -e POSTGRES_PASSWORD=sifap_local \
     -p 5432:5432 \
     -d postgres:16-alpine
   ```

2. **Build:**
   ```bash
   mvn clean install
   ```

3. **Rodar:**
   ```bash
   mvn spring-boot:run
   ```

4. **Testar:**
   ```bash
   curl http://localhost:8080/api/v1/health
   ```

5. **Swagger:**
   ```
   http://localhost:8080/swagger-ui.html
   ```

## Docker

```bash
docker build -t sifap-backend:0.0.1 .
docker run -p 8080:8080 --network sifap-net -e SPRING_DATASOURCE_URL=jdbc:postgresql://postgres:5432/sifap sifap-backend:0.0.1
```

## Rastreabilidade

Cada serviço está mapeado para um requisito:

- `PaymentCalculationService` → REQ-PAY-001 (cálculo de benefício)
- `DiscountCalculationService` → REQ-DIS-001 (cálculo de desconto)
- `DocumentValidationService` → REQ-VAL-001 (validação de documentos)
- `IpCorrectionService` → REQ-CORR-001 (correção IPCA)

### Referências
- `SPECIFICATION.md` — Requisitos detalhados
- `business-rules-catalog.md` — Regras de negócio
- `mysteries-found.md` — Problemas herdados do legacy

## Testes

```bash
mvn test
```

Cobertura mínima: **70%** por classe

## CI/CD

Commits devem seguir padrão de rastreabilidade:

```bash
git commit -m "feat(payment): Implements REQ-PAY-001 - calculate base benefit

- Apply regional factor (BR-001)
- Apply family factor (BR-002)
- Apply income bracket (BR-003)

Closes #REQ-PAY-001"
```

Ver `docs/BRANCH-STRATEGY.md` e `docs/DEFINITION-OF-DONE.md`
