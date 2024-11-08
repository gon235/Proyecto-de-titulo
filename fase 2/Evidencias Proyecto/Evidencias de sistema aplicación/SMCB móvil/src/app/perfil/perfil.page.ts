import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DatabaseService } from '../services/database.service';
import { StorageService } from '../services/storage.service';
import { AlertController } from '@ionic/angular';
import { LoadingController } from '@ionic/angular';
import { AuthService } from '../services/auth.service';

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

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private databaseService: DatabaseService,
    private storageService: StorageService,
    private alertController: AlertController,
    private loadingCtrl: LoadingController,
    private authService: AuthService,

  ) { }

  ngOnInit() {
    this.authService.user$.subscribe(user => {
      this.currentUserId = user ? user.uid : null;
      this.loadPersonalData();
      if (this.currentUserId) {
        this.loadMantenciones();
      }
    });
  }

  loadPersonalData() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      console.log('ID del perfil a cargar:', id); // Debug
  
      this.databaseService.getDocument('personal', id).subscribe(
        (personal: Personal | undefined) => {
          if (personal) {
            console.log('Personal data cargada:', personal); // Debug
            this.personal = personal;
            
            // Asegurar que exista un rol por defecto
            if (!this.personal.rol) {
              this.personal.rol = 'Bombero';
            }
            
            // Guardar copia original de los datos
            this.originalPersonal = {...personal};
  
            // Verificar permisos de edición
            if (this.currentUserId) {
              this.databaseService.getDocument('personal', this.currentUserId).subscribe(
                (currentUser: any) => {
                  console.log('Datos del usuario actual:', currentUser); // Debug
                  
                  this.canEdit = 
                    this.currentUserId === this.personal?.id || 
                    (currentUser?.rol && currentUser.rol !== 'Bombero');
                  
                  this.isSupervisor = currentUser?.rol === 'Supervisor';
                  
                  console.log('Permisos:', {
                    canEdit: this.canEdit,
                    isSupervisor: this.isSupervisor
                  }); // Debug
                }
              );
            }
  
            // Cargar imagen de perfil si existe
            if (this.personal.imagen) {
              this.loadImage(this.personal.imagen);
            } else {
              console.log('No hay imagen de perfil');
            }
  
            // Cargar mantenciones si es un mecánico
            if (this.personal.rol === 'Mecánico') {
              this.databaseService.getCollection('mantenciones')
                .subscribe(mantenciones => {
                  console.log('Todas las mantenciones:', mantenciones); // Debug
                  
                  this.mantencionesList = mantenciones.filter(m => 
                    m.assignedTo === id && 
                    m.estado === 'Pendiente' &&
                    m.aceptada === true
                  );
                  
                  // Ordenar por fecha
                  this.mantencionesList.sort((a, b) => 
                    new Date(b.fechahora).getTime() - new Date(a.fechahora).getTime()
                  );
                  
                  console.log('Mantenciones filtradas:', this.mantencionesList); // Debug
                });
            } else {
              this.mantencionesList = [];
              console.log('No es mecánico, no se cargan mantenciones');
            }
  
          } else {
            console.error('No se encontró el personal');
          }
        },
        error => {
          console.error('Error cargando datos del personal:', error);
        }
      );
    } else {
      console.error('No se proporcionó ID para cargar el perfil');
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
}