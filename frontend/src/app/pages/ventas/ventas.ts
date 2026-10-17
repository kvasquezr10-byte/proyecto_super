import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-ventas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div style="padding: 20px; font-family: Arial, sans-serif;">
      <h2 style="color: #0f172a; font-weight: bold; margin-bottom: 20px;">Módulo: Nueva Venta</h2>

      <div style="background: #f1f5f9; padding: 20px; border-radius: 8px; border: 1px solid #e2e8f0; margin-bottom: 25px;">
        <div style="margin-bottom: 15px;">
          <label style="font-weight: bold; font-size: 14px;">Cliente (*):</label>
          <select [(ngModel)]="clienteId" style="width: 100%; padding: 8px; border: 1px solid #cbd5e1; border-radius: 4px; margin-top: 5px; background: white;">
            <option [ngValue]="null">-- Seleccionar Cliente --</option>
            <option *ngFor="let c of clientes()" [value]="c.id">{{ c.nombres }} {{ c.apellidos }} (NIT: {{ c.nit }})</option>
          </select>
        </div>

        <div style="display: grid; grid-template-columns: 2fr 1fr 1fr auto; gap: 10px; align-items: end;">
          <div>
            <label style="font-weight: bold; font-size: 13px;">Producto:</label>
            <select [(ngModel)]="productoSeleccionado" style="width: 100%; padding: 8px; border: 1px solid #cbd5e1; border-radius: 4px; background: white;">
              <option [ngValue]="null">-- Seleccionar Producto --</option>
              <option *ngFor="let p of productos()" [ngValue]="p">{{ p.nombre }} (Q{{ p.precio_venta }} - Stock: {{ p.stock }})</option>
            </select>
          </div>
          <div>
            <label style="font-weight: bold; font-size: 13px;">Cantidad:</label>
            <input type="number" [(ngModel)]="cantidad" min="1" style="width: 100%; padding: 8px; border: 1px solid #cbd5e1; border-radius: 4px; box-sizing: border-box;">
          </div>
          <div>
            <label style="font-weight: bold; font-size: 13px;">Precio Un.:</label>
            <input type="number" [value]="productoSeleccionado?.precio_venta || 0" readonly style="width: 100%; padding: 8px; border: 1px solid #cbd5e1; border-radius: 4px; background: #e2e8f0; box-sizing: border-box;">
          </div>
          <button (click)="agregarDetalle()" style="background: #0284c7; color: white; border: none; padding: 9px 16px; border-radius: 4px; font-weight: bold; cursor: pointer;">
            + Agregar
          </button>
        </div>
      </div>

      <!-- Detalle de la Venta -->
      <table style="width: 100%; border-collapse: collapse; background: white; box-shadow: 0 1px 3px rgba(0,0,0,0.1); border-radius: 6px; overflow: hidden; margin-bottom: 20px;">
        <thead>
          <tr style="background: #233242; color: white; text-align: left;">
            <th style="padding: 12px;">Producto</th>
            <th style="padding: 12px;">Cantidad</th>
            <th style="padding: 12px;">Precio Unitario</th>
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
        <h3 style="margin: 0; color: #1e293b;">Total: <span style="color: #10b981;">Q {{ totalVenta() | number:'1.2-2' }}</span></h3>
        <button (click)="procesarVenta()" style="background: #10b981; color: white; border: none; padding: 12px 24px; border-radius: 6px; font-weight: bold; font-size: 16px; cursor: pointer;">
          💳 Procesar y Registrar Venta
        </button>
      </div>
    </div>
  `
})
export class Ventas implements OnInit {
  private http = inject(HttpClient);

  clientes = signal<any[]>([]);
  productos = signal<any[]>([]);
  carrito = signal<any[]>([]);

  clienteId: number | null = null;
  productoSeleccionado: any = null;
  cantidad = 1;

  ngOnInit() {
    this.http.get<any[]>(`${environment.apiUrl}clientes`).subscribe(data => this.clientes.set(data));
    this.http.get<any[]>(`${environment.apiUrl}productos`).subscribe(data => this.productos.set(data));
  }

  agregarDetalle() {
    if (!this.productoSeleccionado || this.cantidad <= 0) return;
    if (this.cantidad > this.productoSeleccionado.stock) {
      alert(`Stock insuficiente. Stock actual: ${this.productoSeleccionado.stock}`);
      return;
    }

    const subtotal = this.cantidad * this.productoSeleccionado.precio_venta;
    const item = {
      producto_id: this.productoSeleccionado.id,
      nombre: this.productoSeleccionado.nombre,
      cantidad: this.cantidad,
      precio_unitario: this.productoSeleccionado.precio_venta,
      subtotal
    };

    this.carrito.set([...this.carrito(), item]);
    this.productoSeleccionado = null;
    this.cantidad = 1;
  }

  quitarDetalle(index: number) {
    const list = [...this.carrito()];
    list.splice(index, 1);
    this.carrito.set(list);
  }

  totalVenta() {
    return this.carrito().reduce((acc, curr) => acc + curr.subtotal, 0);
  }

  procesarVenta() {
    if (!this.clienteId) {
      alert('Seleccione un cliente para registrar la venta.');
      return;
    }
    if (this.carrito().length === 0) {
      alert('Agregue al menos un producto a la venta.');
      return;
    }

    const payload = {
      cliente_id: this.clienteId,
      detalles: this.carrito().map(i => ({
        producto_id: i.producto_id,
        cantidad: i.cantidad,
        precio_unitario: i.precio_unitario
      }))
    };

    this.http.post(`${environment.apiUrl}ventas`, payload).subscribe({
      next: () => {
        alert('¡Venta realizada con éxito!');
        this.carrito.set([]);
        this.clienteId = null;
        // Recargar stock de productos
        this.http.get<any[]>(`${environment.apiUrl}productos`).subscribe(data => this.productos.set(data));
      },
      error: (err) => alert(err.error?.detail || 'Error al procesar la venta')
    });
  }
}