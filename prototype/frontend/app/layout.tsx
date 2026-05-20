import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SIFAP 2.0",
  description: "Sistema de cálculo de benefícios - Versão modernizada",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className="bg-gray-50">
        <header className="bg-white shadow">
          <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <h1 className="text-2xl font-bold text-gray-900">SIFAP 2.0</h1>
            <p className="text-gray-600">Sistema de Cálculo de Benefícios</p>
          </nav>
        </header>
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
        <footer className="bg-gray-100 mt-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 text-center text-gray-600">
            <p>SIFAP 2.0 - Estágio 3 (Implementação)</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
