import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DatabaseService } from '../services/database.service';
import { StorageService } from '../services/storage.service';
import { AlertController } from '@ionic/angular';
import { LoadingController } from '@ionic/angular';
import { AuthService } from '../services/auth.service';
import { MenuController, Platform } from '@ionic/angular';

interface Personal {
  id: string;
  nombres: string;
  apellidos: string;
  email: string;
  numeroTelefono: string;
  rango: string;
  imagen: string;
  rol: string;
}

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.page.html',
  styleUrls: ['./perfil.page.scss'],
})
export class PerfilPage implements OnInit {
  personal: Personal | null = null;
  imageUrl: string | null = null;
  isEditing: boolean = false;
  originalPersonal: Personal | null = null;
  profileImage: File | null = null;
  currentUserId: string | null = null;
  canEdit: boolean = false;
  isSupervisor: boolean = false;
  mantencionesList: any[] = [];
  darkMode: boolean = false;
  userRole: string = '';
  userPhotoUrl: string = 'assets/default-avatar.svg';
  userName: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private databaseService: DatabaseService,
    private storageService: StorageService,
    private alertController: AlertController,
    private loadingCtrl: LoadingController,
    private authService: AuthService,
    private menuCtrl: MenuController,
    private platform: Platform
  ) {
    this.platform.ready().then(() => {
      this.enableMenu();
    });
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
  
    // Configuración del modo oscuro
    const prefersDark = localStorage.getItem('darkMode');
    if (prefersDark !== null) {
      this.darkMode = prefersDark === 'true';
      document.body.classList.toggle('dark', this.darkMode);
    } else {
      const prefersDarkMedia = window.matchMedia('(prefers-color-scheme: dark)');
      this.darkMode = prefersDarkMedia.matches;
      document.body.classList.toggle('dark', this.darkMode);
  
      // Observer para cambios en el modo oscuro del sistema
      prefersDarkMedia.addEventListener('change', (e) => {
        this.darkMode = e.matches;
        document.body.classList.toggle('dark', this.darkMode);
        localStorage.setItem('darkMode', String(this.darkMode));
      });
    }
  
    // Suscripción al usuario autenticado
    this.authService.user$.subscribe(user => {
      this.currentUserId = user ? user.uid : null;
      this.loadPersonalData();
      if (this.currentUserId) {
        this.loadMantenciones();
        this.loadUserData();
      }
    });
  
    // Configurar el menú lateral para dispositivos móviles
    if (window.innerWidth < 768) {
      this.menuCtrl.swipeGesture(true);
    }
  }

  async enableMenu() {
    await this.menuCtrl.enable(true, 'main-menu'); // Especifica el ID del menú
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

  loadUserData() {
    if (this.currentUserId) {
      this.databaseService.getDocument('personal', this.currentUserId).subscribe(
        (personal: any) => {
          if (personal) {
            this.userName = `${personal.nombres}`;
            this.userRole = personal.rol;
            if (personal.imagen) {
              this.storageService.getFileUrl(personal.imagen).subscribe(
                url => {
                  this.userPhotoUrl = url;
                },
                error => {
                  this.userPhotoUrl = 'assets/default-avatar.svg';
                }
              );
            }
          }
        }
      );
    }
  }

  loadPersonalData() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      console.log('ID del perfil a cargar:', id);
  
      this.databaseService.getDocument('personal', id).subscribe(
        (personal: Personal | undefined) => {
          if (personal) {
            console.log('Personal data cargada:', personal);
            this.personal = personal;
  
            if (!this.personal.rol) {
              this.personal.rol = 'Bombero';
            }
  
            this.originalPersonal = {...personal};
  
            if (this.currentUserId) {
              this.databaseService.getDocument('personal', this.currentUserId).subscribe(
                (currentUser: any) => {
                  this.canEdit =
                    this.currentUserId === this.personal?.id ||
                    (currentUser?.rol === 'Supervisor');
  
                  this.isSupervisor = currentUser?.rol === 'Supervisor';
                },
                error => {
                  console.error('Error al cargar datos del usuario actual:', error);
                }
              );
            }
  
            if (this.personal.imagen) {
              this.loadImage(this.personal.imagen);
            } else {
              this.imageUrl = 'assets/default-avatar.svg';
            }
  
            if (this.personal.rol === 'Mecánico') {
              console.log('Cargando mantenciones para mecánico:', id);
              this.databaseService.getMantencionesByMecanico(id).subscribe(
                mantenciones => {
                  console.log('Mantenciones obtenidas:', mantenciones);
                  this.mantencionesList = mantenciones;
                  if (this.mantencionesList.length === 0) {
                    console.log('No hay mantenciones para este mecánico.');
                  }
                },
                error => {
                  console.error('Error al cargar mantenciones:', error);
                  this.mantencionesList = [];
                }
              );
            } else {
              this.mantencionesList = [];
            }
          } else {
            console.error('No se encontró el personal');
            this.personal = null;
            this.mantencionesList = [];
          }
        },
        error => {
          console.error('Error cargando datos del personal:', error);
          this.personal = null;
          this.mantencionesList = [];
        }
      );
    } else {
      console.error('No se proporcionó ID para cargar el perfil');
      this.personal = null;
      this.mantencionesList = [];
    }
  }


  loadImage(imagePath: string) {
    if (!imagePath) {
      console.error('No image path provided');
      return;
    }
    
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

  loadMantenciones() {
    const profileId = this.route.snapshot.paramMap.get('id');
    
    if (profileId && this.personal?.rol === 'Mecánico') {
      this.databaseService.getMantencionesByMecanico(profileId)
        .subscribe(mantenciones => {
          this.mantencionesList = mantenciones;
          console.log('Mantenciones cargadas:', this.mantencionesList);
        });
    }
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }

  goToMantencionDetalle(mantencionId: string) {
    this.router.navigate(['/mantencion-detalle', mantencionId]);
  }

  onFileSelected(event: any) {
    this.profileImage = event.target.files[0];
  }

  editPersonal() {
    if (!this.canEdit) {
      this.showUnauthorizedAlert();
      return;
    }
    this.isEditing = true;
  }

  async showUnauthorizedAlert() {
    const alert = await this.alertController.create({
      header: 'Acceso Denegado',
      message: 'No tienes permisos para editar este perfil.',
      buttons: ['OK']
    });
    await alert.present();
  }

  cancelEdit() {
    this.isEditing = false;
    if (this.originalPersonal) {
      this.personal = {...this.originalPersonal};
    }
  }

  async savePersonal() {
    const loading = await this.loadingCtrl.create({
      message: 'Guardando',
      duration: 900,
      spinner: 'circles'
    });
  
    await loading.present();
    if (this.personal && this.personal.id) {
      try {
        if (this.profileImage) {
          const imagePath = `personal/${this.personal.id}/profile.jpg`;
          await this.storageService.uploadFile(imagePath, this.profileImage);
          this.personal.imagen = imagePath;
        }
        await this.databaseService.updateDocument('personal', this.personal.id, this.personal);
        this.isEditing = false;
        this.originalPersonal = {...this.personal};
        console.log('Personal data updated successfully');
        const alert = await this.alertController.create({
          header: 'Éxito',
          message: 'Los datos del perfil se han actualizado correctamente.',
          buttons: ['OK']
        });
        await alert.present();
      } catch (error) {
        console.error('Error updating personal data:', error);
        const alert = await this.alertController.create({
          header: 'Error',
          message: 'Hubo un problema al actualizar los datos del perfil.',
          buttons: ['OK']
        });
        await alert.present();
      }
    }
  }

  async deletePersonal() {
    const alert = await this.alertController.create({
      header: 'Confirmar eliminación',
      message: '¿Estás seguro de que quieres eliminar este perfil? Esta acción no se puede deshacer.',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'secondary',
        }, {
          text: 'Eliminar',
          handler: () => {
            this.confirmDeletePersonal();
          }
        }
      ]
    });

    await alert.present();
  }

  async confirmDeletePersonal() {
    if (this.personal && this.personal.id) {
      try {
        await this.storageService.deleteUserFolder(this.personal.id);
        console.log('Carpeta de imágenes eliminada correctamente');
  
        await this.databaseService.deleteDocument('personal', this.personal.id);
        console.log('Personal profile deleted successfully');
  
        const alert = await this.alertController.create({
          header: 'Éxito',
          message: 'El perfil y todos sus datos asociados han sido eliminados correctamente.',
          buttons: ['OK']
        });
        await alert.present();
        this.router.navigate(['/personal']);
      } catch (error) {
        console.error('Error al eliminar el perfil:', error);
        const alert = await this.alertController.create({
          header: 'Error',
          message: 'Hubo un problema al eliminar el perfil.',
          buttons: ['OK']
        });
        await alert.present();
      }
    }
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