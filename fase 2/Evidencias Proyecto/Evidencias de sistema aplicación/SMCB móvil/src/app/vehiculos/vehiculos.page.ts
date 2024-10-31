import { Component, OnInit } from '@angular/core';
import { DatabaseService } from '../services/database.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

interface Vehicle {
  id: string;
  nombrevehiculo: string;
  patente: string;
  // Añade aquí otras propiedades que tenga un vehículo
}

@Component({
  selector: 'app-vehiculos',
  templateUrl: './vehiculos.page.html',
  styleUrls: ['./vehiculos.page.scss'],
})
export class VehiculosPage implements OnInit {
  vehicles$: Observable<Vehicle[]>;
  filteredVehicles: Vehicle[] = [];

  constructor(private databaseService: DatabaseService) {
    this.vehicles$ = this.databaseService.getCollection('vehiculos') as Observable<Vehicle[]>;
  }

  ngOnInit() {
    this.loadVehicles();
  }

  loadVehicles() {
    this.vehicles$.subscribe(vehicles => {
      this.filteredVehicles = vehicles;
    });
  }

  searchVehicles(event: any) {
    const searchTerm = event.target.value.toLowerCase();
    this.vehicles$.pipe(
      map(vehicles => vehicles.filter(vehicle => 
        vehicle.nombrevehiculo.toLowerCase().includes(searchTerm) ||
        vehicle.patente.toLowerCase().includes(searchTerm)
      ))
    ).subscribe(filteredVehicles => {
      this.filteredVehicles = filteredVehicles;
    });
  }
}