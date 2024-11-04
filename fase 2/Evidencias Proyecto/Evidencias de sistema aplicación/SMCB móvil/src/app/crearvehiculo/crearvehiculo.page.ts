import { Component, OnInit } from '@angular/core';
import { DatabaseService } from '../services/database.service';
import { StorageService } from '../services/storage.service';
import { ToastController } from '@ionic/angular';
import { Router } from '@angular/router';

interface Vehiculo {
  nombrevehiculo: string;
  marca: string;
  modelo: string;
  anio: number | null;
  patente: string;
  imagen: string;
}

@Component({
  selector: 'app-crearvehiculo',
  templateUrl: './crearvehiculo.page.html',
  styleUrls: ['./crearvehiculo.page.scss'],
})
export class CrearvehiculoPage implements OnInit {
  newDatoV: Vehiculo = {
    nombrevehiculo: '',
    marca: '',
    modelo: '',
    anio: null,
    patente: '',
    imagen: ''
  };

  selectedFile: File | null = null;

  constructor(
    private databaseService: DatabaseService,
    private storageService: StorageService,
    private toastController: ToastController,
    private router: Router
  ) { }

  ngOnInit() {
  }

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

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
  }

  async addDatosVehiculo() {
    try {
      // Primero verificamos si la patente ya está registrada
      const existingVehicle = await this.databaseService.getVehicleByPatente(this.newDatoV.patente);
      if (existingVehicle) {
        await this.presentToast('El vehículo no se ha podido crear, la patente ya está registrada');
        return;
      }
  
      // Primero creamos el documento en Firestore para obtener el ID
      const docRef = await this.databaseService.addDocument('vehiculos', this.newDatoV);
      const vehiculoId = docRef.id;
  
      // Si hay una imagen seleccionada, la subimos usando el ID del vehículo
      if (this.selectedFile) {
        const path = `vehiculos/${vehiculoId}/profile.jpg`;
        try {
          const uploadTask = await this.storageService.uploadFile(path, this.selectedFile);
          // Actualizamos el documento con la ruta de la imagen
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

  resetForm() {
    this.newDatoV = {
      nombrevehiculo: '',
      marca: '',
      modelo: '',
      anio: 0,
      patente: '',
      imagen: ''
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