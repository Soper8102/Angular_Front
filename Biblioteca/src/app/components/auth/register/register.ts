import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Auth } from '../../../services/auth';

@Component({
  selector: 'app-register',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {
  private auth = inject(Auth);
  private router = inject(Router);

  readonly form = new FormGroup({
    email: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.email] }),
    password: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.minLength(8)] }),
    role: new FormControl<'ADMIN' | 'CUSTOMER'>('CUSTOMER', { nonNullable: true, validators: [Validators.required] }),
  });

  error: string | null = null;
  success: string | null = null;
  loading = false;

  submit(): void {
    if (this.loading) {
      return;
    }
    this.error = null;
    this.success = null;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.error = 'Revisa los campos';
      return;
    }

    const { email, password, role } = this.form.getRawValue();
    this.loading = true;
    this.auth.register(email, password, role).subscribe({
      next: async (msg) => {
        this.loading = false;
        this.success = typeof msg === 'string' ? msg : 'Usuario registrado';
        await this.router.navigateByUrl('/login');
      },
      error: (e) => {
        this.loading = false;
        if (typeof e?.error === 'string') {
          this.error = e.error;
          return;
        }
        if (typeof e?.error?.message === 'string') {
          this.error = e.error.message;
          return;
        }
        if (e?.status === 400 && e?.error && typeof e.error === 'object') {
          const first = Object.values(e.error)[0];
          this.error = typeof first === 'string' ? first : 'No se pudo registrar';
          return;
        }
        this.error = 'No se pudo registrar';
      },
    });
  }
}
