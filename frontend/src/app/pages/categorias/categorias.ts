import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-categorias',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div style="padding: 20px; font-family: Arial, sans-serif;">
      <h2 style="color: #0f172a; font-weight: bold; margin-bottom: 20px;">Módulo: Categorías</h2>

      <div style="background: #f1f5f9; padding: 20px; border-radius: 8px; border: 1px solid #e2e8f0; margin-bottom: 25px;">
        <h3 style="margin-top: 0; color: #1e293b;">{{ idEditando === null ? 'Nueva Categoría' : 'Editar Categoría' }}</h3>
        <div style="display: flex; gap: 15px; flex-wrap: wrap;">
          <input [(ngModel)]="form.nombre" placeholder="Nombre de categoría" style="flex: 1; padding: 8px; border: 1px solid #cbd5e1; border-radius: 4px;">
          <input [(ngModel)]="form.descripcion" placeholder="Descripción" style="flex: 2; padding: 8px; border: 1px solid #cbd5e1; border-radius: 4px;">
          <button (click)="guardar()" style="background: #10b981; color: white; border: none; padding: 8px 16px; border-radius: 4px; font-weight: bold; cursor: pointer;">
            {{ idEditando === null ? 'Guardar' : 'Actualizar' }}
          </button>
          <button *ngIf="idEditando !== null" (click)="limpiarFormulario()" style="background: #64748b; color: white; border: none; padding: 8px 12px; border-radius: 4px; cursor: pointer;">
            Cancelar
          </button>
        </div>
      </div>

      <table style="width: 100%; border-collapse: collapse; background: white; border-radius: 6px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
        <thead>
          <tr style="background: #233242; color: white; text-align: left;">
            <th style="padding: 12px;">ID</th>
            <th style="padding: 12px;">Categoría</th>
            <th style="padding: 12px;">Descripción</th>
            <th style="padding: 12px; text-align: center;">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let cat of categorias()" style="border-bottom: 1px solid #e2e8f0;">
            <td style="padding: 10px;">{{ cat.id }}</td>
            <td style="padding: 10px; font-weight: bold;">{{ cat.nombre }}</td>
            <td style="padding: 10px;">{{ cat.descripcion || 'Sin descripción' }}</td>
            <td style="padding: 10px; text-align: center;">
              <button (click)="editar(cat)" style="background: #f59e0b; color: white; border: none; padding: 6px 10px; border-radius: 4px; cursor: pointer; margin-right: 5px;">Editar</button>
              <button (click)="eliminar(cat.id)" style="background: #ef4444; color: white; border: none; padding: 6px 10px; border-radius: 4px; cursor: pointer;">Eliminar</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  `
})
export class Categorias implements OnInit {
  private http = inject(HttpClient);
  apiUrl = `${environment.apiUrl}categorias`;

  categorias = signal<any[]>([]);
  idEditando: number | null = null;
  form = { nombre: '', descripcion: '' };

  ngOnInit() { this.cargar(); }

  cargar() {
    this.http.get<any[]>(this.apiUrl).subscribe(data => this.categorias.set(data));
  }

  guardar() {
    if (!this.form.nombre) return;
    if (this.idEditando === null) {
      this.http.post(this.apiUrl, this.form).subscribe(() => { this.limpiarFormulario(); this.cargar(); });
    } else {
      this.http.put(`${this.apiUrl}/${this.idEditando}`, this.form).subscribe(() => { this.limpiarFormulario(); this.cargar(); });
    }
  }

  editar(cat: any) {
    this.idEditando = cat.id;
    this.form = { nombre: cat.nombre, descripcion: cat.descripcion || '' };
  }

  eliminar(id: number) {
    if (confirm('¿Eliminar categoría de la base de datos?')) {
      this.http.delete(`${this.apiUrl}/${id}`).subscribe({
        next: () => this.cargar(),
        error: (err) => alert(err.error?.detail || 'Error al eliminar')
      });
    }
  }

  limpiarFormulario() {
    this.idEditando = null;
    this.form = { nombre: '', descripcion: '' };
  }
}