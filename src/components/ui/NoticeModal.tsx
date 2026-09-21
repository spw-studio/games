'use client';

import { AlertCircle, CheckCircle2, Info, X, XCircle } from 'lucide-react';
import { ReactNode, useEffect, useRef } from 'react';

type NoticeVariant = 'info' | 'warning' | 'success' | 'danger';

interface NoticeModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  variant?: NoticeVariant;
  primaryAction?: {
    label: string;
    onClick: () => void;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  onClose: () => void;
  children?: ReactNode;
}

const VARIANT_STYLES: Record<NoticeVariant, {
  icon: typeof Info;
  iconClass: string;
  badgeClass: string;
}> = {
  info: {
    icon: Info,
    iconClass: 'bg-primary/10 text-primary',
    badgeClass: 'bg-primary',
  },
  warning: {
    icon: AlertCircle,
    iconClass: 'bg-warning/10 text-warning',
    badgeClass: 'bg-warning',
  },
  success: {
    icon: CheckCircle2,
    iconClass: 'bg-success/10 text-success',
    badgeClass: 'bg-success',
  },
  danger: {
    icon: XCircle,
    iconClass: 'bg-danger/10 text-danger',
    badgeClass: 'bg-danger',
  },
};

export function NoticeModal({
  isOpen,
  title,
  message,
  variant = 'info',
  primaryAction,
  secondaryAction,
  onClose,
  children,
}: NoticeModalProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const styles = VARIANT_STYLES[variant];
  const Icon = styles.icon;

  useEffect(() => {
    if (!isOpen) return;

    closeButtonRef.current?.focus();
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200"
      role="presentation"
      onMouseDown={onClose}
    >
      <section
        className="w-full max-w-md overflow-hidden rounded-card border border-border bg-surface shadow-elevated animate-in zoom-in-95 duration-200"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="notice-modal-title"
        aria-describedby="notice-modal-message"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className={`h-1.5 w-full ${styles.badgeClass}`} />
        <div className="p-6 sm:p-7">
          <div className="flex items-start gap-4">
            <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-control ${styles.iconClass}`}>
              <Icon className="h-6 w-6" aria-hidden="true" />
            </div>
            <div className="min-w-0 flex-1">
              <h2 id="notice-modal-title" className="pr-8 text-xl font-bold text-foreground">
                {title}
              </h2>
              <p id="notice-modal-message" className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {message}
              </p>
            </div>
            <button
              ref={closeButtonRef}
              type="button"
              onClick={onClose}
              className="-mr-2 -mt-2 flex h-9 w-9 shrink-0 items-center justify-center rounded-control text-muted-foreground hover:bg-muted hover:text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              aria-label="Fechar aviso"
              title="Fechar"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {children && <div className="mt-5">{children}</div>}

          {(primaryAction || secondaryAction) && (
            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              {secondaryAction && (
                <button
                  type="button"
                  onClick={secondaryAction.onClick}
                  className="rounded-control border border-border bg-surface px-4 py-2.5 text-sm font-semibold text-foreground hover:bg-surface-hover focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {secondaryAction.label}
                </button>
              )}
              {primaryAction && (
                <button
                  type="button"
                  onClick={primaryAction.onClick}
                  className="rounded-control bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                >
                  {primaryAction.label}
                </button>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
