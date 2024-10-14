import { Component, OnInit } from '@angular/core';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-crearpersonal',
  templateUrl: './crearpersonal.page.html',
  styleUrls: ['./crearpersonal.page.scss'],
})
export class CrearpersonalPage implements OnInit {

  constructor(public alertController: AlertController) { }

  ngOnInit() {
  }

  async creacionPersonal() {
    const alert = await this.alertController.create({
      cssClass: 'secondary',
      header: 'Mensaje',
      message: 'La creación del personal ha sido exitosa',
      buttons: ['Aceptar'],
    });

    await alert.present();

    const { role } = await alert.onDidDismiss();
    console.log('onDidDismiss resolved with role', role);

  }

}