import { Component, OnInit } from '@angular/core';
import { DatabaseService } from '../services/database.service';
import { StorageService } from '../services/storage.service';
import { AuthService } from '../services/auth.service';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-crearpersonal',
  templateUrl: './crearpersonal.page.html',
  styleUrls: ['./crearpersonal.page.scss'],
})
export class CrearpersonalPage implements OnInit {
  newDatoP: any = {
    nombres: '',
    apellidos: '',
    numeroTelefono: '',
    email: '',
    password: '',
    rango: '',
    rol: '',
    imagen: '',
    uid: ''
  };

  selectedFile: File | null = null;

  constructor(
    private databaseService: DatabaseService,
    private storageService: StorageService,
    private authService: AuthService,
    private toastController: ToastController
  ) { }

  ngOnInit() {
  }

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
  }

  async addDatosPersonal() {
    try {
      // Usar el nuevo método de registro que no afecta la sesión actual
      const authResult = await this.authService.registerWithoutSignIn(this.newDatoP.email, this.newDatoP.password);
      const uid = authResult.user.uid;
      
      // Añadir el uid al objeto newDatoP
      this.newDatoP.uid = uid;
  
      // Si hay una imagen seleccionada, subirla a Storage usando el uid
      if (this.selectedFile) {
        const path = `personal/${uid}/profile.jpg`;
        try {
          const uploadTask = await this.storageService.uploadFile(path, this.selectedFile);
          this.newDatoP.imagen = path;
        } catch (error) {
          console.error('Error al subir la imagen:', error);
          await this.presentToast('Error al subir la imagen');
          return;
        }
      }
  
      // Eliminar la contraseña del objeto antes de guardarlo
      const datosParaGuardar = {...this.newDatoP};
      delete datosParaGuardar.password;
  
      // Guardar los datos en Firestore usando el uid como ID del documento
      await this.databaseService.addDocumentWithId('personal', uid, datosParaGuardar);
      
      this.resetForm();
      await this.presentToast('Personal creado exitosamente');
    } catch (error) {
      console.error('Error al crear el personal:', error);
      await this.presentToast('Error al crear el personal');
    }
  }

  resetForm() {
    this.newDatoP = {
      nombres: '',
      apellidos: '',
      numeroTelefono: '',
      email: '',
      password: '',
      rango: '',
      imagen: '',
      uid: ''
    };
    this.selectedFile = null;
  }

  async presentToast(message: string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 2000
    });
    toast.present();
  }
}
