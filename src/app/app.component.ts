import { Component } from '@angular/core';

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

  constructor() {}

  componentes: Componente[] = [
    {
      icon: 'home',
      name: 'Inicio',
      redirecTo: '/home'
    },
    {
      icon: 'log-in',
      name: 'Iniciar sesión',
      redirecTo: '/personal'
    },
    {
      icon: 'log-out',
      name: 'Cerrar sesión',
      redirecTo: '/cerrarsesion'
    }
  ];

}
