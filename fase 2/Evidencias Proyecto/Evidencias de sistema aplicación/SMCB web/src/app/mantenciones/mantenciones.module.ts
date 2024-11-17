import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MantencionesPageRoutingModule } from './mantenciones-routing.module';

import { MantencionesPage } from './mantenciones.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MantencionesPageRoutingModule
  ],
  declarations: [MantencionesPage]
})
export class MantencionesPageModule {}
