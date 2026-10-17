import { Component, inject } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <ng-container *ngIf="authService.isLoggedIn(); else viewLogin">
      <!-- Barra Superior -->
      <header style="background: #111827; color: white; padding: 12px 24px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #1f2937;">
        <div style="display: flex; align-items: center; gap: 10px; font-weight: bold; font-size: 1.1rem;">
          🛒 Supermercado - Sistema de Gestión
        </div>
        <div style="display: flex; align-items: center; gap: 12px;">
          <span style="background: #374151; padding: 6px 14px; border-radius: 20px; font-size: 0.85rem;">
            Usuario: <strong>{{ authService.usuarioActual() }}</strong>
          </span>
          <button (click)="authService.logout()" style="background: #ef4444; color: white; border: none; padding: 6px 14px; border-radius: 6px; cursor: pointer; font-weight: bold;">
            🚪 Salir
          </button>
        </div>
      </header>

      <!-- Menú Navegación -->
      <nav style="background: #1f2937; padding: 0 24px; display: flex; gap: 8px; border-bottom: 1px solid #374151;">
        <a routerLink="/dashboard" routerLinkActive="active" style="color: #9ca3af; text-decoration: none; padding: 12px 16px; font-weight: bold; font-size: 14px; display: inline-block;">📊 Dashboard</a>
        <a routerLink="/productos" routerLinkActive="active" style="color: #9ca3af; text-decoration: none; padding: 12px 16px; font-weight: bold; font-size: 14px; display: inline-block;">📦 Productos</a>
        <a routerLink="/categorias" routerLinkActive="active" style="color: #9ca3af; text-decoration: none; padding: 12px 16px; font-weight: bold; font-size: 14px; display: inline-block;">🏷️ Categorías</a>
        <a routerLink="/clientes" routerLinkActive="active" style="color: #9ca3af; text-decoration: none; padding: 12px 16px; font-weight: bold; font-size: 14px; display: inline-block;">👥 Clientes</a>
        <a routerLink="/proveedores" routerLinkActive="active" style="color: #9ca3af; text-decoration: none; padding: 12px 16px; font-weight: bold; font-size: 14px; display: inline-block;">🚚 Proveedores</a>
        <a routerLink="/compras" routerLinkActive="active" style="color: #9ca3af; text-decoration: none; padding: 12px 16px; font-weight: bold; font-size: 14px; display: inline-block;">📥 Compras</a>
        <a routerLink="/ventas" routerLinkActive="active" style="color: #9ca3af; text-decoration: none; padding: 12px 16px; font-weight: bold; font-size: 14px; display: inline-block;">💳 Ventas</a>
      </nav>

      <!-- Contenido Principal -->
      <main style="background: #f8fafc; min-height: calc(100vh - 110px);">
        <router-outlet></router-outlet>
      </main>
    </ng-container>

    <ng-template #viewLogin>
      <router-outlet></router-outlet>
    </ng-template>
  `,
  styles: [`
    .active {
      color: #ffffff !important;
      background: #2563eb;
      border-radius: 4px 4px 0 0;
    }
  `]
})
export class App {
  public authService = inject(AuthService);
}