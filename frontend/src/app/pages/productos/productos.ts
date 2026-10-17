import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-productos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div style="padding: 20px; font-family: Arial, sans-serif; background: #f8fafc; min-height: 100vh;">
      <h2 style="color: #0f172a; font-weight: bold; margin-bottom: 20px;">Módulo 1: Productos</h2>

      <!-- Búsqueda y Botón Nuevo -->
      <div style="display: flex; gap: 10px; margin-bottom: 20px;">
        <input 
          type="text" 
          [(ngModel)]="busqueda" 
          (input)="filtrar()" 
          placeholder="Buscar por código o nombre..." 
          style="flex: 1; padding: 10px 14px; border: 1px solid #cbd5e1; border-radius: 4px; background: white;"
        />
        <button 
          (click)="toggleFormulario()" 
          style="background: #0284c7; color: white; border: none; padding: 10px 20px; border-radius: 4px; font-weight: bold; cursor: pointer;"
        >
          {{ mostrarFormulario ? 'Ocultar Formulario' : 'Nuevo Producto' }}
        </button>
      </div>

      <!-- Formulario -->
      <div *ngIf="mostrarFormulario" style="background: #f1f5f9; padding: 20px; border-radius: 8px; border: 1px solid #e2e8f0; margin-bottom: 25px;">
        <h3 style="margin-top: 0; color: #1e293b; font-size: 18px; margin-bottom: 15px;">
          {{ idEditando === null ? 'Registrar Nuevo Producto' : 'Editar Producto' }}
        </h3>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-bottom: 15px;">
          <div>
            <label style="font-size: 13px; font-weight: bold; color: #334155;">Código (*):</label>
            <input [(ngModel)]="form.codigo" type="text" style="width: 100%; padding: 8px; border: 1px solid #cbd5e1; border-radius: 4px; margin-top: 4px; box-sizing: border-box;">
          </div>
          <div>
            <label style="font-size: 13px; font-weight: bold; color: #334155;">Nombre (*):</label>
            <input [(ngModel)]="form.nombre" type="text" style="width: 100%; padding: 8px; border: 1px solid #cbd5e1; border-radius: 4px; margin-top: 4px; box-sizing: border-box;">
          </div>
          <div>
            <label style="font-size: 13px; font-weight: bold; color: #334155;">Categoría (*):</label>
            <select [(ngModel)]="form.categoria_id" style="width: 100%; padding: 8px; border: 1px solid #cbd5e1; border-radius: 4px; margin-top: 4px; box-sizing: border-box; background: white;">
              <option [ngValue]="null">-- Seleccione --</option>
              <option *ngFor="let cat of categorias()" [ngValue]="cat.id">{{ cat.nombre }}</option>
            </select>
          </div>
        </div>

        <div style="margin-bottom: 15px;">
          <label style="font-size: 13px; font-weight: bold; color: #334155;">Descripción:</label>
          <input [(ngModel)]="form.descripcion" type="text" style="width: 100%; padding: 8px; border: 1px solid #cbd5e1; border-radius: 4px; margin-top: 4px; box-sizing: border-box;">
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 15px; margin-bottom: 15px;">
          <div>
            <label style="font-size: 13px; font-weight: bold; color: #334155;">Precio Compra (Q):</label>
            <input [(ngModel)]="form.precio_compra" type="number" step="0.01" style="width: 100%; padding: 8px; border: 1px solid #cbd5e1; border-radius: 4px; margin-top: 4px; box-sizing: border-box;">
          </div>
          <div>
            <label style="font-size: 13px; font-weight: bold; color: #334155;">Precio Venta (Q):</label>
            <input [(ngModel)]="form.precio_venta" type="number" step="0.01" style="width: 100%; padding: 8px; border: 1px solid #cbd5e1; border-radius: 4px; margin-top: 4px; box-sizing: border-box;">
          </div>
          <div>
            <label style="font-size: 13px; font-weight: bold; color: #334155;">Existencia:</label>
            <input [(ngModel)]="form.stock" type="number" style="width: 100%; padding: 8px; border: 1px solid #cbd5e1; border-radius: 4px; margin-top: 4px; box-sizing: border-box;">
          </div>
          <div>
            <label style="font-size: 13px; font-weight: bold; color: #334155;">Stock Mínimo:</label>
            <input [(ngModel)]="form.stock_minimo" type="number" style="width: 100%; padding: 8px; border: 1px solid #cbd5e1; border-radius: 4px; margin-top: 4px; box-sizing: border-box;">
          </div>
        </div>

        <div style="display: flex; gap: 10px;">
          <button (click)="guardar()" style="background: #10b981; color: white; border: none; padding: 10px 20px; border-radius: 4px; font-weight: bold; cursor: pointer;">
            {{ idEditando === null ? 'Registrar Producto' : 'Actualizar Producto' }}
          </button>
          <button *ngIf="idEditando !== null" (click)="limpiarFormulario()" style="background: #64748b; color: white; border: none; padding: 10px 15px; border-radius: 4px; cursor: pointer;">
            Cancelar
          </button>
        </div>
      </div>

      <!-- Tabla -->
      <div style="overflow-x: auto; box-shadow: 0 1px 3px rgba(0,0,0,0.1); border-radius: 6px;">
        <table style="width: 100%; border-collapse: collapse; background: white;">
          <thead>
            <tr style="background: #233242; color: white; text-align: left; font-size: 14px;">
              <th style="padding: 12px;">Código</th>
              <th style="padding: 12px;">Nombre</th>
              <th style="padding: 12px;">Categoría</th>
              <th style="padding: 12px;">P. Compra</th>
              <th style="padding: 12px;">P. Venta</th>
              <th style="padding: 12px;">Existencia</th>
              <th style="padding: 12px;">Estado</th>
              <th style="padding: 12px; text-align: center;">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let p of productosFiltrados()" style="border-bottom: 1px solid #e2e8f0; font-size: 14px;">
              <td style="padding: 10px; font-weight: bold;">{{ p.codigo }}</td>
              <td style="padding: 10px;">{{ p.nombre }}</td>
              <td style="padding: 10px;">{{ p.categoria_nombre }}</td>
              <td style="padding: 10px;">Q {{ p.precio_compra | number:'1.2-2' }}</td>
              <td style="padding: 10px;">Q {{ p.precio_venta | number:'1.2-2' }}</td>
              <td style="padding: 10px;">{{ p.stock }}</td>
              <td style="padding: 10px;">
                <span [style.color]="p.estado === 'Activo' ? '#16a34a' : '#dc2626'" style="font-weight: bold;">
                  {{ p.estado }}
                </span>
              </td>
              <td style="padding: 10px; text-align: center; white-space: nowrap;">
                <button (click)="editar(p)" style="background: #f59e0b; color: white; border: none; padding: 6px 10px; border-radius: 4px; cursor: pointer; margin-right: 5px;">Editar</button>
                <button (click)="eliminar(p.id)" style="background: #ef4444; color: white; border: none; padding: 6px 10px; border-radius: 4px; cursor: pointer;">Eliminar</button>
              </td>
            </tr>
            <tr *ngIf="productosFiltrados().length === 0">
              <td colspan="8" style="padding: 20px; text-align: center; color: #64748b;">No hay productos registrados.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `
})
export class Productos implements OnInit {
  private http = inject(HttpClient);
  apiUrl = `${environment.apiUrl}productos`;
  apiCategorias = `${environment.apiUrl}categorias`;

  productos = signal<any[]>([]);
  productosFiltrados = signal<any[]>([]);
  categorias = signal<any[]>([]);

  busqueda = '';
  mostrarFormulario = true;
  idEditando: number | null = null;

  form = {
    codigo: '',
    nombre: '',
    categoria_id: null as number | null,
    descripcion: '',
    precio_compra: 0,
    precio_venta: 0,
    stock: 0,
    stock_minimo: 5
  };

  ngOnInit() {
    this.cargarCategorias();
    this.cargarProductos();
  }

  cargarCategorias() {
    this.http.get<any[]>(this.apiCategorias).subscribe({
      next: (data) => this.categorias.set(data),
      error: (err) => console.error('Error al cargar categorías:', err)
    });
  }

  cargarProductos() {
    this.http.get<any[]>(this.apiUrl).subscribe({
      next: (data) => {
        this.productos.set(data);
        this.filtrar();
      },
      error: (err) => console.error('Error al cargar productos:', err)
    });
  }

  filtrar() {
    const q = this.busqueda.toLowerCase().trim();
    if (!q) {
      this.productosFiltrados.set(this.productos());
    } else {
      this.productosFiltrados.set(
        this.productos().filter(p => 
          p.nombre.toLowerCase().includes(q) || p.codigo.toLowerCase().includes(q)
        )
      );
    }
  }

  toggleFormulario() {
    this.mostrarFormulario = !this.mostrarFormulario;
    if (!this.mostrarFormulario) this.limpiarFormulario();
  }

  guardar() {
    if (!this.form.codigo || !this.form.nombre) {
      alert('Debe ingresar Código y Nombre.');
      return;
    }

    const payload = {
      ...this.form,
      categoria_id: this.form.categoria_id ? Number(this.form.categoria_id) : null,
      precio_compra: Number(this.form.precio_compra) || 0,
      precio_venta: Number(this.form.precio_venta) || 0,
      stock: Number(this.form.stock) || 0,
      stock_minimo: Number(this.form.stock_minimo) || 5
    };

    if (this.idEditando === null) {
      this.http.post(this.apiUrl, payload).subscribe({
        next: () => {
          this.limpiarFormulario();
          this.cargarProductos();
        },
        error: (err) => this.mostrarError(err)
      });
    } else {
      this.http.put(`${this.apiUrl}/${this.idEditando}`, payload).subscribe({
        next: () => {
          this.limpiarFormulario();
          this.cargarProductos();
        },
        error: (err) => this.mostrarError(err)
      });
    }
  }

  mostrarError(err: any) {
    let msg = 'Error al guardar el producto.';
    if (typeof err.error?.detail === 'string') {
      msg = err.error.detail;
    } else if (Array.isArray(err.error?.detail)) {
      msg = err.error.detail.map((e: any) => e.msg || e.message).join(', ');
    } else if (err.message) {
      msg = err.message;
    }
    alert(msg);
  }

  editar(p: any) {
    this.mostrarFormulario = true;
    this.idEditando = p.id;
    this.form = {
      codigo: p.codigo,
      nombre: p.nombre,
      categoria_id: p.categoria_id ? Number(p.categoria_id) : null,
      descripcion: p.descripcion,
      precio_compra: p.precio_compra,
      precio_venta: p.precio_venta,
      stock: p.stock,
      stock_minimo: p.stock_minimo || 5
    };
  }

  eliminar(id: number) {
    if (confirm('¿Eliminar producto físicamente de la base de datos?')) {
      this.http.delete(`${this.apiUrl}/${id}`).subscribe({
        next: () => this.cargarProductos(),
        error: (err) => this.mostrarError(err)
      });
    }
  }

  limpiarFormulario() {
    this.idEditando = null;
    this.form = {
      codigo: '',
      nombre: '',
      categoria_id: null,
      descripcion: '',
      precio_compra: 0,
      precio_venta: 0,
      stock: 0,
      stock_minimo: 5
    };
  }
}