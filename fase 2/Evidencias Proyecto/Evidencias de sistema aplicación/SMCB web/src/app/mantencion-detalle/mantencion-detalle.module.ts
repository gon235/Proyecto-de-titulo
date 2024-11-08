import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MantencionDetallePageRoutingModule } from './mantencion-detalle-routing.module';

import { MantencionDetallePage } from './mantencion-detalle.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MantencionDetallePageRoutingModule
  ],
  declarations: [MantencionDetallePage]
})
export class MantencionDetallePageModule {}
