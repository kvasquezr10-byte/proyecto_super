import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div style="min-height: 100vh; display: flex; align-items: center; justify-content: center; background: #0f172a; font-family: Arial, sans-serif;">
      <div style="background: white; padding: 40px; border-radius: 10px; width: 350px; box-shadow: 0 10px 25px rgba(0,0,0,0.3);">
        <h2 style="margin-top: 0; text-align: center; color: #1e293b;">🛒 Iniciar Sesión</h2>
        <p style="text-align: center; color: #64748b; font-size: 14px;">Sistema de Gestión de Supermercado</p>

        <form (ngSubmit)="onLogin()" style="display: flex; flex-direction: column; gap: 15px; margin-top: 20px;">
          <div>
            <label style="font-size: 13px; font-weight: bold; color: #334155;">Usuario</label>
            <input [(ngModel)]="username" name="username" type="text" placeholder="Ej. admin" required
                   style="width: 100%; padding: 10px; border: 1px solid #cbd5e1; border-radius: 6px; box-sizing: border-box; margin-top: 5px;">
          </div>

          <div>
            <label style="font-size: 13px; font-weight: bold; color: #334155;">Contraseña</label>
            <input [(ngModel)]="password" name="password" type="password" placeholder="••••••••" required
                   style="width: 100%; padding: 10px; border: 1px solid #cbd5e1; border-radius: 6px; box-sizing: border-box; margin-top: 5px;">
          </div>

          <button type="submit" style="background: #2563eb; color: white; border: none; padding: 12px; border-radius: 6px; font-weight: bold; cursor: pointer; margin-top: 10px;">
            Ingresar
          </button>
        </form>
      </div>
    </div>
  `
})
export class Login {
  username = '';
  password = '';

  private authService = inject(AuthService);
  private router = inject(Router);

  onLogin() {
    this.authService.login(this.username, this.password).subscribe({
      next: () => {
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        alert(err.error?.detail || 'Error al iniciar sesión');
      }
    });
  }
}