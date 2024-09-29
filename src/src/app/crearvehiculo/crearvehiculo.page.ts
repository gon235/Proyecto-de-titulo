import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-crearvehiculo',
  templateUrl: './crearvehiculo.page.html',
  styleUrls: ['./crearvehiculo.page.scss'],
})
export class CrearvehiculoPage implements OnInit {

  constructor() { }
// Valida el largo del año a un maximo de 4 números
  validarLargoAno(event: any) {
    const input = event.target as HTMLInputElement;
    if (input.value.length > 4) {
      input.value = input.value.slice(0, 4);
    }
  }

  ngOnInit() {
  }

}

