# SIFAP 2.0 Frontend

Frontend Next.js 15 + React 19 + TailwindCSS para modernização do SIFAP

## Estrutura

```
app/
├── layout.tsx              # Layout principal
├── page.tsx                # Página inicial
├── globals.css             # Estilos globais
├── components/             # Componentes React
│   ├── PaymentCalculator.tsx    # Cálculo de benefício (REQ-PAY-001)
│   ├── DiscountForm.tsx         # Cálculo de desconto (REQ-DIS-001)
│   ├── DocumentValidator.tsx    # Validação (REQ-VAL-001)
│   └── ResultsDisplay.tsx       # Exibição de resultados
├── services/               # Serviços de API
│   ├── paymentService.ts
│   ├── discountService.ts
│   └── validationService.ts
└── __tests__/              # Testes

public/                    # Assets estáticos
```

## Desenvolvimento Local

### Pré-requisitos
- Node.js 18+
- npm ou yarn

### Setup

1. **Instalar dependências:**
   ```bash
   npm install
   ```

2. **Rodar em desenvolvimento:**
   ```bash
   npm run dev
   ```

3. **Acessar:**
   ```
   http://localhost:3000
   ```

4. **Testes:**
   ```bash
   npm test
   npm run test:watch
   npm run test:coverage
   ```

5. **Build para produção:**
   ```bash
   npm run build
   npm start
   ```

## Docker

```bash
docker build -t sifap-frontend:0.0.1 .
docker run -p 3000:3000 sifap-frontend:0.0.1
```

## Rastreabilidade

Cada componente está mapeado para um requisito:

- `PaymentCalculator` → REQ-PAY-001 (cálculo de benefício)
- `DiscountForm` → REQ-DIS-001 (cálculo de desconto)
- `DocumentValidator` → REQ-VAL-001 (validação de documentos)

### Referências
- `../../02-spec-moderna/SPECIFICATION.md` — Requisitos detalhados
- `../../01-arqueologia/business-rules-catalog.md` — Regras de negócio

## Testes

Cobertura mínima: **60%** por componente

```bash
# Testes unitários
npm test

# Relatório de cobertura
npm run test:coverage
```

## CI/CD

Commits devem seguir padrão de rastreabilidade:

```bash
git commit -m "feat(payment): Implements REQ-PAY-001 - payment calculator component

- Create input form for region, dependents, income
- Display calculated benefit with regional factor
- Add validation and error handling
- Add 5 component tests

Closes #REQ-PAY-001"
```

Ver `../../docs/BRANCH-STRATEGY.md` e `../../docs/DEFINITION-OF-DONE.md`

## Integração com Backend

O frontend comunica com o backend Java via HTTP:

- Base URL: `http://localhost:8080` (desenvolvimento) ou via env var
- API Proxy: configurado em `next.config.js`
- Health Check: `GET /api/v1/health`

### Exemplo de Chamada

```typescript
// services/paymentService.ts
export async function calculatePayment(params: PaymentParams) {
  // Implements REQ-PAY-001
  const response = await fetch('/api/v1/payments/calculate', {
    method: 'POST',
    body: JSON.stringify(params),
  });
  return response.json();
}
```

## Variáveis de Ambiente

```bash
NEXT_PUBLIC_API_URL=http://localhost:8080  # Backend URL
```
