import { Component, OnInit } from '@angular/core';
import { DatabaseService } from '../services/database.service';
import { MenuController } from '@ionic/angular';

interface Mantencion {
  id: string;
  nombremantencion: string;
  fechahora: string;
  nivelurgencia: string;
}

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {
  mantenciones: Mantencion[] = [];

  constructor(
    private databaseService: DatabaseService,
    private menuController: MenuController
  ) {}

  ngOnInit() {
    this.loadMantenciones();
  }

  loadMantenciones() {
    this.databaseService.getCollection('mantenciones').subscribe(
      (mantenciones: Mantencion[]) => {
        // Ordenar las mantenciones por fecha y filtrar las pendientes
        this.mantenciones = mantenciones
          .sort((a, b) => new Date(a.fechahora).getTime() - new Date(b.fechahora).getTime())
          .filter(m => new Date(m.fechahora) > new Date())
          .slice(0, 5); // Mostrar solo las próximas 5 mantenciones
      },
      error => console.error('Error loading mantenciones:', error)
    );
  }

  mostrarMenu() {
    this.menuController.open();
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Los meses en JavaScript van de 0 a 11
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }
}