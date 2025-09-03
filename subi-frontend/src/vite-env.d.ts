/// <reference types="vite/client" />

// Global type extensions
declare global {
  interface Window {
    authEventListenersAdded?: boolean;
  }
}
