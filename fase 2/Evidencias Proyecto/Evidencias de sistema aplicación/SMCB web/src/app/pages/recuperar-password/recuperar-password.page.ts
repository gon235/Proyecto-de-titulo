import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { ToastController, MenuController } from '@ionic/angular';

@Component({
  selector: 'app-recuperar-password',
  templateUrl: './recuperar-password.page.html',
  styleUrls: ['./recuperar-password.page.scss'],
})
export class RecuperarPasswordPage implements OnInit, OnDestroy {
  email: string = '';

  constructor(
    private authService: AuthService,
    private toastController: ToastController,
    private menuCtrl: MenuController
  ) {}

  ngOnInit() {
    this.menuCtrl.enable(false);
  }

  ngOnDestroy() {
    this.menuCtrl.enable(true);
  }

  async recuperarPassword() {
    if (!this.email) {
      this.presentToast('Por favor, ingrese su correo electrónico');
      return;
    }

    try {
      await this.authService.resetPassword(this.email);
      this.presentToast('Se ha enviado un correo para restablecer su contraseña');
    } catch (error) {
      console.error('Error al recuperar la contraseña:', error);
      this.presentToast('Error al enviar el correo de recuperación. Intente nuevamente.');
    }
  }

  async presentToast(message: string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 2000,
      position: 'bottom'
    });
    toast.present();
  }
}