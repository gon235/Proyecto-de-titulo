import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CrearmantencionPageRoutingModule } from './crearmantencion-routing.module';

import { CrearmantencionPage } from './crearmantencion.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CrearmantencionPageRoutingModule
  ],
  declarations: [CrearmantencionPage]
})
export class CrearmantencionPageModule {}
