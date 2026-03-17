import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Order, OrderResponse } from '../../../services/order';

@Component({
  selector: 'app-order-list',
  imports: [CommonModule, RouterLink],
  templateUrl: './order-list.html',
  styleUrl: './order-list.css',
})
export class OrderList {
  private orders = inject(Order);

  lastOrder: OrderResponse | null = null;

  constructor() {
    this.refresh();
  }

  refresh(): void {
    this.lastOrder = this.orders.getLastOrder();
  }

  clear(): void {
    this.orders.clearLastOrder();
    this.refresh();
  }
}
