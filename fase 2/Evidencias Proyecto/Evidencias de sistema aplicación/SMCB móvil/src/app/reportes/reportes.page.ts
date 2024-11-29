import { Component, OnInit, OnDestroy } from '@angular/core';
import { DatabaseService } from '../services/database.service';
import { MenuController, AlertController, ToastController } from '@ionic/angular';
import { StorageService } from '../services/storage.service';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Chart, registerables } from 'chart.js';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { switchMap, shareReplay, take } from 'rxjs/operators';
import { of } from 'rxjs';
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { FileOpener } from '@capacitor-community/file-opener';

Chart.register(...registerables);

@Component({
  selector: 'app-reportes',
  templateUrl: './reportes.page.html',
  styleUrls: ['./reportes.page.scss'],
})
export class ReportesPage implements OnInit, OnDestroy {
  userPhotoUrl: string = 'assets/default-avatar.svg';
  userName: string = '';
  userData: any;
  currentUserId: string = '';
  darkMode: boolean = false;
  private subscriptions: Subscription[] = [];
  mantencionesChart: any;
  vehiculosMasMantencionesChart: any;
  vehiculosUrgenciaChart: any;
  selectedUrgencia: string = 'todos';
  mantenciones: any[] = [];

  constructor(
    private databaseService: DatabaseService,
    private menuController: MenuController,
    private storageService: StorageService,
    private authService: AuthService,
    private router: Router,
    private alertController: AlertController
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
    const userSub = this.authService.user$.subscribe(user => {
      if (user && user.uid) {
        this.currentUserId = user.uid;
        this.loadUserPhoto(user.uid);
        this.loadMantencionesData();
      } else {
        this.userPhotoUrl = 'assets/default-avatar.svg';
        this.userName = '';
      }
    });
    this.subscriptions.push(userSub);
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  loadUserPhoto(userId: string) {
    // Combinar las suscripciones usando switchMap
    const personalSub = this.databaseService.getDocument('personal', userId).pipe(
      switchMap((personal: any) => {
        if (personal) {
          this.userName = `${personal.nombres}`;
          this.userData = personal;
          
          if (personal.imagen) {
            return this.storageService.getFileUrl(personal.imagen);
          } else {
            return of('assets/default-avatar.svg');
          }
        }
        return of('assets/default-avatar.svg');
      })
    ).subscribe(
      (url: string) => {
        this.userPhotoUrl = url;
      },
      (error) => {
        console.error('Error:', error);
        this.userPhotoUrl = 'assets/default-avatar.svg';
      }
    );
  
    this.subscriptions.push(personalSub);
  }

  loadMantencionesData() {
    const mantenciones$ = this.databaseService.getAllMantenciones().pipe(
      shareReplay(1)
    );
  
    const mantencionesSub = mantenciones$.subscribe(mantenciones => {
      // Guardar las mantenciones en la variable de clase
      this.mantenciones = mantenciones; 
      this.createMantencionesChart(mantenciones);
      this.createVehiculosMasMantencionesChart(mantenciones);
      this.createVehiculosUrgenciaChart(mantenciones);
    });
  
    this.subscriptions.push(mantencionesSub);
  }

  createMantencionesChart(mantenciones: any[]) {
    const canvas = document.getElementById('mantencionesChart') as HTMLCanvasElement;
    if (!canvas) return;
  
    if (this.mantencionesChart) {
      this.mantencionesChart.destroy();
      this.mantencionesChart = null;
    }
  
    const currentDate = new Date();
    const months: string[] = [];
  
    for (let i = 5; i >= 0; i--) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      months.push(date.toLocaleString('es-ES', { month: 'short' }));
    }
  
    // Definir niveles de urgencia y datasets
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
  
    this.mantencionesChart = new Chart(canvas, {
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
    });
  }

  onUrgenciaChange(event: any) {
    this.selectedUrgencia = event.detail.value;
    if (this.mantencionesChart) {
      this.mantencionesChart.destroy();
      this.mantencionesChart = null;
    }
    this.createMantencionesChart(this.mantenciones);
  }

