import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PerfilvehiculoPageRoutingModule } from './perfilvehiculo-routing.module';

import { PerfilvehiculoPage } from './perfilvehiculo.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PerfilvehiculoPageRoutingModule
  ],
  declarations: [PerfilvehiculoPage]
})
export class PerfilvehiculoPageModule {}
