import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { MenuController } from '@ionic/angular';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit, OnDestroy {
  email: string = '';
  password: string = '';
  showPassword: boolean = false;

  constructor(
    private authService: AuthService, 
    private router: Router,
    private menuCtrl: MenuController
  ) {}

  ngOnInit() {
    this.menuCtrl.enable(false);
  }

  toggleShowPassword() {
    this.showPassword = !this.showPassword;
  }

  ngOnDestroy() {
    this.menuCtrl.enable(true);
  }

  async login() {
    try {
      await this.authService.login(this.email, this.password);
      this.router.navigate(['/home']);
    } catch (error) {
      console.error('Error en login:', error);
      // Aquí podrías agregar un mensaje de error para el usuario
    }
  }
}