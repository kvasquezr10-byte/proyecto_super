import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-compras',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div style="padding: 20px; font-family: Arial, sans-serif;">
      <h2 style="color: #0f172a; font-weight: bold; margin-bottom: 20px;">Módulo: Registro de Compras (Ingreso de Stock)</h2>

      <div style="background: #f1f5f9; padding: 20px; border-radius: 8px; border: 1px solid #e2e8f0; margin-bottom: 25px;">
        <div style="margin-bottom: 15px;">
          <label style="font-weight: bold; font-size: 14px;">Proveedor (*):</label>
          <select [(ngModel)]="proveedorId" style="width: 100%; padding: 8px; border: 1px solid #cbd5e1; border-radius: 4px; margin-top: 5px; background: white;">
            <option [ngValue]="null">-- Seleccionar Proveedor --</option>
            <option *ngFor="let p of proveedores()" [value]="p.id">{{ p.nombre }} (NIT: {{ p.nit }})</option>
          </select>
        </div>

        <div style="display: grid; grid-template-columns: 2fr 1fr 1fr auto; gap: 10px; align-items: end;">
          <div>
            <label style="font-weight: bold; font-size: 13px;">Producto:</label>
            <select [(ngModel)]="productoSeleccionado" style="width: 100%; padding: 8px; border: 1px solid #cbd5e1; border-radius: 4px; background: white;">
              <option [ngValue]="null">-- Seleccionar Producto --</option>
              <option *ngFor="let p of productos()" [ngValue]="p">{{ p.nombre }} (Stock actual: {{ p.stock }})</option>
            </select>
          </div>
          <div>
            <label style="font-weight: bold; font-size: 13px;">Cantidad a Comprar:</label>
            <input type="number" [(ngModel)]="cantidad" min="1" style="width: 100%; padding: 8px; border: 1px solid #cbd5e1; border-radius: 4px; box-sizing: border-box;">
          </div>
          <div>
            <label style="font-weight: bold; font-size: 13px;">Costo Unitario (Q):</label>
            <input type="number" [(ngModel)]="precioUnitario" step="0.01" style="width: 100%; padding: 8px; border: 1px solid #cbd5e1; border-radius: 4px; box-sizing: border-box;">
          </div>
          <button (click)="agregarDetalle()" style="background: #0284c7; color: white; border: none; padding: 9px 16px; border-radius: 4px; font-weight: bold; cursor: pointer;">
            + Agregar
          </button>
        </div>
      </div>

      <table style="width: 100%; border-collapse: collapse; background: white; box-shadow: 0 1px 3px rgba(0,0,0,0.1); border-radius: 6px; overflow: hidden; margin-bottom: 20px;">
        <thead>
          <tr style="background: #233242; color: white; text-align: left;">
            <th style="padding: 12px;">Producto</th>
            <th style="padding: 12px;">Cantidad</th>
            <th style="padding: 12px;">Costo Unitario</th>
            <th style="padding: 12px;">Subtotal</th>
            <th style="padding: 12px; text-align: center;">Acción</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let item of carrito(); let i = index" style="border-bottom: 1px solid #e2e8f0;">
            <td style="padding: 10px; font-weight: bold;">{{ item.nombre }}</td>
            <td style="padding: 10px;">{{ item.cantidad }}</td>
            <td style="padding: 10px;">Q {{ item.precio_unitario | number:'1.2-2' }}</td>
            <td style="padding: 10px; font-weight: bold;">Q {{ item.subtotal | number:'1.2-2' }}</td>
            <td style="padding: 10px; text-align: center;">
              <button (click)="quitarDetalle(i)" style="background: #ef4444; color: white; border: none; padding: 4px 8px; border-radius: 4px; cursor: pointer;">Quitar</button>
            </td>
          </tr>
        </tbody>
      </table>

      <div style="display: flex; justify-content: space-between; align-items: center; background: white; padding: 15px 20px; border-radius: 6px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
        <h3 style="margin: 0; color: #1e293b;">Total Compra: <span style="color: #2563eb;">Q {{ totalCompra() | number:'1.2-2' }}</span></h3>
        <button (click)="procesarCompra()" style="background: #2563eb; color: white; border: none; padding: 12px 24px; border-radius: 6px; font-weight: bold; font-size: 16px; cursor: pointer;">
          📥 Registrar Ingreso de Inventario
        </button>
      </div>
    </div>
  `
})
export class Compras implements OnInit {
  private http = inject(HttpClient);

  proveedores = signal<any[]>([]);
  productos = signal<any[]>([]);
  carrito = signal<any[]>([]);

  proveedorId: number | null = null;
  productoSeleccionado: any = null;
  cantidad = 1;
  precioUnitario = 0;

  ngOnInit() {
    this.http.get<any[]>(`${environment.apiUrl}proveedores`).subscribe(data => this.proveedores.set(data));
    this.http.get<any[]>(`${environment.apiUrl}productos`).subscribe(data => this.productos.set(data));
  }

  agregarDetalle() {
    if (!this.productoSeleccionado || this.cantidad <= 0 || this.precioUnitario <= 0) return;

    const subtotal = this.cantidad * this.precioUnitario;
    const item = {
      producto_id: this.productoSeleccionado.id,
      nombre: this.productoSeleccionado.nombre,
      cantidad: this.cantidad,
      precio_unitario: this.precioUnitario,
      subtotal
    };

    this.carrito.set([...this.carrito(), item]);
    this.productoSeleccionado = null;
    this.cantidad = 1;
    this.precioUnitario = 0;
  }

  quitarDetalle(index: number) {
    const list = [...this.carrito()];
    list.splice(index, 1);
    this.carrito.set(list);
  }

  totalCompra() {
    return this.carrito().reduce((acc, curr) => acc + curr.subtotal, 0);
  }

  procesarCompra() {
    if (!this.proveedorId) {
      alert('Seleccione un proveedor.');
      return;
    }
    if (this.carrito().length === 0) {
      alert('Agregue al menos un producto.');
      return;
    }

    const payload = {
      proveedor_id: this.proveedorId,
      detalles: this.carrito().map(i => ({
        producto_id: i.producto_id,
        cantidad: i.cantidad,
        precio_unitario: i.precio_unitario
      }))
    };

    this.http.post(`${environment.apiUrl}compras`, payload).subscribe({
      next: () => {
        alert('¡Stock ingresado e inventario actualizado exitosamente!');
        this.carrito.set([]);
        this.proveedorId = null;
        this.http.get<any[]>(`${environment.apiUrl}productos`).subscribe(data => this.productos.set(data));
      },
      error: (err) => alert(err.error?.detail || 'Error al registrar la compra')
    });
  }
}