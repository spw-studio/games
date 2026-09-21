import type { Metadata } from 'next';
import './globals.css';
import { AppShell } from '@/components/layout/AppShell';
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
              <AppShell>{children}</AppShell>
            </ThemeProvider>
          </AudioProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
