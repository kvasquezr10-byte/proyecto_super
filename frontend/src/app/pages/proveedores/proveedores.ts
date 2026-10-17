import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-proveedores',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div style="padding: 20px; font-family: Arial, sans-serif;">
      <h2 style="color: #0f172a; font-weight: bold; margin-bottom: 20px;">Módulo: Proveedores</h2>

      <div style="background: #f1f5f9; padding: 20px; border-radius: 8px; border: 1px solid #e2e8f0; margin-bottom: 25px;">
        <h3 style="margin-top: 0; color: #1e293b;">{{ idEditando === null ? 'Registrar Proveedor' : 'Editar Proveedor' }}</h3>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 10px; margin-bottom: 15px;">
          <input [(ngModel)]="form.nit" placeholder="NIT (*)" style="padding: 8px; border: 1px solid #cbd5e1; border-radius: 4px;">
          <input [(ngModel)]="form.nombre" placeholder="Nombre Proveedor (*)" style="padding: 8px; border: 1px solid #cbd5e1; border-radius: 4px;">
          <input [(ngModel)]="form.contacto" placeholder="Contacto" style="padding: 8px; border: 1px solid #cbd5e1; border-radius: 4px;">
          <input [(ngModel)]="form.telefono" placeholder="Teléfono" style="padding: 8px; border: 1px solid #cbd5e1; border-radius: 4px;">
          <input [(ngModel)]="form.correo" placeholder="Correo" style="padding: 8px; border: 1px solid #cbd5e1; border-radius: 4px;">
        </div>
        <div style="display: flex; gap: 10px;">
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
            <th style="padding: 12px;">Proveedor</th>
            <th style="padding: 12px;">NIT</th>
            <th style="padding: 12px;">Contacto</th>
            <th style="padding: 12px;">Teléfono</th>
            <th style="padding: 12px;">Correo</th>
            <th style="padding: 12px; text-align: center;">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let p of proveedores()" style="border-bottom: 1px solid #e2e8f0;">
            <td style="padding: 10px;">{{ p.id }}</td>
            <td style="padding: 10px; font-weight: bold;">{{ p.nombre }}</td>
            <td style="padding: 10px;">{{ p.nit }}</td>
            <td style="padding: 10px;">{{ p.contacto || 'N/A' }}</td>
            <td style="padding: 10px;">{{ p.telefono || 'N/A' }}</td>
            <td style="padding: 10px;">{{ p.correo || p.email || 'N/A' }}</td>
            <td style="padding: 10px; text-align: center;">
              <button (click)="editar(p)" style="background: #f59e0b; color: white; border: none; padding: 6px 10px; border-radius: 4px; cursor: pointer; margin-right: 5px;">Editar</button>
              <button (click)="eliminar(p.id)" style="background: #ef4444; color: white; border: none; padding: 6px 10px; border-radius: 4px; cursor: pointer;">Eliminar</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  `
})
export class Proveedores implements OnInit {
  private http = inject(HttpClient);
  apiUrl = `${environment.apiUrl}proveedores`;

  proveedores = signal<any[]>([]);
  idEditando: number | null = null;
  form = { nit: '', nombre: '', contacto: '', telefono: '', correo: '', direccion: '' };

  ngOnInit() { this.cargar(); }

  cargar() {
    this.http.get<any[]>(this.apiUrl).subscribe(data => this.proveedores.set(data));
  }

  guardar() {
    if (!this.form.nombre || !this.form.nit) return;
    const payload = { ...this.form, email: this.form.correo };

    if (this.idEditando === null) {
      this.http.post(this.apiUrl, payload).subscribe(() => { this.limpiarFormulario(); this.cargar(); });
    } else {
      this.http.put(`${this.apiUrl}/${this.idEditando}`, payload).subscribe(() => { this.limpiarFormulario(); this.cargar(); });
    }
  }

  editar(p: any) {
    this.idEditando = p.id;
    this.form = {
      nit: p.nit,
      nombre: p.nombre,
      contacto: p.contacto || '',
      telefono: p.telefono || '',
      correo: p.correo || p.email || '',
      direccion: p.direccion || ''
    };
  }

  eliminar(id: number) {
    if (confirm('¿Eliminar proveedor de la base de datos?')) {
      this.http.delete(`${this.apiUrl}/${id}`).subscribe({
        next: () => this.cargar(),
        error: (err) => alert(err.error?.detail || 'Error al eliminar')
      });
    }
  }

  limpiarFormulario() {
    this.idEditando = null;
    this.form = { nit: '', nombre: '', contacto: '', telefono: '', correo: '', direccion: '' };
  }
}