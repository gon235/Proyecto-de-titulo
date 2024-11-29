import { Component, OnInit } from '@angular/core';
import { DatabaseService } from '../services/database.service';
import { AuthService } from '../services/auth.service';
import { StorageService } from '../services/storage.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-mantenciones',
  templateUrl: './mantenciones.page.html',
  styleUrls: ['./mantenciones.page.scss'],
})
export class MantencionesPage implements OnInit {
  mantenciones: any[] = [];
  mantencionesFiltradas: any[] = [];
  mantencionesFiltradasOriginal: any[] = [];
  contadorHistorialTotal: number = 0;
  contadorTotal: number = 0;
  contadorPendientes: number = 0;
  contadorCompletas: number = 0;
  filtroActual: string = 'todas';
  searchTerm: string = '';
  
  // Propiedades para el usuario y sidebar
  userPhotoUrl: string = 'assets/default-avatar.svg';
  userName: string = '';
  userData: any;
  currentUserId: string = '';
  darkMode: boolean = false;
  userRole: string = '';

  constructor(
    private databaseService: DatabaseService,
    private authService: AuthService,
    private storageService: StorageService,
    private router: Router
  ) {
    const prefersDark = localStorage.getItem('darkMode');
    if (prefersDark !== null) {
      this.darkMode = prefersDark === 'true';
      document.body.classList.toggle('dark', this.darkMode);
    } else {
      const prefersDarkMedia = window.matchMedia('(prefers-color-scheme: dark)');
      this.darkMode = prefersDarkMedia.matches;
      document.body.classList.toggle('dark', this.darkMode);
    }
  }

  ngOnInit() {
    this.loadMantenciones();
    this.loadUserPhoto();
    this.getCurrentUserRole();
  }

  async getCurrentUserRole() {
    this.authService.user$.subscribe(user => {
      if (user) {
        this.databaseService.getDocument('personal', user.uid).subscribe((userData: any) => {
          this.userRole = userData?.rol || '';
        });
      }
    });
  }

  loadUserPhoto() {
    this.authService.user$.subscribe(user => {
      if (user && user.uid) {
        this.currentUserId = user.uid;
        this.databaseService.getDocument('personal', user.uid).subscribe(
          (personal: any) => {
            if (personal) {
              this.userName = `${personal.nombres}`;
              this.userData = personal;

              if (personal.imagen) {
                this.storageService.getFileUrl(personal.imagen).subscribe(
                  (url: string) => {
                    this.userPhotoUrl = url;
                  },
                  (error) => {
                    this.userPhotoUrl = 'assets/default-avatar.svg';
                  }
                );
              } else {
                this.userPhotoUrl = 'assets/default-avatar.svg';
              }
            }
          }
        );
      }
    });
  }

  loadMantenciones() {
    this.databaseService.getCollection('mantenciones').subscribe(
      (data: any[]) => {
        this.mantenciones = data;
        this.actualizarContadores();
        this.filtrarMantenciones('todas');
      },
      error => {
        console.error('Error al cargar mantenciones:', error);
      }
    );
  }

  actualizarContadores() {
    const fechaActual = new Date();
    const primerDiaMes = new Date(fechaActual.getFullYear(), fechaActual.getMonth(), 1);
    const ultimoDiaMes = new Date(fechaActual.getFullYear(), fechaActual.getMonth() + 1, 0);

    // Contadores para el mes actual
    this.contadorTotal = this.mantenciones.filter(m => {
      const fechaMantencion = new Date(m.fechahora);
      return fechaMantencion >= primerDiaMes && fechaMantencion <= ultimoDiaMes;
    }).length;

    this.contadorPendientes = this.mantenciones.filter(m => 
      m.estado !== 'Completa' && 
      new Date(m.fechahora) >= primerDiaMes && 
      new Date(m.fechahora) <= ultimoDiaMes
    ).length;

    this.contadorCompletas = this.mantenciones.filter(m => 
      m.estado === 'Completa' && 
      new Date(m.fechahora) >= primerDiaMes && 
      new Date(m.fechahora) <= ultimoDiaMes
    ).length;

    // Contador histórico total
    this.contadorHistorialTotal = this.mantenciones.length;
  }

  filtrarMantenciones(filtro: string) {
    this.filtroActual = filtro;
    const fechaActual = new Date();
    const primerDiaMes = new Date(fechaActual.getFullYear(), fechaActual.getMonth(), 1);
    const ultimoDiaMes = new Date(fechaActual.getFullYear(), fechaActual.getMonth() + 1, 0);

    switch (filtro) {
      case 'todasHistorial':
        this.mantencionesFiltradas = [...this.mantenciones];
        break;
      case 'todas':
        this.mantencionesFiltradas = this.mantenciones.filter(m => {
          const fechaMantencion = new Date(m.fechahora);
          return fechaMantencion >= primerDiaMes && fechaMantencion <= ultimoDiaMes;
        });
        break;
      case 'pendientes':
        this.mantencionesFiltradas = this.mantenciones.filter(m => 
          m.estado !== 'Completa' && 
          new Date(m.fechahora) >= primerDiaMes && 
          new Date(m.fechahora) <= ultimoDiaMes
        );
        break;
      case 'completas':
        this.mantencionesFiltradas = this.mantenciones.filter(m => 
          m.estado === 'Completa' && 
          new Date(m.fechahora) >= primerDiaMes && 
          new Date(m.fechahora) <= ultimoDiaMes
        );
        break;
    }
    
    this.mantencionesFiltradasOriginal = [...this.mantencionesFiltradas];
    if (this.searchTerm) {
      this.buscarMantenciones();
    }
  }

  buscarMantenciones() {
    if (!this.searchTerm) {
      this.mantencionesFiltradas = [...this.mantencionesFiltradasOriginal];
      return;
    }

    const searchTermLower = this.searchTerm.toLowerCase();
    this.mantencionesFiltradas = this.mantencionesFiltradasOriginal.filter(mantencion =>
      mantencion.nombremantencion.toLowerCase().includes(searchTermLower) ||
      mantencion.nombrevehiculo.toLowerCase().includes(searchTermLower) ||
      mantencion.estado.toLowerCase().includes(searchTermLower)
    );
  }

  limpiarBusqueda() {
    this.searchTerm = '';
    this.mantencionesFiltradas = [...this.mantencionesFiltradasOriginal];
  }

  getBadgeColor(nivelurgencia: string): string {
    switch (nivelurgencia) {
      case 'Nivel alto':
        return 'danger';
      case 'Nivel medio':
        return 'warning';
      case 'Nivel bajo':
        return 'success';
      default:
        return 'medium';
    }
  }

  // Métodos para el sidebar
  toggleDarkMode(event: any) {
    this.darkMode = event.detail.checked;
    document.body.classList.toggle('dark', this.darkMode);
    localStorage.setItem('darkMode', String(this.darkMode));
  }

  async signOut() {
    try {
      await this.authService.logout();
      this.router.navigate(['/login']);
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  }
}