/**
 * Layout System for ASUBK Financial Management System
 * Provides layout width mode switching between boxed and full-width
 */

export type LayoutMode = 'boxed' | 'full';

export interface LayoutProviderProps {
  children: React.ReactNode;
  defaultLayout?: LayoutMode;
  storageKey?: string;
}

export interface LayoutProviderState {
  layoutMode: LayoutMode;
  setLayoutMode: (mode: LayoutMode) => void;
}

/**
 * Get stored layout mode from localStorage
 */
export function getStoredLayout(storageKey: string): LayoutMode {
  if (typeof window === 'undefined') return 'boxed';

  try {
    const stored = localStorage.getItem(storageKey);
    if (stored && ['boxed', 'full'].includes(stored)) {
      return stored as LayoutMode;
    }
  } catch {
    // localStorage access might fail in some environments
  }

  return 'boxed';
}

/**
 * Store layout mode in localStorage
 */
export function setStoredLayout(storageKey: string, mode: LayoutMode) {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(storageKey, mode);
  } catch {
    // localStorage access might fail in some environments
  }
}

/**
 * Apply layout mode to document
 */
export function applyLayout(mode: LayoutMode) {
  const root = document.documentElement;

  // Remove existing layout classes
  root.classList.remove('layout-boxed', 'layout-full');

  // Add new layout class
  root.classList.add(`layout-${mode}`);

  // Set data attribute for CSS selectors
  root.setAttribute('data-layout', mode);
}
