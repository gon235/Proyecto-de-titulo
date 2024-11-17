import { Component, OnInit, OnDestroy } from '@angular/core';
import { DatabaseService } from '../services/database.service';
import { MenuController } from '@ionic/angular';
import { AuthService } from '../services/auth.service';
import { StorageService } from '../services/storage.service';
import { Router } from '@angular/router';
import { Subscription, Observable } from 'rxjs';

interface Mantencion {
  id: string;
  nombremantencion: string;
  fechahora: string;
  nivelurgencia: string;
  estado: string;
}

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit, OnDestroy {
  mantenciones: Mantencion[] = [];
  misMantenciones: Mantencion[] = [];
  userPhotoUrl: string = 'assets/default-avatar.svg';
  userName: string = '';
  userData: any;
  currentUserId: string = '';
  darkMode: boolean = false;
  calendarDays: any[] = [];
  currentMonth: string = '';
  vehiculos: Observable<any[]>;
  private subscriptions: Subscription[] = [];

  constructor(
    private databaseService: DatabaseService,
    private menuController: MenuController,
    private storageService: StorageService,
    private authService: AuthService,
    private router: Router
  ) {
    this.vehiculos = this.databaseService.getCollection('vehiculos');
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
    // Realizar una única suscripción al usuario autenticado
    const userSub = this.authService.user$.subscribe(user => {
      if (user && user.uid) {
        this.currentUserId = user.uid;
        this.loadUserPhoto(user.uid);
        this.loadMantenciones();
        this.loadMisMantenciones(user.uid);
        this.generateCalendar();
      } else {
        // Manejar el caso en que no hay usuario autenticado
        this.userPhotoUrl = 'assets/default-avatar.svg';
        this.userName = '';
      }
    });
    this.subscriptions.push(userSub);
  }

  ngOnDestroy() {
    // Cancelar todas las suscripciones cuando el componente se destruya
    this.subscriptions.forEach(sub => sub.unsubscribe());
    this.subscriptions = [];
  }

  // Carga la foto de perfil del usuario
  loadUserPhoto(userId: string) {
    const personalSub = this.databaseService.getDocument('personal', userId).subscribe(
      (personal: any) => {
        if (personal) {
          this.userName = `${personal.nombres}`;
          this.userData = personal;
          if (personal.imagen) {
            const imageSub = this.storageService.getFileUrl(personal.imagen).subscribe(
              (url: string) => {
                this.userPhotoUrl = url;
              },
              (error) => {
                console.error('Error al obtener URL de Storage:', error);
                this.userPhotoUrl = 'assets/default-avatar.svg';
              }
            );
            this.subscriptions.push(imageSub);
          } else {
            this.userPhotoUrl = 'assets/default-avatar.svg';
          }
        }
      },
      (error) => {
        console.error('Error al obtener datos del personal:', error);
        this.userPhotoUrl = 'assets/default-avatar.svg';
      }
    );
    this.subscriptions.push(personalSub);
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

  // Carga las próximas 5 mantenciones generales
  loadMantenciones() {
    const mantencionesSub = this.databaseService.getCollection('mantenciones').subscribe(
      (mantenciones: Mantencion[]) => {
        this.mantenciones = mantenciones
          .sort((a, b) => new Date(a.fechahora).getTime() - new Date(b.fechahora).getTime())
          .filter(m => new Date(m.fechahora) > new Date())
          .slice(0, 5);
      },
      error => console.error('Error loading mantenciones:', error)
    );
    this.subscriptions.push(mantencionesSub);
  }

  // Carga las mantenciones no completadas del usuario autenticado
  loadMisMantenciones(userId: string) {
    const misMantencionesSub = this.databaseService.getMantencionesByUser(userId).subscribe(
      mantenciones => {
        this.misMantenciones = mantenciones
          .filter(m => m.estado !== 'Completa')
          .sort((a, b) => new Date(a.fechahora).getTime() - new Date(b.fechahora).getTime());
      },
      error => console.error('Error cargando mis mantenciones:', error)
    );
    this.subscriptions.push(misMantencionesSub);
  }

  mostrarMenu() {
    this.menuController.open();
  }

  // Formatea la fecha y hora de la mantención
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }

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

  generateCalendar() {
    // Reiniciar los días del calendario
    this.calendarDays = [];

    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    this.currentMonth = today.toLocaleString('es-ES', { month: 'long', year: 'numeric' });

    const mantencionesSub = this.databaseService.getCollection('mantenciones').subscribe(
      (mantenciones: Mantencion[]) => {
        const monthMantenciones = mantenciones.filter(m => {
          const mDate = new Date(m.fechahora);
          return mDate.getMonth() === today.getMonth() && 
                 mDate.getFullYear() === today.getFullYear();
        });

        // Calcular días previos (ajustado para comenzar en lunes)
        let prevMonthDays = firstDay.getDay() - 1;
        if (prevMonthDays === -1) prevMonthDays = 6; // Si es domingo, mostrar 6 días previos

        const prevMonth = new Date(today.getFullYear(), today.getMonth(), 0);
        for (let i = prevMonthDays - 1; i >= 0; i--) {
          this.calendarDays.push({
            day: prevMonth.getDate() - i,
            isCurrentMonth: false,
            isToday: false,
            events: []
          });
        }

        // Días del mes actual con sus mantenciones
        for (let i = 1; i <= lastDay.getDate(); i++) {
          const currentDate = new Date(today.getFullYear(), today.getMonth(), i);
          const dayMantenciones = monthMantenciones.filter(m => {
            const mDate = new Date(m.fechahora);
            return mDate.getDate() === i;
          });

          this.calendarDays.push({
            day: i,
            isCurrentMonth: true,
            isToday: i === today.getDate(),
            events: dayMantenciones
          });
        }

        // Días del siguiente mes para completar la última semana
        const remainingDays = 42 - this.calendarDays.length;
        for (let i = 1; i <= remainingDays; i++) {
          this.calendarDays.push({
            day: i,
            isCurrentMonth: false,
            isToday: false,
            events: []
          });
        }
      },
      error => console.error('Error cargando mantenciones del calendario:', error)
    );
    this.subscriptions.push(mantencionesSub);
  }

  goToMantencionDetalle(mantencionId: string) {
    this.router.navigate(['/mantencion-detalle', mantencionId]);
  }
}