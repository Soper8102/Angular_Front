import { Component, inject, OnInit } from '@angular/core'; // Añadido OnInit
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Catalog, CatalogProduct } from '../../../services/catalog';
import { Order, OrderResponse } from '../../../services/order';

@Component({
  selector: 'app-order-create',
  standalone: true, // Asegúrate de que sea standalone si usas imports directos
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  templateUrl: './order-create.html',
  styleUrl: './order-create.css',
})
export class OrderCreate implements OnInit { // Implementamos la interfaz
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
    // El constructor lo dejamos vacío o para inicializaciones simples no asíncronas
  }

  // Este método se dispara automáticamente al entrar a la pantalla
  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.loading = true; // Feedback visual mientras carga el select
    this.catalog.list().subscribe({
      next: (items) => {
        this.products = items ?? [];
        this.loading = false;
        // Tip de depuración:
        console.log('Productos cargados para el pedido:', this.products);
      },
      error: (err) => {
        this.loading = false;
        this.error = 'No se pudieron cargar los productos para el pedido';
        console.error(err);
      },
    });
  }

  submit(): void {
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
    this.error = null;

    this.orders.createOrder({ productId, cantidad: v.cantidad }).subscribe({
      next: async (o) => {
        this.loading = false;
        this.created = o;
        // Guardamos un mensaje de éxito rápido antes de redirigir
        sessionStorage.setItem('flash_success', '¡Pedido creado con éxito!');
        await this.router.navigateByUrl('/orders');
      },
      error: (e) => {
        this.loading = false;
        if (e?.status === 401) {
          this.error = 'Tu sesión ha expirado. Por favor, inicia sesión de nuevo.';
          return;
        }
        // Manejo de error de stock desde Spring Boot
        this.error = e?.error?.message || 'No se pudo procesar el pedido. Verifica el stock.';
      },
    });
  }
}