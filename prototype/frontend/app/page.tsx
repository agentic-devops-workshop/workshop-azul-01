'use client';

import { useEffect, useState } from 'react';

export default function Home() {
  const [backendStatus, setBackendStatus] = useState<string>('Verificando...');

  useEffect(() => {
    const checkBackend = async () => {
      try {
        const response = await fetch('/api/v1/health');
        if (response.ok) {
          setBackendStatus('✓ Backend conectado');
        } else {
          setBackendStatus('✗ Backend indisponível');
        }
      } catch (error) {
        setBackendStatus('✗ Erro ao conectar ao backend');
      }
    };

    checkBackend();
  }, []);

  return (
    <div className="space-y-8">
      <section className="bg-white rounded-lg shadow p-6">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Bem-vindo ao SIFAP 2.0</h2>
        <p className="text-gray-600 mb-4">
          Sistema modernizado de cálculo de benefícios - Estágio 3 (Implementação)
        </p>
        
        <div className="bg-blue-50 border border-blue-200 rounded p-4 mb-4">
          <p className="text-blue-900">
            <strong>Status do Backend:</strong> <span className="font-mono">{backendStatus}</span>
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border border-gray-200 rounded p-4">
            <h3 className="font-bold text-lg mb-2">📋 Requisitos</h3>
            <p className="text-gray-600">
              Implemente os requisitos especificados por Par 2 (SPECIFICATION.md)
            </p>
          </div>
          
          <div className="border border-gray-200 rounded p-4">
            <h3 className="font-bold text-lg mb-2">📊 Rastreabilidade</h3>
            <p className="text-gray-600">
              Cada feature está mapeada a um REQ-XXX com testes automatizados
            </p>
          </div>

          <div className="border border-gray-200 rounded p-4">
            <h3 className="font-bold text-lg mb-2">🧪 Testes</h3>
            <p className="text-gray-600">
              Cobertura mínima de 60% - rode `npm test` para validar
            </p>
          </div>

          <div className="border border-gray-200 rounded p-4">
            <h3 className="font-bold text-lg mb-2">🚀 Deploy</h3>
            <p className="text-gray-600">
              Pronto para entrega a Par 5 (DevOps) em Estágio 4
            </p>
          </div>
        </div>
      </section>

      <section className="bg-white rounded-lg shadow p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Próximos Passos</h3>
        <ol className="list-decimal list-inside space-y-2 text-gray-600">
          <li>Ler <code className="bg-gray-100 px-2 py-1 rounded">SPECIFICATION.md</code> de Par 2</li>
          <li>Criar branches <code className="bg-gray-100 px-2 py-1 rounded">feat/REQ-XXX</code> para cada requisito</li>
          <li>Implementar componentes e services</li>
          <li>Escrever testes unitários e de integração</li>
          <li>Fazer commits com rastreabilidade: <code className="bg-gray-100 px-2 py-1 rounded">Implements REQ-XXX</code></li>
          <li>Abrir PRs para revisão</li>
          <li>Validar com <code className="bg-gray-100 px-2 py-1 rounded">docker compose up</code></li>
        </ol>
      </section>

      <section className="bg-yellow-50 border border-yellow-200 rounded p-6">
        <h3 className="text-lg font-bold text-yellow-900 mb-2">⚠️ Referências Importantes</h3>
        <ul className="list-disc list-inside space-y-1 text-yellow-800 text-sm">
          <li><code>01-arqueologia/business-rules-catalog.md</code> - Regras de negócio (BR-XXX)</li>
          <li><code>01-arqueologia/mysteries-found.md</code> - Problemas herdados do legacy</li>
          <li><code>docs/BRANCH-STRATEGY.md</code> - Convenção de branches</li>
          <li><code>docs/DEFINITION-OF-DONE.md</code> - Critérios de conclusão</li>
          <li><code>prototype/backend/README.md</code> - Setup do backend</li>
        </ul>
      </section>
    </div>
  );
}
