import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { MenuController, AlertController, Platform } from '@ionic/angular';
import { DOCUMENT } from '@angular/common';
import { Inject } from '@angular/core';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit, OnDestroy {
  email: string = '';
  password: string = '';
  showPassword: boolean = false;
  logoSrc: string = 'assets/img/SMCB-normal.svg';
  private isDarkMode: boolean = false;

  constructor(
    private authService: AuthService, 
    private router: Router,
    private menuCtrl: MenuController,
    private alertController: AlertController,
    @Inject(DOCUMENT) private document: Document,
    private platform: Platform
  ) {}

  ngOnInit() {
    this.menuCtrl.enable(false);
    this.updateLogo();
  }

  ngOnDestroy() {
    this.menuCtrl.enable(true);
  }

  @HostListener('document:ionChangeTheme', ['$event'])
  onThemeChange(event: any) {
    this.updateLogo();
  }

  updateLogo() {
    const currentlyDark = this.document.body.classList.contains('dark');
    
    if (currentlyDark !== this.isDarkMode) {
      this.isDarkMode = currentlyDark;
      const logoName = this.isDarkMode ? 'SMCB-dark-mode.svg' : 'SMCB-normal.svg';
      this.logoSrc = `assets/img/${logoName}?v=${new Date().getTime()}`;
    }
  }

  toggleShowPassword() {
    this.showPassword = !this.showPassword;
  }

  async login() {
    try {
      await this.authService.login(this.email, this.password);
      this.router.navigate(['/home']);
    } catch (error) {
      console.error('Error en login:', error);
      this.presentAlert('Error al iniciar sesión', 'El correo o contraseña ingresado no es válido.');
    }
  }

  async presentAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['Aceptar']
    });

    await alert.present();
  }

  async logout() {
    await this.authService.logout();
    this.updateLogo();
    this.router.navigate(['/login']);
  }
}