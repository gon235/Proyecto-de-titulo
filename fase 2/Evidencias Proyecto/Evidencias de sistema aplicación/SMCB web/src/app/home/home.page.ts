import { Component, OnInit, OnDestroy } from '@angular/core';
import { DatabaseService } from '../services/database.service';
import { MenuController } from '@ionic/angular';
import { AuthService } from '../services/auth.service';
import { StorageService } from '../services/storage.service';
import { Router } from '@angular/router';
import { Subscription, Observable } from 'rxjs';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

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
  mantencionesChart: any;
  selectedUrgencia: string = 'todos';
  private subscriptions: Subscription[] = [];
  private calendarSubscription: Subscription | null = null;

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
    const userSub = this.authService.user$.subscribe(user => {
      if (user && user.uid) {
        this.currentUserId = user.uid;
        this.loadUserPhoto(user.uid);
        this.loadMantenciones();
        this.loadMisMantenciones(user.uid);
        this.generateCalendar();
        this.createMantencionesChart([]);
      } else {
        this.userPhotoUrl = 'assets/default-avatar.svg';
        this.userName = '';
      }
    });
    this.subscriptions.push(userSub);
  }

  ngOnDestroy() {
    // Destruir el gráfico si existe
    if (this.mantencionesChart) {
      this.mantencionesChart.destroy();
      this.mantencionesChart = null;
    }
    
    // Limpiar todas las suscripciones
    if (this.calendarSubscription) {
      this.calendarSubscription.unsubscribe();
    }
    
    this.subscriptions.forEach(sub => {
      if (sub) sub.unsubscribe();
    });
    this.subscriptions = [];
  }

  createMantencionesChart(mantenciones: any[]) {
    const canvas = document.getElementById('mantencionesChartEscritorio') as HTMLCanvasElement;
    if (!canvas) return;
  
    // Destruir el gráfico existente si existe
    if (this.mantencionesChart) {
      this.mantencionesChart.destroy();
      this.mantencionesChart = null;
    }
  
    // Limpiar el canvas
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  
    const currentDate = new Date();
    const months: string[] = [];
  
    for (let i = 5; i >= 0; i--) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      months.push(date.toLocaleString('es-ES', { month: 'short' }));
    }
  
    const chartSub = this.databaseService.getCollection('mantenciones').subscribe({
      next: (mantenciones) => {
        const nivelesUrgencia = ['Nivel alto', 'Nivel medio', 'Nivel bajo'];
        const datasets = nivelesUrgencia.map(nivel => {
          const data = months.map((_, index) => {
            const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - (5 - index), 1);
            return mantenciones.filter(m => {
              const mDate = new Date(m.fechahora);
              return mDate.getMonth() === date.getMonth() && 
                     mDate.getFullYear() === date.getFullYear() &&
                     (this.selectedUrgencia === 'todos' || this.selectedUrgencia === nivel) &&
                     m.nivelurgencia === nivel;
            }).length;
          });
  
          const colors: Record<string, { border: string; background: string }> = {
            'Nivel alto': {
              border: 'rgba(255, 99, 132, 1)',
              background: 'rgba(255, 99, 132, 0.2)'
            },
            'Nivel medio': {
              border: 'rgba(255, 206, 86, 1)',
              background: 'rgba(255, 206, 86, 0.2)'
            },
            'Nivel bajo': {
              border: 'rgba(75, 192, 192, 1)',
              background: 'rgba(75, 192, 192, 0.2)'
            }
          };
  
          return {
            label: nivel,
            data: data,
            borderColor: colors[nivel].border,
            backgroundColor: colors[nivel].background,
            borderWidth: 2,
            fill: true,
            tension: 0.4,
            pointBackgroundColor: colors[nivel].border,
            pointBorderColor: '#fff',
            pointBorderWidth: 2,
            pointRadius: 4,
            pointHoverRadius: 6
          };
        });
  
        // Agregar dataset para el total de mantenciones
        const totalData = months.map((_, index) => {
          const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - (5 - index), 1);
          return mantenciones.filter(m => {
            const mDate = new Date(m.fechahora);
            return mDate.getMonth() === date.getMonth() && 
                   mDate.getFullYear() === date.getFullYear() &&
                   (this.selectedUrgencia === 'todos' || this.selectedUrgencia === m.nivelurgencia);
          }).length;
        });
  
        datasets.push({
          label: 'Total mantenciones',
          data: totalData,
          borderColor: 'rgba(153, 102, 255, 1)',
          backgroundColor: 'rgba(153, 102, 255, 0.2)',
          borderWidth: 3,
          fill: true,
          tension: 0.4,
          pointBackgroundColor: 'rgba(153, 102, 255, 1)',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6
        });
  
        const config = {
          type: 'line',
          data: {
            labels: months,
            datasets: datasets
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: 'top',
                display: true
              },
              title: {
                display: true,
                text: 'Tendencia de mantenciones por nivel de urgencia'
              }
            },
            scales: {
              y: {
                beginAtZero: true,
                ticks: {
                  stepSize: 1
                }
              }
            }
          }
        };
  
        this.mantencionesChart = new Chart(canvas, config as any);
      },
      error: (error) => {
        console.error('Error al cargar datos para el gráfico:', error);
      }
    });
  
    this.subscriptions.push(chartSub);
  }

  onUrgenciaChange(event: any) {
    this.selectedUrgencia = event.detail.value;
    
    // Destruir el gráfico existente
    if (this.mantencionesChart) {
      this.mantencionesChart.destroy();
      this.mantencionesChart = null;
    }
    
    // Crear el nuevo gráfico
    setTimeout(() => {
      this.createMantencionesChart(this.mantenciones);
    }, 0);
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
    // Cancelar suscripción anterior si existe
    if (this.calendarSubscription) {
      this.calendarSubscription.unsubscribe();
    }

    // Reiniciar los días del calendario
    this.calendarDays = [];

    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    this.currentMonth = today.toLocaleString('es-ES', { month: 'long', year: 'numeric' });

    this.calendarSubscription = this.databaseService.getCollection('mantenciones').subscribe(
      (mantenciones: Mantencion[]) => {
        // Limpiar el array antes de agregar nuevos días
        this.calendarDays = [];

        const monthMantenciones = mantenciones.filter(m => {
          const mDate = new Date(m.fechahora);
          return mDate.getMonth() === today.getMonth() && 
                 mDate.getFullYear() === today.getFullYear();
        });

        // Días del mes anterior
        let prevMonthDays = firstDay.getDay() - 1;
        if (prevMonthDays === -1) prevMonthDays = 6;

        const prevMonth = new Date(today.getFullYear(), today.getMonth(), 0);
        for (let i = prevMonthDays - 1; i >= 0; i--) {
          this.calendarDays.push({
            day: prevMonth.getDate() - i,
            isCurrentMonth: false,
            isToday: false,
            events: []
          });
        }

        // Días del mes actual
        for (let i = 1; i <= lastDay.getDate(); i++) {
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

        // Días del mes siguiente
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

    // Agregar al array de suscripciones
    this.subscriptions.push(this.calendarSubscription);
  }

  goToMantencionDetalle(mantencionId: string) {
    this.router.navigate(['/mantencion-detalle', mantencionId]);
  }
}
