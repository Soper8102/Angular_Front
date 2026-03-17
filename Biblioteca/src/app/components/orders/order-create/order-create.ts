import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Catalog, CatalogProduct } from '../../../services/catalog';
import { Order, OrderResponse } from '../../../services/order';

@Component({
  selector: 'app-order-create',
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  templateUrl: './order-create.html',
  styleUrl: './order-create.css',
})
export class OrderCreate {
  private catalog = inject(Catalog);
  private orders = inject(Order);
  private router = inject(Router);

  products: CatalogProduct[] = [];
  loading = false;
  error: string | null = null;
  created: OrderResponse | null = null;

  readonly form = new FormGroup({
    productId: new FormControl<number | null>(null, { validators: [Validators.required] }),
    cantidad: new FormControl<number>(1, { nonNullable: true, validators: [Validators.required, Validators.min(1)] }),
  });

  constructor() {
    this.loadProducts();
  }

  loadProducts(): void {
    this.catalog.list().subscribe({
      next: (items) => {
        this.products = items ?? [];
      },
      error: () => {
        this.error = 'No se pudieron cargar los productos';
      },
    });
  }

  submit(): void {
    this.error = null;
    this.created = null;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const v = this.form.getRawValue();
    const productId = v.productId;
    if (!productId) {
      this.error = 'Selecciona un producto';
      return;
    }

    this.loading = true;
    this.orders.createOrder({ productId, cantidad: v.cantidad }).subscribe({
      next: async (o) => {
        this.loading = false;
        this.created = o;
        await this.router.navigateByUrl('/orders');
      },
      error: (e) => {
        this.loading = false;
        if (e?.status === 401) {
          this.error = 'Necesitas iniciar sesión';
          return;
        }
        this.error = typeof e?.error?.message === 'string' ? e.error.message : 'No se pudo crear el pedido';
      },
    });
  }
}
