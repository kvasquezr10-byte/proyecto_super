import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div style="padding: 20px;">
      <h2 style="color: #1e293b; margin-bottom: 20px;">Resumen General del Sistema</h2>

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 20px;">
        <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #3b82f6; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
          <span style="font-size: 12px; font-weight: bold; color: #64748b; text-transform: uppercase;">Total Productos</span>
          <h3 style="font-size: 28px; margin: 10px 0 0 0; color: #1e293b;">{{ stats().total_productos || 0 }}</h3>
        </div>

        <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #10b981; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
          <span style="font-size: 12px; font-weight: bold; color: #64748b; text-transform: uppercase;">Ventas Registradas</span>
          <h3 style="font-size: 28px; margin: 10px 0 0 0; color: #1e293b;">{{ stats().total_ventas || 0 }}</h3>
        </div>

        <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #8b5cf6; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
          <span style="font-size: 12px; font-weight: bold; color: #64748b; text-transform: uppercase;">Ingresos Totales</span>
          <h3 style="font-size: 28px; margin: 10px 0 0 0; color: #1e293b;">Q {{ (stats().ingresos_totales || 0) | number:'1.2-2' }}</h3>
        </div>

        <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #ef4444; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
          <span style="font-size: 12px; font-weight: bold; color: #64748b; text-transform: uppercase;">Bajo Stock</span>
          <h3 style="font-size: 28px; margin: 10px 0 0 0; color: #ef4444;">{{ stats().bajo_stock || 0 }}</h3>
        </div>
      </div>
    </div>
  `
})
export class Dashboard implements OnInit {
  private http = inject(HttpClient);
  apiUrl = `${environment.apiUrl}dashboard/stats`;

  stats = signal({ total_productos: 0, total_ventas: 0, ingresos_totales: 0, bajo_stock: 0 });

  ngOnInit() {
    this.http.get<any>(this.apiUrl).subscribe({
      next: (data) => this.stats.set(data),
      error: () => {}
    });
  }
}