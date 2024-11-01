import { Component, OnInit } from '@angular/core';
import { DatabaseService } from '../services/database.service';
import { AuthService } from '../services/auth.service';
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

  constructor(
    private databaseService: DatabaseService,
    private authService: AuthService
  ) {
    this.vehicles$ = this.databaseService.getCollection('vehiculos') as Observable<Vehicle[]>;
  }

  ngOnInit() {
    this.authService.user$.subscribe(user => {
      if (user) {
        this.loadVehicles();
      }
    });
  }

  loadVehicles() {
    this.vehicles$.subscribe(
      vehicles => {
        this.filteredVehicles = vehicles;
      },
      error => {
        console.error('Error al cargar vehículos:', error);
      }
    );
  }

  searchVehicles(event: any) {
    const searchTerm = event.target.value.toLowerCase();
    this.vehicles$.pipe(
      map(vehicles => vehicles.filter(vehicle => 
        vehicle.nombrevehiculo.toLowerCase().includes(searchTerm) ||
        vehicle.patente.toLowerCase().includes(searchTerm)
      ))
    ).subscribe(
      filteredVehicles => {
        this.filteredVehicles = filteredVehicles;
      },
      error => {
        console.error('Error al filtrar vehículos:', error);
      }
    );
  }
}
