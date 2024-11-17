import { Component, OnInit } from '@angular/core';
import { DatabaseService } from '../services/database.service';
import { ToastController } from '@ionic/angular';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { StorageService } from '../services/storage.service';

interface Vehicle {
  id: string;
  nombrevehiculo: string;
  patente: string;
  marca: string;
  modelo: string;
}

interface Mantencion {
  nombrevehiculo: string;
  nombremantencion: string;
  nivelurgencia: string;
  fechahora: string;
  detalle: string;
  marca: string;
  modelo: string;
  estado: string;
}

@Component({
  selector: 'app-crearmantencion',
  templateUrl: './crearmantencion.page.html',
  styleUrls: ['./crearmantencion.page.scss'],
})
export class CrearmantencionPage implements OnInit {
  // Propiedades para el formulario
  today = new Date();
  datosV: Vehicle[] = [];
  
  newDatoM: Mantencion = {
    nombrevehiculo: '',
    nombremantencion: '',
    nivelurgencia: '',
    fechahora: new Date().toISOString(),
    detalle: '',
    marca: '',
    modelo: '',
    estado: 'Pendiente'
  };

  // Propiedades para el sidebar y perfil
  darkMode: boolean = false;
  userPhotoUrl: string = 'assets/default-avatar.svg';
  userName: string = '';
  userData: any;
  currentUserId: string = '';

  constructor(
    private databaseService: DatabaseService,
    private toastController: ToastController,
    private router: Router,
    private authService: AuthService,
    private storageService: StorageService
  ) {
    const prefersDark = localStorage.getItem('darkMode');
    if (prefersDark !== null) {
      this.darkMode = prefersDark === 'true';
      document.body.classList.toggle('dark', this.darkMode);
    }
  }

  ngOnInit() {
    this.loadVehicles();
    this.loadUserPhoto();
  }

  // Métodos para el sidebar y perfil
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
          }
        );
      }
    });
  }

  // Métodos para el formulario
  loadVehicles() {
    this.databaseService.getCollection('vehiculos').subscribe(
      (vehicles: Vehicle[]) => {
        this.datosV = vehicles;
      },
      error => console.error('Error loading vehicles:', error)
    );
  }

  onVehicleSelect(event: any) {
    const selectedVehicleId = event.detail.value;
    const selectedVehicle = this.datosV.find(v => v.id === selectedVehicleId);
    if (selectedVehicle) {
      this.newDatoM.nombrevehiculo = `${selectedVehicle.nombrevehiculo} - Patente ${selectedVehicle.patente}`;
      this.newDatoM.marca = selectedVehicle.marca;
      this.newDatoM.modelo = selectedVehicle.modelo;
    }
  }

  async addDatosMantencion() {
    if (!this.newDatoM.nombrevehiculo || 
        !this.newDatoM.nombremantencion || 
        !this.newDatoM.nivelurgencia) {
      await this.presentToast('Por favor complete todos los campos obligatorios');
      return;
    }
    if (this.validateForm()) {
      try {
        await this.databaseService.addDocument('mantenciones', this.newDatoM);
        this.presentToast('Mantención creada exitosamente');
        this.resetForm();
        this.router.navigate(['/vehiculos']);
      } catch (error) {
        console.error('Error al crear la mantención:', error);
        this.presentToast('Error al crear la mantención');
      }
    } else {
      this.presentToast('Por favor, complete todos los campos');
    }
  }

  validateForm(): boolean {
    return (
      this.newDatoM.nombrevehiculo !== '' &&
      this.newDatoM.nombremantencion !== '' &&
      this.newDatoM.nivelurgencia !== '' &&
      this.newDatoM.fechahora !== '' &&
      this.newDatoM.detalle !== '' &&
      this.newDatoM.marca !== '' &&
      this.newDatoM.modelo !== ''
    );
  }

  resetForm() {
    this.newDatoM = {
      nombrevehiculo: '',
      nombremantencion: '',
      nivelurgencia: '',
      fechahora: new Date().toISOString(),
      detalle: '',
      marca: '',
      modelo: '',
      estado: 'Pendiente'
    };
  }

  async presentToast(message: string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 4000
    });
    toast.present();
  }
}