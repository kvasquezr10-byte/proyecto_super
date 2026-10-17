import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  isLoggedIn = signal<boolean>(!!localStorage.getItem('usuario'));
  usuarioActual = signal<string>(localStorage.getItem('usuario') || 'admin');
  rolActual = signal<string>(localStorage.getItem('rol') || 'admin');

  login(username: string, password: string) {
    return this.http.post<any>(`${environment.apiUrl}login`, { username, password }).pipe(
      tap(res => {
        const usuarioNombre = res.nombre || res.username || username;
        const rolUsuario = res.rol || 'admin';

        localStorage.setItem('usuario', usuarioNombre);
        localStorage.setItem('rol', rolUsuario);
        if (res.token) {
          localStorage.setItem('token', res.token);
        }

        this.isLoggedIn.set(true);
        this.usuarioActual.set(usuarioNombre);
        this.rolActual.set(rolUsuario);
      })
    );
  }

  logout() {
    localStorage.clear();
    this.isLoggedIn.set(false);
    this.usuarioActual.set('');
    this.rolActual.set('');
    this.router.navigate(['/login']);
  }
}