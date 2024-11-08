import { Component, OnInit } from '@angular/core';
import { DatabaseService } from '../services/database.service';
import { StorageService } from '../services/storage.service';
import { AuthService } from '../services/auth.service';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-crearpersonal',
  templateUrl: './crearpersonal.page.html',
  styleUrls: ['./crearpersonal.page.scss'],
})
export class CrearpersonalPage implements OnInit {
  showPassword = false;
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
    private toastController: ToastController,
    private firestore: AngularFirestore
  ) { }

  ngOnInit() {
  }

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  async addDatosPersonal() {
        // Validar que todos los campos estén completos
        if (!this.newDatoP.nombres || 
          !this.newDatoP.apellidos || 
          !this.newDatoP.numeroTelefono || 
          !this.newDatoP.email || 
          !this.newDatoP.password || 
          !this.newDatoP.rango || 
          !this.newDatoP.rol) {
        await this.presentToast('Por favor complete todos los campos obligatorios');
        return;
      }
    try {
      // Check if the email is already registered
      const snapshot = await this.firestore.collection('personal')
        .ref.where('email', '==', this.newDatoP.email)
        .get();

      if (!snapshot.empty) {
        await this.presentToast('El email ya está registrado');
        return;
      }

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
      rol: '',
      imagen: '',
      uid: ''
    };
    this.selectedFile = null;
  }

  async presentToast(message: string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 4000
    });
    toast.present();
  }
}