  createVehiculosMasMantencionesChart(mantenciones: any[]) {
    const canvas = document.getElementById('vehiculosMasMantencionesChart') as HTMLCanvasElement;
    if (!canvas) {
      console.error('Canvas element not found');
      return;
    }
  
    if (this.vehiculosMasMantencionesChart) {
      this.vehiculosMasMantencionesChart.destroy();
      this.vehiculosMasMantencionesChart = null;
    }
  
    // Filtrar mantenciones de los últimos 6 meses
    const fechaActual = new Date();
    const fecha6MesesAtras = new Date(fechaActual);
    fecha6MesesAtras.setMonth(fecha6MesesAtras.getMonth() - 6);
  
    const mantenciones6Meses = mantenciones.filter(mantencion => {
      const fechaMantencion = new Date(mantencion.fechahora);
      return fechaMantencion >= fecha6MesesAtras && fechaMantencion <= fechaActual;
    });
  
    console.log('Mantenciones filtradas:', mantenciones6Meses);
  
    // Agrupar mantenciones por vehículo usando nombrevehiculo directamente
    const vehiculos = mantenciones6Meses.reduce((acc, mantencion) => {
      // Usar nombrevehiculo como identificador único
      const nombreVehiculo = mantencion.nombrevehiculo;
      if (!acc[nombreVehiculo]) {
        acc[nombreVehiculo] = { nombre: nombreVehiculo, count: 0 };
      }
      acc[nombreVehiculo].count++;
      return acc;
    }, {});
  
    console.log('Vehículos agrupados:', vehiculos);
  
    // Ordenar por cantidad de mantenciones y tomar los 5 primeros
    const sortedVehiculos = Object.entries(vehiculos)
      .sort((a, b) => (b[1] as { nombre: string, count: number }).count - (a[1] as { nombre: string, count: number }).count)
      .slice(0, 5) as [string, { nombre: string, count: number }][];
  
    console.log('Vehículos ordenados:', sortedVehiculos);
  
    const labels = sortedVehiculos.map(v => v[1].nombre);
    const data = sortedVehiculos.map(v => v[1].count);
  
    console.log('Labels:', labels);
    console.log('Data:', data);
  
    this.vehiculosMasMantencionesChart = new Chart(canvas, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Total de Mantenciones (últimos 6 meses)',
          data: data,
          backgroundColor: 'rgba(153, 102, 255, 0.2)',
          borderColor: 'rgba(153, 102, 255, 1)',
          borderWidth: 1
        }]
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
            text: 'Top 5 Vehículos con más mantenciones en los últimos 6 meses'
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
    });
  }

  createVehiculosUrgenciaChart(mantenciones: any[]) {
    const canvas = document.getElementById('vehiculosUrgenciaChart') as HTMLCanvasElement;
    if (!canvas) {
      console.error('No se encontró el canvas');
      return;
    }
  
    // Destruir el gráfico existente si hay uno
    if (this.vehiculosUrgenciaChart) {
      this.vehiculosUrgenciaChart.destroy();
      this.vehiculosUrgenciaChart = null;
    }
  
    // Validar datos
    if (!mantenciones || mantenciones.length === 0) {
      console.error('No hay mantenciones para mostrar');
      return;
    }
  
    // Obtener nombres únicos de vehículos
    const vehiculosUnicos = [...new Set(mantenciones.map(m => m.nombrevehiculo))];
  
    // Definir los niveles de urgencia y sus colores
    const niveles = [
      { nombre: 'Nivel alto', color: 'rgb(255, 99, 132)', bgColor: 'rgba(255, 99, 132, 0.5)' },
      { nombre: 'Nivel medio', color: 'rgb(255, 159, 64)', bgColor: 'rgba(255, 159, 64, 0.5)' },
      { nombre: 'Nivel bajo', color: 'rgb(75, 192, 192)', bgColor: 'rgba(75, 192, 192, 0.5)' }
    ];
  
    // Crear datasets
    const datasets = niveles.map(nivel => ({
      label: nivel.nombre,
      data: vehiculosUnicos.map(vehiculo => 
        mantenciones.filter(m => 
          m.nombrevehiculo === vehiculo && 
          m.nivelurgencia === nivel.nombre
        ).length
      ),
      backgroundColor: nivel.bgColor,
      borderColor: nivel.color,
      borderWidth: 1,
      barPercentage: 0.8,
      categoryPercentage: 0.9
    }));
  
    // Debug
    console.log('Vehículos:', vehiculosUnicos);
    console.log('Datasets:', datasets);
  
    // Crear el gráfico
    this.vehiculosUrgenciaChart = new Chart(canvas, {
      type: 'line',
      data: {
        labels: vehiculosUnicos,
        datasets: datasets
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: 'x',
        scales: {
          x: {
            stacked: false,
            grid: {
              display: false
            }
          },
          y: {
            stacked: false,
            beginAtZero: true,
            ticks: {
              stepSize: 1
            }
          }
        },
        plugins: {
          legend: {
            position: 'top',
            display: true
          },
          title: {
            display: true,
            text: 'Mantenciones por nivel de urgencia'
          }
        }
      }
    });
  }

  mostrarMenu() {
    this.menuController.open();
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

async exportarPDF(): Promise<void> {
    try {
      const pdf = new jsPDF();
      let yPos = 20;
  
      // Configuración de la imagen
      const logoPath = 'assets/img/SMCB-normal.svg';
      const logoWidth = 20;
      const logoHeight = 20;
      const logoX = 20;
      const logoY = 15;
  
      try {
        // Cargar la imagen de forma asíncrona
        await new Promise((resolve, reject) => {
          const img = new Image();
          img.onload = () => {
            try {
              // Convertir la imagen a base64
              const canvas = document.createElement('canvas');
              canvas.width = img.width;
              canvas.height = img.height;
              const ctx = canvas.getContext('2d');
              if (ctx) {
                ctx.drawImage(img, 0, 0);
                const imageData = canvas.toDataURL('image/png');
                
                // Agregar la imagen al PDF
                pdf.addImage(imageData, 'PNG', logoX, logoY, logoWidth, logoHeight);
              }
              resolve(true);
            } catch (error) {
              console.error('Error al procesar la imagen:', error);
              resolve(true);
            }
          };
          img.onerror = () => {
            console.error('Error al cargar la imagen');
            resolve(true); 
          };
          img.src = logoPath;
        });
      } catch (error) {
        console.error('Error con la imagen:', error);
      }
  
      // Encabezado
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Reporte de mantenciones', logoX + logoWidth + 10, yPos + 5, { align: 'left' });
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(10);
      pdf.text(`Fecha de generación: ${new Date().toLocaleDateString()}`, logoX + logoWidth + 10, yPos + 12, { align: 'left' });
      yPos += 30;
  
      // Obtener datos
      const detallesMensuales = this.getDetalleMantencionesMensuales();
      const detallesVehiculos = this.getDetalleVehiculosMantenciones();
      const detallesUrgencia = this.getDetalleMantencionesUrgencia();
  
      // Tabla de mantenciones mensuales
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Detalle de mantenciones mensuales', 20, yPos);
  
      (pdf as any).autoTable({
        startY: yPos + 5,
        head: detallesMensuales.tablaMensual.head,
        body: detallesMensuales.tablaMensual.body,
        theme: 'grid',
        headStyles: {
          fillColor: [75, 75, 75],
          textColor: 255,
          fontSize: 8,
          fontStyle: 'bold'
        },
        styles: {
          fontSize: 8,
          cellPadding: 2
        },
        margin: { top: 10 }
      });
  
      yPos = (pdf as any).lastAutoTable.finalY + 15;
  
      // Resumen de mantenciones
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Resumen de mantenciones', 20, yPos);
  
      (pdf as any).autoTable({
        startY: yPos + 5,
        head: detallesMensuales.tablaResumen.head,
        body: detallesMensuales.tablaResumen.body,
        theme: 'grid',
        headStyles: {
          fillColor: [75, 75, 75],
          textColor: 255,
          fontSize: 8,
          fontStyle: 'bold'
        },
        styles: {
          fontSize: 8,
          cellPadding: 2
        }
      });
  
      yPos = (pdf as any).lastAutoTable.finalY + 15;
  
      if (yPos > pdf.internal.pageSize.height - 40) {
        pdf.addPage();
        yPos = 20;
      }
  
      // Vehículos con más mantenciones
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Vehículos con la mayor cantidad de mantenciones', 20, yPos);
  
      (pdf as any).autoTable({
        startY: yPos + 5,
        head: [['Vehículo', 'Cantidad', 'Porcentaje']],
        body: detallesVehiculos,
        theme: 'grid',
        headStyles: {
          fillColor: [75, 75, 75],
          textColor: 255,
          fontSize: 8,
          fontStyle: 'bold'
        },
        styles: {
          fontSize: 8,
          cellPadding: 2
        }
      });
  
      yPos = (pdf as any).lastAutoTable.finalY + 15;
  
      if (yPos > pdf.internal.pageSize.height - 40) {
        pdf.addPage();
        yPos = 20;
      }
  
      // Mantenciones por urgencia
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Mantenciones por nivel de urgencia', 20, yPos);
  
      (pdf as any).autoTable({
        startY: yPos + 5,
        head: [['Nivel de urgencia', 'Vehículo', 'Cantidad']],
        body: detallesUrgencia,
        theme: 'grid',
        headStyles: {
          fillColor: [75, 75, 75],
          textColor: 255,
          fontSize: 8,
          fontStyle: 'bold'
        },
        styles: {
          fontSize: 8,
          cellPadding: 2
        }
      });
  
    // Agregar numeración de páginas
    const pageCount = pdf.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      pdf.setPage(i);
      pdf.setFontSize(8);
      pdf.setTextColor(128);
      pdf.text(
        `Página ${i} de ${pageCount}`,
        pdf.internal.pageSize.getWidth() / 2,
        pdf.internal.pageSize.getHeight() - 10,
        { align: 'center' }
      );
    }

    // Obtener el PDF en formato Blob
    const pdfBlob = pdf.output('blob');

    // Convertir el Blob a base64
    const reader = new FileReader();
    reader.readAsDataURL(pdfBlob);
    reader.onloadend = async () => {
      const base64Data = reader.result as string;
      // Remover el prefijo "data:application/pdf;base64,"
      const base64DataClean = base64Data.replace('data:application/pdf;base64,', '');

      const fileName = `reporte-mantenciones-${new Date().toISOString().split('T')[0]}.pdf`;

      // Guardar el archivo en el dispositivo
      const savedFile = await Filesystem.writeFile({
        path: fileName,
        data: base64DataClean,
        directory: Directory.Documents,
        recursive: true
      });

      // Obtener la ruta nativa del archivo
      const path = savedFile.uri;

      // Abrir el archivo
      await FileOpener.open({
        filePath: path,
        contentType: 'application/pdf'
      });
    };

  } catch (error) {
    console.error('Error al generar o abrir el PDF:', error);
  }
}
  
  // Funciones auxiliares para generar el detalle de cada gráfico
  private getDetalleMantencionesMensuales(): any {
    const chart = this.mantencionesChart;
    const meses = chart.data.labels;
    const datasets = chart.data.datasets;
    const nivelesUrgencia = datasets.slice(0, 3);
    const totalDataset = datasets[datasets.length - 1];
  
    // Datos para la tabla mensual
    const tablaMensual: {
      head: string[][],
      body: (string | number)[][]
    } = {
      head: [['Mes', 'Nivel alto', 'Nivel medio', 'Nivel bajo', 'Total', '% Alto', '% Medio', '% Bajo']],
      body: []
    };
  
    // Llenar datos mensuales
    meses.forEach((mes: string, index: number) => {
      const datosNiveles = nivelesUrgencia.map((dataset: { data: number[] }) => dataset.data[index]);
      const totalMes = totalDataset.data[index];
      const porcentajes = datosNiveles.map((cantidad: number) => 
        totalMes > 0 ? `${((cantidad / totalMes) * 100).toFixed(1)}%` : '0%'
      );
  
      tablaMensual.body.push([
        mes.toUpperCase(),
        datosNiveles[0],
        datosNiveles[1],
        datosNiveles[2],
        totalMes,
        porcentajes[0],
        porcentajes[1],
        porcentajes[2]
      ]);
    });
  
    // Datos para la tabla de resumen
    const tablaResumen: {
      head: string[][],
      body: (string | number)[][]
    } = {
      head: [['Nivel de urgencia', 'Total', 'Promedio mensual', 'Porcentaje total']],
      body: []
    };
  
    // Calcular totales generales
    const totalGeneral = totalDataset.data.reduce((sum: number, current: number): number => sum + current, 0);
  
    // Llenar datos de resumen
    nivelesUrgencia.forEach((dataset: { label: string; data: number[] }) => {
      const totalNivel = dataset.data.reduce((sum, current) => sum + current, 0);
      const promedioMensual = (totalNivel / meses.length).toFixed(1);
      const porcentajeTotal = totalGeneral > 0 ? 
        `${((totalNivel / totalGeneral) * 100).toFixed(1)}%` : '0%';
  
      tablaResumen.body.push([
        dataset.label,
        totalNivel,
        promedioMensual,
        porcentajeTotal
      ]);
    });
  
    // Agregar fila de totales al resumen
    const promedioGeneral = (totalGeneral / meses.length).toFixed(1);
    tablaResumen.body.push([
      'Total de mantenciones históricas',
      totalGeneral,
      promedioGeneral,
      '100%'
    ]);
  
    return {
      tablaMensual,
      tablaResumen,
      titulo: 'Detalle de Mantenciones Mensuales'
    };
  }
  
  private getDetalleVehiculosMantenciones(): any[] {
    const chart = this.vehiculosMasMantencionesChart;
    const labels = chart.data.labels;
    const data = chart.data.datasets[0].data;
    const total = data.reduce((sum: number, current: number) => sum + current, 0);
    
    return labels.map((label: string, index: number) => [
      label,
      data[index],
      `${((data[index] / total) * 100).toFixed(1)}%`
    ]);
  }
  
  private getDetalleMantencionesUrgencia(): any[] {
    const chart = this.vehiculosUrgenciaChart;
    const labels = chart.data.labels;
    const datasets = chart.data.datasets;
    const detalles: any[] = [];
  
    datasets.forEach((dataset: any) => {
      dataset.data.forEach((valor: number, index: number) => {
        if (valor > 0) {
          detalles.push([
            dataset.label,
            labels[index],
            valor
          ]);
        }
      });
    });
  
    return detalles;
  }
}