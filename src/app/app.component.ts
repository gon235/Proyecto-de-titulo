import { Component, inject } from '@angular/core';
import { FirebaseService } from './services/firebase.service';
import { Router, NavigationEnd } from '@angular/router';

interface Componente {  
  icon: string;
  name: string;
  redirecTo: string;
}

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {

  firebaseSvc = inject(FirebaseService);
  showMenu = true;

  constructor(private router: Router) {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.showMenu = !['auth', 'forgot-password', 'sign-up'].some(route => event.url.includes(route));
      }
    });
  }

    //======Cerrar sesión======
    signOut() {
      this.firebaseSvc.signOut();
    }

  componentes: Componente[] = [
    {
      icon: 'home',
      name: 'Inicio',
      redirecTo: '/home'
    },
    {
      icon: 'log-in',
      name: 'Iniciar sesión',
      redirecTo: '/iniciarsesion'
    },
    {
      icon: 'log-out',
      name: 'Cerrar sesión',
      redirecTo: '/cerrarsesion'
    }
  ];

}
