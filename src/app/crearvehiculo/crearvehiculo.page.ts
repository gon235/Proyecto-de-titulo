import { Component, OnInit } from '@angular/core';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-crearvehiculo',
  templateUrl: './crearvehiculo.page.html',
  styleUrls: ['./crearvehiculo.page.scss'],
})

export class CrearvehiculoPage implements OnInit {

  vehiculo = {
    nombrevehiculo: '',
    marca: '',
    modelo: '',
    anio: '',
    patente: '',
    imagen: ''
  };

  constructor(public alertController: AlertController) { }

  // Valida el largo del año a un máximo de 4 números
  validarLargoAno(event: any) {
    const input = event.target as HTMLInputElement;
    if (input.value.length > 4) {
      input.value = input.value.slice(0, 4);
    }
  }

  ngOnInit() {
  }

  onSubmit() {
    console.log('submit');
    console.log(this.vehiculo);
  }

  async creacionVehiculo() {
    const alert = await this.alertController.create({
      cssClass: 'secondary',
      header: 'Mensaje',
      message: 'La creación del vehículo ha sido exitosa',
      buttons: ['Aceptar'],
    });

    await alert.present();

    const { role } = await alert.onDidDismiss();
    console.log('onDidDismiss resolved with role', role);

  }

}

