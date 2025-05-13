export interface TokenStorage {
  getToken(): string | null;
  setToken(token: string): void;
  clearToken(): void;
}

export class InMemoryTokenStorage implements TokenStorage {
  private token: string | null = null;

  getToken(): string | null {
    return this.token;
  }

  setToken(token: string): void {
    this.token = token;
  }

  clearToken(): void {
    this.token = null;
  }
}