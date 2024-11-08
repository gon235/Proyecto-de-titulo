import { Component, OnInit } from '@angular/core';
import { DatabaseService } from '../services/database.service';
import { MenuController } from '@ionic/angular';
import { AuthService } from '../services/auth.service';
import { StorageService } from '../services/storage.service';
import { AppComponent } from '../app.component'; //import de app.component for web detection
import { Observable, BehaviorSubject } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

interface Mantencion {
  id: string;
  nombremantencion: string;
  fechahora: string;
  nivelurgencia: string;
}

interface Vehicle {
  id: string;
  nombrevehiculo: string;
  patente: string;
  estado: string;
}

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {
  isWeb: boolean = false;   // Var for Web app detection
  mantenciones: Mantencion[] = [];
  userPhotoUrl: string = 'assets/default-avatar.svg';
  userName: string = '';
  userData: any;
  currentUserId: string = '';

  vehicles$: Observable<Vehicle[]>;
  filteredVehicles$: Observable<Vehicle[]>;
  searchQuery: string = 'En mantenimiento';
  selectedStatus: string = 'En mantenimiento';
  private searchSubject = new BehaviorSubject<string>('');

  


  constructor(
    private databaseService: DatabaseService,
    private menuController: MenuController,
    private authService: AuthService,
    private storageService: StorageService,
    public appComponent: AppComponent,     // web detection 

  ) {this.vehicles$ = this.databaseService.getCollection('vehiculos') as Observable<Vehicle[]>;
    this.filteredVehicles$ = this.vehicles$;
  }

  ngOnInit() {
    this.loadMantenciones();
    this.loadUserPhoto();
    this.isWeb = this.appComponent.isWeb;   // web detection
    this.vehicles$ = this.databaseService.getCollection('vehiculos').pipe(
      map(vehicles => vehicles.sort((a, b) => a.nombrevehiculo.localeCompare(b.nombrevehiculo)))
    ); // filtered
    this.filteredVehicles$ = this.databaseService.getCollection('vehiculos').pipe(
      map(vehicles => vehicles.filter(vehicle => vehicle.estado === 'En mantenimiento'))
    );
  
  }

/*
  setupSearch() {
    this.filteredVehicles$ = this.searchSubject.pipe(
      switchMap(searchQuery => 
        this.applyFilter(searchQuery)
      )
    );
  }
*/
  loadUserPhoto() {
    console.log('Iniciando carga de foto de perfil');
    
    this.authService.user$.subscribe(user => {
      console.log('Usuario autenticado:', user);
      
      if (user && user.uid) {
        this.currentUserId = user.uid;
        console.log('UID del usuario:', user.uid);
        
        // Obtener el documento del usuario desde Firestore
        this.databaseService.getDocument('personal', user.uid).subscribe(
          (personal: any) => {
            console.log('Datos del personal obtenidos:', personal);
            
            if (personal) {
              // Establecer el nombre del usuario
              this.userName = `${personal.nombres}`;
              
              if (personal.imagen) {
                console.log('Ruta de imagen encontrada:', personal.imagen);
                
                // Obtener la URL de la imagen desde Storage
                this.storageService.getFileUrl(personal.imagen).subscribe(
                  (url: string) => {
                    console.log('URL de imagen obtenida:', url);
                    this.userPhotoUrl = url;
                  },
                  (error) => {
                    console.error('Error al obtener URL de Storage:', error);
                    this.userPhotoUrl = 'assets/default-avatar.svg';
                  }
                );
              } else {
                console.log('No se encontró imagen en los datos del personal');
                this.userPhotoUrl = 'assets/default-avatar.svg';
              }
            }
          },
          (error) => {
            console.error('Error al obtener datos del personal:', error);
            this.userPhotoUrl = 'assets/default-avatar.svg';
          }
        );
      } else {
        console.log('No hay usuario autenticado');
        this.userPhotoUrl = 'assets/default-avatar.svg';
        this.userName = '';
      }
    });
  }

  loadMantenciones() {
    this.authService.user$.subscribe(user => {
      if (user) {
        this.databaseService.getCollection('mantenciones').subscribe(
          (mantenciones: Mantencion[]) => {
            this.mantenciones = mantenciones
              .sort((a, b) => new Date(a.fechahora).getTime() - new Date(b.fechahora).getTime())
              .filter(m => new Date(m.fechahora) > new Date())
              .slice(0, 5);
          },
          error => console.error('Error loading mantenciones:', error)
        );
      }
    });
  }

  mostrarMenu() {
    this.menuController.open();
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }

  private normalizeString(str: string): string {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  }

  filterVehicles() {
    this.searchSubject.next(this.searchQuery);
  }

  private applyFilter(query: string): Observable<Vehicle[]> {
    return this.vehicles$.pipe(
      map(vehicles =>
        vehicles.filter(vehicle => vehicle.estado === 'En mantenimiento')
      )
    );
  }
}