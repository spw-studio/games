'use client';

interface LoadingScreenProps {
  label?: string;
  fullScreen?: boolean;
}

export function LoadingScreen({
  label = 'Carregando...',
  fullScreen = true,
}: LoadingScreenProps) {
  return (
    <div
      className={[
        'flex items-center justify-center bg-background/95 p-6 text-center text-foreground backdrop-blur-sm',
        fullScreen ? 'fixed inset-0 z-[70] min-h-screen' : 'min-h-[50vh] w-full',
      ].join(' ')}
      role="status"
      aria-live="polite"
      aria-label={label}
    >
      <div className="flex flex-col items-center gap-4">
        <div className="relative h-12 w-12" aria-hidden="true">
          <div className="absolute inset-0 rounded-full border-4 border-muted" />
          <div className="absolute inset-0 animate-spin rounded-full border-4 border-transparent border-t-primary" />
          <div className="absolute inset-2 rounded-full bg-secondary/20" />
        </div>
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}
