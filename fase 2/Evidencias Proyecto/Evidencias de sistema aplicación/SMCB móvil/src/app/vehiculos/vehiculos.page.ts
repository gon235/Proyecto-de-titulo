import { Component, OnInit } from '@angular/core';
import { DatabaseService } from '../services/database.service';
import { AuthService } from '../services/auth.service';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

interface Vehicle {
  id: string;
  nombrevehiculo: string;
  patente: string;
  estado: string;
}

@Component({
  selector: 'app-vehiculos',
  templateUrl: './vehiculos.page.html',
  styleUrls: ['./vehiculos.page.scss'],
})
export class VehiculosPage implements OnInit {
  vehicles$: Observable<Vehicle[]>;
  filteredVehicles$: Observable<Vehicle[]>;
  searchQuery: string = '';
  selectedStatus: string = '';
  private searchSubject = new BehaviorSubject<string>('');
  userRole: string = '';

  constructor(
    private databaseService: DatabaseService,
    private authService: AuthService
  ) {
    this.vehicles$ = this.databaseService.getCollection('vehiculos') as Observable<Vehicle[]>;
    this.filteredVehicles$ = this.vehicles$;
    this.getCurrentUserRole();
  }

  async getCurrentUserRole() {
    this.authService.user$.subscribe(user => {
      if (user) {
        this.databaseService.getDocument('personal', user.uid).subscribe((userData: any) => {
          this.userRole = userData?.rol || '';
        });
      }
    });
  }

  ngOnInit() {
    this.vehicles$ = this.databaseService.getCollection('vehiculos').pipe(
      map(vehicles => vehicles.sort((a, b) => a.nombrevehiculo.localeCompare(b.nombrevehiculo)))
    );
    this.setupSearch();
  }

  setupSearch() {
    this.filteredVehicles$ = this.searchSubject.pipe(
      switchMap(searchQuery => 
        this.applyFilter(searchQuery)
      )
    );
  }

  filterVehicles() {
    this.searchSubject.next(this.searchQuery);
  }

  private normalizeString(str: string): string {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  }

  private applyFilter(query: string): Observable<Vehicle[]> {
    const normalizedQuery = this.normalizeString(query);
    return this.vehicles$.pipe(
      map(vehicles => 
        vehicles
          .sort((a, b) => a.nombrevehiculo.localeCompare(b.nombrevehiculo))
          .filter(vehicle => 
            (this.selectedStatus === '' || vehicle.estado === this.selectedStatus) &&
            (this.normalizeString(vehicle.nombrevehiculo).includes(normalizedQuery) ||
            this.normalizeString(vehicle.patente).includes(normalizedQuery) ||
            this.normalizeString(vehicle.estado).includes(normalizedQuery))
          )
      )
    );
  }
}