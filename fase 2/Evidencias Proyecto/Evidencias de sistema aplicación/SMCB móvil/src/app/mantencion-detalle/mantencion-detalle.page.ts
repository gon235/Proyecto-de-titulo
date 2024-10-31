import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DatabaseService } from '../services/database.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-mantencion-detalle',
  templateUrl: './mantencion-detalle.page.html',
  styleUrls: ['./mantencion-detalle.page.scss'],
})
export class MantencionDetallePage implements OnInit {
  mantencion: any = {};
  isEditing: boolean = false;
  vehiculo: any;
  originalMantencionData: any;

  constructor(
    private route: ActivatedRoute,
    private databaseService: DatabaseService,
    private router: Router
  ) { }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.databaseService.getDocument('mantenciones', id).subscribe(
        (data) => {
          this.mantencion = data;
          if (!this.mantencion.estado) {
            this.mantencion.estado = 'pendiente';
          }
          this.cargarDatosVehiculo();
        },
        (error) => {
          console.error('Error fetching mantencion details:', error);
        }
      );
    }
  }

  loadMantencionData() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.databaseService.getDocument('mantenciones', id).subscribe(
        (data) => {
          this.mantencion = data;
          if (!this.mantencion.estado) {
            this.mantencion.estado = 'pendiente';
          }
          this.originalMantencionData = { ...this.mantencion };
          this.cargarDatosVehiculo();
        },
        (error) => {
          console.error('Error fetching mantencion details:', error);
        }
      );
    }
  }

  cargarDatosVehiculo() {
    if (this.mantencion && this.mantencion.nombrevehiculo) {
      const [nombrevehiculo, patente] = this.mantencion.nombrevehiculo.split(' - Patente ');
      this.databaseService.getCollection('vehiculos').subscribe(
        (vehiculos: any[]) => {
          this.vehiculo = vehiculos.find(v => v.nombrevehiculo === nombrevehiculo && v.patente === patente);
        },
        (error) => {
          console.error('Error fetching vehicle details:', error);
        }
      );
    }
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleString();
  }

  toggleEdit() {
    if (this.isEditing) {
      this.saveChanges();
    }
    this.isEditing = !this.isEditing;
  }

  cancelEdit() {
    this.isEditing = false;
    if (this.mantencion) {
      // Restaurar los valores originales de la mantención
      this.mantencion.nombremantencion = this.originalMantencionData.nombremantencion;
      this.mantencion.nivelurgencia = this.originalMantencionData.nivelurgencia;
      this.mantencion.detalle = this.originalMantencionData.detalle;
      this.mantencion.estado = this.originalMantencionData.estado;
    }
  }

  saveChanges() {
    if (this.mantencion && this.mantencion.id) {
      this.databaseService.updateDocument('mantenciones', this.mantencion.id, this.mantencion)
        .then(() => {
          console.log('Cambios guardados exitosamente');
          this.isEditing = false;
          this.router.navigate(['/mantencion-detalle', this.mantencion.id]); // Navegar de vuelta al detalle de la mantención
        })
        .catch((error) => {
          console.error('Error al guardar los cambios:', error);
        });
    }
  }
}