import { Component, OnInit } from '@angular/core';
import { ServicedatosService, DatosPersonal } from '../services/servicedatos.service';

@Component({
  selector: 'app-personal',
  templateUrl: './personal.page.html',
  styleUrls: ['./personal.page.scss'],
})
export class PersonalPage implements OnInit {
  personales: DatosPersonal[] = [];

  constructor(private servicedatosService: ServicedatosService) { }

  ngOnInit() {
    this.loadDatosPersonal();
  }

  loadDatosPersonal() {
    this.servicedatosService.getDatosPersonal().then(data => {
      this.personales = data || [];
    });
  }
}