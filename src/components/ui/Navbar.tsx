'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signIn, signOut, useSession } from 'next-auth/react';
import { ChefHat, Gamepad2, Home, Trophy, User, Sparkles } from 'lucide-react';
import { PlayerProfile } from '@/types/player';

interface NavbarProps {
  player: PlayerProfile | null;
  onOpenPlayerModal?: () => void;
}

export function Navbar({ player, onOpenPlayerModal }: NavbarProps) {
  const pathname = usePathname();
  const { data: session, status } = useSession();

  const navLinks = [
    { href: '/', label: 'Início', icon: Home },
    { href: '/jogos', label: 'Jogos', icon: Gamepad2 },
    { href: '/perfil', label: 'Desempenho', icon: Trophy },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-primary/20 bg-primary text-primary-foreground shadow-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 h-16 sm:h-20">
        {/* Marca & Logo */}
        <Link
          href="/"
          className="group flex items-center gap-3 transition-transform duration-200 active:scale-95"
          aria-label="Página Inicial - Gastronomia Academy"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-brand-700 to-brand-950 border border-gold-400/40 shadow-inner group-hover:border-gold-300">
            <ChefHat className="h-6 w-6 text-secondary transition-transform group-hover:rotate-6" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-serif text-lg sm:text-xl font-bold tracking-wider text-white">
                GASTRONOMIA
              </span>
                <span className="rounded bg-secondary/20 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-secondary border border-secondary/30">
                PRO
              </span>
            </div>
                <span className="text-[11px] font-light tracking-widest text-secondary/70 uppercase">
              Plataforma de Aprendizagem
            </span>
          </div>
        </Link>

        {/* Links Centrais de Navegação */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive =
              link.href === '/'
                ? pathname === '/'
                : pathname.startsWith(link.href);

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-all ${isActive
                  ? 'bg-primary-foreground/10 text-secondary shadow-sm border border-secondary/30'
                  : 'text-cream-200/80 hover:bg-white/5 hover:text-white'
                  }`}
              >
                <Icon className="h-4 w-4" />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Perfil do Jogador */}
        <div className="flex items-center gap-3">
          {status === 'authenticated' ? (
            <button
              onClick={() => signOut()}
              className="flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-medium text-white hover:bg-white/15 border border-white/10 transition-all active:scale-95"
              title={`Sair de ${session.user?.email || 'sua conta Google'}`}
            >
              <span className="hidden lg:inline max-w-32 truncate">{session.user?.email}</span>
              <span className="text-secondary">Sair</span>
            </button>
          ) : status !== 'loading' ? (
            <button
              onClick={() => signIn('google')}
              className="flex items-center gap-2 rounded-full bg-white px-3 py-1.5 sm:px-3.5 sm:py-2 text-xs sm:text-sm font-semibold text-primary hover:bg-cream-50 transition-all active:scale-95"
              title="Entrar com Google"
            >
              <span>Entrar com Google</span>
            </button>
          ) : null}
          <button
            onClick={onOpenPlayerModal}
            className="flex items-center gap-2.5 rounded-full bg-white/10 px-3 py-1.5 sm:px-3.5 sm:py-2 text-xs sm:text-sm font-medium text-white hover:bg-white/15 border border-white/10 transition-all active:scale-95"
            title="Clique para editar seu nome"
          >
            <User className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Barra de navegação móvel inferior ou compacta */}
      <div className="md:hidden flex items-center justify-around border-t border-primary-foreground/20 bg-primary px-2 py-2">
        {navLinks.map((link) => {
          const Icon = link.icon;
          const isActive =
            link.href === '/'
              ? pathname === '/'
              : pathname.startsWith(link.href);

          return (
            <Link
              key={link.href}
              href={link.href}
                className={`flex flex-col items-center gap-1 rounded-lg px-3 py-1 text-[11px] font-medium transition-colors ${isActive ? 'text-secondary font-semibold' : 'text-primary-foreground/70 hover:text-primary-foreground'
                }`}
            >
              <Icon className="h-4 w-4" />
              <span>{link.label}</span>
            </Link>
          );
        })}
      </div>
    </header>
  );
}
