import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DatabaseService } from '../services/database.service';
import { StorageService } from '../services/storage.service';
import { AlertController } from '@ionic/angular';
import { map } from 'rxjs/operators';

interface Vehicle {
  id: string;
  nombrevehiculo: string;
  marca: string;
  modelo: string;
  anio: number;
  patente: string;
  imagen: string;
}

interface Maintenance {
  id: string;
  nombremantencion: string;
  fechahora: string;
  estado: string;
  nombrevehiculo: string;
  nivelurgencia: string;
  detalle: string;
}

@Component({
  selector: 'app-perfilvehiculo',
  templateUrl: './perfilvehiculo.page.html',
  styleUrls: ['./perfilvehiculo.page.scss'],
})
export class PerfilvehiculoPage implements OnInit {
  vehicle: Vehicle | null = null;
  imageUrl: string | null = null;
  isEditing: boolean = false;
  originalVehicle: Vehicle | null = null;
  maintenances: Maintenance[] = [];
  vehicleImage: File | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private databaseService: DatabaseService,
    private storageService: StorageService,
    private alertController: AlertController
  ) { }

  ngOnInit() {
    this.loadVehicleData();
  }

  loadVehicleData() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.databaseService.getDocument('vehiculos', id).subscribe(
        (vehicle: Vehicle | undefined) => {
          if (vehicle) {
            this.vehicle = vehicle;
            this.originalVehicle = { ...vehicle };
            if (this.vehicle.imagen) {
              this.loadImage(this.vehicle.imagen);
            }
            this.loadMaintenances(id);
          } else {
            console.error('Vehicle not found');
          }
        },
        error => console.error('Error loading vehicle data:', error)
      );
    } else {
      console.error('No ID provided');
    }
  }

  loadMaintenances(vehicleId: string) {
    this.databaseService.getCollection('mantenciones').pipe(
      map(maintenances => maintenances.filter(m => m.nombrevehiculo.includes(this.vehicle?.nombrevehiculo)))
    ).subscribe(
      (maintenances: Maintenance[]) => {
        this.maintenances = maintenances;
        console.log('Maintenance records:', this.maintenances);
      },
      error => console.error('Error loading maintenance records:', error)
    );
  }

  loadImage(imagePath: string) {
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

  editVehicle() {
    this.isEditing = true;
    if (this.vehicle) {
      this.originalVehicle = { ...this.vehicle } as Vehicle;
    }
  }

  onFileSelected(event: any) {
    this.vehicleImage = event.target.files[0];
  }

  async saveVehicle() {
    if (this.vehicle && this.vehicle.id) {
      try {
        if (this.vehicleImage) {
          const imagePath = `vehiculos/${this.vehicle.id}/profile.jpg`;
          await this.storageService.uploadFile(imagePath, this.vehicleImage);
          this.vehicle.imagen = imagePath;
        }
        await this.databaseService.updateDocument('vehiculos', this.vehicle.id, this.vehicle);
        this.isEditing = false;
        this.originalVehicle = { ...this.vehicle };
        console.log('Vehicle data updated successfully');
        const alert = await this.alertController.create({
          header: 'Éxito',
          message: 'Los datos del vehículo se han actualizado correctamente.',
          buttons: ['OK']
        });
        await alert.present();
        this.loadImage(this.vehicle.imagen);
      } catch (error) {
        console.error('Error updating vehicle data:', error);
        const alert = await this.alertController.create({
          header: 'Error',
          message: 'Hubo un problema al actualizar los datos del vehículo.',
          buttons: ['OK']
        });
        await alert.present();
      }
    }
  }

  cancelEdit() {
    this.isEditing = false;
    if (this.originalVehicle) {
      this.vehicle = { ...this.originalVehicle };
    }
  }

  async deleteVehicle() {
    const alert = await this.alertController.create({
      header: 'Confirmar eliminación',
      message: '¿Estás seguro de que quieres eliminar este vehículo? Esta acción no se puede deshacer.',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'secondary',
        }, {
          text: 'Eliminar',
          handler: () => {
            this.confirmDeleteVehicle();
          }
        }
      ]
    });

    await alert.present();
  }

  async confirmDeleteVehicle() {
    if (this.vehicle && this.vehicle.id) {
      try {
        await this.databaseService.deleteDocument('vehiculos', this.vehicle.id);
        if (this.vehicle.imagen) {
          await this.storageService.deleteFile(this.vehicle.imagen);
        }
        console.log('Vehicle deleted successfully');
        const alert = await this.alertController.create({
          header: 'Éxito',
          message: 'El vehículo ha sido eliminado correctamente.',
          buttons: ['OK']
        });
        await alert.present();
        this.router.navigate(['/vehiculos']);
      } catch (error) {
        console.error('Error deleting vehicle:', error);
        const alert = await this.alertController.create({
          header: 'Error',
          message: 'Hubo un problema al eliminar el vehículo.',
          buttons: ['OK']
        });
        await alert.present();
      }
    }
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleString();
  }
}