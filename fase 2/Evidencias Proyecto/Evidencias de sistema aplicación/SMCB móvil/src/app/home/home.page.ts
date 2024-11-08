import { Component, OnInit } from '@angular/core';
import { DatabaseService } from '../services/database.service';
import { MenuController } from '@ionic/angular';
import { AuthService } from '../services/auth.service';
import { StorageService } from '../services/storage.service';

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
  misMantenciones: Mantencion[] = []; // Agregar esta propiedad
  userPhotoUrl: string = 'assets/default-avatar.svg';
  userName: string = '';
  userData: any; // Asegúrate de que esta variable captura los datos del usuario
  currentUserId: string = '';

  constructor(
    private databaseService: DatabaseService,
    private menuController: MenuController,
    private authService: AuthService,
    private storageService: StorageService
  ) {}

  ngOnInit() {
    this.loadMantenciones();
    this.loadUserPhoto();
    this.loadMisMantenciones(); // Agregar esta línea
  }

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
              // Establecer el nombre y rol del usuario
              this.userName = `${personal.nombres}`;
              this.userData = personal; // Aquí estamos capturando los datos del usuario

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

  loadMisMantenciones() {
    this.authService.user$.subscribe(user => {
      if (user) {
        this.databaseService.getMantencionesByUser(user.uid).subscribe(
          mantenciones => {
            this.misMantenciones = mantenciones
              .filter(m => m.estado !== 'Completa') // Filtrar mantenciones no completadas
              .sort((a, b) => 
                new Date(a.fechahora).getTime() - new Date(b.fechahora).getTime()
              );
          },
          error => console.error('Error cargando mis mantenciones:', error)
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
}