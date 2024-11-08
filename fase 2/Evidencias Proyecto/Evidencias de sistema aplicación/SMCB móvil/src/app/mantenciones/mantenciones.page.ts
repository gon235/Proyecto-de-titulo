import { Component, OnInit } from '@angular/core';
import { DatabaseService } from '../services/database.service';

@Component({
  selector: 'app-mantenciones',
  templateUrl: './mantenciones.page.html',
  styleUrls: ['./mantenciones.page.scss'],
})
export class MantencionesPage implements OnInit {
  mantenciones: any[] = [];
  mantencionesFiltradas: any[] = [];
  mantencionesFiltradasOriginal: any[] = []; // Para mantener el filtro original
  contadorHistorialTotal: number = 0;
  contadorTotal: number = 0;
  contadorPendientes: number = 0;
  contadorCompletas: number = 0;
  filtroActual: string = 'todas';
  searchTerm: string = '';

  constructor(private databaseService: DatabaseService) { }

  ngOnInit() {
    this.loadMantenciones();
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

    this.contadorHistorialTotal = this.mantenciones.length;

    const mantencionesDelMes = this.mantenciones.filter(mantencion => {
      const fechaMantencion = new Date(mantencion.fechahora);
      return fechaMantencion >= primerDiaMes && fechaMantencion <= ultimoDiaMes;
    });

    this.contadorTotal = mantencionesDelMes.length;
    this.contadorPendientes = mantencionesDelMes.filter(m => m.estado === 'Pendiente').length;
    this.contadorCompletas = mantencionesDelMes.filter(m => m.estado === 'Completa').length;
  }

  filtrarMantenciones(tipo: string) {
    this.filtroActual = tipo;
    const fechaActual = new Date();
    const primerDiaMes = new Date(fechaActual.getFullYear(), fechaActual.getMonth(), 1);
    const ultimoDiaMes = new Date(fechaActual.getFullYear(), fechaActual.getMonth() + 1, 0);

    switch (tipo) {
      case 'todasHistorial':
        this.mantencionesFiltradas = [...this.mantenciones];
        break;
      case 'todas':
        this.mantencionesFiltradas = this.mantenciones.filter(mantencion => {
          const fechaMantencion = new Date(mantencion.fechahora);
          return fechaMantencion >= primerDiaMes && fechaMantencion <= ultimoDiaMes;
        });
        break;
      case 'pendientes':
        this.mantencionesFiltradas = this.mantenciones.filter(mantencion => {
          const fechaMantencion = new Date(mantencion.fechahora);
          return fechaMantencion >= primerDiaMes && 
                 fechaMantencion <= ultimoDiaMes && 
                 mantencion.estado === 'Pendiente';
        });
        break;
      case 'completas':
        this.mantencionesFiltradas = this.mantenciones.filter(mantencion => {
          const fechaMantencion = new Date(mantencion.fechahora);
          return fechaMantencion >= primerDiaMes && 
                 fechaMantencion <= ultimoDiaMes && 
                 mantencion.estado === 'Completa';
        });
        break;
    }
    // Guardamos una copia del filtro actual
    this.mantencionesFiltradasOriginal = [...this.mantencionesFiltradas];
    // Aplicamos la búsqueda si existe un término
    if (this.searchTerm) {
      this.buscarMantenciones();
    }
  }

  buscarMantenciones() {
    if (!this.searchTerm.trim()) {
      // Si no hay término de búsqueda, restauramos la lista original filtrada
      this.mantencionesFiltradas = [...this.mantencionesFiltradasOriginal];
      return;
    }

    const searchTermLower = this.searchTerm.toLowerCase().trim();
    
    this.mantencionesFiltradas = this.mantencionesFiltradasOriginal.filter(mantencion => {
      // Normalizar los términos de búsqueda para el nivel de urgencia
      const searchIncludes = (field: string) => field?.toLowerCase().includes(searchTermLower);
      const nivelUrgenciaMatches = this.normalizarBusquedaUrgencia(mantencion.nivelurgencia, searchTermLower);

      return searchIncludes(mantencion.nombremantencion) ||
             searchIncludes(mantencion.nombrevehiculo) ||
             searchIncludes(mantencion.estado) ||
             searchIncludes(mantencion.detalle) ||
             nivelUrgenciaMatches;
    });
  }

  // Nueva función para normalizar la búsqueda de nivel de urgencia
  normalizarBusquedaUrgencia(nivelUrgencia: string, searchTerm: string): boolean {
    if (!nivelUrgencia) return false;
    
    const urgenciaLower = nivelUrgencia.toLowerCase();
    
    // Términos de búsqueda alternativos para cada nivel
    const terminos = {
      'nivel alto': ['alto', 'alta', 'urgente', 'nivel alto'],
      'nivel medio': ['medio', 'media', 'normal', 'nivel medio'],
      'nivel bajo': ['bajo', 'baja', 'leve', 'nivel bajo']
    };

    // Buscar coincidencias directas
    if (urgenciaLower.includes(searchTerm)) {
      return true;
    }

    // Buscar coincidencias en términos alternativos
    for (const [nivel, aliases] of Object.entries(terminos)) {
      if (urgenciaLower === nivel && aliases.some(alias => alias.includes(searchTerm))) {
        return true;
      }
    }

    return false;
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
}