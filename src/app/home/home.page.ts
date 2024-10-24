import { Component, OnInit } from '@angular/core';
import { MenuController } from '@ionic/angular';
import { ServicedatosService, DatosMantencion } from '../services/servicedatos.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {

  mantenciones: DatosMantencion[] = [];

  constructor(private menuController: MenuController, private servicedatosService: ServicedatosService) {}

  ngOnInit() {
    this.loadMantenciones();
  }

  mostrarMenu() {
    this.menuController.open('hamburguesa');
  }

  loadMantenciones() {
    this.servicedatosService.getDatosMantencion().then(datos => {
      if (datos) {
        // Ordena las mantenciones por fecha de forma ascendente
        this.mantenciones = datos.sort((a, b) => {
          const dateA = new Date(a.fechahora).getTime();
          const dateB = new Date(b.fechahora).getTime();
          return dateA - dateB;
        }).slice(0, 5); // Limita a 5 elementos
      }
    });
  }
}