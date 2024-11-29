import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DatabaseService } from '../services/database.service';
import { StorageService } from '../services/storage.service';
import { AlertController } from '@ionic/angular';
import { map } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { MenuController, Platform } from '@ionic/angular';

interface Vehicle {
  id: string;
  nombrevehiculo: string;
  marca: string;
  modelo: string;
  anio: number;
  patente: string;
  imagen: string;
  estado: string;
}

interface Maintenance {
  id: string;
  nombremantencion: string;
  fechahora: string;
  estado: string;
  nombrevehiculo: string;
  nivelurgencia: string;
  detalle: string;
}

@Component({
  selector: 'app-perfilvehiculo',
  templateUrl: './perfilvehiculo.page.html',
  styleUrls: ['./perfilvehiculo.page.scss'],
})
export class PerfilvehiculoPage implements OnInit {
  vehicle: Vehicle | null = null;
  imageUrl: string | null = null;
  isEditing: boolean = false;
  originalVehicle: Vehicle | null = null;
  maintenances: Maintenance[] = [];
  vehicleImage: File | null = null;
  canEdit: boolean = false;
  currentUserId: string | null = null;
  darkMode: boolean = false;
  userRole: string = '';
  userName: string = '';
  userPhotoUrl: string = 'assets/default-avatar.svg';
  userData: any;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private databaseService: DatabaseService,
    private storageService: StorageService,
    private alertController: AlertController,
    private authService: AuthService,
    private menuCtrl: MenuController,
    private platform: Platform
) {
    this.platform.ready().then(() => {
      this.enableMenu();
    });
    // Inicializar el modo oscuro
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

  ngOnInit() {
    // Habilitar el menú lateral
    this.menuCtrl.enable(true);
    this.enableMenu();
  
    // Agregar listener para el estado del menú
    this.menuCtrl.isEnabled('main-menu').then(enabled => {
      if (!enabled) {
        this.enableMenu();
      }
    });
  
    // Suscripción al usuario autenticado y carga de datos
    this.authService.user$.subscribe(user => {
      if (user) {
        this.currentUserId = user.uid;
        this.databaseService.getDocument('personal', user.uid).subscribe((userData: any) => {
          this.userRole = userData?.rol || '';
          this.userName = `${userData?.nombres}`;
          this.userData = userData;
          this.canEdit = userData?.rol === 'Supervisor';
          
          if (userData?.imagen) {
            this.storageService.getFileUrl(userData.imagen).subscribe(
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
          
          this.loadVehicleData();
        });
      }
    });
  
    // Configurar el menú lateral para dispositivos móviles
    if (window.innerWidth < 768) {
      this.menuCtrl.swipeGesture(true);
    }
  }

  async enableMenu() {
    await this.menuCtrl.enable(true, 'main-menu');
    await this.menuCtrl.swipeGesture(true, 'main-menu');
}

async toggleMenu() {
  const isOpen = await this.menuCtrl.isOpen('main-menu');
  if (isOpen) {
      await this.menuCtrl.close('main-menu');
  } else {
      await this.menuCtrl.open('main-menu');
  }
}

ionViewWillEnter() {
  this.menuCtrl.enable(true, 'main-menu');
  this.menuCtrl.swipeGesture(true, 'main-menu');
}

  loadVehicleData() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.databaseService.getDocument('vehiculos', id).subscribe(
        (vehicle: Vehicle | undefined) => {
          if (vehicle) {
            this.vehicle = vehicle;
            this.originalVehicle = { ...vehicle };
            if (this.vehicle.imagen) {
              this.loadImage(this.vehicle.imagen);
            }
            this.loadMaintenances(id);
          } else {
            console.error('Vehicle not found');
          }
        },
        error => console.error('Error loading vehicle data:', error)
      );
    } else {
      console.error('No ID provided');
    }
  }

  loadMaintenances(vehicleId: string) {
    this.databaseService.getCollection('mantenciones').pipe(
      map(maintenances => maintenances.filter(m => m.nombrevehiculo.includes(this.vehicle?.nombrevehiculo)))
    ).subscribe(
      (maintenances: Maintenance[]) => {
        this.maintenances = maintenances;
        console.log('Maintenance records:', this.maintenances);
      },
      error => console.error('Error loading maintenance records:', error)
    );
  }

  loadImage(imagePath: string) {
    this.storageService.getFileUrl(imagePath).subscribe(
      url => {
        console.log('Image URL:', url);
        this.imageUrl = url;
      },
      error => {
        console.error('Error loading image:', error);
        this.imageUrl = null;
      }
    );
  }

  editVehicle() {
    if (!this.canEdit) {
      this.showUnauthorizedAlert();
      return;
    }
    this.isEditing = true;
    if (this.vehicle) {
      this.originalVehicle = { ...this.vehicle } as Vehicle;
    }
  }

  async showUnauthorizedAlert() {
    const alert = await this.alertController.create({
      header: 'Acceso Denegado',
      message: 'Solo los supervisores pueden editar los perfiles de vehículos.',
      buttons: ['OK']
    });
    await alert.present();
  }

  onFileSelected(event: any) {
    this.vehicleImage = event.target.files[0];
  }

  async saveVehicle() {
    if (!this.canEdit) {
      this.showUnauthorizedAlert();
      return;
    }

    if (this.vehicle && this.vehicle.id) {
      try {
        if (this.vehicleImage) {
          const imagePath = `vehiculos/${this.vehicle.id}/profile.jpg`;
          await this.storageService.uploadFile(imagePath, this.vehicleImage);
          this.vehicle.imagen = imagePath;
        }
        this.vehicle.patente = this.vehicle.patente.toUpperCase();
        await this.databaseService.updateDocument('vehiculos', this.vehicle.id, this.vehicle);
        this.isEditing = false;
        this.originalVehicle = { ...this.vehicle };
        console.log('Vehicle data updated successfully');
        const alert = await this.alertController.create({
          header: 'Éxito',
          message: 'Los datos del vehículo se han actualizado correctamente.',
          buttons: ['OK']
        });
        await alert.present();
        this.loadImage(this.vehicle.imagen);
      } catch (error) {
        console.error('Error updating vehicle data:', error);
        const alert = await this.alertController.create({
          header: 'Error',
          message: 'Hubo un problema al actualizar los datos del vehículo.',
          buttons: ['OK']
        });
        await alert.present();
      }
    }
  }

  cancelEdit() {
    this.isEditing = false;
    if (this.originalVehicle) {
      this.vehicle = { ...this.originalVehicle };
    }
  }

  async deleteVehicle() {
    if (!this.canEdit) {
      this.showUnauthorizedAlert();
      return;
    }

    const alert = await this.alertController.create({
      header: 'Confirmar eliminación',
      message: '¿Estás seguro de que quieres eliminar este vehículo? Esta acción no se puede deshacer.',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'secondary',
        }, {
          text: 'Eliminar',
          handler: () => {
            this.confirmDeleteVehicle();
          }
        }
      ]
    });

    await alert.present();
  }

  async confirmDeleteVehicle() {
    if (this.vehicle && this.vehicle.id) {
      try {
        await this.storageService.deleteVehicleFolder(this.vehicle.id);
        console.log('Carpeta de imágenes del vehículo eliminada correctamente');

        await this.databaseService.deleteDocument('vehiculos', this.vehicle.id);
        console.log('Vehicle deleted successfully');

        const alert = await this.alertController.create({
          header: 'Éxito',
          message: 'El vehículo y todos sus datos asociados han sido eliminados correctamente.',
          buttons: ['OK']
        });
        await alert.present();
        this.router.navigate(['/vehiculos']);
      } catch (error) {
        console.error('Error al eliminar el vehículo:', error);
        const alert = await this.alertController.create({
          header: 'Error',
          message: 'Hubo un problema al eliminar el vehículo.',
          buttons: ['OK']
        });
        await alert.present();
      }
    }
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleString();
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