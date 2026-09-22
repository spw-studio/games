'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signIn, signOut, useSession } from 'next-auth/react';
import { useEffect, useRef, useState } from 'react';
import {
  ChefHat,
  ChevronDown,
  Gamepad2,
  Home,
  LogOut,
  Settings,
  Trophy,
  User,
  UserRound,
  Users,
} from 'lucide-react';
import { PlayerProfile } from '@/types/player';

interface NavbarProps {
  player: PlayerProfile | null;
  onOpenPlayerModal?: () => void;
  onOpenAudioSettings?: () => void;
}

export function Navbar({ player, onOpenPlayerModal, onOpenAudioSettings }: NavbarProps) {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  const navLinks = [
    { href: '/', label: 'Início', icon: Home },
    { href: '/jogos', label: 'Jogos', icon: Gamepad2 },
    { href: '/perfil', label: 'Desempenho', icon: Trophy },
  ];

  const isAuthenticated = status === 'authenticated';
  const visibleNavLinks = isAuthenticated ? navLinks : [];
  const homeHref = isAuthenticated ? '/' : '/jogos';
  const profileName = session?.user?.name || player?.nome || 'Visitante';
  const profileEmail = session?.user?.email || player?.email;
  const profileInitials = profileName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || 'V';

  useEffect(() => {
    if (!isProfileMenuOpen) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (!profileMenuRef.current?.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsProfileMenuOpen(false);
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isProfileMenuOpen]);

  const closeProfileMenu = () => setIsProfileMenuOpen(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-primary/20 bg-primary text-primary-foreground shadow-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 h-16 sm:h-20">
        {/* Marca & Logo */}
        <Link
          href={homeHref}
          className="group flex items-center gap-3 transition-transform duration-200 active:scale-95"
          aria-label="Página Inicial - Gastronomia Academy"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-brand-700 to-brand-950 border border-gold-400/40 shadow-inner group-hover:border-gold-300">
            <ChefHat className="h-6 w-6 text-secondary transition-transform group-hover:rotate-6" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-serif text-lg sm:text-xl font-bold tracking-wider text-primary-foreground">
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

        <div className="flex items-center gap-3">
          {/* Links de navegação alinhados à direita após o login */}
          <nav className="hidden items-center gap-1 md:flex">
            {visibleNavLinks.map((link) => {
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
                    : 'text-primary-foreground/80 hover:bg-primary-foreground/5 hover:text-primary-foreground'
                    }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Login ou menu do perfil autenticado */}
          {!isAuthenticated ? (
          <button
            type="button"
            onClick={() => void signIn('google')}
            disabled={status === 'loading'}
            className="rounded-full bg-primary-foreground px-4 py-2 text-xs font-bold uppercase tracking-wide text-primary transition-all hover:bg-surface disabled:cursor-wait disabled:opacity-70"
            aria-label="Fazer login com Google"
          >
            Login
          </button>
          ) : (
          <div className="relative" ref={profileMenuRef}>
            <button
              type="button"
              onClick={() => setIsProfileMenuOpen((isOpen) => !isOpen)}
              className="flex items-center gap-2 rounded-full border border-primary-foreground/15 bg-primary-foreground/10 px-2 py-1.5 text-left transition-all hover:bg-primary-foreground/15 focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-2 focus:ring-offset-primary"
              aria-expanded={isProfileMenuOpen}
              aria-haspopup="menu"
              aria-label={`Abrir menu do perfil de ${profileName}`}
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-xs font-bold text-primary">
                {profileInitials}
              </span>
              <span className="hidden max-w-32 sm:block">
                <span className="block truncate text-xs font-semibold text-primary-foreground">{profileName}</span>
                <span className="block text-[10px] text-secondary/80">Conta Google</span>
              </span>
              <ChevronDown className={`hidden h-4 w-4 text-secondary transition-transform sm:block ${isProfileMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {isProfileMenuOpen && (
            <div className="absolute right-0 top-full z-50 mt-2 w-64 rounded-card border border-border bg-surface p-2 text-foreground shadow-elevated" role="menu">
              <div className="border-b border-border px-3 py-2">
                <p className="truncate text-sm font-bold">{profileName}</p>
                <p className="truncate text-xs text-muted-foreground">{profileEmail || 'Perfil salvo neste navegador'}</p>
              </div>

              {isAuthenticated && (
                <>
                  <Link
                    href="/perfil"
                    onClick={closeProfileMenu}
                    className="mt-2 flex items-center gap-3 rounded-control px-3 py-2.5 text-sm hover:bg-muted"
                    role="menuitem"
                  >
                    <UserRound className="h-4 w-4 text-primary" />
                    <span>Meu desempenho</span>
                  </Link>
                  {(session?.user?.role === 'OWNER' ||
                    session?.user?.isSuperAdmin) && (
                    <Link
                      href="/admin/membros"
                      onClick={closeProfileMenu}
                      className="mt-1 flex items-center gap-3 rounded-control px-3 py-2.5 text-sm hover:bg-muted"
                      role="menuitem"
                    >
                      <Users className="h-4 w-4 text-primary" />
                      <span>Equipe</span>
                    </Link>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      closeProfileMenu();
                      onOpenPlayerModal?.();
                    }}
                    className="flex w-full items-center gap-3 rounded-control px-3 py-2.5 text-left text-sm hover:bg-muted"
                    role="menuitem"
                  >
                    <User className="h-4 w-4 text-primary" />
                    <span>Editar perfil</span>
                  </button>
                </>
              )}
              <button
                type="button"
                onClick={() => {
                  closeProfileMenu();
                  onOpenAudioSettings?.();
                }}
                className="flex w-full items-center gap-3 rounded-control px-3 py-2.5 text-left text-sm hover:bg-muted"
                role="menuitem"
              >
                <Settings className="h-4 w-4 text-primary" />
                <span>Preferências de som</span>
              </button>

              <div className="mt-2 border-t border-border pt-2">
                <button
                  type="button"
                  onClick={() => {
                    closeProfileMenu();
                    void signOut({ callbackUrl: '/jogos' });
                  }}
                  className="flex w-full items-center gap-3 rounded-control px-3 py-2.5 text-left text-sm text-danger hover:bg-danger/10"
                  role="menuitem"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Sair da conta Google</span>
                </button>
              </div>
            </div>
            )}
            </div>
          )}
        </div>
      </div>

      {/* Barra de navegação móvel inferior ou compacta */}
      <div className="md:hidden flex items-center justify-around border-t border-primary-foreground/20 bg-primary px-2 py-2">
        {visibleNavLinks.map((link) => {
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
