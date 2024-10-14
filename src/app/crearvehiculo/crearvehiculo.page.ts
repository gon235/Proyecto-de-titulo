import { Component, OnInit } from '@angular/core';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-crearvehiculo',
  templateUrl: './crearvehiculo.page.html',
  styleUrls: ['./crearvehiculo.page.scss'],
})
export class CrearvehiculoPage implements OnInit {

  constructor(public alertController: AlertController) { }

  // Valida el largo del año a un maximo de 4 números
  validarLargoAno(event: any) {
    const input = event.target as HTMLInputElement;
    if (input.value.length > 4) {
      input.value = input.value.slice(0, 4);
    }
  }

  ngOnInit() {
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

