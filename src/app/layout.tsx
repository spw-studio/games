import type { Metadata } from 'next';
import './globals.css';
import { AppShell } from '@/components/layout/AppShell';

export const metadata: Metadata = {
  title: 'Gastronomia Academy - Plataforma de Jogos e Aprendizagem',
  description:
    'Plataforma de capacitação, aprendizagem e treinamento para restaurantes baseada no catálogo de produtos oficial.',
  keywords: [
    'treinamento restaurante',
    'jogo da memória gastronômico',
    'cardápio',
    'coco bambu',
    'capacitação de garçons',
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className="antialiased selection:bg-brand-800 selection:text-gold-200">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
