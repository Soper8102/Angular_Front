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

  /**
   * Realiza una petición GET genérica
   * @param endpoint Ruta del endpoint (ej. 'usuarios')
   * @param params Parámetros opcionales para la URL
   */
  get<T>(endpoint: string, params?: HttpParams | { [param: string]: string | number | boolean | ReadonlyArray<string | number | boolean> }): Observable<T> {
    return this.http.get<T>(`${this.apiUrl}/${endpoint}`, { params });
  }

  /**
   * Realiza una petición POST genérica
   * @param endpoint Ruta del endpoint
   * @param body Cuerpo de la petición
   * @param headers Cabeceras opcionales
   */
  post<T>(endpoint: string, body: any, headers?: HttpHeaders | { [header: string]: string | string[] }): Observable<T> {
    return this.http.post<T>(`${this.apiUrl}/${endpoint}`, body, { headers });
  }

  /**
   * Realiza una petición PUT genérica
   * @param endpoint Ruta del endpoint
   * @param body Cuerpo de la petición
   */
  put<T>(endpoint: string, body: any): Observable<T> {
    return this.http.put<T>(`${this.apiUrl}/${endpoint}`, body);
  }

  /**
   * Realiza una petición DELETE genérica
   * @param endpoint Ruta del endpoint
   */
  delete<T>(endpoint: string): Observable<T> {
    return this.http.delete<T>(`${this.apiUrl}/${endpoint}`);
  }
}
