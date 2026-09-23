import type { Metadata } from 'next';
import { Suspense } from 'react';
import './globals.css';
import { AppShell } from '@/components/layout/AppShell';
import { GameModeProvider } from '@/components/layout/GameModeProvider';
import { ThemeProvider } from '@/theme/ThemeProvider';
import { AuthProvider } from '@/components/auth/AuthProvider';
import { AudioProvider } from '@/components/audio/AudioProvider';

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
      <body className="antialiased selection:bg-primary selection:text-secondary">
        <AuthProvider>
          <AudioProvider>
            <ThemeProvider>
              <GameModeProvider>
                <Suspense fallback={null}>
                  <AppShell>{children}</AppShell>
                </Suspense>
              </GameModeProvider>
            </ThemeProvider>
          </AudioProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
