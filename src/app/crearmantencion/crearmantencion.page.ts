import { Component, OnInit } from '@angular/core';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-crearmantencion',
  templateUrl: './crearmantencion.page.html',
  styleUrls: ['./crearmantencion.page.scss'],
})

export class CrearmantencionPage implements OnInit {

  mantencion = {
    selvehiculo: '',
    nombremantencion: '',
    nivelurgencia: '',
    fechahora: '',
    detalle: ''
  };

  constructor(public alertController: AlertController) { }

  ngOnInit() {
  }

  onSubmit() {
    console.log('submit');
    console.log(this.mantencion);
  }

  async creacionMantencion() {
    const alert = await this.alertController.create({
      cssClass: 'secondary',
      header: 'Mensaje',
      message: 'La creación de la mantención ha sido exitosa',
      buttons: ['Aceptar'],
    });

    await alert.present();

    const { role } = await alert.onDidDismiss();
    console.log('onDidDismiss resolved with role', role);

  }

}
