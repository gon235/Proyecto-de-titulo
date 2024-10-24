import { Component, OnInit } from '@angular/core';
import { ServicedatosService, DatosVehiculo } from '../services/servicedatos.service';

@Component({
  selector: 'app-vehiculos',
  templateUrl: './vehiculos.page.html',
  styleUrls: ['./vehiculos.page.scss'],
})
export class VehiculosPage implements OnInit {
  vehicles: DatosVehiculo[] = [];
  filteredVehicles: DatosVehiculo[] = [];

  constructor(private storageService: ServicedatosService) {}

  ngOnInit() {
    this.loadVehicles();
  }

  loadVehicles() {
    this.storageService.getDatosVehiculo().then(vehicles => {
      this.vehicles = vehicles || [];
      this.filteredVehicles = this.vehicles; // Initialize filtered list
    }).catch(error => {
      console.error('Error loading vehicles:', error);
      this.vehicles = [];
    });
  }

  searchVehicles(event: any) {
    const query = event.target.value.toLowerCase();
    this.filteredVehicles = this.vehicles.filter(vehicle =>
      (vehicle.nombrevehiculo && vehicle.nombrevehiculo.toLowerCase().includes(query)) ||
      (vehicle.marca && vehicle.marca.toLowerCase().includes(query)) ||
      (vehicle.modelo && vehicle.modelo.toLowerCase().includes(query)) ||
      (vehicle.anio && vehicle.anio.toString().includes(query)) ||
      (vehicle.patente && vehicle.patente.toLowerCase().includes(query))
    );
  }
}