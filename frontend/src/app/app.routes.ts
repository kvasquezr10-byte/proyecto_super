import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { Login } from './pages/login/login';

export const routes: Routes = [
  { path: 'login', component: Login },
  { 
    path: 'dashboard', 
    loadComponent: () => import('./pages/dashboard/dashboard').then(m => m.Dashboard),
    canActivate: [authGuard]
  },
  { 
    path: 'productos', 
    loadComponent: () => import('./pages/productos/productos').then(m => m.Productos),
    canActivate: [authGuard]
  },
  { 
    path: 'categorias', 
    loadComponent: () => import('./pages/categorias/categorias').then(m => m.Categorias),
    canActivate: [authGuard]
  },
  { 
    path: 'clientes', 
    loadComponent: () => import('./pages/clientes/clientes').then(m => m.Clientes),
    canActivate: [authGuard]
  },
  { 
    path: 'proveedores', 
    loadComponent: () => import('./pages/proveedores/proveedores').then(m => m.Proveedores),
    canActivate: [authGuard]
  },
  { 
    path: 'compras', 
    loadComponent: () => import('./pages/compras/compras').then(m => m.Compras),
    canActivate: [authGuard]
  },
  { 
    path: 'ventas', 
    loadComponent: () => import('./pages/ventas/ventas').then(m => m.Ventas),
    canActivate: [authGuard]
  },
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: '**', redirectTo: 'dashboard' }
];