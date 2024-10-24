import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ServicedatosService, DatosVehiculo, DatosMantencion } from '../services/servicedatos.service';

@Component({
  selector: 'app-perfilvehiculo',
  templateUrl: './perfilvehiculo.page.html',
  styleUrls: ['./perfilvehiculo.page.scss'],
})
export class PerfilvehiculoPage implements OnInit {
  vehicle: DatosVehiculo | undefined;
  imageUrl: string | undefined;
  maintenances: DatosMantencion[] = [];

  constructor(private route: ActivatedRoute, private storageService: ServicedatosService) {}

  ngOnInit() {
    const vehicleId = this.route.snapshot.paramMap.get('id');
    if (vehicleId) {
      this.loadVehicle(Number(vehicleId));
      this.loadMaintenances(Number(vehicleId));
    }
  }

  async loadVehicle(id: number) {
    try {
      const vehicles = await this.storageService.getDatosVehiculo();
      this.vehicle = vehicles.find(v => v.id === id);
      if (this.vehicle?.imagen) {
        const file = new File([this.vehicle.imagen], 'imagen', { type: 'image/*' });
        this.loadImage(file);
      }
      // Only load maintenances after vehicle is loaded
      if (this.vehicle) {
        this.loadMaintenances(id);
      }
    } catch (error) {
      console.error('Error loading vehicle:', error);
    }
  }

  async loadMaintenances(vehicleId: number) {
    try {
      const allMaintenances = await this.storageService.getDatosMantencion();
      this.maintenances = allMaintenances.filter(m => m.nombrevehiculo === this.vehicle?.nombrevehiculo);
    } catch (error) {
      console.error('Error loading maintenances:', error);
    }
  }

  loadImage(file: File) {
    const reader = new FileReader();
    reader.onload = (e) => {
      this.imageUrl = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }
}

