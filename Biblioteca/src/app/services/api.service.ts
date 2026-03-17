import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  constructor() { }

  private getAuthToken(): string | null {
    try {
      return localStorage.getItem('auth_token');
    } catch {
      return null;
    }
  }

  private createCorrelationId(): string {
    try {
      const cryptoAny = (globalThis as unknown as { crypto?: { randomUUID?: () => string } }).crypto;
      if (cryptoAny?.randomUUID) {
        return cryptoAny.randomUUID();
      }
    } catch {
      // ignore
    }

    const part = () => Math.random().toString(16).slice(2).padEnd(8, '0').slice(0, 8);
    return `${part()}-${part()}-${part()}-${part()}`;
  }

  private buildHeaders(
    headers?: HttpHeaders | { [header: string]: string | string[] },
  ): HttpHeaders | { [header: string]: string | string[] } | undefined {
    const token = this.getAuthToken();
    const correlationId = this.createCorrelationId();

    if (!token) {
      if (!headers) {
        return { CorrelationId: correlationId };
      }
      if (headers instanceof HttpHeaders) {
        return headers.set('CorrelationId', correlationId);
      }
      return { ...headers, CorrelationId: correlationId };
    }

    if (!headers) {
      return {
        Authorization: `Bearer ${token}`,
        CorrelationId: correlationId,
      };
    }

    if (headers instanceof HttpHeaders) {
      return headers.set('Authorization', `Bearer ${token}`).set('CorrelationId', correlationId);
    }

    return {
      ...headers,
      Authorization: `Bearer ${token}`,
      CorrelationId: correlationId,
    };
  }

  /**
   * Realiza una petición GET genérica
   * @param endpoint Ruta del endpoint (ej. 'usuarios')
   * @param params Parámetros opcionales para la URL
   */
  get<T>(
    endpoint: string,
    params?: HttpParams | { [param: string]: string | number | boolean | ReadonlyArray<string | number | boolean> },
    headers?: HttpHeaders | { [header: string]: string | string[] },
  ): Observable<T> {
    return this.http.get<T>(`${this.apiUrl}/${endpoint}`, { params, headers: this.buildHeaders(headers) });
  }

  /**
   * Realiza una petición POST genérica
   * @param endpoint Ruta del endpoint
   * @param body Cuerpo de la petición
   * @param headers Cabeceras opcionales
   */
  post<T>(endpoint: string, body: any, headers?: HttpHeaders | { [header: string]: string | string[] }): Observable<T> {
    return this.http.post<T>(`${this.apiUrl}/${endpoint}`, body, { headers: this.buildHeaders(headers) });
  }

  postText(endpoint: string, body: any, headers?: HttpHeaders | { [header: string]: string | string[] }): Observable<string> {
    return this.http.post(`${this.apiUrl}/${endpoint}`, body, { headers: this.buildHeaders(headers), responseType: 'text' });
  }

  /**
   * Realiza una petición PUT genérica
   * @param endpoint Ruta del endpoint
   * @param body Cuerpo de la petición
   */
  put<T>(endpoint: string, body: any, headers?: HttpHeaders | { [header: string]: string | string[] }): Observable<T> {
    return this.http.put<T>(`${this.apiUrl}/${endpoint}`, body, { headers: this.buildHeaders(headers) });
  }

  /**
   * Realiza una petición DELETE genérica
   * @param endpoint Ruta del endpoint
   */
  delete<T>(endpoint: string, headers?: HttpHeaders | { [header: string]: string | string[] }): Observable<T> {
    return this.http.delete<T>(`${this.apiUrl}/${endpoint}`, { headers: this.buildHeaders(headers) });
  }
}
