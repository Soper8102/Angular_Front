import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Catalog, CatalogProduct, StockCheckResponse } from '../../../services/catalog';
import { Auth } from '../../../services/auth';

@Component({
  selector: 'app-book-detail',
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  templateUrl: './book-detail.html',
  styleUrl: './book-detail.css',
})
export class BookDetail {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private catalog = inject(Catalog);
  private auth = inject(Auth);

  id: number | null = null;
  loading = false;
  error: string | null = null;
  success: string | null = null;
  stockResult: StockCheckResponse | null = null;
  stockCantidad = new FormControl<number>(1, { nonNullable: true, validators: [Validators.required, Validators.min(1)] });

  readonly form = new FormGroup({
    titulo: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    autor: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    isbn: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    categoria: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    descripcion: new FormControl('', { nonNullable: true }),
    precio: new FormControl<number | null>(null, { validators: [Validators.required, Validators.min(0)] }),
    stock: new FormControl<number | null>(null, { validators: [Validators.required, Validators.min(0)] }),
  });

  constructor() {
    this.success = this.consumeFlashSuccess();
    const rawId = this.route.snapshot.paramMap.get('id');
    this.id = rawId ? Number(rawId) : null;
    if (this.id && !Number.isNaN(this.id)) {
      this.load(this.id);
    } else {
      this.id = null;
    }
  }

  isAdmin(): boolean {
    return this.auth.isAuthenticated() && this.auth.getRole() === 'ADMIN';
  }

  isCreate(): boolean {
    return this.id === null;
  }

  load(id: number): void {
    this.loading = true;
    this.error = null;
    this.catalog.getById(id).subscribe({
      next: (p) => {
        this.loading = false;
        this.form.patchValue({
          titulo: p.titulo ?? '',
          autor: p.autor ?? '',
          isbn: p.isbn ?? '',
          categoria: p.categoria ?? '',
          descripcion: p.descripcion ?? '',
          precio: typeof p.precio === 'string' ? Number(p.precio) : p.precio,
          stock: p.stock ?? 0,
        });
      },
      error: () => {
        this.loading = false;
        this.error = 'No se pudo cargar el producto';
      },
    });
  }

  save(): void {
    if (this.loading) {
      return;
    }
    this.error = null;
    this.success = null;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.error = 'Faltan campos por llenar';
      return;
    }
    if (!this.isCreate() && !this.isAdmin()) {
      this.error = 'No autorizado';
      return;
    }
    if (this.isCreate() && !this.isAdmin()) {
      this.error = 'No autorizado';
      return;
    }

    const v = this.form.getRawValue();
    const payload: CatalogProduct = {
      titulo: v.titulo,
      autor: v.autor,
      isbn: v.isbn,
      categoria: v.categoria,
      descripcion: v.descripcion || undefined,
      precio: v.precio ?? 0,
      stock: v.stock ?? 0,
    };

    this.loading = true;
    if (this.isCreate()) {
      this.catalog.create(payload).subscribe({
        next: async (created) => {
          this.loading = false;
          this.setFlashSuccess('Producto creado correctamente');
          if (created?.id) {
            await this.router.navigateByUrl(`/catalog/${created.id}`);
          } else {
            await this.router.navigateByUrl('/catalog');
          }
        },
        error: (e) => {
          this.loading = false;
          this.error = typeof e?.error?.message === 'string' ? e.error.message : 'No se pudo crear el producto';
        },
      });
      return;
    }

    this.catalog.update(this.id!, payload).subscribe({
      next: () => {
        this.loading = false;
        this.success = 'Producto actualizado correctamente';
      },
      error: (e) => {
        this.loading = false;
        this.error = typeof e?.error?.message === 'string' ? e.error.message : 'No se pudo guardar';
      },
    });
  }

  delete(): void {
    if (!this.id || !this.isAdmin()) {
      this.error = 'No autorizado';
      return;
    }
    if (!confirm('¿Eliminar este producto?')) {
      return;
    }
    this.loading = true;
    this.catalog.remove(this.id).subscribe({
      next: async () => {
        this.loading = false;
        this.setFlashSuccess('Producto eliminado correctamente');
        await this.router.navigateByUrl('/catalog');
      },
      error: () => {
        this.loading = false;
        this.error = 'No se pudo eliminar el producto';
      },
    });
  }

  checkStock(): void {
    this.stockResult = null;
    if (!this.id) {
      return;
    }
    if (this.stockCantidad.invalid) {
      this.stockCantidad.markAsTouched();
      return;
    }
    this.catalog.checkStock(this.id, this.stockCantidad.getRawValue()).subscribe({
      next: (r) => {
        this.stockResult = r;
      },
      error: () => {
        this.error = 'No se pudo consultar el stock';
      },
    });
  }

  private setFlashSuccess(message: string): void {
    try {
      sessionStorage.setItem('flash_success', message);
    } catch {
      return;
    }
  }

  private consumeFlashSuccess(): string | null {
    try {
      const key = 'flash_success';
      const msg = sessionStorage.getItem(key);
      if (msg) {
        sessionStorage.removeItem(key);
      }
      return msg;
    } catch {
      return null;
    }
  }
}
