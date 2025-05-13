import { TokenStorage, InMemoryTokenStorage } from './token-storage.js';

export interface MCPConfig {
  tokenStorage: TokenStorage;
}

// Create a factory function for default config
export function createDefaultConfig(): MCPConfig {
  return {
    tokenStorage: new InMemoryTokenStorage(),
  };
}

// Export a default config instance
export const defaultConfig = createDefaultConfig();