import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { Auth } from './services/auth';
import { filter } from 'rxjs';

@Component({
  selector: 'app-root',
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('Biblioteca');
  private auth = inject(Auth);
  private router = inject(Router);
  private url = signal(this.router.url);

  readonly isAuthenticated = computed(() => this.auth.isAuthenticated());
  readonly role = computed(() => this.auth.getRole());
  readonly isAuthPage = computed(() => {
    const path = this.url();
    return path === '/login' || path === '/register' || path.startsWith('/login?') || path.startsWith('/register?');
  });

  constructor() {
    this.router.events.pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd)).subscribe((e) => {
      this.url.set(e.urlAfterRedirects);
    });
  }

  async logout(): Promise<void> {
    this.auth.logout();
    await this.router.navigateByUrl('/login');
  }
}
