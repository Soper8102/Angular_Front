import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Auth } from '../../../services/auth';

@Component({
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  private auth = inject(Auth);
  private router = inject(Router);

  readonly form = new FormGroup({
    email: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.email] }),
    password: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
  });

  error: string | null = null;
  success: string | null = null;
  loading = false;

  constructor() {
    this.success = this.consumeFlashSuccess();
  }

  submit(): void {
    if (this.loading) {
      return;
    }
    this.error = null;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.error = 'Revisa los campos';
      return;
    }

    const { email, password } = this.form.getRawValue();
    this.loading = true;
    try {
      this.auth.login(email, password).subscribe({
        next: async () => {
          this.loading = false;
          await this.router.navigateByUrl('/dashboard');
        },
        error: (e) => {
          this.loading = false;
          if (e?.status === 401) {
            this.error = 'Usuario o contraseña incorrectas';
            return;
          }
          this.error = typeof e?.error?.message === 'string' ? e.error.message : 'No se pudo iniciar sesión';
        },
      });
    } catch {
      this.loading = false;
      this.error = 'No se pudo iniciar sesión';
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
