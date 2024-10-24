import { Component, OnInit } from '@angular/core';
import { ServicedatosService, DatosPersonal } from '../services/servicedatos.service';

@Component({
  selector: 'app-personal',
  templateUrl: './personal.page.html',
  styleUrls: ['./personal.page.scss'],
})
export class PersonalPage implements OnInit {
  personales: DatosPersonal[] = [];
  filteredPersonales: DatosPersonal[] = [];
  searchQuery: string = '';

  constructor(private servicedatosService: ServicedatosService) { }

  ngOnInit() {
    this.loadDatosPersonal();
  }

  loadDatosPersonal() {
    this.servicedatosService.getDatosPersonal().then(data => {
      this.personales = data || [];
      this.filteredPersonales = [...this.personales]; // initially show all entries
    });
  }

  filterPersonales() {
    if (this.searchQuery) {
      this.filteredPersonales = this.personales.filter(personal =>
        personal.nombres.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        personal.apellidos.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        personal.email.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        personal.rango.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
    } else {
      // If the search query is empty, show all data
      this.filteredPersonales = [...this.personales];
    }
  }
}