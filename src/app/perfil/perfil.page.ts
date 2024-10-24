import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ServicedatosService, DatosPersonal } from '../services/servicedatos.service';

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.page.html',
  styleUrls: ['./perfil.page.scss'],
})
export class PerfilPage implements OnInit {
  personalId: number | undefined;
  personal: DatosPersonal | undefined;

  constructor(
    private route: ActivatedRoute,
    private servicedatosService: ServicedatosService
  ) {}

ngOnInit() {
  const id = this.route.snapshot.paramMap.get('id');
  if (id) {
    this.personalId = parseInt(id, 10);
    this.loadDatosPersonal(this.personalId);
  } else {
    // Handle the case where the ID is not available
    console.error('No ID provided');
  }
}

  loadDatosPersonal(id: number) {
    this.servicedatosService.getDatosPersonal().then(data => {
      if (data) {
        this.personal = data.find(p => p.id === id);
      }
    });
  }
}
