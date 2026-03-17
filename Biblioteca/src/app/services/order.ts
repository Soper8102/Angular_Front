import { Injectable, inject } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { ApiService } from './api.service';

export type CreateOrderRequest = {
  productId: number;
  cantidad: number;
};

export type OrderResponse = {
  id: number;
  productId: number;
  cantidad: number;
  usuarioId: number;
  estado: string;
  fechaCreacion: string;
};

@Injectable({
  providedIn: 'root',
})
export class Order {
  private api = inject(ApiService);

  createOrder(request: CreateOrderRequest): Observable<OrderResponse> {
    return this.api.post<OrderResponse>('orders/pedidos', request).pipe(tap((o) => this.setLastOrder(o)));
  }

  getLastOrder(): OrderResponse | null {
    try {
      const raw = localStorage.getItem('last_order');
      if (!raw) {
        return null;
      }
      return JSON.parse(raw) as OrderResponse;
    } catch {
      return null;
    }
  }

  clearLastOrder(): void {
    try {
      localStorage.removeItem('last_order');
    } catch {
      return;
    }
  }

  private setLastOrder(order: OrderResponse): void {
    try {
      localStorage.setItem('last_order', JSON.stringify(order));
    } catch {
      return;
    }
  }
}
