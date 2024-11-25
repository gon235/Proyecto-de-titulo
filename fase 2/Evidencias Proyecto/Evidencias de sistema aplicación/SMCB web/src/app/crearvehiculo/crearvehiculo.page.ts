import { Component, OnInit } from '@angular/core';
import { DatabaseService } from '../services/database.service';
import { StorageService } from '../services/storage.service';
import { ToastController, MenuController } from '@ionic/angular';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

interface Vehiculo {
  nombrevehiculo: string;
  marca: string;
  modelo: string;
  anio: number | null;
  patente: string;
  imagen: string;
  estado: string;
}

@Component({
  selector: 'app-crearvehiculo',
  templateUrl: './crearvehiculo.page.html',
  styleUrls: ['./crearvehiculo.page.scss'],
})
export class CrearvehiculoPage implements OnInit {
  // Propiedades para el formulario
  newDatoV: Vehiculo = {
    nombrevehiculo: '',
    marca: '',
    modelo: '',
    anio: null,
    patente: '',
    imagen: '',
    estado: ''
  };

  selectedFile: File | null = null;

  // Propiedades para el sidebar y perfil
  darkMode: boolean = false;
  userPhotoUrl: string = 'assets/default-avatar.svg';
  userName: string = '';
  userData: any;
  currentUserId: string = '';

  constructor(
    private databaseService: DatabaseService,
    private storageService: StorageService,
    private toastController: ToastController,
    private router: Router,
    private menuController: MenuController,
    private authService: AuthService
  ) {
    const prefersDark = localStorage.getItem('darkMode');
    if (prefersDark !== null) {
      this.darkMode = prefersDark === 'true';
      document.body.classList.toggle('dark', this.darkMode);
    }
  }

  ngOnInit() {
    this.loadUserPhoto();
  }

  // Método para cargar la foto del usuario
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
                    this.userPhotoUrl = 'assets/default-avatar.svg';
                  }
                );
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

  // Método para validar el año
  validarLargoAno(event: any) {
    const input = event.target as HTMLInputElement;
    const currentYear = new Date().getFullYear();
    const maxYear = currentYear + 1;
  
    if (input.value.length > 4) {
      input.value = input.value.slice(0, 4);
    }
  
    if (parseInt(input.value) > maxYear) {
      input.value = maxYear.toString();
    }
  }

  // Método para manejar la selección de archivo
  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
  }

  // Método para agregar un nuevo vehículo
  async addDatosVehiculo() {
    if (!this.newDatoV.nombrevehiculo || 
        !this.newDatoV.marca || 
        !this.newDatoV.modelo || 
        !this.newDatoV.anio || 
        !this.newDatoV.patente || 
        !this.newDatoV.estado) {
      await this.presentToast('Por favor complete todos los campos obligatorios');
      return;
    }

    this.newDatoV.patente = this.newDatoV.patente.toUpperCase();

    try {
      const existingVehicle = await this.databaseService.getVehicleByPatente(this.newDatoV.patente);
      if (existingVehicle) {
        await this.presentToast('El vehículo no se ha podido crear, la patente ya está registrada');
        return;
      }

      const docRef = await this.databaseService.addDocument('vehiculos', this.newDatoV);
      const vehiculoId = docRef.id;

      if (this.selectedFile) {
        const path = `vehiculos/${vehiculoId}/profile.jpg`;
        try {
          const uploadTask = await this.storageService.uploadFile(path, this.selectedFile);
          await this.databaseService.updateDocument('vehiculos', vehiculoId, {
            imagen: path
          });
        } catch (error) {
          console.error('Error al subir la imagen:', error);
          await this.presentToast('Error al subir la imagen');
          return;
        }
      }

      this.resetForm();
      await this.presentToast('Vehículo creado exitosamente');
      this.router.navigate(['/vehiculos']);
    } catch (error) {
      console.error('Error al crear el vehículo:', error);
      await this.presentToast('Error al crear el vehículo');
    }
  }

  // Métodos auxiliares
  resetForm() {
    this.newDatoV = {
      nombrevehiculo: '',
      marca: '',
      modelo: '',
      anio: null,
      patente: '',
      imagen: '',
      estado: ''
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

  // Métodos para el sidebar
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

  validarPatente(event: any) {
    const input = event.target as HTMLInputElement;
    // Remove any characters that aren't letters or numbers
    input.value = input.value.replace(/[^a-zA-Z0-9]/g, '');
    // Limit to 6 characters
    if (input.value.length > 6) {
      input.value = input.value.slice(0, 6);
    }
    // Update the model
    this.newDatoV.patente = input.value;
  }
}