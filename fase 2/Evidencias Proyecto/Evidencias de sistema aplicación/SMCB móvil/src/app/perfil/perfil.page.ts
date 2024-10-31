import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DatabaseService } from '../services/database.service';
import { StorageService } from '../services/storage.service';
import { AlertController } from '@ionic/angular';

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

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private databaseService: DatabaseService,
    private storageService: StorageService,
    private alertController: AlertController
  ) { }

  ngOnInit() {
    this.loadPersonalData();
  }

  loadPersonalData() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.databaseService.getDocument('personal', id).subscribe(
        (personal: Personal | undefined) => {
          if (personal) {
            console.log('Personal data:', personal);
            this.personal = personal;
            if (!this.personal.rol) {
              this.personal.rol = 'bombero';
            }
            this.originalPersonal = {...personal};
            if (this.personal.imagen) {
              this.loadImage(this.personal.imagen);
            } else {
              console.log('No image path in personal data');
            }
          } else {
            console.error('Personal not found');
          }
        },
        error => console.error('Error loading personal data:', error)
      );
    } else {
      console.error('No ID provided');
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

  onFileSelected(event: any) {
    this.profileImage = event.target.files[0];
  }

  editPersonal() {
    this.isEditing = true;
  }

  cancelEdit() {
    this.isEditing = false;
    if (this.originalPersonal) {
      this.personal = {...this.originalPersonal};
    }
  }

  async savePersonal() {
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
        await this.databaseService.deleteDocument('personal', this.personal.id);
        console.log('Personal profile deleted successfully');
        const alert = await this.alertController.create({
          header: 'Éxito',
          message: 'El perfil ha sido eliminado correctamente.',
          buttons: ['OK']
        });
        await alert.present();
        this.router.navigate(['/personal']);
      } catch (error) {
        console.error('Error deleting personal profile:', error);
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