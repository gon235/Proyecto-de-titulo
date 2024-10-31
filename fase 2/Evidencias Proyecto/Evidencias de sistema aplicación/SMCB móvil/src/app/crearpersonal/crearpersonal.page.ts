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
    if (this.selectedFile) {
      const path = `personal/${new Date().getTime()}_${this.selectedFile.name}`;
      try {
        const uploadTask = await this.storageService.uploadFile(path, this.selectedFile);
        const downloadURL = await uploadTask.ref.getDownloadURL();
        this.newDatoP.imagen = downloadURL;
      } catch (error) {
        console.error('Error al subir la imagen:', error);
        await this.presentToast('Error al subir la imagen');
        return;
      }
    }

    try {
      // Crear el usuario en Firebase Authentication
      const authResult = await this.authService.register(this.newDatoP.email, this.newDatoP.password);
      
      // Añadir el uid al objeto newDatoP
      this.newDatoP.uid = authResult.user.uid;

      // Eliminar la contraseña del objeto antes de guardarlo en la base de datos
      const datosParaGuardar = {...this.newDatoP};
      delete datosParaGuardar.password;

      // Añadir los datos a la base de datos
      await this.databaseService.addDocument('personal', datosParaGuardar);
      
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