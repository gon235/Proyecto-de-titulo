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
    }
  }

  async loadVehicle(id: number) {
    try {
      const vehicles = await this.storageService.getDatosVehiculo();
      this.vehicle = vehicles.find(v => v.id === id);
      if (this.vehicle?.imagen) {
        this.loadImage(this.vehicle.imagen as string);
      }
      if (this.vehicle) {
        this.loadMaintenances(id);
      }
    } catch (error) {
      console.error('Error loading vehicle:', error);
    }
  }

  loadImage(imagenString: string) {
    if (imagenString.startsWith('data:image')) {
      // Si ya es una URL de datos, úsala directamente
      this.imageUrl = imagenString;
    } else {
      // Si es una ruta de archivo, conviértela a URL de datos
      fetch(imagenString)
        .then(res => res.blob())
        .then(blob => {
          const reader = new FileReader();
          reader.onloadend = () => {
            this.imageUrl = reader.result as string;
          };
          reader.readAsDataURL(blob);
        })
        .catch(error => {
          console.error('Error loading image:', error);
          this.imageUrl = undefined;
        });
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


}

