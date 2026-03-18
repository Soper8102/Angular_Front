import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { Catalog, CatalogProduct } from '../../../services/catalog';
import { Auth } from '../../../services/auth';
import { error } from 'node:console';


@Component({
  selector: 'app-book-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './book-list.html',
  styleUrl: './book-list.css',
})
export class BookList implements OnInit {
  private catalog = inject(Catalog);
  private auth = inject(Auth);
  private router = inject(Router);

  products: CatalogProduct[] = [];
  loading = false;
  error: string | null = null;
  success: string | null = null;

  constructor() {
    this.success = this.consumeFlashSuccess();
  }

  ngOnInit(): void {
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
      error: (err) => {
        this.loading = false;
        if (err.status === 401 || err === 401) {
        localStorage.removeItem('auth_token'); 
        this.router.navigate(['/login']); } else {
          this.error = 'Error al conectar con el servidor';
        }
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
