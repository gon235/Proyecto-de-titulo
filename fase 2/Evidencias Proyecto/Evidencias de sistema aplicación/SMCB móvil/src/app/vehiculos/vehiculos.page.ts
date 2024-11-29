import { Component, OnInit } from '@angular/core';
import { DatabaseService } from '../services/database.service';
import { AuthService } from '../services/auth.service';
import { StorageService } from '../services/storage.service';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { Router } from '@angular/router';

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
  userPhotoUrl: string = 'assets/default-avatar.svg';
  userName: string = '';
  userData: any;
  currentUserId: string = '';
  darkMode: boolean = false;

  constructor(
    private databaseService: DatabaseService,
    private authService: AuthService,
    private storageService: StorageService,
    private router: Router
  ) {
    this.vehicles$ = this.databaseService.getCollection('vehiculos') as Observable<Vehicle[]>;
    this.filteredVehicles$ = this.vehicles$;
    this.getCurrentUserRole();

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
    this.loadUserPhoto();
  }

  loadUserPhoto() {
    this.authService.user$.subscribe(user => {
      if (user && user.uid) {
        this.currentUserId = user.uid;
        this.databaseService.getDocument('personal', user.uid).subscribe(
          (personal: any) => {
            if (personal) {
              this.userName = `${personal.nombres}`;
              this.userData = personal;

              if (personal.imagen) {
                this.storageService.getFileUrl(personal.imagen).subscribe(
                  (url: string) => {
                    this.userPhotoUrl = url;
                  },
                  (error) => {
                    this.userPhotoUrl = 'assets/default-avatar.svg';
                  }
                );
              } else {
                this.userPhotoUrl = 'assets/default-avatar.svg';
              }
            }
          }
        );
      }
    });
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

}