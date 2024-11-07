import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DatabaseService } from '../services/database.service';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { AuthService } from '../services/auth.service';
import { switchMap } from 'rxjs/operators';
import { Observable } from 'rxjs';

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
  canEdit: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private databaseService: DatabaseService,
    private router: Router,
    private alertController: AlertController,
    private authService: AuthService
  ) { }

  ngOnInit() {
    this.authService.user$.pipe(
      switchMap(user => {
        if (user) {
          return this.databaseService.getDocument('personal', user.uid);
        }
        return new Observable<null>(subscriber => subscriber.next(null));
      })
    ).subscribe(userData => {
      this.canEdit = userData && userData.rol !== 'Bombero';
    });

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
    if (!this.canEdit) {
      this.showNoPermissionAlert();
      return;
    }

    if (!this.isEditing) {
      this.originalMantencionData = { ...this.mantencion };
    } else {
      this.saveChanges();
    }
    this.isEditing = !this.isEditing;
  }

  cancelEdit() {
    this.isEditing = false;
    if (this.mantencion && this.originalMantencionData) {
      this.mantencion.nombremantencion = this.originalMantencionData.nombremantencion;
      this.mantencion.nivelurgencia = this.originalMantencionData.nivelurgencia;
      this.mantencion.detalle = this.originalMantencionData.detalle;
      this.mantencion.estado = this.originalMantencionData.estado;
    }
  }

  saveChanges() {
    if (!this.canEdit) {
      this.showNoPermissionAlert();
      return;
    }

    if (this.mantencion && this.mantencion.id) {
      this.databaseService.updateDocument('mantenciones', this.mantencion.id, this.mantencion)
        .then(() => {
          console.log('Cambios guardados exitosamente');
          this.isEditing = false;
          this.router.navigate(['/mantencion-detalle', this.mantencion.id]);
        })
        .catch((error) => {
          console.error('Error al guardar los cambios:', error);
        });
    }
  }

  async deleteMantencion() {
    if (!this.canEdit) {
      this.showNoPermissionAlert();
      return;
    }

    const alert = await this.alertController.create({
      header: 'Confirmar eliminación',
      message: '¿Estás seguro de que quieres eliminar esta mantención? Esta acción no se puede deshacer.',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'secondary',
        }, {
          text: 'Eliminar',
          handler: () => {
            this.confirmDeleteMantencion();
          }
        }
      ]
    });

    await alert.present();
  }

  async confirmDeleteMantencion() {
    if (this.mantencion && this.mantencion.id) {
      try {
        await this.databaseService.deleteDocument('mantenciones', this.mantencion.id);
        const alert = await this.alertController.create({
          header: 'Éxito',
          message: 'La mantención ha sido eliminada correctamente.',
          buttons: ['OK']
        });
        await alert.present();
        this.router.navigate(['/home']);
      } catch (error) {
        console.error('Error al eliminar la mantención:', error);
        const alert = await this.alertController.create({
          header: 'Error',
          message: 'Hubo un problema al eliminar la mantención.',
          buttons: ['OK']
        });
        await alert.present();
      }
    }
  }

  async showNoPermissionAlert() {
    const alert = await this.alertController.create({
      header: 'Acceso Denegado',
      message: 'No tienes permisos para editar mantenciones',
      buttons: ['OK']
    });
    await alert.present();
  }
}