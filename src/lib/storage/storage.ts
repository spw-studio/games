/**
 * Utilitário seguro para acesso ao localStorage que previne
 * erros de execução no ambiente de SSR do Next.js.
 */

export function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

export function safeGetItem<T>(key: string, defaultValue: T): T {
  if (!isBrowser()) {
    return defaultValue;
  }
  try {
    const item = window.localStorage.getItem(key);
    if (!item) return defaultValue;
    return JSON.parse(item) as T;
  } catch (error) {
    console.warn(`[storage] Erro ao ler chave "${key}":`, error);
    return defaultValue;
  }
}

export function safeSetItem<T>(key: string, value: T): boolean {
  if (!isBrowser()) {
    return false;
  }
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.warn(`[storage] Erro ao salvar chave "${key}":`, error);
    return false;
  }
}

export function safeRemoveItem(key: string): boolean {
  if (!isBrowser()) {
    return false;
  }
  try {
    window.localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.warn(`[storage] Erro ao remover chave "${key}":`, error);
    return false;
  }
}
