import { Component } from '@angular/core';
import { MenuController } from '@ionic/angular';

interface Componente {  
  icon: string;
  name: string;
  redirecTo: string;
}

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  constructor(private menuController: MenuController) {}

  ngOnInit() {
  }

  mostrarMenu() {
    this.menuController.open('hamburguesa');
  }

}

