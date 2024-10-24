import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ServicedatosService, DatosPersonal } from '../services/servicedatos.service';

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.page.html',
  styleUrls: ['./perfil.page.scss'],
})
export class PerfilPage implements OnInit {
  personal: DatosPersonal | undefined;
  imageUrl: string | undefined;

  constructor(private route: ActivatedRoute, private storageService: ServicedatosService) {}

  ngOnInit() {
    const personalId = this.route.snapshot.paramMap.get('id');
    if (personalId) {
      this.loadPersonal(Number(personalId));
    }
  }

  async loadPersonal(id: number) {
    try {
      const personalList = await this.storageService.getDatosPersonal();
      this.personal = personalList.find(p => p.id === id);
      if (this.personal?.imagen) {
        this.loadImage(this.personal.imagen);
      }
    } catch (error) {
      console.error('Error loading personal data:', error);
    }
  }

  loadImage(imagenString: string) {
    if (imagenString.startsWith('data:image')) {
      // If it's already a data URL, use it directly
      this.imageUrl = imagenString;
    } else {
      // If it's a file path, convert it to a data URL
      fetch(imagenString)
        .then(res => res.blob())
        .then(blob => {
          const reader = new FileReader();
          reader.onloadend = () => {
            this.imageUrl = reader.result as string;
          };
          reader.readAsDataURL(blob);
        })
        .catch(error => {
          console.error('Error loading image:', error);
          this.imageUrl = undefined;
        });
    }
  }
}