import { Component, OnInit } from '@angular/core';
import { DatabaseService } from '../services/database.service';
import { StorageService } from '../services/storage.service';
import { AuthService } from '../services/auth.service';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { ToastController } from '@ionic/angular';
import { Router } from '@angular/router';

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
  darkMode: boolean = false;
  userData: any;
  userPhotoUrl: string = 'assets/default-avatar.svg';
  userName: string = '';
  currentUserId: string = '';

  constructor(
    private databaseService: DatabaseService,
    private storageService: StorageService,
    private authService: AuthService,
    private router: Router,
    private toastController: ToastController,
    private firestore: AngularFirestore
  ) {
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
    this.loadUserData();
    this.loadUserPhoto();
  }

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  async addDatosPersonal() {
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
      const snapshot = await this.firestore.collection('personal')
        .ref.where('email', '==', this.newDatoP.email)
        .get();

      if (!snapshot.empty) {
        await this.presentToast('El email ya está registrado');
        return;
      }

      const authResult = await this.authService.registerWithoutSignIn(this.newDatoP.email, this.newDatoP.password);
      const uid = authResult.user.uid;
      
      this.newDatoP.uid = uid;
  
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
  
      const datosParaGuardar = {...this.newDatoP};
      delete datosParaGuardar.password;
  
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

  loadUserData() {
    this.authService.user$.subscribe(user => {
      if (user) {
        this.databaseService.getDocument('personal', user.uid).subscribe(
          (personal: any) => {
            if (personal) {
              this.userData = personal;
            }
          },
          (error) => {
            console.error('Error al obtener datos del personal:', error);
          }
        );
      }
    });
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
                    console.error('Error al obtener URL de Storage:', error);
                    this.userPhotoUrl = 'assets/default-avatar.svg';
                  }
                );
              } else {
                this.userPhotoUrl = 'assets/default-avatar.svg';
              }
            }
          },
          (error) => {
            console.error('Error al obtener datos del personal:', error);
            this.userPhotoUrl = 'assets/default-avatar.svg';
          }
        );
      }
    });
  }
}