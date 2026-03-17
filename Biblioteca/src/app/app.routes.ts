import { inject } from '@angular/core';
import { Routes, Router } from '@angular/router';
import { Auth } from './services/auth';
import { Login } from './components/auth/login/login';
import { Register } from './components/auth/register/register';
import { BookList } from './components/catalog/book-list/book-list';
import { BookDetail } from './components/catalog/book-detail/book-detail';
import { OrderCreate } from './components/orders/order-create/order-create';
import { OrderList } from './components/orders/order-list/order-list';

const authGuard = () => {
  const auth = inject(Auth);
  if (auth.isAuthenticated()) {
    return true;
  }
  return inject(Router).parseUrl('/login');
};

const adminGuard = () => {
  const auth = inject(Auth);
  if (auth.isAuthenticated() && auth.getRole() === 'ADMIN') {
    return true;
  }
  return inject(Router).parseUrl('/login');
};

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'catalog' },
  { path: 'login', component: Login },
  { path: 'register', component: Register },

  { path: 'catalog', component: BookList },
  { path: 'catalog/new', component: BookDetail, canActivate: [adminGuard] },
  { path: 'catalog/:id', component: BookDetail },

  { path: 'orders', component: OrderList, canActivate: [authGuard] },
  { path: 'orders/new', component: OrderCreate, canActivate: [authGuard] },

  { path: '**', redirectTo: 'catalog' },
];
