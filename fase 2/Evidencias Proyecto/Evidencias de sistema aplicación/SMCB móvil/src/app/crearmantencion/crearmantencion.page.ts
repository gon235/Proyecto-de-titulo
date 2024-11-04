import { Component, OnInit } from '@angular/core';
import { DatabaseService } from '../services/database.service';
import { ToastController } from '@ionic/angular';
import { Router } from '@angular/router';

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
    estado:'pendiente'
  };

  constructor(
    private databaseService: DatabaseService,
    private toastController: ToastController,
    private router: Router
  ) { }

  ngOnInit() {
    this.loadVehicles();
  }

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
        // Validar que todos los campos estén completos
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
      estado:'pendiente'
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