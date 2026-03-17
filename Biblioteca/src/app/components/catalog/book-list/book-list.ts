import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Catalog, CatalogProduct } from '../../../services/catalog';
import { Auth } from '../../../services/auth';

@Component({
  selector: 'app-book-list',
  imports: [CommonModule, RouterLink],
  templateUrl: './book-list.html',
  styleUrl: './book-list.css',
})
export class BookList {
  private catalog = inject(Catalog);
  private auth = inject(Auth);

  products: CatalogProduct[] = [];
  loading = false;
  error: string | null = null;
  success: string | null = null;

  constructor() {
    this.success = this.consumeFlashSuccess();
    this.load();
  }

  isAdmin(): boolean {
    return this.auth.isAuthenticated() && this.auth.getRole() === 'ADMIN';
  }

  load(): void {
    this.loading = true;
    this.error = null;
    this.catalog.list().subscribe({
      next: (items) => {
        this.loading = false;
        this.products = items ?? [];
      },
      error: () => {
        this.loading = false;
        this.error = 'No se pudo cargar el catálogo';
      },
    });
  }

  delete(id: number | undefined): void {
    if (!id) {
      return;
    }
    if (!confirm('¿Eliminar este producto?')) {
      return;
    }
    this.catalog.remove(id).subscribe({
      next: () => {
        this.success = 'Producto eliminado correctamente';
        this.load();
      },
      error: () => {
        this.error = 'No se pudo eliminar el producto';
      },
    });
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
