import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export type CatalogProduct = {
  id?: number;
  titulo: string;
  autor: string;
  isbn: string;
  categoria: string;
  descripcion?: string;
  precio: number | string;
  stock: number;
  activo?: boolean;
  fechaCreacion?: string;
  fechaActualizacion?: string;
};

export type StockCheckResponse = {
  productId: number;
  requestedQuantity: number;
  availableStock: number;
  available: boolean;
};

@Injectable({
  providedIn: 'root',
})
export class Catalog {
  private api = inject(ApiService);

  ping(): Observable<string> {
    return this.api.get<string>('catalog/ping');
  }

  list(): Observable<CatalogProduct[]> {
    return this.api.get<CatalogProduct[]>('catalog/productos');
  }

  getById(id: number): Observable<CatalogProduct> {
    return this.api.get<CatalogProduct>(`catalog/productos/${id}`);
  }

  create(product: CatalogProduct): Observable<CatalogProduct> {
    return this.api.post<CatalogProduct>('catalog/productos', product);
  }

  update(id: number, product: CatalogProduct): Observable<CatalogProduct> {
    return this.api.put<CatalogProduct>(`catalog/productos/${id}`, product);
  }

  remove(id: number): Observable<void> {
    return this.api.delete<void>(`catalog/productos/${id}`);
  }

  checkStock(id: number, cantidad: number): Observable<StockCheckResponse> {
    return this.api.get<StockCheckResponse>(`catalog/productos/${id}/check-stock`, { cantidad });
  }
}
