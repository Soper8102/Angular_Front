import { Injectable, inject } from '@angular/core';
import { Observable, map, tap } from 'rxjs';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root',
})
export class Auth {
  private api = inject(ApiService);

  register(email: string, password: string, role: 'ADMIN' | 'CUSTOMER'): Observable<string> {
    return this.api.postText('auth/register', { email, password, role });
  }

  login(email: string, password: string): Observable<string> {
    return this.api
      .post<{ token: string }>('auth/login', { email, password })
      .pipe(
        map((r) => r.token),
        tap((token) => this.setToken(token)),
      );
  }

  logout(): void {
    try {
      localStorage.removeItem('auth_token');
    } catch {
      return;
    }
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  getToken(): string | null {
    try {
      return localStorage.getItem('auth_token');
    } catch {
      return null;
    }
  }

  getRole(): string | null {
    const token = this.getToken();
    if (!token) {
      return null;
    }

    const parts = token.split('.');
    if (parts.length < 2) {
      return null;
    }

    try {
      const payloadRaw = parts[1].replace(/-/g, '+').replace(/_/g, '/');
      const padLen = (4 - (payloadRaw.length % 4)) % 4;
      const payload = atob(payloadRaw + '='.repeat(padLen));
      const json = JSON.parse(payload) as { role?: string; roles?: string[] } | undefined;
      if (!json) {
        return null;
      }
      if (typeof json.role === 'string') {
        return json.role;
      }
      if (Array.isArray(json.roles) && typeof json.roles[0] === 'string') {
        return json.roles[0];
      }
      return null;
    } catch {
      return null;
    }
  }

  private setToken(token: string): void {
    try {
      localStorage.setItem('auth_token', token);
    } catch {
      return;
    }
  }
}
