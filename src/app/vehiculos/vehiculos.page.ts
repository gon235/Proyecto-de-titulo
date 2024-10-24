import { Component, OnInit } from '@angular/core';
import { ServicedatosService, DatosVehiculo } from '../services/servicedatos.service';

@Component({
  selector: 'app-vehiculos',
  templateUrl: './vehiculos.page.html',
  styleUrls: ['./vehiculos.page.scss'],
})
export class VehiculosPage implements OnInit {
  vehicles: DatosVehiculo[] = [];

  constructor(private storageService: ServicedatosService) {}

  ngOnInit() {
    this.loadVehicles();
  }

  loadVehicles() {
    this.storageService.getDatosVehiculo().then(vehicles => {
      this.vehicles = vehicles || [];
    }).catch(error => {
      console.error('Error loading vehicles:', error);
      this.vehicles = [];
    });
  }
}